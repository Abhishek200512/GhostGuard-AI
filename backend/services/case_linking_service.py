"""
GhostGuard AI - Case Linking & Identification Service
Validates Case IDs, discovers suggestions from extracted text, and tracks provenance.
"""

import re
from typing import Optional, Tuple, List, Dict, Any
from backend.data_store import DATA_STORE

class CaseNotFoundError(Exception):
    pass

class CaseLinkingService:
    @classmethod
    def normalize_case_id(cls, case_id: str) -> str:
        """
        Normalizes Case IDs to canonical 3-digit zero-padded uppercase format
        (e.g. 'case-1' -> 'CASE-001', 'CASE-099' -> 'CASE-099', 'CASE-402' -> 'CASE-402').
        """
        if not case_id:
            return ""
        clean_id = case_id.strip().upper()
        m = re.match(r"^CASE\s*-\s*(\d+)$", clean_id)
        if m:
            return f"CASE-{int(m.group(1)):03d}"
        return clean_id

    @classmethod
    def case_exists(cls, case_id: str) -> bool:
        if not case_id:
            return False
        normalized = cls.normalize_case_id(case_id)
        # Direct check in canonical cases
        return normalized in DATA_STORE.cases

    @classmethod
    def validate_case_id(cls, case_id: str) -> str:
        normalized = cls.normalize_case_id(case_id)
        if not cls.case_exists(normalized):
            raise CaseNotFoundError(f"Target case '{case_id}' does not exist in the challenge registry (Cases CASE-001 to CASE-518).")
        return normalized

    @classmethod
    def discover_case_suggestions(cls, text: str) -> Tuple[Optional[str], float, List[str]]:
        """
        Analyzes extracted text for reliable identity anchors:
        1. Explicit CASE-XXX references
        2. Customer IDs (CUST-XXXXX)
        3. Exact matching email addresses
        Returns (suggested_case_id, confidence, match_reasons)
        """
        if not text:
            return None, 0.0, []

        candidate_cases: Dict[str, List[str]] = {}

        # 1. Look for explicit CASE-###
        case_matches = re.findall(r"\bCASE-(\d+)\b", text, re.IGNORECASE)
        for num in case_matches:
            cid = f"CASE-{int(num):03d}"
            if cls.case_exists(cid):
                candidate_cases.setdefault(cid, []).append(f"Explicit Case ID pattern '{cid}' detected in text")

        # 2. Look for customer ID (e.g. CUST-99214)
        cust_matches = re.findall(r"\bCUST-(\d+)\b", text, re.IGNORECASE)
        for num in cust_matches:
            cust_str = f"CUST-{num}"
            for cid, case_obj in DATA_STORE.cases.items():
                if case_obj.identity.customer_id == cust_str:
                    candidate_cases.setdefault(cid, []).append(f"Customer identifier '{cust_str}' matches case subject")

        # 3. Look for email matches
        email_matches = re.findall(r"[\w\.-]+@[\w\.-]+\.\w+", text)
        for em in email_matches:
            clean_em = em.lower()
            for cid, case_obj in DATA_STORE.cases.items():
                if case_obj.identity.primary_email.lower() == clean_em:
                    candidate_cases.setdefault(cid, []).append(f"Subject email '{clean_em}' found in document text")
                elif clean_em in [h.lower() for h in case_obj.identity.historical_emails]:
                    candidate_cases.setdefault(cid, []).append(f"Historical alias email '{clean_em}' found in document text")

        # Evaluate matches
        if len(candidate_cases) == 1:
            suggested_id = list(candidate_cases.keys())[0]
            reasons = candidate_cases[suggested_id]
            confidence = 0.95 if any("Explicit Case ID" in r for r in reasons) else 0.85
            return suggested_id, confidence, reasons
        elif len(candidate_cases) > 1:
            # Ambiguous match: multiple cases detected
            reasons = [f"Multiple candidate cases found: {', '.join(candidate_cases.keys())}. Confirmation required."]
            return None, 0.5, reasons

        return None, 0.0, []
