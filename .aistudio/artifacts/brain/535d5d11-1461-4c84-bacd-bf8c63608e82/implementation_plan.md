# GhostGuard AI — Personal Data Deletion Audit Platform

A deterministic, forensically verifiable personal data deletion audit platform built for the HackerRank Orchestrate October 2026 challenge: *"Ghost Data Still Exists"*. GhostGuard AI investigates distributed database replicas, search indexes, session caches, streaming pipelines, object storage, and backup restoration loops to verify whether user deletion requests under GDPR Art. 17 and CCPA §1798.105 have truly been executed or if ghost data persists.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following core architectural and operational decisions have been confirmed and incorporated into this specification:

- **Backend Runtime Architecture**: Pure Python FastAPI backend running the deterministic audit engine (with Pandas, SQLite, PyPDF, and OCR parsers), serving a React 19 + TypeScript + Vite frontend through a high-performance REST/streaming API on `/api/*`.
- **Data Loading & Seeding Strategy**: Pre-seeds all 518 challenge cases and evidence graphs (spanning 18 backend systems and 1,420 evidence proofs) in an interactive DEMO mode, while providing an active drag-and-drop file ingestion portal for custom raw CSV/ZIP dataset uploads.
- **Dual-Mode Validation & Submission System**:
  1. *Interactive Submission Center*: Web-based schema validator, step-order checker, benchmark metric evaluator (macro-averaged F1), and 1-click `output.csv` export.
  2. *CLI Runner & Automated Test Suite*: Standalone Python CLI (`python -m backend.cli`) with exit codes and comprehensive `pytest` and `vitest` regression suites.
- **Submission Safety**: The original challenge files remain completely immutable in `dataset/` (read-only). All generated audit artifacts, predictions, and reports are written to isolated directories (`output/output.csv`, `evaluation/`).

---

## 1. Overview & Core Concept

### What It Does
GhostGuard AI operates as an automated digital forensics auditor. When an organization receives a deletion request (e.g. GDPR Right to be Forgotten), conventional IT systems often delete the primary SQL row but leave remnants in Elasticsearch indexes, Redis caches, Kafka replication topics, S3 buckets, and scheduled ETL/CDC pipelines. GhostGuard AI reconstructs the subject's multi-system identity graph, audits 18 backend topologies, detects dangerous resurrection loops, applies deletion rules, and outputs ordered remediation plans.

### Target Persona
- **Data Protection Officers (DPOs)** & **Privacy Engineering Leads** conducting zero-trust cryptographic deletion attestations.
- **Security & Data Platform Engineers** mitigating CDC desyncs, Kafka topic replays, and lakehouse re-injections.
- **HackerRank Challenge Evaluators** verifying strict compliance against the official benchmark schema (`case_id,deletion_status,steps_json`).

### Key Value Delivered
- **Absolute Truth Over Assertions**: Ignores misleading primary database "success" flags if secondary replicas or streaming offsets still retain PII.
- **Recreation Loop Isolation**: Pinpoints the exact pipeline and partition re-injecting purged records (e.g. `cdc_user_profile_sync` lacking Kafka tombstones).
- **Dual-Mode Verifiability**: Developers can test and generate deliverables in their terminal via CLI or inspect visual traces in the dense SOC workstation UI.

---

## 2. User Experience & Visual Design

### Visual Identity & Theme
GhostGuard AI faithfully reproduces the uploaded enterprise security screenshots using the defined **GhostGuard Precision Security** design system:
- **Navy Sidebar Chrome**: `#283044` / `#131b2e` deep slate-navy frame with compact navigation, active case indicator (`Active: CASE-402`), and live SHA-256 ledger status.
- **Workspace Canvas**: Crisp `#faf8ff` canvas with `#ffffff` elevation panels and subtle `#eaedff` boundaries.
- **Action Indigo**: `#4f46e5` / `#3525cd` dedicated strictly to operational triggers (Run Audit, Generate Script, Open Submission).
- **Forensic Status Accents**:
  - Emerald Green (`#006c4a` / `#82f5c1`): COMPLETE, verified tombstones, 100% cryptographic proofs.
  - Signal Red (`#ba1a1a` / `#ffdad6`): INCOMPLETE, active violations, PII leaks, SLA breaches.
  - Amber Gold (`#934e00` / `#ffdcc3`): Recreation hazards, CDC replay loops, topic lag warnings.
  - Slate Gray (`#464555` / `#dae2fd`): NOT_APPLICABLE, zero-footprint identities.
- **Typography & Dense Math**:
  - Display & Headings: `Geist` for razor-sharp geometric hierarchy.
  - Body & Table Data: `Inter` at high-density compact scales (12px–13px).
  - Identifiers & Hashes: `JetBrains Mono` (`font-mono tabular-nums`) for case IDs (`CASE-402`), SHA-256 hashes, Redis keys, and Kafka payloads.

### Navigation & 11 Application Screens
The sidebar provides seamless access to all 11 core screens:
1. **Overview Dashboard** *(matches Screenshot 1)*: 6 KPI metrics, segmented deletion distribution bar, Systems with Residual PII bar chart, High-Priority Unresolved Cases table, Active Sync & Restore Risks alert cards, Challenge Evaluation Quick-Check, and Audit Activity & Lineage Timeline.
2. **Deletion Requests**: Comprehensive table of all 518 cases with search (Cmd+K), filters (Status, Risk, Jurisdiction, Date), pagination, and quick inspect drawers.
3. **Case Investigation** *(matches Screenshot 2)*: Case HUD, Executive Decision Rationale, 43% Compliance Gauge, 3-panel forensic findings grid (Resolved Identity & Footprint, Confirmed Violations, Active Recreation Risks), 3 monospaced Evidence Manifest cards (Elasticsearch EV-0941, Redis EV-0112, Kafka EV-0842), 4-node Automated Verification Pipeline, and docked Order of Operations banner.
4. **Evidence Explorer**: Interactive file tree and inspector across 1,420 evidence records (SQL dumps, JSON payloads, Redis hashes, Kafka offsets, PDF/PNG KYC docs with OCR overlays).
5. **Identity Resolution**: Interactive graph linking primary emails, historical aliases, customer IDs, and Auth0 UUIDs to prevent cross-user contamination.
6. **System Activity & Data Lineage**: Topology dependency map showing 18 monitored backend services, data flow directions, and CDC pipeline desyncs.
7. **Policy Rules**: Table of 42 constraints derived from `deletion_rules.csv` detailing legal basis (GDPR Art. 17 vs CCPA vs FinTech statutory holds).
8. **Remediation Planner**: Ordered execution sequencer generating sequential purge vectors (1. Halt CDC -> 2. Purge Elasticsearch -> 3. Evict Redis -> 4. Cryptographic Proof).
9. **Evaluation Center**: Real-time confusion matrix, Macro-Averaged F1 benchmark score (0.942), class breakdown, and failure diagnostic breakdown.
10. **Submission Center**: Schema validator checking `output.csv` against official columns (`case_id,deletion_status,steps_json`), JSON validator, and 1-click download.
11. **Settings**: Configuration for audit cutoff timestamps, OCR engine parameters, and API endpoints.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Pure Python FastAPI Backend with Vite Reverse Proxy
- **Chosen Approach**: Python 3 backend using FastAPI, Pandas, and SQLite, with Vite forwarding all `/api/*` traffic to FastAPI on port 8000.
- **Why**: The challenge evaluation mandates deterministic Python data processing, SQLite query execution, and PyPDF/OCR parsing. Providing a real Python FastAPI engine guarantees that the Python CLI runner and React UI execute the exact same algorithms without logic divergence.
- **Alternatives Considered**: TypeScript-only mock engine was rejected because it cannot run Python pytest suites or real Pandas data frames.

### Decision 2: Seeded Challenge Dataset with In-Memory / File Caching
- **Chosen Approach**: Bundle the canonical 518-case challenge dataset into `backend/data/` while exposing `/api/upload` to allow uploading custom raw datasets or zip archives.
- **Why**: Allows instant exploration and demonstration out-of-the-box (meeting the visual requirements of the screenshots) while ensuring full capability to ingest, parse, and validate new files dynamically.

### Decision 3: Verifiable Step-Order Remediation Planner
- **Chosen Approach**: Every step in `steps_json` strictly adheres to the dependency order:
  - Step Type `FINDING` (linking observed unpurged evidence)
  - Step Type `REMEDIATION` (e.g. `HALT_PIPELINE`, `PURGE_INDEX_DOCUMENT`, `EVICT_CACHE_KEY`, `REDACT_STORAGE_OBJECT`)
  - Step Type `VERIFICATION` (e.g. `VERIFY_TOMBSTONE_HASH`, `ASSERT_ZERO_RECORDS`)
  - `NOT_APPLICABLE` cases strictly output `[]`.
- **Why**: The challenge grading evaluates valid JSON arrays, proper step sequencing, and authentic evidence IDs without hallucinated records.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GhostGuard AI Web Frontend                       │
│  (React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts) │
├────────────────────────────────────────────────────────────────────────┤
│  • Overview Dashboard       • Case Investigation (CASE-402)             │
│  • Deletion Requests Table  • Evidence Explorer (1,420 files)           │
│  • Identity Graph Explorer  • System Activity & Lineage                 │
│  • Policy Rules (42 rules)  • Remediation Planner                       │
│  • Evaluation Center        • Interactive Submission Center             │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ REST / JSON (Port 3000 -> 8000)
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend Services                         │
│  (Python 3.11+ / Uvicorn / Pandas / SQLite / PyPDF / Regex Engine)      │
├────────────────────────────────────────────────────────────────────────┤
│  • Ingestion Router        : Reads deletion_requests, user_identities  │
│  • Identity Resolver       : Reconstructs alias graph & Auth0 UUIDs     │
│  • Evidence Extraction     : SQL queries, Redis dumps, Kafka log scan   │
│  • Recreation Detector     : Dependency graph & CDC replay detection   │
│  • Policy Rule Engine      : Evaluates 42 constraints from policy CSV   │
│  • Submission & Evaluator  : Validates output.csv & benchmark metrics   │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      CLI Runner & Test Harness                         │
├────────────────────────────────────────────────────────────────────────┤
│  • `python -m backend.cli` : Standalone batch audit & CSV generator    │
│  • `pytest tests/`         : Backend engine, schema, and policy tests   │
│  • `npm run test` (Vitest) : Frontend component & interaction tests    │
│  • `output/output.csv`     : Final submission deliverable               │
└────────────────────────────────────────────────────────────────────────┘
```

### Core API Endpoints
- `GET /api/health` — System status, dataset hash, cutoff timestamp.
- `GET /api/overview` — Aggregated counts, status distribution, system residuals, high-priority cases.
- `GET /api/requests` — Paginated deletion requests with filtering and sorting.
- `GET /api/cases/{case_id}` — Complete forensic case dossier (identity, violations, recreation risks, evidence manifest, remediation plan).
- `GET /api/evidence` — Evidence file catalog and extracted content.
- `GET /api/lineage` — Distributed system topology and active replication pipelines.
- `GET /api/policies` — 42 deletion rules, statutory retention periods, and treatments.
- `POST /api/audit/run` — Triggers deterministic full-cluster audit re-evaluation.
- `GET /api/submission/validate` — Validates generated `output.csv` schema and rules.
- `GET /api/submission/download` — Downloads the verified `output.csv`.
- `POST /api/upload` — Ingests user-supplied dataset CSVs or ZIP archives.

---

## 5. Implementation Stages & Verification Plan

### Stage 1: Setup & Data Engine Foundations
- Configure Python environment with `fastapi`, `uvicorn`, `pandas`, `pydantic`, `pytest`.
- Implement `backend/data_loader.py` to parse challenge CSVs (`deletion_requests.csv`, `user_identities.csv`, `user_audit_log.csv`, `system_activity.csv`, `deletion_rules.csv`, `evidence_files.csv`).
- Implement `backend/identity_resolver.py` to link current and historical email aliases, customer IDs, and Auth0 identifiers.

### Stage 2: Forensic Evidence & Policy Evaluation Engine
- Implement `backend/evidence_engine.py` to search SQL snapshots, JSON payloads, Redis session keys, Kafka partition offsets, and OCR text.
- Implement `backend/recreation_detector.py` to detect CDC replay hazards and uncompacted Kafka streams.
- Implement `backend/policy_engine.py` to determine `COMPLETE`, `INCOMPLETE`, or `NOT_APPLICABLE` and generate valid `steps_json`.

### Stage 3: FastAPI Server & CLI Runner
- Implement `backend/main.py` with all required REST endpoints.
- Configure Vite proxy in `vite.config.ts` (`/api` -> `http://127.0.0.1:8000`).
- Implement `backend/cli.py` to run headless audits and write `output/output.csv`.

### Stage 4: High-Fidelity Frontend Design System & Screens
- Install frontend dependencies (`lucide-react`, `recharts`).
- Implement navigation sidebar matching screenshots (dark navy, indicators, active case chip).
- Implement top bar (breadcrumbs, DEMO pill, search bar, profile).
- Implement **Overview Dashboard** matching Screenshot 1.
- Implement **Case Investigation** matching Screenshot 2 with active tabs, compliance gauge, 3-column forensic grid, and monospaced evidence manifests.
- Implement remaining screens: Deletion Requests, Evidence Explorer, Identity Resolution, System Lineage, Policy Rules, Remediation Planner, Evaluation Center, Submission Center, and Settings.

### Stage 5: Dual-Mode Testing & Submission Validation
- Create unit and integration tests with `pytest` for backend audit logic, schema constraints, and edge cases.
- Create unit tests with `vitest` for React views and interaction flows.
- Verify `output.csv` output header, field formatting, and non-empty rows.
- Document complete setup, test commands, and submission workflow in `README.md`.
