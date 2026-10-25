"""
GhostGuard AI - Canonical Dataset and Data Store
Manages the 518 cases, 1,420 evidence proofs, 18 backend topologies,
14 recreation loops, and 42 policy rules.
"""

import json
import hashlib
import uuid
import random
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any

from backend.models import (
    DeletionStatus,
    StepType,
    RiskSeverity,
    RemediationStep,
    UserIdentity,
    EvidenceItem,
    RecreationHazard,
    PolicyRule,
    CaseDossier
)

class ChallengeDataStore:
    def __init__(self):
        self.cases: Dict[str, CaseDossier] = {}
        self.evidence: Dict[str, EvidenceItem] = {}
        self.policies: List[PolicyRule] = []
        self.hazards: List[RecreationHazard] = []
        self.systems = [
            "PostgreSQL 15 (Primary OLTP)",
            "Elasticsearch v8.9 (Search Cluster)",
            "Redis Cluster (Session Cache)",
            "Kafka 3.4 (Message Queue)",
            "AWS S3 (Bronze Data Lake)",
            "AWS S3 (KYC Vault)",
            "Snowflake (Analytics Mart)",
            "DynamoDB (Device Tokens)",
            "MongoDB (Customer Profiles)",
            "Cassandra (Activity Ledger)",
            "AWS Redshift (Warehouse)",
            "Google BigQuery (Audit Logs)",
            "ClickHouse (Metrics Store)",
            "RabbitMQ (Notifications)",
            "OpenSearch (Log Index)",
            "Memcached (API Gateways)",
            "Neo4j (Identity Graph)",
            "AWS Glacier (Cold Vault Archive)"
        ]
        self._initialize_policies()
        self._initialize_hazards()
        self._initialize_dataset()

    def _initialize_policies(self):
        rule_specs = [
            ("R-01", "PostgreSQL 15 (Primary OLTP)", "User Core Credentials", "DELETE", 0, "GDPR_ART_17"),
            ("R-02", "PostgreSQL 15 (Primary OLTP)", "User Profile Attributes", "DELETE", 0, "GDPR_ART_17"),
            ("R-03", "PostgreSQL 15 (Primary OLTP)", "Financial Billing History", "RETAIN", 2555, "FINTECH_COMPLIANCE"),
            ("R-04", "Elasticsearch v8.9 (Search Cluster)", "Search Document PII", "DELETE", 0, "GDPR_ART_17"),
            ("R-05", "Redis Cluster (Session Cache)", "Session Tokens & Memory Keys", "DELETE", 0, "GDPR_ART_17"),
            ("R-06", "Kafka 3.4 (Message Queue)", "User Topic Partitions", "REDACT", 0, "CCPA_1798_105"),
            ("R-07", "AWS S3 (Bronze Data Lake)", "Raw Telemetry Parquet Dumps", "DELETE", 0, "GDPR_ART_17"),
            ("R-08", "AWS S3 (KYC Vault)", "Passport & ID Document Scans", "DELETE", 0, "GDPR_ART_17"),
            ("R-09", "Snowflake (Analytics Mart)", "Customer Demographic Tables", "ANONYMIZE", 0, "GDPR_ART_17"),
            ("R-10", "DynamoDB (Device Tokens)", "Push Notification Tokens", "DELETE", 0, "CCPA_1798_105"),
            ("R-11", "MongoDB (Customer Profiles)", "Preference Documents", "DELETE", 0, "GDPR_ART_17"),
            ("R-12", "Cassandra (Activity Ledger)", "Clickstream Row Keys", "ANONYMIZE", 0, "CCPA_1798_105"),
            ("R-13", "AWS Redshift (Warehouse)", "Historical Sales Records", "RETAIN", 1825, "TAX_RECORD_KEEPING"),
            ("R-14", "Google BigQuery (Audit Logs)", "Immutability Ledger", "RETAIN", 3650, "REGULATORY_AUDIT"),
            ("R-15", "ClickHouse (Metrics Store)", "Latency Aggregations", "ANONYMIZE", 0, "CCPA_1798_105"),
            ("R-16", "RabbitMQ (Notifications)", "Pending Email Queues", "DELETE", 0, "GDPR_ART_17"),
            ("R-17", "OpenSearch (Log Index)", "API Gateway Request Logs", "REDACT", 30, "SECURITY_INCIDENT_INVESTIGATION"),
            ("R-18", "Memcached (API Gateways)", "Edge Auth Tokens", "DELETE", 0, "GDPR_ART_17"),
            ("R-19", "Neo4j (Identity Graph)", "Social Connection Nodes", "DELETE", 0, "GDPR_ART_17"),
            ("R-20", "AWS Glacier (Cold Vault Archive)", "Annual Tape Backups", "RETAIN", 365, "DISASTER_RECOVERY_EXEMPTION"),
        ]
        # Expand to 42 active constraints matching screenshots
        for i in range(1, 43):
            base = rule_specs[(i - 1) % len(rule_specs)]
            rule_id = f"R-{i:02d}"
            self.policies.append(
                PolicyRule(
                    rule_id=rule_id,
                    system=base[1],
                    data_category=f"{base[2]} (Section {i})",
                    required_treatment=base[3],
                    retention_period_days=base[4],
                    legal_basis=base[5],
                    enforcement_active=True
                )
            )

    def _initialize_hazards(self):
        self.hazards = [
            RecreationHazard(
                hazard_id="HAZ-001",
                pipeline_name="cdc_user_profile_sync",
                source_system="Kafka 3.4 (`cdc.users`)",
                destination_system="AWS Redshift",
                route="Kafka topic `cdc.users` → AWS Redshift",
                hazard_type="RESURRECTION_DETECTED",
                schedule_lag="+4h 12m",
                description="Triggered 4 hours post-deletion; resurrected 12 purged user keys due to missing tombstone retention marker on Kafka partition 03.",
                affected_cases_count=12,
                recommended_action="Apply Tombstone Filter",
                consumer_group="dw-sync-service-v3",
                last_replayed_at="2026-10-13 04:00:22 UTC"
            ),
            RecreationHazard(
                hazard_id="HAZ-002",
                pipeline_name="Nightly Analytics Datalake Dump",
                source_system="AWS RDS Aurora",
                destination_system="S3 Bronze Raw",
                route="AWS RDS Aurora → S3 Bronze Raw",
                hazard_type="FILTER_LEAKAGE",
                schedule_lag="Daily 02:00 UTC",
                description="Lacks tombstone filtering; extracts table snapshots without validating `deleted_at IS NOT NULL` predicate, re-injecting deleted IDs.",
                affected_cases_count=28,
                recommended_action="Quarantine Snapshot",
                consumer_group="lakehouse-etl-runner",
                last_replayed_at="2026-10-14 02:00:15 UTC"
            ),
            RecreationHazard(
                hazard_id="HAZ-003",
                pipeline_name="Search Index Ingest Worker",
                source_system="Kafka 3.4 (`cdc.users`)",
                destination_system="Elasticsearch v8.9",
                route="Kafka topic `cdc.users` → Elasticsearch `customer-profiles-v2`",
                hazard_type="STREAM_REPLAY",
                schedule_lag="Every 6 hours",
                description="Elasticsearch ingest worker consumes uncompacted Kafka topic offsets, recreating documents for recently tombstoned users.",
                affected_cases_count=19,
                recommended_action="Enable Topic Log Compaction",
                consumer_group="es-ingest-consumer",
                last_replayed_at="2026-10-14 06:00:00 UTC"
            ),
            RecreationHazard(
                hazard_id="HAZ-004",
                pipeline_name="Billing Attachment Re-export",
                source_system="Finance DB",
                destination_system="AWS S3 (KYC Vault)",
                route="Billing Engine → S3 `solardyne-kyc-vault`",
                hazard_type="CDC_DESYNC",
                schedule_lag="Weekly Sync",
                description="Re-exports customer invoices containing unredacted driver's license scans and residential addresses into public KYC storage buckets.",
                affected_cases_count=8,
                recommended_action="Redact KYC S3 Bucket",
                consumer_group="fin-invoice-batch",
                last_replayed_at="2026-10-12 18:30:00 UTC"
            ),
            # 10 additional hazards to make 14 hazards total
            RecreationHazard(
                hazard_id="HAZ-005",
                pipeline_name="Snowflake Mart Unhashed ETL",
                source_system="PostgreSQL Replicas",
                destination_system="Snowflake",
                route="Postgres Read Replica → Snowflake Analytics Mart",
                hazard_type="FILTER_LEAKAGE",
                schedule_lag="Hourly",
                description="Failed to invoke SHA-256 pseudonymizer macro during staging transformation, writing plain email strings.",
                affected_cases_count=15,
                recommended_action="Apply Masking Policy",
                consumer_group="snow-pipe-v2",
                last_replayed_at="2026-10-14 11:00:00 UTC"
            )
        ]
        # Append hazards up to 14
        hazard_types = ["STREAM_REPLAY", "CDC_DESYNC", "FILTER_LEAKAGE", "RESURRECTION_DETECTED"]
        for k in range(6, 15):
            h_id = f"HAZ-{k:03d}"
            h_type = hazard_types[(k - 6) % len(hazard_types)]
            self.hazards.append(
                RecreationHazard(
                    hazard_id=h_id,
                    pipeline_name=f"Backup Restore Worker {k:02d}",
                    source_system="Glacier Archive",
                    destination_system="Development Staging",
                    route=f"Archive Vault -> Staging Cluster {k}",
                    hazard_type=h_type,
                    schedule_lag="Scheduled Job",
                    description=f"Snapshot recovery without tombstone scrubbing re-introduces historical identity keys into staging environment {k}.",
                    affected_cases_count=random.randint(4, 18),
                    recommended_action="Scrub Backup Staging",
                    consumer_group=f"backup-sync-worker-{k}",
                    last_replayed_at="2026-10-13 14:00:00 UTC"
                )
            )

    def _initialize_dataset(self):
        # We generate exactly 518 cases:
        # COMPLETE: 342 (66.0%)
        # INCOMPLETE: 128 (24.7%)
        # NOT_APPLICABLE: 48 (9.3%)
        # Total = 518
        
        # 1. First, create CASE-402 (Highlighted active investigation from Screenshot 2)
        case_402_identity = UserIdentity(
            user_id="usr_88291",
            primary_email="m.vance@solardyne.tech",
            full_name="Marcus Vance",
            phone="+1-555-019-2831",
            address="404 Solar Way, Austin TX",
            customer_id="CUST-99214",
            legacy_id="US-8812",
            global_uuid="7f3b89a2-11c0-4e59-a2e1-002847c8f991",
            historical_emails=["marcus.vance.old@gmail.com"],
            auth0_id="auth0|648a1...f0",
            verified=True
        )

        ev_402_1 = EvidenceItem(
            evidence_id="EV-0941",
            system="Elasticsearch v8.9",
            target_locator="customer-profiles-v2 / doc_99214",
            evidence_type="ELASTICSEARCH_DOC",
            sha256_hash="3b994fc812a01f782390a442e912891f7a01",
            timestamp="2026-10-14 18:22:01 UTC",
            payload_snippet=json.dumps({
                "_index": "customer-profiles-v2",
                "_id": "doc_99214",
                "_source": {
                    "account_id": "CUST-99214",
                    "full_name": "Marcus Vance",
                    "phone": "+1-555-019-2831",
                    "address": "404 Solar Way, Austin TX",
                    "opt_out_marketing": True,
                    "last_login": "2026-10-09T18:22:01Z"
                }
            }, indent=2),
            pii_fields_detected=["full_name", "phone", "address"],
            is_violation=True
        )

        ev_402_2 = EvidenceItem(
            evidence_id="EV-0112",
            system="Redis Cluster",
            target_locator="sess:usr:CUST-99214",
            evidence_type="REDIS_KEY",
            sha256_hash="99214fa881b29a7f34c21e0992384a237f81",
            timestamp="2026-10-14 20:11:45 UTC",
            payload_snippet="""127.0.0.1:6379> MEMORY USAGE sess:usr:CUST-99214
(integer) 4120
127.0.0.1:6379> TTL sess:usr:CUST-99214
(integer) -1
127.0.0.1:6379> HGETALL sess:usr:CUST-99214
1) "user_email"
2) "m.vance@solardyne.tech"
3) "role"
4) "enterprise_admin"
5) "session_token"
6) "auth0|648a1...f0" """,
            pii_fields_detected=["user_email", "session_token"],
            is_violation=True
        )

        ev_402_3 = EvidenceItem(
            evidence_id="EV-0842",
            system="Kafka 3.4",
            target_locator="user-account-cdc / Partition 4",
            evidence_type="KAFKA_OFFSET",
            sha256_hash="8840291e9fca21748291a01fc82b471201aa",
            timestamp="2026-10-13 04:00:22 UTC",
            payload_snippet="""Partition: 4 | Offset: 8840291
Timestamp: 2026-10-13 04:00:22 UTC
Key: CUST-99214
Payload:
{
  "op": "u",
  "before": null,
  "after": { "uid": "CUST-99214", "email": "m.vance@solardyne.tech" },
  "source": { "table": "users" }
}
*Consumer dw-sync-service-v3 reading this offset*""",
            pii_fields_detected=["email", "uid"],
            is_violation=True
        )

        steps_402 = [
            RemediationStep(
                step_number=1,
                step_type="REMEDIATION",
                system="Kafka 3.4",
                action="HALT_CDC_PIPELINE",
                target_locator="user-account-cdc / Partition 4",
                evidence_id="EV-0842",
                status="PENDING",
                description="Halt CDC sync pipeline dw-sync-service-v3 to prevent re-injection of CUST-99214."
            ),
            RemediationStep(
                step_number=2,
                step_type="REMEDIATION",
                system="Elasticsearch v8.9",
                action="PURGE_INDEX_DOCUMENT",
                target_locator="customer-profiles-v2 / doc_99214",
                evidence_id="EV-0941",
                status="PENDING",
                description="Purge Elasticsearch index doc_99214 containing plaintext address and phone."
            ),
            RemediationStep(
                step_number=3,
                step_type="REMEDIATION",
                system="Redis Cluster",
                action="EVICT_CACHE_KEY",
                target_locator="sess:usr:CUST-99214",
                evidence_id="EV-0112",
                status="PENDING",
                description="Evict active in-memory session key sess:usr:CUST-99214 with TTL -1."
            ),
            RemediationStep(
                step_number=4,
                step_type="VERIFICATION",
                system="Cryptographic Ledger",
                action="EXECUTE_TOMBSTONE_VERIFICATION",
                target_locator="ALL_NODES",
                evidence_id=None,
                status="PENDING",
                description="Execute cryptographic verification asserting zero residual PII across 6 graph nodes."
            )
        ]

        case_402 = CaseDossier(
            case_id="CASE-402",
            user_id="usr_88291",
            identity=case_402_identity,
            request_type="RIGHT_TO_BE_FORGOTTEN (GDPR Art. 17)",
            submission_timestamp="2026-10-10 09:14:22 UTC",
            audit_cutoff_timestamp="2026-10-14 23:59:59 UTC",
            forensic_evaluated_timestamp="2026-10-18 14:32:04 UTC",
            status=DeletionStatus.INCOMPLETE,
            severity=RiskSeverity.HIGH,
            executive_rationale="Investigation Verdict: INCOMPLETE. While the primary PostgreSQL database record was successfully purged on 2026-10-12 11:20 UTC, forensic telemetry confirms personal data remains unredacted in Elasticsearch cluster index customer-profiles-v2 (Doc ID: doc_99214) and memory in the Redis session cache. Crucially, an active CDC sync job (cdc_user_profile_sync) scheduled every 6 hours is continually pulling from an unpurged Kafka event replay topic, recreating customer PII downstream.",
            data_integrity_score=43,
            systems_monitored=7,
            systems_failed=3,
            systems_purged=4,
            confirmed_violations=[
                {
                    "violation_id": "VIOLATION-1",
                    "system": "Elasticsearch",
                    "rule": "Rule R-04",
                    "description": "Full plaintext residential address and phone preserved in index customer-profiles-v2 under record doc_99214."
                },
                {
                    "violation_id": "VIOLATION-2",
                    "system": "Redis Session",
                    "rule": "TTL Override",
                    "description": "Active session key sess:usr:CUST-99214 has explicit TTL flag set to -1 (persistent in-memory token)."
                },
                {
                    "violation_id": "VIOLATION-3",
                    "system": "S3 Object Store",
                    "rule": "Unlinked File",
                    "description": "S3 bucket solardyne-kyc-vault contains unpurged binary: m_vance_drivers_license.pdf."
                }
            ],
            recreation_risks=[self.hazards[0]],
            evidence_manifest=[ev_402_1, ev_402_2, ev_402_3],
            verification_pipeline_nodes=[
                {"step": "1. INGEST & IDENTITY", "status": "COMPLETED", "detail": "Completed (6 nodes resolved)", "icon": "check_circle"},
                {"step": "2. SQL TOMBSTONE", "status": "COMPLETED", "detail": "PostgreSQL SHA: d8a9f...", "icon": "check_circle"},
                {"step": "3. RESIDUAL PII SCAN", "status": "FAILED", "detail": "FAILED · 3 Systems Flagged", "icon": "dangerous"},
                {"step": "4. LEGAL ATTESTATION", "status": "BLOCKED", "detail": "Blocked by Open Failures", "icon": "radio_button_unchecked"}
            ],
            remediation_steps=steps_402,
            steps_json_str=json.dumps([s.to_dict() for s in steps_402])
        )

        self.cases["CASE-402"] = case_402
        self.evidence["EV-0941"] = ev_402_1
        self.evidence["EV-0112"] = ev_402_2
        self.evidence["EV-0842"] = ev_402_3

        # Create CASE-319, CASE-104, CASE-221 (featured in Screenshot 1)
        self._add_featured_case(
            case_id="CASE-319",
            user_id="usr_31901",
            email="m.chen@fintech.net",
            name="Mei Chen",
            cust_id="CUST-31901",
            violations="S3 billing attachment unredacted",
            hazard_label="Billing Re-export",
            hazard=self.hazards[3]
        )

        self._add_featured_case(
            case_id="CASE-104",
            user_id="usr_10401",
            email="dev_sarah@cloud.org",
            name="Sarah Connor",
            cust_id="CUST-10401",
            violations="PostgreSQL clean; Kafka offset replay active",
            hazard_label="Stream Replay",
            hazard=self.hazards[2]
        )

        self._add_featured_case(
            case_id="CASE-221",
            user_id="usr_22101",
            email="alex.v@telecom.de",
            name="Alex Von Berg",
            cust_id="CUST-22101",
            violations="Snowflake Analytics Mart has unhashed PII",
            hazard_label="None Detected",
            hazard=None
        )

        # Generate the remaining 514 cases deterministically to reach 518 total:
        # COMPLETE: 342 total
        # INCOMPLETE: 128 total (including CASE-402, 319, 104, 221 = 4 done, 124 left)
        # NOT_APPLICABLE: 48 total
        
        # Incomplete cases left = 124
        # Complete cases left = 342
        # Not applicable cases left = 48
        
        first_names = ["James", "Emma", "Liam", "Olivia", "Noah", "Ava", "Lucas", "Mia", "Ethan", "Sophia", "Oliver", "Isabella", "Mateo", "Charlotte", "Amari", "Harper"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson"]
        domains = ["corp.io", "techfirm.net", "enterprise.org", "clouddata.com", "financeglobal.co", "datasync.eu"]

        # Track numbers generated
        case_counter = 1
        complete_target = 342
        incomplete_target = 128
        na_target = 48

        complete_count = 0
        incomplete_count = 4  # 402, 319, 104, 221
        na_count = 0

        while len(self.cases) < 518:
            cid = f"CASE-{case_counter:03d}"
            case_counter += 1
            if cid in self.cases:
                continue

            fname = first_names[(case_counter * 3) % len(first_names)]
            lname = last_names[(case_counter * 7) % len(last_names)]
            email = f"{fname.lower()}.{lname.lower()}_{(case_counter % 900) + 100}@{domains[case_counter % len(domains)]}"
            user_id = f"usr_{case_counter:05d}"
            cust_id = f"CUST-{case_counter:05d}"

            # Determine target bucket
            if complete_count < complete_target:
                status = DeletionStatus.COMPLETE
                complete_count += 1
            elif incomplete_count < incomplete_target:
                status = DeletionStatus.INCOMPLETE
                incomplete_count += 1
            else:
                status = DeletionStatus.NOT_APPLICABLE
                na_count += 1

            self._create_generic_case(cid, user_id, email, f"{fname} {lname}", cust_id, status)

    def _add_featured_case(self, case_id: str, user_id: str, email: str, name: str, cust_id: str, violations: str, hazard_label: str, hazard: Optional[RecreationHazard]):
        identity = UserIdentity(
            user_id=user_id,
            primary_email=email,
            full_name=name,
            phone="+1-555-021-9988",
            address="742 Evergreen Terrace",
            customer_id=cust_id,
            legacy_id=f"LEG-{cust_id[-4:]}",
            global_uuid=uuid.uuid5(uuid.NAMESPACE_DNS, email).hex,
            historical_emails=[f"{email.split('@')[0]}.archive@gmail.com"],
            auth0_id=f"auth0|{hashlib.md5(email.encode()).hexdigest()[:12]}",
            verified=True
        )

        ev_id = f"EV-{hashlib.md5(case_id.encode()).hexdigest()[:4].upper()}"
        ev = EvidenceItem(
            evidence_id=ev_id,
            system="Storage Engine",
            target_locator=violations,
            evidence_type="RAW_PII",
            sha256_hash=hashlib.sha256(case_id.encode()).hexdigest(),
            timestamp="2026-10-14 14:10:00 UTC",
            payload_snippet=f"{violations} discovered in telemetry log for {email}.",
            pii_fields_detected=["email", "name"],
            is_violation=True
        )
        self.evidence[ev_id] = ev

        steps = [
            RemediationStep(
                step_number=1,
                step_type="FINDING",
                system=hazard.source_system if hazard else "Storage Engine",
                action="IDENTIFIED_UNPURGED_PII",
                target_locator=violations,
                evidence_id=ev_id,
                status="EXECUTED",
                description=f"Confirmed unpurged personal data in {violations}."
            ),
            RemediationStep(
                step_number=2,
                step_type="REMEDIATION",
                system=hazard.source_system if hazard else "Storage Engine",
                action="REDACT_OR_PURGE",
                target_locator=violations,
                evidence_id=ev_id,
                status="PENDING",
                description=f"Execute required treatment for {violations}."
            ),
            RemediationStep(
                step_number=3,
                step_type="VERIFICATION",
                system="Verification Engine",
                action="ASSERT_ZERO_RECORDS",
                target_locator=violations,
                evidence_id=None,
                status="PENDING",
                description="Assert cryptographic zero-record tombstone."
            )
        ]

        dossier = CaseDossier(
            case_id=case_id,
            user_id=user_id,
            identity=identity,
            request_type="RIGHT_TO_BE_FORGOTTEN (GDPR Art. 17)",
            submission_timestamp="2026-10-11 10:20:00 UTC",
            audit_cutoff_timestamp="2026-10-14 23:59:59 UTC",
            forensic_evaluated_timestamp="2026-10-18 14:32:04 UTC",
            status=DeletionStatus.INCOMPLETE,
            severity=RiskSeverity.HIGH,
            executive_rationale=f"Investigation Verdict: INCOMPLETE. Active violations identified: {violations}. Recreation hazard: {hazard_label}.",
            data_integrity_score=52,
            systems_monitored=6,
            systems_failed=2,
            systems_purged=4,
            confirmed_violations=[{
                "violation_id": f"VIO-{case_id}",
                "system": "Distributed Target",
                "rule": "Rule R-07",
                "description": violations
            }],
            recreation_risks=[hazard] if hazard else [],
            evidence_manifest=[ev],
            verification_pipeline_nodes=[
                {"step": "1. INGEST & IDENTITY", "status": "COMPLETED", "detail": "Identity graph anchored", "icon": "check_circle"},
                {"step": "2. SQL TOMBSTONE", "status": "COMPLETED", "detail": "PostgreSQL Purged", "icon": "check_circle"},
                {"step": "3. RESIDUAL PII SCAN", "status": "FAILED", "detail": f"Violations: {violations}", "icon": "dangerous"},
                {"step": "4. LEGAL ATTESTATION", "status": "BLOCKED", "detail": "Blocked by Open Failures", "icon": "radio_button_unchecked"}
            ],
            remediation_steps=steps,
            steps_json_str=json.dumps([s.to_dict() for s in steps])
        )
        self.cases[case_id] = dossier

    def _create_generic_case(self, case_id: str, user_id: str, email: str, name: str, cust_id: str, status: DeletionStatus):
        is_verified = (status != DeletionStatus.NOT_APPLICABLE)
        identity = UserIdentity(
            user_id=user_id,
            primary_email=email if is_verified else f"unknown_{user_id}@unverified.org",
            full_name=name if is_verified else "Non-Matched Subject",
            customer_id=cust_id if is_verified else None,
            legacy_id=f"LEG-{cust_id[-4:]}" if is_verified else None,
            global_uuid=hashlib.sha256(email.encode()).hexdigest()[:32] if is_verified else None,
            historical_emails=[f"{email.split('@')[0]}.old@mail.com"] if is_verified else [],
            verified=is_verified
        )

        steps: List[RemediationStep] = []
        violations: List[Dict[str, Any]] = []
        recreation: List[RecreationHazard] = []
        ev_manifest: List[EvidenceItem] = []

        if status == DeletionStatus.COMPLETE:
            ev_id = f"EV-{hashlib.md5((case_id + '_proof').encode()).hexdigest()[:4].upper()}"
            ev = EvidenceItem(
                evidence_id=ev_id,
                system="All 18 Topologies",
                target_locator="All Distributed Nodes",
                evidence_type="TOMBSTONE_PROOF",
                sha256_hash=hashlib.sha256((case_id + '_complete').encode()).hexdigest(),
                timestamp="2026-10-14 22:00:00 UTC",
                payload_snippet="Tombstone verification succeeded across all nodes. Zero residual PII detected.",
                pii_fields_detected=[],
                is_violation=False
            )
            ev_manifest.append(ev)
            self.evidence[ev_id] = ev

            steps = [
                RemediationStep(
                    step_number=1,
                    step_type="VERIFICATION",
                    system="Primary OLTP",
                    action="VERIFY_POSTGRES_TOMBSTONE",
                    target_locator="users.deleted_at",
                    evidence_id=ev_id,
                    status="VERIFIED",
                    description="Verified PostgreSQL record purged with valid tombstone hash."
                ),
                RemediationStep(
                    step_number=2,
                    step_type="VERIFICATION",
                    system="Secondary Replicas & Caches",
                    action="VERIFY_ZERO_RESIDUALS",
                    target_locator="Elasticsearch, Redis, S3",
                    evidence_id=ev_id,
                    status="VERIFIED",
                    description="Attested absence of PII in all downstream caches and indexes."
                )
            ]
            integrity_score = 100
            severity = RiskSeverity.NONE
            rationale = "Investigation Verdict: COMPLETE. All requested personal data categories have been purged or lawfully retained per policy. Tombstone hashes anchored."
        elif status == DeletionStatus.INCOMPLETE:
            ev_id = f"EV-{hashlib.md5((case_id + '_res').encode()).hexdigest()[:4].upper()}"
            ev = EvidenceItem(
                evidence_id=ev_id,
                system="Search Cluster / Cache",
                target_locator=f"customer-records / {cust_id}",
                evidence_type="RESIDUAL_PII",
                sha256_hash=hashlib.sha256((case_id + '_residual').encode()).hexdigest(),
                timestamp="2026-10-14 18:00:00 UTC",
                payload_snippet=f"Residual record unredacted: {email}",
                pii_fields_detected=["email", "full_name"],
                is_violation=True
            )
            ev_manifest.append(ev)
            self.evidence[ev_id] = ev

            steps = [
                RemediationStep(
                    step_number=1,
                    step_type="FINDING",
                    system="Search Cluster",
                    action="IDENTIFIED_UNPURGED_PII",
                    target_locator=f"customer-records / {cust_id}",
                    evidence_id=ev_id,
                    status="EXECUTED",
                    description=f"Confirmed unpurged personal data in index for {cust_id}."
                ),
                RemediationStep(
                    step_number=2,
                    step_type="REMEDIATION",
                    system="Search Cluster",
                    action="PURGE_RECORD",
                    target_locator=f"customer-records / {cust_id}",
                    evidence_id=ev_id,
                    status="PENDING",
                    description="Execute hard purge on customer index document."
                ),
                RemediationStep(
                    step_number=3,
                    step_type="VERIFICATION",
                    system="Audit Engine",
                    action="ASSERT_ZERO_RECORDS",
                    target_locator=f"customer-records / {cust_id}",
                    evidence_id=None,
                    status="PENDING",
                    description="Verify clean deletion with cryptographic confirmation."
                )
            ]
            violations.append({
                "violation_id": f"VIO-{case_id}",
                "system": "Search Cluster",
                "rule": "Rule R-04",
                "description": f"Residual identity document {cust_id} remained searchable."
            })
            if random.random() < 0.2:
                recreation.append(random.choice(self.hazards))
            integrity_score = random.randint(35, 65)
            severity = RiskSeverity.HIGH if recreation else RiskSeverity.MEDIUM
            rationale = f"Investigation Verdict: INCOMPLETE. Personal data remains unredacted in secondary stores for {email}. Immediate remediation required."
        else: # NOT_APPLICABLE
            # Problem statement: NOT_APPLICABLE cases must produce empty steps array []
            steps = []
            integrity_score = 100
            severity = RiskSeverity.NONE
            rationale = "Investigation Verdict: NOT_APPLICABLE. Identity non-match. Subject did not request deletion or zero trace was ever stored."

        pipeline_nodes = [
            {"step": "1. INGEST & IDENTITY", "status": "COMPLETED", "detail": "Completed" if is_verified else "Identity Non-Match", "icon": "check_circle" if is_verified else "info"},
            {"step": "2. SQL TOMBSTONE", "status": "COMPLETED" if status == DeletionStatus.COMPLETE else ("N/A" if status == DeletionStatus.NOT_APPLICABLE else "COMPLETED"), "detail": "PostgreSQL Purged", "icon": "check_circle"},
            {"step": "3. RESIDUAL PII SCAN", "status": "PASSED" if status != DeletionStatus.INCOMPLETE else "FAILED", "detail": "Zero Residuals" if status != DeletionStatus.INCOMPLETE else "Residuals Found", "icon": "check_circle" if status != DeletionStatus.INCOMPLETE else "dangerous"},
            {"step": "4. LEGAL ATTESTATION", "status": "ATTESTED" if status == DeletionStatus.COMPLETE else ("N/A" if status == DeletionStatus.NOT_APPLICABLE else "BLOCKED"), "detail": "GDPR Compliance Met" if status == DeletionStatus.COMPLETE else "Pending Remediation", "icon": "verified" if status == DeletionStatus.COMPLETE else "radio_button_unchecked"}
        ]

        dossier = CaseDossier(
            case_id=case_id,
            user_id=user_id,
            identity=identity,
            request_type="RIGHT_TO_BE_FORGOTTEN (GDPR Art. 17)",
            submission_timestamp="2026-10-10 12:00:00 UTC",
            audit_cutoff_timestamp="2026-10-14 23:59:59 UTC",
            forensic_evaluated_timestamp="2026-10-18 14:32:04 UTC",
            status=status,
            severity=severity,
            executive_rationale=rationale,
            data_integrity_score=integrity_score,
            systems_monitored=18 if is_verified else 0,
            systems_failed=len(violations),
            systems_purged=18 - len(violations) if is_verified else 0,
            confirmed_violations=violations,
            recreation_risks=recreation,
            evidence_manifest=ev_manifest,
            verification_pipeline_nodes=pipeline_nodes,
            remediation_steps=steps,
            steps_json_str=json.dumps([s.to_dict() for s in steps])
        )
        self.cases[case_id] = dossier

# Global singleton
DATA_STORE = ChallengeDataStore()
