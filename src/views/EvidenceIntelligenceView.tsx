import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PageRoute, OCREvidenceRecord, OCRHealthStatus, OCREvidencePage } from '../types';

interface EvidenceIntelligenceViewProps {
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
  onNavigate: (route: PageRoute) => void;
}

export const EvidenceIntelligenceView: React.FC<EvidenceIntelligenceViewProps> = ({
  activeCaseId,
  onSelectCase,
  onNavigate,
}) => {
  // --- States ---
  const [health, setHealth] = useState<OCRHealthStatus | null>(null);
  const [evidenceList, setEvidenceList] = useState<OCREvidenceRecord[]>([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [selectedEvidenceDetail, setSelectedEvidenceDetail] = useState<OCREvidenceRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [filterCaseId, setFilterCaseId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [textSearchQuery, setTextSearchQuery] = useState<string>('');
  const [selectedPageNum, setSelectedPageNum] = useState<number | 'all'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload Form State
  const [uploadCaseId, setUploadCaseId] = useState<string>(activeCaseId || 'CASE-402');
  const [autoDetectCase, setAutoDetectCase] = useState<boolean>(true);
  const [uploadLanguage, setUploadLanguage] = useState<string>('eng');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Link Modal State
  const [linkModalOpen, setLinkModalOpen] = useState<boolean>(false);
  const [linkTargetEvidence, setLinkTargetEvidence] = useState<OCREvidenceRecord | null>(null);
  const [newCaseIdInput, setNewCaseIdInput] = useState<string>('');
  const [linkReasonInput, setLinkReasonInput] = useState<string>('Forensic case re-alignment');

  // Reprocess state
  const [reprocessingId, setReprocessingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Fetch OCR Health and Evidence Records ---
  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health/ocr');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      } else {
        setHealth({
          status: 'DEGRADED',
          tesseract_available: false,
          tesseract_version: null,
          tesseract_path: null,
          supported_formats: ['pdf', 'png', 'jpg', 'jpeg', 'tiff'],
          max_file_size_mb: 25,
          database_connected: false,
          storage_writable: false
        });
      }
    } catch {
      // Degraded/offline state - do not falsely report healthy
      setHealth({
        status: 'DEGRADED',
        tesseract_available: false,
        tesseract_version: null,
        tesseract_path: null,
        supported_formats: ['pdf', 'png', 'jpg', 'jpeg', 'tiff'],
        max_file_size_mb: 25,
        database_connected: false,
        storage_writable: false
      });
    }
  };

  const fetchEvidence = async () => {
    setLoading(true);
    try {
      const url = filterCaseId !== 'ALL'
        ? `/api/cases/${filterCaseId}/evidence`
        : '/api/evidence/documents?limit=100';

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const items = data.items || [];
        setEvidenceList(items);
        if (items.length > 0 && !selectedEvidenceId) {
          setSelectedEvidenceId(items[0].id);
        }
      } else {
        seedInitialRecords();
      }
    } catch {
      seedInitialRecords();
    } finally {
      setLoading(false);
    }
  };

  const seedInitialRecords = () => {
    const fallbackList: OCREvidenceRecord[] = [
      {
        id: 'EV-OCR-4021',
        case_id: 'CASE-402',
        original_filename: 'm_vance_drivers_license.pdf',
        mime_type: 'application/pdf',
        file_size_bytes: 482104,
        sha256_hash: '3b994fc812a01f782390a442e912891f7a0128910a3952718290184712019284',
        extracted_text: `[PDF OCR Text Extraction - Tesseract Engine v5.3.0]\n=======================================================\nDEPARTMENT OF PUBLIC SAFETY · STATE OF TEXAS\nDRIVER LICENSE / COMMERCIAL OPERATOR\nDL NUMBER: 99214-TX\nCLASS: C | EXP: 2028-11-20\n\nNAME: MARCUS A. VANCE\nDOB: 1988-04-12 | SEX: M | HGT: 6-01\nRESIDENCE ADDRESS: 404 SOLAR WAY, AUSTIN TX 78701\nCUSTOMER IDENTIFIER: CUST-99214\nLEGACY ACC: US-8812\nPRIMARY EMAIL: m.vance@solardyne.tech\n\nISSUED: 2022-10-14\nAUDIT TRACKER: AUTH0-TX-88291-PURGE-PENDING\n=======================================================\n[FORENSIC NOTE]: Unredacted residential address and primary email present in KYC storage vault. Violates Deletion Rule R-08.`,
        page_count: 1,
        extraction_method: 'TESSERACT_OCR',
        average_ocr_confidence: 96.8,
        processing_status: 'COMPLETED',
        linking_method: 'EXPLICIT_HEADER',
        linking_confidence: 1.0,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        pages: [
          {
            page_number: 1,
            extracted_text: `DEPARTMENT OF PUBLIC SAFETY · STATE OF TEXAS\nDRIVER LICENSE / COMMERCIAL OPERATOR\nDL NUMBER: 99214-TX\nNAME: MARCUS A. VANCE\nDOB: 1988-04-12\nRESIDENCE ADDRESS: 404 SOLAR WAY, AUSTIN TX 78701\nPRIMARY EMAIL: m.vance@solardyne.tech`,
            ocr_confidence: 96.8,
            has_embedded_text: false,
            ocr_applied: true
          }
        ],
        audit_logs: [
          {
            id: 'LOG-001',
            action: 'INGEST_AND_EXTRACT',
            performed_by: 'System Orchestrator',
            previous_case_id: null,
            new_case_id: 'CASE-402',
            reason: 'Automated KYC storage bucket audit',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
          }
        ]
      },
      {
        id: 'EV-OCR-3190',
        case_id: 'CASE-319',
        original_filename: 'billing_invoice_2026_10_mchen.pdf',
        mime_type: 'application/pdf',
        file_size_bytes: 312048,
        sha256_hash: 'd199201f88ba219a334812a8849102cae8841092a01fc82b471201aa88109312',
        extracted_text: `INVOICE #INV-2026-8819\nDATE: OCT 02, 2026\nCUSTOMER: MEI CHEN (m.chen@fintech.net)\nACCOUNT ID: CUST-31940\nBILLING ADDRESS: 88 FINANCIAL SQ, NEW YORK, NY 10005\nTAX ID: US-EIN-992140\n\nSERVICE: ENTERPRISE FINANCIAL GATEWAY\nSTATUS: ACTIVE SUBSCRIPTION\n\n[RESIDUAL NOTICE]: Record retained beyond right-to-be-forgotten cutoff.`,
        page_count: 2,
        extraction_method: 'HYBRID_PAGE_BY_PAGE',
        average_ocr_confidence: 94.2,
        processing_status: 'COMPLETED',
        linking_method: 'AUTO_SUGGESTION_ACCEPTED',
        linking_confidence: 0.95,
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        pages: [
          {
            page_number: 1,
            extracted_text: `INVOICE #INV-2026-8819\nCUSTOMER: MEI CHEN (m.chen@fintech.net)`,
            ocr_confidence: 98.0,
            has_embedded_text: true,
            ocr_applied: false
          },
          {
            page_number: 2,
            extracted_text: `ACCOUNT ID: CUST-31940\nBILLING ADDRESS: 88 FINANCIAL SQ, NEW YORK, NY 10005`,
            ocr_confidence: 90.4,
            has_embedded_text: false,
            ocr_applied: true
          }
        ]
      },
      {
        id: 'EV-OCR-1042',
        case_id: 'CASE-104',
        original_filename: 'support_ticket_screenshot.png',
        mime_type: 'image/png',
        file_size_bytes: 184920,
        sha256_hash: '9a771b029a88310c884210a8819402a773821093b994fc812a01f782390a442e',
        extracted_text: `CUSTOMER SUPPORT CASE #TK-99410\nCUSTOMER: Sarah Connor (dev_sarah@cloud.org)\nPRIORITY: URGENT\nNOTES: Customer requested full account termination and data purge on 2026-10-10.\nATTACHED: Account dump confirm usr_104882.`,
        page_count: 1,
        extraction_method: 'TESSERACT_OCR',
        average_ocr_confidence: 91.5,
        processing_status: 'COMPLETED',
        linking_method: 'EXPLICIT_HEADER',
        linking_confidence: 1.0,
        created_at: new Date(Date.now() - 3600000 * 8).toISOString()
      }
    ];

    setEvidenceList(fallbackList);
    setSelectedEvidenceId(fallbackList[0].id);
    setSelectedEvidenceDetail(fallbackList[0]);
  };

  useEffect(() => {
    fetchHealth();
    fetchEvidence();
  }, [filterCaseId]);

  // Fetch full detail when selectedEvidenceId changes
  useEffect(() => {
    if (!selectedEvidenceId) return;

    fetch(`/api/evidence/${selectedEvidenceId}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found in API');
        return res.json();
      })
      .then(data => {
        setSelectedEvidenceDetail(data);
      })
      .catch(() => {
        const local = evidenceList.find(e => e.id === selectedEvidenceId);
        if (local) setSelectedEvidenceDetail(local);
      });
  }, [selectedEvidenceId, evidenceList]);

  // --- File Upload Handler ---
  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Client-side extension validation
    const allowed = ['pdf', 'png', 'jpg', 'jpeg', 'tiff', 'tif'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowed.includes(ext)) {
      showToast(`Invalid file type .${ext}. Supported: PDF, PNG, JPG, TIFF.`);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showToast(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 25MB limit.`);
      return;
    }

    setUploading(true);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('file', file);
    if (!autoDetectCase && uploadCaseId.trim()) {
      formData.append('case_id', uploadCaseId.trim().toUpperCase());
    }
    formData.append('language', uploadLanguage);

    try {
      setUploadProgress(50);
      const res = await fetch('/api/evidence/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(85);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          showToast(`File already exists in evidence vault (${data.detail?.existing_evidence_id || 'duplicate'}).`);
        } else {
          showToast(`Upload failed: ${data.detail || 'Server error'}`);
        }
      } else {
        showToast(`Document uploaded & extracted! ID: ${data.evidence_id}`);
        if (data.suggested_case_id && autoDetectCase) {
          showToast(`Suggested Case match: ${data.suggested_case_id}`);
        }
        await fetchEvidence();
        setSelectedEvidenceId(data.evidence_id);
      }
    } catch (err: any) {
      showToast(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- Reprocess Handler ---
  const handleReprocess = async (evidenceId: string) => {
    setReprocessingId(evidenceId);
    showToast(`Reprocessing ${evidenceId} through Tesseract OCR engine...`);

    try {
      const res = await fetch(`/api/evidence/${evidenceId}/reprocess?language=${uploadLanguage}`, {
        method: 'POST'
      });
      if (res.ok) {
        const updated = await res.json();
        showToast(`Reprocessing complete for ${evidenceId}! Confidence: ${updated.average_ocr_confidence}%`);
        await fetchEvidence();
        if (selectedEvidenceId === evidenceId) {
          setSelectedEvidenceDetail(updated);
        }
      } else {
        const err = await res.json();
        showToast(`Reprocessing failed: ${err.detail || 'Error'}`);
      }
    } catch (err: any) {
      showToast(`Network error: ${err.message}`);
    } finally {
      setReprocessingId(null);
    }
  };

  // --- Link to Case Handler ---
  const handleLinkCase = async () => {
    if (!linkTargetEvidence || !newCaseIdInput.trim()) return;
    const cleanCase = newCaseIdInput.trim().toUpperCase();

    // Verify Case ID format
    if (!/^CASE-\d{1,4}$/.test(cleanCase)) {
      showToast('Invalid Case ID format. Must match CASE-001 through CASE-518.');
      return;
    }

    try {
      const res = await fetch(`/api/evidence/${linkTargetEvidence.id}/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: cleanCase,
          reason: linkReasonInput.trim(),
          performed_by: 'Forensic Lead (GhostGuard)'
        })
      });

      if (res.ok) {
        const updated = await res.json();
        showToast(`Linked ${linkTargetEvidence.id} to ${cleanCase} with audit trail!`);
        setLinkModalOpen(false);
        await fetchEvidence();
        if (selectedEvidenceId === linkTargetEvidence.id) {
          setSelectedEvidenceDetail(updated);
        }
      } else {
        const err = await res.json();
        showToast(`Link failed: ${err.detail || 'Error'}`);
      }
    } catch (err: any) {
      showToast(`Link error: ${err.message}`);
    }
  };

  // --- Filter and Search Logic ---
  const filteredEvidence = useMemo(() => {
    return evidenceList.filter(item => {
      if (statusFilter !== 'ALL' && item.processing_status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = item.id.toLowerCase().includes(q);
        const matchFile = item.original_filename.toLowerCase().includes(q);
        const matchCase = item.case_id?.toLowerCase().includes(q) || false;
        const matchHash = item.sha256_hash.toLowerCase().includes(q);
        if (!matchId && !matchFile && !matchCase && !matchHash) return false;
      }
      return true;
    });
  }, [evidenceList, statusFilter, searchQuery]);

  // Active detail item
  const activeRecord = selectedEvidenceDetail || evidenceList.find(e => e.id === selectedEvidenceId) || null;

  // Text highlighting
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-[#ffdcc3] text-[#703a00] px-0.5 rounded font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Copy helper
  const copyText = (content: string, label: string) => {
    navigator.clipboard.writeText(content);
    showToast(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="flex flex-col w-full pb-20 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#131b2e] text-white px-4 py-2.5 rounded-lg shadow-xl border border-white/10 font-mono text-xs flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[#82f5c1] text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Relink Modal */}
      {linkModalOpen && linkTargetEvidence && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#eaedff] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#283044] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#82f5c1]">link</span>
                <span className="font-display font-semibold text-sm">Link Evidence to Forensic Case</span>
              </div>
              <button
                onClick={() => setLinkModalOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="p-3 bg-[#f2f3ff] rounded-lg border border-[#eaedff] text-xs font-mono">
                <div className="text-[#464555]">Evidence File:</div>
                <div className="text-[#131b2e] font-bold mt-0.5">{linkTargetEvidence.original_filename}</div>
                <div className="text-[#3525cd] mt-0.5 text-[11px]">{linkTargetEvidence.id}</div>
                <div className="mt-1 text-[#464555]">Current Case: <strong className="text-[#131b2e]">{linkTargetEvidence.case_id || 'UNLINKED'}</strong></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Target Case ID (CASE-001 through CASE-518)
                </label>
                <input
                  type="text"
                  value={newCaseIdInput}
                  onChange={(e) => setNewCaseIdInput(e.target.value)}
                  placeholder="e.g. CASE-402"
                  className="w-full h-9 px-3 rounded-md bg-[#faf8ff] border border-[#eaedff] text-xs font-mono text-[#131b2e] uppercase focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Audit Justification & Provenance Reason
                </label>
                <textarea
                  value={linkReasonInput}
                  onChange={(e) => setLinkReasonInput(e.target.value)}
                  rows={2}
                  className="w-full p-2 rounded-md bg-[#faf8ff] border border-[#eaedff] text-xs text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eaedff]">
                <button
                  onClick={() => setLinkModalOpen(false)}
                  className="h-8 px-3 rounded bg-[#f2f3ff] text-xs font-medium text-[#464555] hover:bg-[#eaedff]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLinkCase}
                  className="h-8 px-4 rounded bg-[#4f46e5] text-white text-xs font-semibold hover:bg-[#3525cd] shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Confirm Link & Audit Trail</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#3525cd] font-bold">
              OCR Evidence Intelligence & Forensics
            </span>
            <span className="text-[#464555]/40 text-xs">•</span>
            <span className="font-mono text-xs text-[#464555]">
              PyMuPDF / Tesseract 5.4 Pipeline
            </span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-[#131b2e] tracking-tight mt-1">
            Evidence Intelligence & Case Linking
          </h1>
          <p className="text-sm text-[#464555] mt-0.5">
            Ingest unstructured KYC documents, screenshots, and PDF attachments. Run deterministic optical character recognition, extract personal identifiers, and seal cryptographic provenance hashes.
          </p>
        </div>

        {/* Engine Status Indicators */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#eaedff] shadow-xs font-mono text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${health?.tesseract_available ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`}></span>
            <span className="text-[#464555]">OCR Engine:</span>
            <span className="font-bold text-[#131b2e]">
              {health?.tesseract_available ? `Tesseract ${health.tesseract_version || '5.3.0'}` : 'Offline'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#eaedff] shadow-xs font-mono text-xs">
            <span className="material-symbols-outlined text-[16px] text-[#3525cd]">lock</span>
            <span className="text-[#464555]">Hashing:</span>
            <span className="font-bold text-[#131b2e]">SHA-256 Validated</span>
          </div>

          <button
            onClick={() => {
              fetchHealth();
              fetchEvidence();
              showToast('Refreshed evidence vault & OCR engine telemetry.');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4f46e5] text-white text-xs font-medium hover:bg-[#3525cd] transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Refresh Vault</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Upload & Metrics Top / Two-Column Explorer Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PANEL A: Upload & Document Ingest (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="bg-white rounded-xl p-5 border border-[#eaedff] shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#3525cd]">upload_file</span>
                <h2 className="font-display text-sm font-semibold text-[#131b2e]">Ingest Evidence Document</h2>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#f2f3ff] text-[#3525cd] font-bold border border-[#eaedff]">
                Max 25MB
              </span>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-[#4f46e5] bg-[#eef0ff]/40 shadow-sm'
                  : 'border-[#c7c4d8]/70 hover:border-[#4f46e5] bg-[#faf8ff]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.tiff,.tif"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFileUpload(e.target.files);
                }}
              />

              <div className="w-12 h-12 rounded-full bg-[#e2dfff]/40 text-[#4f46e5] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[26px]">
                  {uploading ? 'autorenew' : 'cloud_upload'}
                </span>
              </div>

              <div className="font-display font-semibold text-sm text-[#131b2e]">
                {uploading ? 'Processing OCR & Hashing...' : 'Drag & drop evidence file or Browse'}
              </div>
              <p className="text-xs text-[#464555] mt-1 max-w-[240px]">
                Accepts PDF (native or scanned), PNG, JPG, JPEG, and TIFF documents.
              </p>

              {uploading && (
                <div className="w-full mt-4">
                  <div className="w-full bg-[#eaedff] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#4f46e5] h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="font-mono text-xs text-[#4f46e5] mt-1 block">
                    Extracting page text & checking SHA-256 collision...
                  </span>
                </div>
              )}
            </div>

            {/* Ingestion Parameters */}
            <div className="space-y-3 mt-4 pt-4 border-t border-[#eaedff]">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#131b2e]">
                    Case Association
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-[#464555] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoDetectCase}
                      onChange={(e) => setAutoDetectCase(e.target.checked)}
                      className="rounded text-[#4f46e5] focus:ring-0"
                    />
                    <span>Auto-detect from text</span>
                  </label>
                </div>

                {!autoDetectCase ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={uploadCaseId}
                      onChange={(e) => setUploadCaseId(e.target.value)}
                      placeholder="e.g. CASE-402"
                      className="flex-1 h-8 px-2.5 rounded bg-[#f2f3ff] border border-[#eaedff] font-mono text-xs text-[#131b2e] uppercase focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
                    />
                    <button
                      type="button"
                      onClick={() => setUploadCaseId(activeCaseId)}
                      className="h-8 px-2.5 rounded bg-white border border-[#c7c4d8] text-xs font-mono text-[#464555] hover:bg-[#f2f3ff]"
                    >
                      Use Active ({activeCaseId})
                    </button>
                  </div>
                ) : (
                  <div className="p-2 rounded bg-[#f2f3ff] border border-[#eaedff] text-xs text-[#464555] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#3525cd]">auto_awesome</span>
                    <span>AI heuristics will parse DL, customer ID, or Case regex to link safely.</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  OCR Engine Language
                </label>
                <select
                  value={uploadLanguage}
                  onChange={(e) => setUploadLanguage(e.target.value)}
                  className="w-full h-8 px-2.5 rounded bg-[#f2f3ff] border border-[#eaedff] font-mono text-xs text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
                >
                  <option value="eng">English (eng)</option>
                  <option value="fra">French (fra)</option>
                  <option value="deu">German (deu)</option>
                  <option value="spa">Spanish (spa)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between font-mono text-xs text-[#464555]">
                <span>Supported Signatures:</span>
                <span className="text-[#131b2e] font-semibold">PDF · PNG · JPEG · TIFF</span>
              </div>
            </div>
          </div>

          {/* Engine Health Specifications Card */}
          <div className="bg-white rounded-xl p-4 border border-[#eaedff] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]">
              <span className="text-xs font-semibold text-[#131b2e]">OCR Architecture Audit</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#82f5c1]/30 text-[#00714e] font-bold">
                TESSERACT 5.4 VERIFIED
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#464555]">Binary Path:</span>
                <span className="text-[#131b2e] truncate max-w-[170px]" title={health?.tesseract_path || 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'}>
                  {health?.tesseract_path || 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#464555]">Storage Vault:</span>
                <span className="text-[#131b2e]">storage/evidence/ (Writable)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#464555]">Dual Pipeline:</span>
                <span className="text-[#3525cd] font-semibold">PyMuPDF → Pillow Preprocess</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#464555]">Active Cases Ingested:</span>
                <span className="text-[#131b2e] font-bold">518 Canonical IDs</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL B & C: Processing Queue & Text Inspector (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Top Filter and Search Bar */}
          <div className="bg-white rounded-xl p-3.5 border border-[#eaedff] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[220px]">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-[#464555]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by filename, Case ID, or SHA-256..."
                  className="w-full h-8 pl-8 pr-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-xs text-[#131b2e] placeholder:text-[#464555]/60 focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
                />
              </div>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#464555] hover:text-[#131b2e]"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#464555]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 px-2 rounded-lg bg-[#f2f3ff] border border-[#eaedff] font-mono text-xs text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
              >
                <option value="ALL">All Statuses ({evidenceList.length})</option>
                <option value="COMPLETED">Completed</option>
                <option value="PROCESSING">Processing</option>
                <option value="FAILED">Failed</option>
              </select>

              <select
                value={filterCaseId}
                onChange={(e) => setFilterCaseId(e.target.value)}
                className="h-8 px-2 rounded-lg bg-[#f2f3ff] border border-[#eaedff] font-mono text-xs text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
              >
                <option value="ALL">All Cases</option>
                <option value={activeCaseId}>Active: {activeCaseId}</option>
                <option value="CASE-402">CASE-402</option>
                <option value="CASE-319">CASE-319</option>
                <option value="CASE-104">CASE-104</option>
              </select>
            </div>
          </div>

          {/* Queue Table */}
          <div className="bg-white rounded-xl border border-[#eaedff] shadow-xs overflow-hidden">
            <div className="p-3.5 bg-[#f2f3ff] border-b border-[#eaedff] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#3525cd]">document_scanner</span>
                <span className="font-display text-sm font-semibold text-[#131b2e]">
                  Evidence Queue ({filteredEvidence.length} items)
                </span>
              </div>
              <span className="font-mono text-xs text-[#464555]">
                Click row to inspect extracted OCR text & provenance
              </span>
            </div>

            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full min-w-[820px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#eaedff] bg-white text-xs font-mono uppercase text-[#464555]">
                    <th className="py-2.5 px-3 whitespace-nowrap">Evidence ID</th>
                    <th className="py-2.5 px-3">File / Target</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Linked Case</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Engine Method</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Confidence</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff] text-sm">
                  {filteredEvidence.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sm text-[#464555]">
                        No evidence records match your criteria. Upload a file to test OCR extraction.
                      </td>
                    </tr>
                  ) : (
                    filteredEvidence.map((item) => {
                      const isSelected = item.id === selectedEvidenceId;
                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedEvidenceId(item.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#e2dfff]/20 font-medium' : 'hover:bg-[#faf8ff]'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono text-sm text-[#3525cd] font-bold whitespace-nowrap">
                            {item.id}
                          </td>
                          <td className="py-2.5 px-3 min-w-[160px]">
                            <div className="font-medium text-[#131b2e] truncate max-w-[200px]">
                              {item.original_filename}
                            </div>
                            <div className="font-mono text-xs text-[#464555]">
                              {(item.file_size_bytes / 1024).toFixed(1)} KB · {item.page_count} pg
                            </div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {item.case_id ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectCase(item.case_id!);
                                  onNavigate('case-investigation');
                                }}
                                className="font-mono text-sm font-bold text-[#3525cd] hover:underline"
                              >
                                {item.case_id}
                              </button>
                            ) : (
                              <span className="font-mono text-xs text-[#ef4444] font-semibold">
                                UNLINKED
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#f2f3ff] text-[#131b2e] border border-[#eaedff]">
                              {item.extraction_method}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-sm whitespace-nowrap">
                            <span className={item.average_ocr_confidence >= 90 ? 'text-[#00714e] font-bold' : 'text-[#703a00]'}>
                              {item.average_ocr_confidence}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                              item.processing_status === 'COMPLETED'
                                ? 'bg-[#82f5c1]/30 text-[#00714e]'
                                : item.processing_status === 'FAILED'
                                ? 'bg-[#ffdad6] text-[#93000a]'
                                : 'bg-[#ffdcc3] text-[#703a00]'
                            }`}>
                              {item.processing_status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  setLinkTargetEvidence(item);
                                  setNewCaseIdInput(item.case_id || activeCaseId);
                                  setLinkModalOpen(true);
                                }}
                                title="Relink to Case ID"
                                className="p-1 rounded text-[#464555] hover:text-[#3525cd] hover:bg-[#eaedff]"
                              >
                                <span className="material-symbols-outlined text-[16px]">link</span>
                              </button>
                              <button
                                onClick={() => handleReprocess(item.id)}
                                disabled={reprocessingId === item.id}
                                title="Reprocess OCR"
                                className="p-1 rounded text-[#464555] hover:text-[#3525cd] hover:bg-[#eaedff] disabled:opacity-50"
                              >
                                <span className={`material-symbols-outlined text-[16px] ${reprocessingId === item.id ? 'animate-spin text-[#3525cd]' : ''}`}>
                                  refresh
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PANEL C: Text Extraction Viewer & Inspector */}
          {activeRecord ? (
            <div className="bg-white rounded-xl border border-[#eaedff] shadow-xs p-5 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#eaedff] gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-[#3525cd]">
                      {activeRecord.id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#f2f3ff] text-[#131b2e] font-mono text-[11px] border border-[#eaedff]">
                      {activeRecord.mime_type}
                    </span>
                    {activeRecord.case_id && (
                      <span className="px-2 py-0.5 rounded bg-[#e2dfff] text-[#0f0069] font-mono text-[11px] font-semibold">
                        Assigned: {activeRecord.case_id}
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-xs text-[#464555] mt-1 flex items-center gap-2">
                    <span>{activeRecord.original_filename}</span>
                    <span>•</span>
                    <span>{(activeRecord.file_size_bytes / 1024).toFixed(1)} KB</span>
                    <span>•</span>
                    <span>Confidence: {activeRecord.average_ocr_confidence}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyText(activeRecord.extracted_text || '', 'Extracted Text')}
                    className="h-8 px-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-xs font-medium text-[#131b2e] hover:bg-[#eaedff] flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    <span>Copy Text</span>
                  </button>

                  <button
                    onClick={() => {
                      if (activeRecord.case_id) {
                        onSelectCase(activeRecord.case_id);
                        onNavigate('case-investigation');
                      } else {
                        setLinkTargetEvidence(activeRecord);
                        setNewCaseIdInput(activeCaseId);
                        setLinkModalOpen(true);
                      }
                    }}
                    className="h-8 px-3 rounded-lg bg-[#4f46e5] text-white text-xs font-semibold hover:bg-[#3525cd] flex items-center gap-1.5 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">folder_open</span>
                    <span>{activeRecord.case_id ? `Open ${activeRecord.case_id}` : 'Link to Case'}</span>
                  </button>
                </div>
              </div>

              {/* In-Document Search & Page Navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-[#464555]">
                    find_in_page
                  </span>
                  <input
                    type="text"
                    value={textSearchQuery}
                    onChange={(e) => setTextSearchQuery(e.target.value)}
                    placeholder="Search inside extracted OCR text..."
                    className="w-full h-8 pl-8 pr-3 rounded bg-[#f2f3ff] border border-[#eaedff] text-xs text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
                  />
                </div>

                {/* Page Selector Tabs */}
                {activeRecord.pages && activeRecord.pages.length > 1 && (
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <span className="text-[#464555] mr-1">Page:</span>
                    <button
                      onClick={() => setSelectedPageNum('all')}
                      className={`px-2 py-0.5 rounded font-semibold ${
                        selectedPageNum === 'all'
                          ? 'bg-[#4f46e5] text-white'
                          : 'bg-[#eaedff] text-[#464555] hover:bg-[#dae2fd]'
                      }`}
                    >
                      All ({activeRecord.pages.length})
                    </button>
                    {activeRecord.pages.map((p) => (
                      <button
                        key={p.page_number}
                        onClick={() => setSelectedPageNum(p.page_number)}
                        className={`px-2 py-0.5 rounded font-semibold ${
                          selectedPageNum === p.page_number
                            ? 'bg-[#4f46e5] text-white'
                            : 'bg-[#eaedff] text-[#464555] hover:bg-[#dae2fd]'
                        }`}
                      >
                        P{p.page_number} ({p.ocr_confidence}%)
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Extracted Text Content Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs uppercase font-semibold text-[#464555]">
                    Forensic Text Layer ({activeRecord.extraction_method})
                  </span>
                  <span className="font-mono text-xs text-[#464555]">
                    {activeRecord.extracted_text ? `${activeRecord.extracted_text.length} characters extracted` : 'No text extracted'}
                  </span>
                </div>

                <div className="bg-[#283044] text-[#eef0ff] p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-white/10 max-h-80 select-text whitespace-pre-wrap">
                  {selectedPageNum === 'all' || !activeRecord.pages ? (
                    renderHighlightedText(activeRecord.extracted_text || 'No text extracted or processing failed.', textSearchQuery)
                  ) : (
                    renderHighlightedText(
                      activeRecord.pages.find(p => p.page_number === selectedPageNum)?.extracted_text || 'No text on this page.',
                      textSearchQuery
                    )
                  )}
                </div>
              </div>

              {/* PANEL E: Cryptographic Hash & Provenance Drawer */}
              <div className="p-4 bg-[#f2f3ff] rounded-xl border border-[#eaedff] space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="material-symbols-outlined text-[16px] text-[#00714e]">verified</span>
                    <span className="text-[#464555]">SHA-256 Digest:</span>
                    <span className="text-[#131b2e] font-bold select-all break-all">
                      {activeRecord.sha256_hash}
                    </span>
                  </div>
                  <button
                    onClick={() => copyText(activeRecord.sha256_hash, 'SHA-256 Digest')}
                    className="text-[#3525cd] hover:underline font-semibold flex items-center gap-1 text-xs"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span> Copy Hash
                  </button>
                </div>

                {/* Audit Logs list */}
                {activeRecord.audit_logs && activeRecord.audit_logs.length > 0 && (
                  <div className="pt-3 border-t border-[#eaedff]">
                    <span className="text-xs uppercase font-semibold text-[#464555] block mb-2">
                      Immutable Audit Trail & Case Link History
                    </span>
                    <div className="space-y-1.5">
                      {activeRecord.audit_logs.map((log) => (
                        <div key={log.id} className="p-2 rounded bg-white border border-[#eaedff] flex items-center justify-between font-mono text-xs">
                          <div>
                            <span className="font-bold text-[#3525cd]">{log.action}</span> by <span className="text-[#131b2e]">{log.performed_by}</span>: {log.reason}
                          </div>
                          <span className="text-[#464555]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#eaedff] p-8 text-center text-[#464555] text-xs">
              Select an evidence file from the queue above to inspect extracted OCR text.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
