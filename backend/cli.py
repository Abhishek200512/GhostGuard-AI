#!/usr/bin/env python3
"""
GhostGuard AI - Command Line Interface (CLI) Runner
HackerRank Orchestrate October 2026: 'Ghost Data Still Exists'

Usage:
  python3 -m backend.cli --run-audit
  python3 -m backend.cli --generate-csv --output output/output.csv
  python3 -m backend.cli --validate output/output.csv
  python3 -m backend.cli --score
"""

import sys
import os
import argparse
import json
from backend.engine import AUDIT_ENGINE
from backend.data_store import DATA_STORE

def main():
    parser = argparse.ArgumentParser(
        description="GhostGuard AI Deletion Audit Platform - CLI Runner",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--run-audit", action="store_true", help="Run deterministic forensic audit across all 518 cases")
    parser.add_argument("--generate-csv", action="store_true", help="Generate official output.csv")
    parser.add_argument("--output", type=str, default="output/output.csv", help="Target output CSV file path")
    parser.add_argument("--validate", type=str, help="Validate an existing output.csv against official schema")
    parser.add_argument("--score", action="store_true", help="Compute benchmark evaluation metrics against ground-truth labels")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose diagnostics output")

    args = parser.parse_args()

    # Default action if no arguments provided: run audit, generate CSV and validate
    if not any([args.run_audit, args.generate_csv, args.validate, args.score]):
        args.run_audit = True
        args.generate_csv = True
        args.score = True

    print("================================================================")
    print("  GHOSTGUARD AI — DELETION AUDIT PLATFORM (CLI RUNNER)")
    print("  HackerRank Orchestrate Oct 2026: 'Ghost Data Still Exists'")
    print("================================================================\n")

    if args.run_audit:
        print("[+] Initiating forensic audit across 18 backend systems...")
        summary = AUDIT_ENGINE.run_full_audit()
        print(f"    - Evaluated cases         : {summary['evaluated_cases']}")
        print(f"    - Complete (Purged)       : {summary['status_distribution']['COMPLETE']} ({summary['percentages']['COMPLETE']}%)")
        print(f"    - Incomplete (Violations) : {summary['status_distribution']['INCOMPLETE']} ({summary['percentages']['INCOMPLETE']}%)")
        print(f"    - Not Applicable          : {summary['status_distribution']['NOT_APPLICABLE']} ({summary['percentages']['NOT_APPLICABLE']}%)")
        print(f"    - Recreation Hazards      : {summary['recreation_hazards_count']} active CDC / ETL loops")
        print(f"    - Cryptographic Coverage  : {summary['coverage_percentage']}% ({summary['evidence_proofs_count']}/{summary['evidence_total_count']} SHA-256 digests)")
        print(f"    - Run Duration            : {summary['duration_seconds']}s (TPS: {summary['tps']} ops/s)")
        print(f"    - SHA-256 Ledger Hash     : {summary['ledger_hash']}\n")

    if args.generate_csv:
        out_dir = os.path.dirname(args.output)
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)

        print(f"[+] Generating official submission file: '{args.output}'...")
        csv_content = AUDIT_ENGINE.export_output_csv()
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(csv_content)
        print(f"    [OK] Successfully wrote {len(csv_content)} bytes to {args.output}.\n")

        # Auto-validate generated file
        print(f"[+] Verifying format of generated deliverable...")
        val_result = AUDIT_ENGINE.validate_submission_format(csv_content)
        if not val_result["is_valid"]:
            print(f"    [FAIL] Validation errors detected ({val_result['error_count']} errors):")
            for err in val_result["errors"][:10]:
                print(f"      - {err}")
            sys.exit(1)
        else:
            print(f"    [SUCCESS] Schema validation PASSED for all {val_result['total_cases_validated']} cases.")
            print(f"    - Header format: case_id,deletion_status,steps_json (100% compliant)")
            print(f"    - Zero missing cases, zero duplicate IDs, zero malformed JSON steps.")
            print(f"    - NOT_APPLICABLE constraints satisfied (empty steps arrays).\n")

    if args.validate:
        if not os.path.exists(args.validate):
            print(f"[ERROR] Target file '{args.validate}' does not exist.")
            sys.exit(2)
        with open(args.validate, "r", encoding="utf-8") as f:
            content = f.read()
        print(f"[+] Validating submission file: '{args.validate}'...")
        val_result = AUDIT_ENGINE.validate_submission_format(content)
        if not val_result["is_valid"]:
            print(f"    [FAIL] Validation errors detected ({val_result['error_count']} errors):")
            for err in val_result["errors"]:
                print(f"      - {err}")
            sys.exit(1)
        else:
            print(f"    [SUCCESS] Schema validation PASSED for all {val_result['total_cases_validated']} cases.\n")

    if args.score:
        print("[+] Benchmark Evaluation Summary:")
        csv_content = AUDIT_ENGINE.export_output_csv()
        val_result = AUDIT_ENGINE.validate_submission_format(csv_content)
        metric = val_result["benchmark_metric"]
        print(f"    - Metric Name            : {metric['name']}")
        print(f"    - Macro-Averaged F1      : {metric['score']:.3f} ({metric['delta_vs_baseline']} vs v1.2)")
        print(f"    - COMPLETE Precision/Rec : {metric['status_precision']['COMPLETE']} / {metric['status_recall']['COMPLETE']}")
        print(f"    - INCOMPLETE Prec/Recall : {metric['status_precision']['INCOMPLETE']} / {metric['status_recall']['INCOMPLETE']}")
        print(f"    - NOT_APPLICABLE Prec/Rec: {metric['status_precision']['NOT_APPLICABLE']} / {metric['status_recall']['NOT_APPLICABLE']}\n")

    print("[DONE] Audit run and validation complete with exit code 0.")
    sys.exit(0)

if __name__ == "__main__":
    main()
