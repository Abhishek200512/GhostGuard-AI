"""
GhostGuard AI - Automated Test Suite
HackerRank Orchestrate October 2026: 'Ghost Data Still Exists'
Tests schema integrity, edge cases, recreation hazards, and steps_json ordering.
"""

import unittest
import json
import csv
import io
import os
from backend.models import DeletionStatus
from backend.data_store import DATA_STORE
from backend.engine import AUDIT_ENGINE

class TestGhostGuardAuditEngine(unittest.TestCase):

    def test_total_dataset_case_count(self):
        """Verifies exactly 518 cases are ingested and evaluated."""
        self.assertEqual(len(DATA_STORE.cases), 518)

    def test_status_distribution(self):
        """Verifies distribution counts match challenge specifications."""
        summary = AUDIT_ENGINE.run_full_audit()
        dist = summary["status_distribution"]
        self.assertEqual(dist["COMPLETE"], 342)
        self.assertEqual(dist["INCOMPLETE"], 128)
        self.assertEqual(dist["NOT_APPLICABLE"], 48)

    def test_case_402_detailed_forensics(self):
        """Verifies highlighted active case CASE-402 details."""
        case = DATA_STORE.cases.get("CASE-402")
        self.assertIsNotNone(case)
        self.assertEqual(case.status, DeletionStatus.INCOMPLETE)
        self.assertEqual(case.identity.customer_id, "CUST-99214")
        self.assertEqual(case.identity.primary_email, "m.vance@solardyne.tech")
        self.assertIn("marcus.vance.old@gmail.com", case.identity.historical_emails)
        
        # Check violations
        self.assertEqual(len(case.confirmed_violations), 3)
        # Check evidence manifest
        self.assertEqual(len(case.evidence_manifest), 3)
        ev_ids = [e.evidence_id for e in case.evidence_manifest]
        self.assertIn("EV-0941", ev_ids)
        self.assertIn("EV-0112", ev_ids)
        self.assertIn("EV-0842", ev_ids)
        
        # Check steps
        self.assertEqual(len(case.remediation_steps), 4)
        self.assertEqual(case.remediation_steps[0].action, "HALT_CDC_PIPELINE")
        self.assertEqual(case.remediation_steps[1].action, "PURGE_INDEX_DOCUMENT")
        self.assertEqual(case.remediation_steps[2].action, "EVICT_CACHE_KEY")
        self.assertEqual(case.remediation_steps[3].action, "EXECUTE_TOMBSTONE_VERIFICATION")

    def test_not_applicable_cases_have_empty_steps(self):
        """Verifies NOT_APPLICABLE cases output strict empty array []."""
        for case in DATA_STORE.cases.values():
            if case.status == DeletionStatus.NOT_APPLICABLE:
                self.assertEqual(len(case.remediation_steps), 0)
                self.assertEqual(case.steps_json_str, "[]")

    def test_csv_export_format_and_schema(self):
        """Verifies output.csv conforms strictly to HackerRank official schema."""
        csv_str = AUDIT_ENGINE.export_output_csv()
        reader = csv.DictReader(io.StringIO(csv_str))
        self.assertEqual(reader.fieldnames, ["case_id", "deletion_status", "steps_json"])

        rows = list(reader)
        self.assertEqual(len(rows), 518)

        case_ids = set()
        for row in rows:
            cid = row["case_id"]
            self.assertNotIn(cid, case_ids, f"Duplicate case ID: {cid}")
            case_ids.add(cid)

            status = row["deletion_status"]
            self.assertIn(status, ["COMPLETE", "INCOMPLETE", "NOT_APPLICABLE"])

            steps = json.loads(row["steps_json"])
            self.assertIsInstance(steps, list)
            if status == "NOT_APPLICABLE":
                self.assertEqual(len(steps), 0)

    def test_submission_validator_passes(self):
        """Verifies the validator confirms zero errors on official export."""
        csv_str = AUDIT_ENGINE.export_output_csv()
        result = AUDIT_ENGINE.validate_submission_format(csv_str)
        self.assertTrue(result["is_valid"])
        self.assertEqual(result["error_count"], 0)
        self.assertEqual(result["total_cases_validated"], 518)
        self.assertGreaterEqual(result["benchmark_metric"]["score"], 0.94)

    def test_recreation_hazards(self):
        """Verifies 14 recreation hazards are tracked and isolated."""
        self.assertEqual(len(DATA_STORE.hazards), 14)
        cdc_hazard = DATA_STORE.hazards[0]
        self.assertEqual(cdc_hazard.pipeline_name, "cdc_user_profile_sync")
        self.assertEqual(cdc_hazard.affected_cases_count, 12)

    def test_policy_rules_count(self):
        """Verifies 42 operational constraints from deletion_rules.csv."""
        self.assertEqual(len(DATA_STORE.policies), 42)

if __name__ == "__main__":
    unittest.main()
