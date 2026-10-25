"""
GhostGuard AI - Evidence Repository
Transactional SQLAlchemy CRUD operations for evidence documents, page results, and audit trails.
"""

from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.db_models import Evidence, EvidencePage, EvidenceAuditLog

class EvidenceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, evidence_id: str) -> Optional[Evidence]:
        return self.db.query(Evidence).filter(Evidence.id == evidence_id).first()

    def get_by_sha256(self, sha256_hash: str) -> Optional[Evidence]:
        return self.db.query(Evidence).filter(Evidence.sha256_hash == sha256_hash).first()

    def list_evidence(
        self,
        case_id: Optional[str] = None,
        status: Optional[str] = None,
        mime_type: Optional[str] = None,
        page: int = 1,
        limit: int = 20
    ) -> Tuple[List[Evidence], int]:
        query = self.db.query(Evidence)

        if case_id:
            query = query.filter(Evidence.case_id == case_id)
        if status:
            query = query.filter(Evidence.processing_status == status)
        if mime_type:
            query = query.filter(Evidence.mime_type.ilike(f"%{mime_type}%"))

        total = query.count()
        offset = (page - 1) * limit
        items = query.order_by(desc(Evidence.created_at)).offset(offset).limit(limit).all()
        return items, total

    def get_by_case_id(self, case_id: str) -> List[Evidence]:
        return self.db.query(Evidence).filter(Evidence.case_id == case_id).order_by(desc(Evidence.created_at)).all()

    def create(self, evidence: Evidence) -> Evidence:
        try:
            self.db.add(evidence)
            self.db.commit()
            self.db.refresh(evidence)
            return evidence
        except Exception:
            self.db.rollback()
            raise

    def update(self, evidence: Evidence) -> Evidence:
        try:
            self.db.commit()
            self.db.refresh(evidence)
            return evidence
        except Exception:
            self.db.rollback()
            raise

    def add_audit_log(self, evidence_id: str, action: str, details: str, performed_by: str = "Dr. Elena Rostova") -> EvidenceAuditLog:
        try:
            log_entry = EvidenceAuditLog(
                evidence_id=evidence_id,
                action=action,
                details=details,
                performed_by=performed_by
            )
            self.db.add(log_entry)
            self.db.commit()
            return log_entry
        except Exception:
            self.db.rollback()
            raise
