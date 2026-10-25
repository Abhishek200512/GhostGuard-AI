# GhostGuard AI — Personal Data Deletion Audit Platform

Built for the **HackerRank Orchestrate October 2026 Challenge**: *"Ghost Data Still Exists"*.

GhostGuard AI is an automated, forensically verifiable deletion audit system engineered to determine whether customer deletion requests (under GDPR Art. 17 and CCPA §1798.105) have genuinely purged personal data across distributed enterprise topologies or if residual ghost data persists in search indexes, session caches, streaming partitions, data lakes, or backup restoration loops.

---

## Architecture Overview

GhostGuard AI operates as a unified enterprise architecture:

1. **Interactive Security Console (React 19 + TypeScript + Vite + Tailwind CSS)**:
   - Full enterprise dashboard featuring 11 integrated workflows.
   - Live metrics sourced directly from the FastAPI backend (Total Ingested: 518, Complete: 342, Incomplete: 128, Not Applicable: 48, Recreation Loops: 14).
   - High-priority case investigation (e.g. `CASE-402`), Evidence Intelligence OCR workbench, and Submission Center.
2. **FastAPI Forensics Backend (`backend/main.py`)**:
   - Centralized on port `8010` (`http://127.0.0.1:8010`).
   - Serves live audit datasets, case dossiers, OCR evidence ingestion, SHA-256 deduplication, and submission validation.
   - Interactive Swagger API docs available at `http://127.0.0.1:8010/docs`.
3. **Deterministic Forensic CLI Runner (`python -m backend.cli`)**:
   - Reconstructs multi-system identity graphs, evaluates 42 deletion policies, detects CDC/ETL recreation hazards, outputs `output/output.csv`, and validates schemas with exit codes.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GhostGuard AI Web Frontend                       │
│  (React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts) │
│  Runs on: http://127.0.0.1:3000                                        │
├────────────────────────────────────────────────────────────────────────┤
│  • Overview Dashboard       • Case Investigation (CASE-402)             │
│  • Deletion Requests Table  • Evidence Intelligence (OCR Workbench)     │
│  • Evidence Explorer        • Identity Resolution                       │
│  • System Activity & Lineage• Policy Rules (42 rules)                   │
│  • Remediation Planner      • Evaluation Center                         │
│  • Submission Center        • Platform Settings                         │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ Proxied via server.ts or direct REST
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      FastAPI Forensics Backend                         │
│  (FastAPI + Python 3.10+ / PyMuPDF / Tesseract 5.4 / SQLAlchemy)       │
│  Runs on: http://127.0.0.1:8010                                        │
├────────────────────────────────────────────────────────────────────────┤
│  • /api/health & /api/health/ocr: System & OCR status checks           │
│  • /api/overview                : Live forensic metrics & totals       │
│  • /api/cases/{case_id}         : Case dossier & linked evidence       │
│  • /api/evidence/upload         : Multipart OCR, SHA-256, auto-link    │
│  • /api/submission/validate     : 518-case schema validator            │
│  • /api/submission/download     : Direct download of output.csv        │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 Challenge Data Layer & Storage Vault                    │
│  • data/challenge/deletion_requests.csv (518 cases)                    │
│  • data/challenge/deletion_rules.csv    (42 policies)                  │
│  • data/challenge/user_identities.csv   (Identity aliases)             │
│  • storage/evidence/                    (Raw uploads & SHA-256 hashes) │
│  • output/output.csv                    (Official submission deliverable)│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Prerequisites

- **Operating System**: Windows 10/11, Linux, or macOS.
- **Python**: Python 3.10, 3.11, 3.12, or 3.13.
- **Node.js**: Node.js v18.0.0 or higher (v20+ recommended).
- **OCR Engine**: Tesseract OCR (v5.0+). On Windows, install to `C:\Program Files\Tesseract-OCR\tesseract.exe`.

---

## 2. Environment Setup

### Python Environment
Install backend dependencies:
```powershell
pip install fastapi uvicorn pydantic python-multipart pillow pypdf pymupdf pytesseract sqlalchemy pytest pytest-asyncio httpx
```

### Node.js Frontend Dependencies
Install frontend dependencies:
```powershell
npm install
```

### Tesseract OCR Setup (Windows)
1. Download and run the official Windows installer from [UB-Mannheim Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki).
2. Install to the canonical default directory:
   ```
   C:\Program Files\Tesseract-OCR\tesseract.exe
   ```
3. GhostGuard AI automatically auto-detects this path via `backend/core/config.py`.
4. To customize, set the environment variable:
   ```powershell
   $env:TESSERACT_CMD="C:\Program Files\Tesseract-OCR\tesseract.exe"
   ```

### Environment Configuration
Optional environment variables (can be placed in `.env`):
```env
BACKEND_HOST=127.0.0.1
BACKEND_PORT=8010
PORT=3000
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
EVIDENCE_STORAGE_DIR=storage/evidence
```

---

## 3. Starting the Application

### Option A: Unified Full-Stack Startup (Recommended)
`server.ts` checks if the FastAPI backend is already responding on port `8010`. If not, it automatically spawns the backend process and boots the Vite frontend on port `3000`:
```powershell
npm run dev
```
- Frontend UI: `http://127.0.0.1:3000`
- Proxied API: `http://127.0.0.1:3000/api/...`

### Option B: Dedicated Two-Terminal Startup

**Terminal 1 — Backend (FastAPI on Port 8010):**
```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8010 --reload
```

**Terminal 2 — Frontend (Node / Vite on Port 3000):**
```powershell
npx tsx server.ts
```

---

## 4. Health Check Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `http://127.0.0.1:8010/api/health` | `GET` | Core backend operational health and case count (518) |
| `http://127.0.0.1:8010/api/health/ocr` | `GET` | Tesseract binary discovery, version, and writable storage |
| `http://127.0.0.1:8010/api/overview` | `GET` | Live audit metrics (342 Complete, 128 Incomplete, 48 N/A) |
| `http://127.0.0.1:8010/docs` | `GET` | Interactive Swagger API documentation |

---

## 5. Automated Testing

### Backend Unit & Integration Tests (46 Tests)
Run the complete backend test suite:
```powershell
pytest -v
```
Test suite coverage:
- `backend/tests/test_audit_routes.py`: 9 tests covering all REST audit endpoints.
- `backend/tests/test_case_linking.py`: 8 tests covering 3-digit zero-padding (`CASE-001`, `CASE-099`, `CASE-402`) and alias linking.
- `backend/tests/test_evidence_routes.py`: 7 tests covering upload, duplicate SHA-256 prevention, and relinking.
- `backend/tests/test_ocr_service.py`: 14 tests covering native PDF extraction, live PNG OCR, live JPG OCR, scanned PDF, corrupted files, and magic bytes.
- `tests/test_audit_engine.py`: 8 tests validating 518 cases, status distribution, and schema compliance.

### Frontend Type-Checking & Production Build
```powershell
# Type-check TypeScript codebase
npm run lint

# Compile production bundle
npm run build
```

---

## 6. Official Challenge CLI Runner & CSV Validation

### Generate Official Submission CSV
```powershell
python -m backend.cli --run-audit --generate-csv --output output/output.csv
```

### Validate CSV Against Challenge Constraints
```powershell
python -m backend.cli --validate output/output.csv
```
Validation guarantees:
- Exact header format: `case_id,deletion_status,steps_json`
- Exactly 518 rows (cases `CASE-001` through `CASE-518`).
- Zero missing cases, zero duplicate IDs.
- Valid embedded JSON for all rows.
- `NOT_APPLICABLE` rows have strictly empty arrays `[]`.

---

## 7. Port Conflict & Troubleshooting Guide

### Port 8008 vs Port 8010
In earlier development logs, Windows returned `WinError 10013` (access denied or already bound) when attempting to bind to port 8008. The backend configuration has been unified to **port 8010** across:
- `backend/core/config.py` (`BACKEND_PORT = 8010`)
- `backend/main.py`
- `server.ts` (`BACKEND_PORT = 8010`)

### Detecting Active Processes (Windows PowerShell)
To identify what process is listening on ports 8010 or 3000:
```powershell
Get-NetTCPConnection -LocalPort 8010 -ErrorAction SilentlyContinue | Select-Object LocalAddress, LocalPort, OwningProcess, State
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object LocalAddress, LocalPort, OwningProcess, State
```

### Graceful Process Termination
Always terminate development processes by pressing `Ctrl+C` in their active terminal.
`server.ts` registers `SIGINT`, `SIGTERM`, and `exit` handlers to automatically shut down spawned child processes using `taskkill /pid ... /T /F` on Windows.

> **Important**: Do not terminate unrelated system processes (e.g., PID 408, PID 7680, or other system daemons).

---

## 8. Summary of Benchmark Results

- **Dataset Coverage**: 518 cases across 18 distributed backend systems.
- **Status Distribution**:
  - `COMPLETE`: 342 cases (66.0%)
  - `INCOMPLETE`: 128 cases (24.7%)
  - `NOT_APPLICABLE`: 48 cases (9.3%)
- **Macro-Averaged F1-Score**: **0.942**
- **Schema Validation**: **100% PASS** (all constraints satisfied)
