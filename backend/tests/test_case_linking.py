"""
GhostGuard AI - Case Linking Tests
Verifies Case ID validation, existence checks, auto-suggestion heuristics, and conflict handling.
"""

import pytest
from backend.services.case_linking_service import CaseLinkingService, CaseNotFoundError

def test_case_id_normalization_specific_cases():
    """
    Ensure Case IDs preserve three-digit zero-padding:
    - CASE-001 (e.g. 'case-1', 'CASE-1', 'case-01', 'case-001', 'CASE-001')
    - CASE-099 (e.g. 'case-99', 'CASE-99', 'case-099', 'CASE-099')
    - CASE-402 (e.g. 'case-402', 'CASE-402', ' Case-402 ', ' CASE - 402 ')
    """
    # CASE-001: preserve 3-digit zero-padding
    for variant in ["CASE-001", "case-001", "CASE-1", "case-1", "case-01", " CASE-001 ", " case-1 "]:
        assert CaseLinkingService.normalize_case_id(variant) == "CASE-001"
        assert CaseLinkingService.case_exists(variant) is True
        assert CaseLinkingService.validate_case_id(variant) == "CASE-001"

    # CASE-099: preserve 3-digit zero-padding
    for variant in ["CASE-099", "case-099", "CASE-99", "case-99", " CASE-099 ", " case-99 "]:
        assert CaseLinkingService.normalize_case_id(variant) == "CASE-099"
        assert CaseLinkingService.case_exists(variant) is True
        assert CaseLinkingService.validate_case_id(variant) == "CASE-099"

    # CASE-402: remains CASE-402 across cases and spacing
    for variant in ["CASE-402", "case-402", " Case-402 ", " CASE - 402 "]:
        assert CaseLinkingService.normalize_case_id(variant) == "CASE-402"
        assert CaseLinkingService.case_exists(variant) is True
        assert CaseLinkingService.validate_case_id(variant) == "CASE-402"

def test_existing_case_validation():
    # Canonical 3-digit zero-padded cases
    assert CaseLinkingService.case_exists("CASE-001") is True
    assert CaseLinkingService.case_exists("CASE-099") is True
    assert CaseLinkingService.case_exists("CASE-402") is True
    assert CaseLinkingService.case_exists("case-402") is True
    assert CaseLinkingService.case_exists("CASE-319") is True

    # Unpadded or mixed-case representations normalize to canonical 3-digit format
    assert CaseLinkingService.normalize_case_id("case-1") == "CASE-001"
    assert CaseLinkingService.normalize_case_id("CASE-99") == "CASE-099"
    assert CaseLinkingService.normalize_case_id("CASE-402") == "CASE-402"

    assert CaseLinkingService.validate_case_id("case-1") == "CASE-001"
    assert CaseLinkingService.validate_case_id("CASE-001") == "CASE-001"
    assert CaseLinkingService.validate_case_id("CASE-099") == "CASE-099"
    assert CaseLinkingService.validate_case_id("CASE-402") == "CASE-402"

def test_nonexistent_case_validation():
    assert CaseLinkingService.case_exists("CASE-999") is False
    with pytest.raises(CaseNotFoundError, match="does not exist"):
        CaseLinkingService.validate_case_id("CASE-999")

def test_case_suggestion_from_explicit_case_id():
    text = "The following log confirms deletion audit for CASE-402 in partition 04."
    suggested_id, conf, reasons = CaseLinkingService.discover_case_suggestions(text)
    assert suggested_id == "CASE-402"
    assert conf >= 0.85
    assert len(reasons) > 0

def test_case_suggestion_from_zero_padded_case_ids():
    # Both CASE-001 and CASE-1 in text should discover canonical CASE-001
    text1 = "Audit record attached to CASE-001 in bronze datalake."
    suggested1, conf1, _ = CaseLinkingService.discover_case_suggestions(text1)
    assert suggested1 == "CASE-001"
    assert conf1 >= 0.85

    text2 = "Telemetry for CASE-099 confirmed purged."
    suggested2, conf2, _ = CaseLinkingService.discover_case_suggestions(text2)
    assert suggested2 == "CASE-099"
    assert conf2 >= 0.85

    text3 = "Notice regarding case-1 for customer."
    suggested3, conf3, _ = CaseLinkingService.discover_case_suggestions(text3)
    assert suggested3 == "CASE-001"
    assert conf3 >= 0.85

def test_case_suggestion_from_customer_id():
    text = "Account record CUST-99214 was found unredacted in redis cluster."
    suggested_id, conf, reasons = CaseLinkingService.discover_case_suggestions(text)
    assert suggested_id == "CASE-402"
    assert conf >= 0.85

def test_case_suggestion_from_email():
    text = "Customer email m.vance@solardyne.tech requested complete removal under GDPR Art 17."
    suggested_id, conf, reasons = CaseLinkingService.discover_case_suggestions(text)
    assert suggested_id == "CASE-402"
    assert conf >= 0.85

def test_ambiguous_case_suggestions():
    text = "Document mentions both CASE-402 and CASE-319 across multiple systems."
    suggested_id, conf, reasons = CaseLinkingService.discover_case_suggestions(text)
    # Ambiguous matches require manual confirmation and must NOT silently attach
    assert suggested_id is None
    assert "Confirmation required" in reasons[0]
