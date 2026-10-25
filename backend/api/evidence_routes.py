"""
GhostGuard AI - Evidence & OCR REST Endpoints
"""

import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.services.evidence_service import EvidenceService, DuplicateEvidenceError
from backend.services.file_validation_service import FileValidationError
from backend.services.case_linking_service import CaseNotFoundError
from backend.services.ocr_service import OCRService, TesseractUnavailableError
from backend.schemas.evidence_schemas import (
    EvidenceDetailResponse,
    EvidenceUploadResponse,
    PaginatedEvidenceResponse,
    CaseLinkRequest,
    OCRHealthResponse
)
from backend.core.config import settings

router = APIRouter(tags=["Evidence & OCR"])

from sqlalchemy import text

@router.get("/health/ocr", response_model=OCRHealthResponse)
def get_ocr_health(db: Session = Depends(get_db)):
    """
    Reports whether the Tesseract OCR engine, storage directories, and database are healthy.
    """
    is_avail, version, path = OCRService.check_tesseract_availability()
    db_ok = True
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_ok = False

    storage_writable = settings.STORAGE_DIR.exists() and os.access(settings.STORAGE_DIR, os.W_OK) if 'os' in globals() else True

    return OCRHealthResponse(
        status="HEALTHY" if (is_avail and db_ok) else "DEGRADED",
        tesseract_available=is_avail,
        tesseract_version=version,
        tesseract_path=path,
        supported_formats=sorted(list(settings.ALLOWED_EXTENSIONS)),
        max_file_size_mb=settings.MAX_FILE_SIZE_BYTES // (1024 * 1024),
        database_connected=db_ok,
        storage_writable=storage_writable
    )

@router.post("/evidence/upload", response_model=EvidenceUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    file: UploadFile = File(...),
    case_id: Optional[str] = Form(None),
    language: str = Form("eng"),
    db: Session = Depends(get_db)
):
    """
    Accepts multipart document/image upload, validates signatures, runs OCR, and links to Case ID.
    """
    service = EvidenceService(db)
    file_bytes = await file.read()

    try:
        evidence, suggested_case = service.process_and_store_upload(
            filename=file.filename or "unknown.bin",
            file_bytes=file_bytes,
            case_id=case_id,
            language=language
        )

        message = "Evidence ingested and OCR extraction completed."
        if evidence.processing_status == "FAILED":
            message = f"Evidence ingested but OCR failed: {evidence.processing_error}"

        return EvidenceUploadResponse(
            evidence_id=evidence.id,
            case_id=evidence.case_id,
            original_filename=evidence.original_filename,
            file_size_bytes=evidence.file_size_bytes,
            sha256_hash=evidence.sha256_hash,
            processing_status=evidence.processing_status,
            extraction_method=evidence.extraction_method,
            page_count=evidence.page_count,
            average_ocr_confidence=round(evidence.average_ocr_confidence, 2),
            suggested_case_id=suggested_case,
            message=message
        )

    except FileValidationError as fe:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(fe))
    except CaseNotFoundError as ce:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ce))
    except DuplicateEvidenceError as de:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"message": str(de), "existing_evidence_id": de.existing_evidence_id}
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ingestion failed: {str(e)}")

@router.get("/evidence", response_model=PaginatedEvidenceResponse)
@router.get("/evidence/documents", response_model=PaginatedEvidenceResponse)
def list_evidence(
    case_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    mime_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Returns paginated evidence records with optional case_id and status filters.
    """
    service = EvidenceService(db)
    items, total = service.repo.list_evidence(case_id=case_id, status=status, mime_type=mime_type, page=page, limit=limit)
    
    response_items = []
    for item in items:
        data = item.to_dict()
        data["pages"] = [p.to_dict() for p in item.pages]
        data["audit_logs"] = [a.to_dict() for a in item.audit_logs]
        response_items.append(data)

    return PaginatedEvidenceResponse(
        total=total,
        page=page,
        limit=limit,
        items=response_items
    )

@router.get("/evidence/{evidence_id}", response_model=EvidenceDetailResponse)
def get_evidence_detail(evidence_id: str, db: Session = Depends(get_db)):
    """
    Returns complete metadata, OCR extraction details, and audit history for an evidence file.
    """
    service = EvidenceService(db)
    evidence = service.repo.get_by_id(evidence_id)
    if not evidence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Evidence '{evidence_id}' not found.")

    data = evidence.to_dict()
    data["pages"] = [p.to_dict() for p in evidence.pages]
    data["audit_logs"] = [a.to_dict() for a in evidence.audit_logs]
    return data

@router.get("/evidence/{evidence_id}/text")
def get_evidence_text(evidence_id: str, db: Session = Depends(get_db)):
    """
    Returns extracted text and page-level breakdown for authorized case inspection.
    """
    service = EvidenceService(db)
    evidence = service.repo.get_by_id(evidence_id)
    if not evidence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Evidence '{evidence_id}' not found.")

    return {
        "evidence_id": evidence.id,
        "case_id": evidence.case_id,
        "filename": evidence.original_filename,
        "page_count": evidence.page_count,
        "extracted_text": evidence.extracted_text or "",
        "extraction_method": evidence.extraction_method,
        "average_ocr_confidence": round(evidence.average_ocr_confidence, 2),
        "pages": [p.to_dict() for p in evidence.pages]
    }

@router.get("/cases/{case_id}/evidence")
def get_case_evidence(case_id: str, db: Session = Depends(get_db)):
    """
    Returns all evidence records linked to a specific Case ID.
    """
    service = EvidenceService(db)
    clean_id = case_id.strip().upper()
    items = service.repo.get_by_case_id(clean_id)

    return {
        "case_id": clean_id,
        "evidence_count": len(items),
        "items": [
            {
                "id": item.id,
                "original_filename": item.original_filename,
                "mime_type": item.mime_type,
                "file_size_bytes": item.file_size_bytes,
                "sha256_hash": item.sha256_hash,
                "page_count": item.page_count,
                "extraction_method": item.extraction_method,
                "average_ocr_confidence": round(item.average_ocr_confidence, 2),
                "processing_status": item.processing_status,
                "linking_method": item.linking_method,
                "linking_confidence": item.linking_confidence,
                "created_at": item.created_at.isoformat() if item.created_at else None
            }
            for item in items
        ]
    }

@router.post("/evidence/{evidence_id}/reprocess", response_model=EvidenceDetailResponse)
def reprocess_evidence(
    evidence_id: str,
    language: str = Query("eng"),
    db: Session = Depends(get_db)
):
    """
    Retries failed OCR extraction or executes re-processing with a newly configured engine/language.
    """
    service = EvidenceService(db)
    try:
        evidence = service.reprocess_evidence(evidence_id, language=language)
        data = evidence.to_dict()
        data["pages"] = [p.to_dict() for p in evidence.pages]
        data["audit_logs"] = [a.to_dict() for a in evidence.audit_logs]
        return data
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(fnf))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Reprocessing error: {str(e)}")

@router.post("/evidence/{evidence_id}/link", response_model=EvidenceDetailResponse)
def link_evidence_to_case(
    evidence_id: str,
    body: CaseLinkRequest,
    db: Session = Depends(get_db)
):
    """
    Associates or re-links an evidence file to a validated Case ID with an audit trail.
    """
    service = EvidenceService(db)
    try:
        evidence = service.link_to_case(
            evidence_id=evidence_id,
            case_id=body.case_id,
            reason=body.reason or "Manual link",
            performed_by=body.performed_by or "Dr. Elena Rostova"
        )
        data = evidence.to_dict()
        data["pages"] = [p.to_dict() for p in evidence.pages]
        data["audit_logs"] = [a.to_dict() for a in evidence.audit_logs]
        return data
    except CaseNotFoundError as ce:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ce))
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(fnf))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Link failed: {str(e)}")
