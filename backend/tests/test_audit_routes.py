"""
GhostGuard AI - Audit REST API Tests
Tests all audit, overview, case query, lineage, policy, remediation, and submission endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_audit_health_endpoint():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ONLINE"
    assert data["cases_count"] == 518
    assert data["hash"] == "9e8a3a71b2d98c4d2"

def test_overview_endpoint():
    resp = client.get("/api/overview")
    assert resp.status_code == 200
    data = resp.json()
    assert data["ledger_status"] == "VALID"
    assert data["metrics"]["total_ingested"] == 518
    assert data["metrics"]["complete"] == 342
    assert data["metrics"]["incomplete"] == 128
    assert data["metrics"]["not_applicable"] == 48
    assert data["metrics"]["recreation_hazards"] == 14
    assert len(data["systems_residual"]) >= 4
    assert len(data["high_priority_cases"]) >= 4

def test_get_case_detail_canonical():
    resp = client.get("/api/cases/CASE-402")
    assert resp.status_code == 200
    data = resp.json()
    assert data["case_id"] == "CASE-402"
    assert data["status"] == "INCOMPLETE"
    assert data["subject"]["customer_id"] == "CUST-99214"
    assert len(data["confirmed_violations"]) >= 1
    assert data["recreation_risks"] is not None

def test_get_case_detail_normalized():
    # Test lowercase unpadded input normalizes to CASE-001
    resp = client.get("/api/cases/case-1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["case_id"] == "CASE-001"
    assert data["status"] == "COMPLETE"

    # Test lowercase padded input for CASE-099
    resp_99 = client.get("/api/cases/case-099")
    assert resp_99.status_code == 200
    assert resp_99.json()["case_id"] == "CASE-099"

def test_get_case_detail_nonexistent():
    resp = client.get("/api/cases/CASE-9999")
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()

def test_requests_pagination_and_search():
    # Page 1 with limit 10
    resp = client.get("/api/requests?page=1&limit=10")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 518
    assert len(data["cases"]) == 10
    assert data["totalPages"] == 52

    # Status filter INCOMPLETE
    resp_inc = client.get("/api/requests?status_filter=INCOMPLETE")
    assert resp_inc.status_code == 200
    data_inc = resp_inc.json()
    assert data_inc["total"] == 128
    assert all(c["status"] == "INCOMPLETE" for c in data_inc["cases"])

    # Search for CASE-402
    resp_s = client.get("/api/requests?search=CASE-402")
    assert resp_s.status_code == 200
    assert resp_s.json()["total"] == 1
    assert resp_s.json()["cases"][0]["case_id"] == "CASE-402"

def test_lineage_and_policies():
    resp_lin = client.get("/api/lineage")
    assert resp_lin.status_code == 200
    assert resp_lin.json()["systems"] == 18

    resp_pol = client.get("/api/policies")
    assert resp_pol.status_code == 200
    assert resp_pol.json()["total_rules"] == 42

def test_remediation_and_evaluation():
    resp_rem = client.get("/api/remediation")
    assert resp_rem.status_code == 200
    assert resp_rem.json()["incomplete_cases_count"] == 128

    resp_eval = client.get("/api/evaluation")
    assert resp_eval.status_code == 200
    assert resp_eval.json()["sample_size"] == 518

def test_submission_validate_and_download():
    resp_val = client.get("/api/submission/validate")
    assert resp_val.status_code == 200
    data = resp_val.json()
    assert data["is_valid"] is True
    assert data["cases_count"] == 518
    assert data["header"] == "case_id,deletion_status,steps_json"

    resp_down = client.get("/api/submission/download")
    assert resp_down.status_code == 200
    assert "text/csv" in resp_down.headers["content-type"]
    assert "case_id,deletion_status,steps_json" in resp_down.text
