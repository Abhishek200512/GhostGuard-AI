"""
GhostGuard AI - Evidence Management & Processing Service
Orchestrates file validation, storage, OCR execution, database persistence, and case linkage.
"""

from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List
from sqlalchemy.orm import Session
from backend.core.config import settings
from backend.db_models import Evidence, EvidencePage
from backend.repositories.evidence_repository import EvidenceRepository
from backend.services.file_validation_service import FileValidationService, FileValidationError
from backend.services.ocr_service import OCRService, OCRError, TesseractUnavailableError
from backend.services.case_linking_service import CaseLinkingService, CaseNotFoundError

class DuplicateEvidenceError(Exception):
    def __init__(self, message: str, existing_evidence_id: str):
        super().__init__(message)
        self.existing_evidence_id = existing_evidence_id

class EvidenceService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = EvidenceRepository(db)

    def process_and_store_upload(
        self,
        filename: str,
        file_bytes: bytes,
        case_id: Optional[str] = None,
        language: str = "eng",
        performed_by: str = "Dr. Elena Rostova"
    ) -> Tuple[Evidence, Optional[str]]:
        """
        Full ingestion pipeline:
        1. Validate size, extension, magic signatures.
        2. Compute SHA-256 and check for duplicates.
        3. Validate case_id if provided.
        4. Save original binary to storage/evidence/.
        5. Create database record in QUEUED state.
        6. Execute OCR / Native extraction.
        7. If case_id was not provided, look for auto-suggestions.
        8. Record page results and audit log.
        """
        # 1. Validate file
        sanitized_name, ext, mime_type = FileValidationService.validate_file(filename, file_bytes)
        sha256 = FileValidationService.compute_sha256(file_bytes)

        # 2. Duplicate check
        existing = self.repo.get_by_sha256(sha256)
        if existing:
            raise DuplicateEvidenceError(
                f"Duplicate evidence content detected. Matches existing record '{existing.id}' (Case {existing.case_id or 'UNLINKED'}).",
                existing_evidence_id=existing.id
            )

        # 3. Validate case if provided
        target_case_id = None
        linking_method = "UNLINKED"
        linking_confidence = 0.0

        if case_id and case_id.strip():
            target_case_id = CaseLinkingService.validate_case_id(case_id)
            linking_method = "EXPLICIT_USER_SELECTION"
            linking_confidence = 1.0

        # 4. Save file to storage
        stored_filename = FileValidationService.generate_storage_name(ext)
        dest_path = settings.STORAGE_DIR / stored_filename
        with open(dest_path, "wb") as f:
            f.write(file_bytes)

        # 5. Generate Evidence ID (EV-XXXX)
        evidence_id = f"EV-{sha256[:8].upper()}"

        evidence = Evidence(
            id=evidence_id,
            case_id=target_case_id,
            original_filename=sanitized_name,
            stored_filename=stored_filename,
            file_extension=ext,
            mime_type=mime_type,
            file_size_bytes=len(file_bytes),
            sha256_hash=sha256,
            language=language,
            processing_status="PROCESSING",
            linked_by=performed_by,
            linking_method=linking_method,
            linking_confidence=linking_confidence,
            created_at=datetime.now(timezone.utc)
        )
        self.repo.create(evidence)
        self.repo.add_audit_log(evidence_id, "UPLOAD", f"Uploaded {sanitized_name} ({len(file_bytes)} bytes)", performed_by)

        # 6. Run OCR / Native PDF Extraction
        suggested_case = None
        try:
            extraction_result = OCRService.process_document(file_bytes, mime_type=mime_type, language=language)

            evidence.extracted_text = extraction_result["extracted_text"]
            evidence.page_count = extraction_result["page_count"]
            evidence.average_ocr_confidence = extraction_result["average_confidence"]
            evidence.extraction_method = extraction_result["extraction_method"]
            evidence.processing_status = "COMPLETED"
            evidence.processed_at = datetime.now(timezone.utc)

            # Record page-level breakdown
            for p in extraction_result["pages"]:
                page_obj = EvidencePage(
                    evidence_id=evidence_id,
                    page_number=p["page_number"],
                    extracted_text=p["extracted_text"],
                    ocr_confidence=p["ocr_confidence"],
                    extraction_method=p["extraction_method"],
                    warnings=p["warnings"]
                )
                self.db.add(page_obj)

            # Auto-suggest Case ID if not explicitly specified
            if not target_case_id:
                suggested_id, conf, reasons = CaseLinkingService.discover_case_suggestions(evidence.extracted_text or "")
                if suggested_id:
                    suggested_case = suggested_id
                    # We store suggestion as suggestion, NOT auto-linking without user confirmation
                    evidence.linking_method = "PENDING_CONFIRMATION"
                    evidence.linking_confidence = conf

            self.repo.update(evidence)
            self.repo.add_audit_log(
                evidence_id,
                "OCR_PROCESSED",
                f"Extraction method: {evidence.extraction_method}, Confidence: {evidence.average_ocr_confidence}%, Pages: {evidence.page_count}",
                performed_by
            )

        except TesseractUnavailableError as te:
            evidence.processing_status = "FAILED"
            evidence.processing_error = str(te)
            evidence.extraction_method = "FAILED"
            self.repo.update(evidence)
            self.repo.add_audit_log(evidence_id, "OCR_FAILED", f"Tesseract error: {str(te)}", performed_by)

        except Exception as oe:
            evidence.processing_status = "FAILED"
            evidence.processing_error = f"Extraction failed: {str(oe)}"
            evidence.extraction_method = "FAILED"
            self.repo.update(evidence)
            self.repo.add_audit_log(evidence_id, "OCR_FAILED", str(oe), performed_by)

        return evidence, suggested_case

    def reprocess_evidence(self, evidence_id: str, language: str = "eng", performed_by: str = "Dr. Elena Rostova") -> Evidence:
        """
        Retries extraction for an existing evidence file from storage.
        """
        evidence = self.repo.get_by_id(evidence_id)
        if not evidence:
            raise FileNotFoundError(f"Evidence '{evidence_id}' not found.")

        file_path = settings.STORAGE_DIR / evidence.stored_filename
        if not file_path.exists():
            raise FileNotFoundError(f"Underlying storage file '{evidence.stored_filename}' missing.")

        with open(file_path, "rb") as f:
            file_bytes = f.read()

        # Delete old pages
        self.db.query(EvidencePage).filter(EvidencePage.evidence_id == evidence_id).delete()

        try:
            extraction_result = OCRService.process_document(file_bytes, mime_type=evidence.mime_type, language=language)
            evidence.extracted_text = extraction_result["extracted_text"]
            evidence.page_count = extraction_result["page_count"]
            evidence.average_ocr_confidence = extraction_result["average_confidence"]
            evidence.extraction_method = extraction_result["extraction_method"]
            evidence.processing_status = "COMPLETED"
            evidence.processing_error = None
            evidence.processed_at = datetime.now(timezone.utc)

            for p in extraction_result["pages"]:
                page_obj = EvidencePage(
                    evidence_id=evidence_id,
                    page_number=p["page_number"],
                    extracted_text=p["extracted_text"],
                    ocr_confidence=p["ocr_confidence"],
                    extraction_method=p["extraction_method"],
                    warnings=p["warnings"]
                )
                self.db.add(page_obj)

            self.repo.update(evidence)
            self.repo.add_audit_log(evidence_id, "REPROCESSED", f"Reprocessed successfully. New confidence: {evidence.average_ocr_confidence}%", performed_by)
            return evidence

        except Exception as e:
            evidence.processing_status = "FAILED"
            evidence.processing_error = f"Reprocess failed: {str(e)}"
            self.repo.update(evidence)
            self.repo.add_audit_log(evidence_id, "REPROCESS_FAILED", str(e), performed_by)
            raise

    def link_to_case(self, evidence_id: str, case_id: str, reason: str, performed_by: str = "Dr. Elena Rostova") -> Evidence:
        """
        Manually attaches or re-links an evidence item to a validated Case ID.
        """
        evidence = self.repo.get_by_id(evidence_id)
        if not evidence:
            raise FileNotFoundError(f"Evidence '{evidence_id}' not found.")

        validated_case_id = CaseLinkingService.validate_case_id(case_id)
        old_case = evidence.case_id or "UNLINKED"

        evidence.case_id = validated_case_id
        evidence.linked_by = performed_by
        evidence.linking_method = "MANUAL_OVERRIDE"
        evidence.linking_confidence = 1.0

        self.repo.update(evidence)
        self.repo.add_audit_log(
            evidence_id,
            "CASE_LINKED",
            f"Relinked from {old_case} to {validated_case_id}. Reason: {reason}",
            performed_by
        )
        return evidence
