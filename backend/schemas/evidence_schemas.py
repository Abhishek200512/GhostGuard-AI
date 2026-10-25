"""
GhostGuard AI - Pydantic Request & Response Schemas
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class PageDetailSchema(BaseModel):
    page_number: int
    extracted_text: str
    ocr_confidence: float
    extraction_method: str
    warnings: Optional[str] = None

class AuditLogSchema(BaseModel):
    id: int
    action: str
    performed_by: str
    details: Optional[str] = None
    timestamp: str

class EvidenceDetailResponse(BaseModel):
    id: str
    case_id: Optional[str] = None
    original_filename: str
    stored_filename: str
    file_extension: str
    mime_type: str
    file_size_bytes: int
    sha256_hash: str
    page_count: int
    extracted_text: Optional[str] = None
    extraction_method: str
    average_ocr_confidence: float
    processing_status: str
    processing_error: Optional[str] = None
    language: str
    created_at: str
    processed_at: Optional[str] = None
    linked_by: Optional[str] = None
    linking_method: Optional[str] = None
    linking_confidence: Optional[float] = None
    suggested_case_id: Optional[str] = None
    pages: Optional[List[PageDetailSchema]] = []
    audit_logs: Optional[List[AuditLogSchema]] = []

class EvidenceUploadResponse(BaseModel):
    evidence_id: str
    case_id: Optional[str]
    original_filename: str
    file_size_bytes: int
    sha256_hash: str
    processing_status: str
    extraction_method: str
    page_count: int
    average_ocr_confidence: float
    suggested_case_id: Optional[str] = None
    message: str

class PaginatedEvidenceResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[EvidenceDetailResponse]

class CaseLinkRequest(BaseModel):
    case_id: str
    reason: Optional[str] = "Manual case linkage by privacy engineer"
    performed_by: Optional[str] = "Dr. Elena Rostova"

class OCRHealthResponse(BaseModel):
    status: str
    tesseract_available: bool
    tesseract_version: Optional[str] = None
    tesseract_path: Optional[str] = None
    supported_formats: List[str]
    max_file_size_mb: int
    database_connected: bool
    storage_writable: bool
