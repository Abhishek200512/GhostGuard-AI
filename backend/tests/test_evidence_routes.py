"""
GhostGuard AI - FastAPI Evidence Route Tests
Uses TestClient to test all evidence ingestion, OCR text extraction, linking, and query endpoints.
"""

import io
import uuid
import pytest
from fastapi.testclient import TestClient
from PIL import Image, ImageDraw
from backend.main import app

client = TestClient(app)

def create_image_file(text: str = "CASE-402 EVIDENCE") -> bytes:
    img = Image.new("RGB", (300, 100), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Add unique nonce to prevent duplicate SHA across test runs
    nonce = uuid.uuid4().hex[:8]
    draw.text((10, 35), f"{text} [{nonce}]", fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def test_ocr_health_endpoint():
    resp = client.get("/api/health/ocr")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ["HEALTHY", "DEGRADED"]
    assert "tesseract_available" in data
    assert ".pdf" in data["supported_formats"]
    assert data["max_file_size_mb"] == 25

def test_upload_image_with_case_id():
    img_bytes = create_image_file("CASE-402 PURGE TEST 1")
    resp = client.post(
        "/api/evidence/upload",
        files={"file": ("test_kyc_402.png", img_bytes, "image/png")},
        data={"case_id": "CASE-402", "language": "eng"}
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["case_id"] == "CASE-402"
    assert data["evidence_id"].startswith("EV-")
    assert data["processing_status"] in ["COMPLETED", "FAILED"]
    assert data["page_count"] == 1

def test_duplicate_sha256_detection():
    img_bytes = create_image_file("IDENTICAL DUPLICATE CONTENT")
    # First upload
    resp1 = client.post(
        "/api/evidence/upload",
        files={"file": ("orig.png", img_bytes, "image/png")},
        data={"case_id": "CASE-104"}
    )
    assert resp1.status_code == 201

    # Second upload with identical bytes must trigger 409 Conflict
    resp2 = client.post(
        "/api/evidence/upload",
        files={"file": ("duplicate.png", img_bytes, "image/png")},
        data={"case_id": "CASE-104"}
    )
    assert resp2.status_code == 409
    assert "Duplicate evidence content detected" in resp2.text

def test_upload_with_nonexistent_case_id():
    img_bytes = create_image_file("NONEXISTENT CASE")
    resp = client.post(
        "/api/evidence/upload",
        files={"file": ("bad_case.png", img_bytes, "image/png")},
        data={"case_id": "CASE-9999"}
    )
    assert resp.status_code == 404
    assert "does not exist" in resp.json()["detail"]

def test_get_evidence_list_and_detail():
    img_bytes = create_image_file("LIST TEST EVIDENCE")
    resp_up = client.post(
        "/api/evidence/upload",
        files={"file": ("list_test.png", img_bytes, "image/png")},
        data={"case_id": "CASE-319"}
    )
    ev_id = resp_up.json()["evidence_id"]

    # List evidence
    resp_list = client.get("/api/evidence")
    assert resp_list.status_code == 200
    list_data = resp_list.json()
    assert list_data["total"] >= 1
    assert any(item["id"] == ev_id for item in list_data["items"])

    # Detail
    resp_detail = client.get(f"/api/evidence/{ev_id}")
    assert resp_detail.status_code == 200
    detail_data = resp_detail.json()
    assert detail_data["id"] == ev_id
    assert detail_data["case_id"] == "CASE-319"
    assert len(detail_data["audit_logs"]) >= 1

    # Extracted text endpoint
    resp_text = client.get(f"/api/evidence/{ev_id}/text")
    assert resp_text.status_code == 200
    assert "extracted_text" in resp_text.json()

def test_relink_evidence_to_different_case():
    img_bytes = create_image_file("RELINK TEST")
    resp_up = client.post(
        "/api/evidence/upload",
        files={"file": ("relink.png", img_bytes, "image/png")},
        data={"case_id": "CASE-319"}
    )
    ev_id = resp_up.json()["evidence_id"]

    # Relink to CASE-402
    resp_link = client.post(
        f"/api/evidence/{ev_id}/link",
        json={"case_id": "CASE-402", "reason": "Corrected case assignment"}
    )
    assert resp_link.status_code == 200
    linked_data = resp_link.json()
    assert linked_data["case_id"] == "CASE-402"
    assert linked_data["linking_method"] == "MANUAL_OVERRIDE"

    # Verify audit log recorded the change
    audit_actions = [log["action"] for log in linked_data["audit_logs"]]
    assert "CASE_LINKED" in audit_actions

def test_case_evidence_endpoint():
    resp = client.get("/api/cases/CASE-402/evidence")
    assert resp.status_code == 200
    data = resp.json()
    assert data["case_id"] == "CASE-402"
    assert "items" in data
