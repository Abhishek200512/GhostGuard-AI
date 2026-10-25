"""
GhostGuard AI - Core Data Models and Audit Engine Types
HackerRank Orchestrate October 2026: 'Ghost Data Still Exists'
"""

from dataclasses import dataclass, field, asdict
from typing import List, Dict, Optional, Any
from enum import Enum
import json

class DeletionStatus(str, Enum):
    COMPLETE = "COMPLETE"
    INCOMPLETE = "INCOMPLETE"
    NOT_APPLICABLE = "NOT_APPLICABLE"

class StepType(str, Enum):
    FINDING = "FINDING"
    REMEDIATION = "REMEDIATION"
    VERIFICATION = "VERIFICATION"

class RiskSeverity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    NONE = "NONE"

@dataclass
class RemediationStep:
    step_number: int
    step_type: str  # FINDING, REMEDIATION, VERIFICATION
    system: str
    action: str
    target_locator: str
    evidence_id: Optional[str] = None
    status: str = "PENDING"  # PENDING, EXECUTED, VERIFIED
    description: str = ""

    def to_dict(self):
        return {
            "step_number": self.step_number,
            "step_type": self.step_type,
            "system": self.system,
            "action": self.action,
            "target_locator": self.target_locator,
            "evidence_id": self.evidence_id,
            "status": self.status,
            "description": self.description
        }

@dataclass
class UserIdentity:
    user_id: str
    primary_email: str
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    customer_id: Optional[str] = None
    legacy_id: Optional[str] = None
    global_uuid: Optional[str] = None
    historical_emails: List[str] = field(default_factory=list)
    auth0_id: Optional[str] = None
    verified: bool = True

@dataclass
class EvidenceItem:
    evidence_id: str
    system: str
    target_locator: str
    evidence_type: str  # ELASTICSEARCH_DOC, REDIS_KEY, KAFKA_OFFSET, S3_OBJECT, SQL_ROW, OCR_DOC
    sha256_hash: str
    timestamp: str
    payload_snippet: str
    pii_fields_detected: List[str] = field(default_factory=list)
    is_violation: bool = True
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class RecreationHazard:
    hazard_id: str
    pipeline_name: str
    source_system: str
    destination_system: str
    route: str
    hazard_type: str  # RESURRECTION_DETECTED, FILTER_LEAKAGE, STREAM_REPLAY, CDC_DESYNC
    schedule_lag: str
    description: str
    affected_cases_count: int
    recommended_action: str
    consumer_group: Optional[str] = None
    last_replayed_at: Optional[str] = None

@dataclass
class PolicyRule:
    rule_id: str
    system: str
    data_category: str
    required_treatment: str  # DELETE, REDACT, ANONYMIZE, RETAIN
    retention_period_days: Optional[int]
    legal_basis: str  # GDPR_ART_17, CCPA_1798_105, FINTECH_COMPLIANCE, TAX_RECORD_KEEPING
    enforcement_active: bool = True

@dataclass
class CaseDossier:
    case_id: str
    user_id: str
    identity: UserIdentity
    request_type: str
    submission_timestamp: str
    audit_cutoff_timestamp: str
    forensic_evaluated_timestamp: str
    status: DeletionStatus
    severity: RiskSeverity
    executive_rationale: str
    data_integrity_score: int
    systems_monitored: int
    systems_failed: int
    systems_purged: int
    confirmed_violations: List[Dict[str, Any]] = field(default_factory=list)
    recreation_risks: List[RecreationHazard] = field(default_factory=list)
    evidence_manifest: List[EvidenceItem] = field(default_factory=list)
    verification_pipeline_nodes: List[Dict[str, Any]] = field(default_factory=list)
    remediation_steps: List[RemediationStep] = field(default_factory=list)
    steps_json_str: str = "[]"
