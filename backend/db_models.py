"""
GhostGuard AI - SQLAlchemy Database Models for Evidence Intelligence
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.core.database import Base

class Evidence(Base):
    __tablename__ = "evidence_documents"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(32), index=True, nullable=True)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_extension = Column(String(16), nullable=False)
    mime_type = Column(String(64), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    sha256_hash = Column(String(64), unique=True, index=True, nullable=False)
    
    page_count = Column(Integer, default=1)
    extracted_text = Column(Text, nullable=True)
    extraction_method = Column(String(32), default="PENDING")  # NATIVE_PDF, TESSERACT_OCR, HYBRID, FAILED
    average_ocr_confidence = Column(Float, default=0.0)
    
    processing_status = Column(String(32), default="QUEUED", index=True)  # QUEUED, PROCESSING, COMPLETED, FAILED
    processing_error = Column(Text, nullable=True)
    language = Column(String(16), default="eng")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    processed_at = Column(DateTime, nullable=True)
    
    linked_by = Column(String(64), default="SYSTEM")
    linking_method = Column(String(32), default="MANUAL")  # MANUAL, AUTO_SUGGESTION, SYSTEM_DEFAULT
    linking_confidence = Column(Float, default=1.0)

    # Relationships
    pages = relationship("EvidencePage", back_populates="evidence", cascade="all, delete-orphan")
    audit_logs = relationship("EvidenceAuditLog", back_populates="evidence", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "case_id": self.case_id,
            "original_filename": self.original_filename,
            "stored_filename": self.stored_filename,
            "file_extension": self.file_extension,
            "mime_type": self.mime_type,
            "file_size_bytes": self.file_size_bytes,
            "sha256_hash": self.sha256_hash,
            "page_count": self.page_count,
            "extracted_text": self.extracted_text,
            "extraction_method": self.extraction_method,
            "average_ocr_confidence": round(self.average_ocr_confidence, 2) if self.average_ocr_confidence else 0.0,
            "processing_status": self.processing_status,
            "processing_error": self.processing_error,
            "language": self.language,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "processed_at": self.processed_at.isoformat() if self.processed_at else None,
            "linked_by": self.linked_by,
            "linking_method": self.linking_method,
            "linking_confidence": self.linking_confidence
        }

class EvidencePage(Base):
    __tablename__ = "evidence_pages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    evidence_id = Column(String(64), ForeignKey("evidence_documents.id"), index=True, nullable=False)
    page_number = Column(Integer, nullable=False)
    extracted_text = Column(Text, nullable=True)
    ocr_confidence = Column(Float, default=0.0)
    extraction_method = Column(String(32), default="NATIVE_PDF")
    warnings = Column(Text, nullable=True)

    evidence = relationship("Evidence", back_populates="pages")

    def to_dict(self):
        return {
            "page_number": self.page_number,
            "extracted_text": self.extracted_text or "",
            "ocr_confidence": round(self.ocr_confidence, 2) if self.ocr_confidence else 0.0,
            "extraction_method": self.extraction_method,
            "warnings": self.warnings
        }

class EvidenceAuditLog(Base):
    __tablename__ = "evidence_audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    evidence_id = Column(String(64), ForeignKey("evidence_documents.id"), index=True, nullable=False)
    action = Column(String(64), nullable=False)  # UPLOAD, OCR_PROCESSED, CASE_LINKED, REPROCESSED
    performed_by = Column(String(64), default="Dr. Elena Rostova")
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    evidence = relationship("Evidence", back_populates="audit_logs")

    def to_dict(self):
        return {
            "id": self.id,
            "action": self.action,
            "performed_by": self.performed_by,
            "details": self.details,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }
