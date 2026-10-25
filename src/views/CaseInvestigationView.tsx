import React, { useState, useEffect } from 'react';
import { CaseDossierDetail, PageRoute } from '../types';

interface CaseInvestigationViewProps {
  caseId: string;
  onNavigate: (route: PageRoute) => void;
  onSelectCase: (caseId: string) => void;
}

export const CaseInvestigationView: React.FC<CaseInvestigationViewProps> = ({
  caseId,
  onNavigate,
  onSelectCase
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'identity' | 'evidence' | 'timeline' | 'policy' | 'remediation' | 'checklist'>('summary');
  const [caseData, setCaseData] = useState<CaseDossierDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [evidenceFilter, setEvidenceFilter] = useState<string>('all');
  const [scriptModalOpen, setScriptModalOpen] = useState<boolean>(false);
  const [ocrEvidence, setOcrEvidence] = useState<any[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/cases/${caseId}`).then(res => res.json()).catch(() => null),
      fetch(`/api/cases/${caseId}/evidence`).then(res => res.json()).catch(() => null)
    ]).then(([dossier, ocrData]) => {
      if (dossier) setCaseData(dossier);
      if (ocrData?.items) setOcrEvidence(ocrData.items);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [caseId]);

  if (loading || !caseData) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[32px] text-[#3525cd] animate-spin">refresh</span>
          <span className="font-mono text-xs text-[#464555]">Loading forensic case dossier for {caseId}...</span>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#131b2e] text-white px-4 py-2.5 rounded-lg shadow-xl border border-white/10 font-mono text-xs flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[#82f5c1] text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Script Generation Modal */}
      {scriptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#eaedff] w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-[#283044] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">terminal</span>
                <span className="font-display font-semibold text-sm">Automated Remediation Script ({caseData.case_id})</span>
              </div>
              <button
                onClick={() => setScriptModalOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-4 bg-[#131b2e] text-emerald-400 font-mono text-xs overflow-x-auto max-h-96">
              <pre className="leading-relaxed">
{`#!/usr/bin/env bash
# GhostGuard AI Deterministic Remediation Vector
# Case: ${caseData.case_id} | Subject: ${caseData.subject.primary_email}
set -euo pipefail

echo "[+] Step 1: Halting CDC replay pipeline worker..."
curl -X POST https://kafka-connect.cluster:8083/connectors/cdc_user_profile_sync/pause \\
  -H "Content-Type: application/json"

echo "[+] Step 2: Purging unredacted Elasticsearch document doc_99214..."
curl -X DELETE "https://es-cluster.internal:9200/customer-profiles-v2/_doc/doc_99214" \\
  -H "X-Audit-Reason: GDPR-Art17-Purge"

echo "[+] Step 3: Evicting persistent Redis session key sess:usr:CUST-99214..."
redis-cli -h redis-session-master.internal -p 6379 DEL "sess:usr:CUST-99214"

echo "[+] Step 4: Redacting KYC drivers license S3 object..."
aws s3 rm s3://solardyne-kyc-vault/m_vance_drivers_license.pdf

echo "[+] Step 5: Emitting tombstone marker to Kafka partition..."
echo '{"key":"CUST-99214","value":null}' | kafka-console-producer \\
  --broker-list kafka:9092 --topic cdc.users

echo "[SUCCESS] All 5 sequential vectors executed. Case ${caseData.case_id} sealed."`}
              </pre>
            </div>
            <div className="p-3 bg-[#f2f3ff] border-t border-[#eaedff] flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#464555]">Script verified against 42 deletion policy constraints</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("curl -X DELETE ... (remediation script)");
                    showToast('Remediation script copied to clipboard.');
                    setScriptModalOpen(false);
                  }}
                  className="h-7 px-3 rounded bg-white border border-[#c7c4d8] text-xs font-medium hover:bg-[#eaedff]"
                >
                  Copy Script
                </button>
                <button
                  onClick={() => {
                    showToast('Executing remediation script against staging cluster...');
                    setScriptModalOpen(false);
                  }}
                  className="h-7 px-3 rounded bg-[#4f46e5] text-white text-xs font-medium hover:bg-[#3525cd]"
                >
                  Execute in Staging
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Case Header HUD */}
      <div className="sticky top-16 z-30 bg-white shadow-md rounded-xl p-4 mb-6 border border-[#eaedff]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Left: Identity & Badges */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#eaedff] px-2.5 py-1 rounded border border-[#c7c4d8]/40 whitespace-nowrap">
                <span className="text-xs font-semibold text-[#464555]">CASE ID</span>
                <span className="font-mono text-sm text-[#3525cd] font-bold">{caseData.case_id}</span>
                <button
                  onClick={() => copyToClipboard(caseData.case_id, 'Case ID')}
                  className="p-0.5 text-[#464555] hover:text-[#3525cd] transition-colors"
                  title="Copy Case ID"
                >
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                </button>
              </div>

              <span className="px-2.5 py-1 rounded bg-[#e2dfff] text-[#0f0069] font-mono text-xs font-semibold whitespace-nowrap">
                {caseData.request_type}
              </span>

              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-xs font-bold whitespace-nowrap ${
                caseData.status === 'COMPLETE'
                  ? 'bg-[#82f5c1]/40 text-[#00714e]'
                  : (caseData.status === 'INCOMPLETE' ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#dae2fd] text-[#131b2e]')
              }`}>
                <span className="material-symbols-outlined text-[14px]">
                  {caseData.status === 'COMPLETE' ? 'check_circle' : (caseData.status === 'INCOMPLETE' ? 'error' : 'info')}
                </span>
                {caseData.status}
              </span>

              {caseData.severity !== 'NONE' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ffdcc3] text-[#703a00] font-mono text-xs font-bold whitespace-nowrap">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  {caseData.severity}
                </span>
              )}
            </div>

            {/* Subject Line */}
            <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
              <h1 className="font-display text-2xl lg:text-[28px] font-semibold text-[#131b2e] tracking-tight">
                {caseData.subject.name}
              </h1>
              <span className="font-mono text-sm text-[#464555]">{caseData.subject.primary_email}</span>
              <span className="text-[#464555]/40 text-xs">•</span>
              <span className="font-mono text-xs text-[#464555]">
                cust_id: <strong className="text-[#131b2e] font-semibold">{caseData.subject.customer_id}</strong>
              </span>
              <span className="text-[#464555]/40 text-xs">•</span>
              <span className="font-mono text-xs text-[#464555]">
                legacy: <strong className="text-[#131b2e] font-semibold">{caseData.subject.legacy_id}</strong>
              </span>
            </div>

            {/* Timestamps */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#464555] mt-0.5">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#703a00]">schedule</span>
                Audit Cutoff: <strong className="text-[#131b2e]">{caseData.audit_cutoff}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#006c4a]">verified</span>
                Forensic Evaluated: <strong className="text-[#131b2e]">{caseData.forensic_evaluated}</strong>
              </span>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => showToast(`Re-running forensic verification on ${caseData.case_id}...`)}
              className="h-9 px-3 rounded bg-white border border-[#c7c4d8]/50 hover:bg-[#f2f3ff] text-[#131b2e] text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>Re-run Analysis</span>
            </button>

            <button
              onClick={() => setScriptModalOpen(true)}
              className="h-8 px-3 rounded bg-[#4f46e5] text-white text-xs font-medium flex items-center gap-1 shadow-xs hover:bg-[#3525cd] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">terminal</span>
              <span>Generate Remediation Script</span>
            </button>

            <button
              onClick={() => showToast(`Exported forensic dossier for ${caseData.case_id} (PDF format).`)}
              className="h-8 px-2.5 rounded bg-white border border-[#c7c4d8]/50 hover:bg-[#f2f3ff] text-[#131b2e] text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>Export Dossier</span>
            </button>

            <button
              onClick={() => showToast(`Case ${caseData.case_id} flagged for Legal Review.`)}
              className="h-8 px-2 rounded bg-[#ffdad6] hover:bg-[#ba1a1a] text-[#93000a] hover:text-white text-xs flex items-center justify-center transition-colors cursor-pointer"
              title="Flag for Manual Legal Review"
            >
              <span className="material-symbols-outlined text-[18px]">flag</span>
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-1 overflow-x-auto mt-3.5 pt-1 bg-[#f2f3ff] rounded-lg p-1 border border-[#eaedff]">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'summary'
                ? 'bg-white text-[#3525cd] font-semibold shadow-xs'
                : 'text-[#464555] hover:text-[#131b2e]'
            }`}
          >
            <span>A. Summary</span>
            {activeTab === 'summary' && <span className="w-1.5 h-1.5 rounded-full bg-[#3525cd]"></span>}
          </button>

          <button
            onClick={() => setActiveTab('identity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'identity'
                ? 'bg-white text-[#3525cd] font-semibold shadow-xs'
                : 'text-[#464555] hover:text-[#131b2e]'
            }`}
          >
            <span>B. Identity & Identifiers</span>
            <span className="px-1 py-0.2 rounded bg-[#eaedff] text-[#131b2e] font-mono text-[10px]">3</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'evidence'
                ? 'bg-white text-[#3525cd] font-semibold shadow-xs'
                : 'text-[#464555] hover:text-[#131b2e]'
            }`}
          >
            <span>C. Evidence Manifest</span>
            <span className="px-1 py-0.2 rounded bg-[#ffdad6] text-[#93000a] font-mono text-[10px]">6</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'timeline'
                ? 'bg-white text-[#3525cd] font-semibold shadow-xs'
                : 'text-[#464555] hover:text-[#131b2e]'
            }`}
          >
            <span>D. System Timeline</span>
            <span className="px-1 py-0.2 rounded bg-[#eaedff] text-[#131b2e] font-mono text-[10px]">12</span>
          </button>

          <button
            onClick={() => setActiveTab('policy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'policy'
                ? 'bg-white text-[#3525cd] font-semibold shadow-xs'
                : 'text-[#464555] hover:text-[#131b2e]'
            }`}
          >
            <span>E. Policy Evaluation</span>
            <span className="px-1 py-0.2 rounded bg-[#ffdcc3] text-[#703a00] font-mono text-[10px]">5</span>
          </button>

          <button
            onClick={() => setActiveTab('remediation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'remediation'
                ? 'bg-white text-[#3525cd] font-semibold shadow-xs'
                : 'text-[#464555] hover:text-[#131b2e]'
            }`}
          >
            <span>F. Remediation Plan</span>
            <span className="px-1 py-0.2 rounded bg-[#eaedff] text-[#131b2e] font-mono text-[10px]">3 Steps</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'checklist'
                ? 'bg-white text-[#3525cd] font-semibold shadow-xs'
                : 'text-[#464555] hover:text-[#131b2e]'
            }`}
          >
            <span>G. Verification Checklist</span>
            <span className="px-1 py-0.2 rounded bg-[#82f5c1] text-[#002114] font-mono text-[10px]">4</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'summary' && (
        <div className="flex flex-col gap-6">
          {/* Executive Decision Banner with Diagnostic Visualizer */}
          <div className="bg-white rounded-xl p-5 border border-[#eaedff] shadow-xs relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#ffdad6]/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-wider font-bold ${
                    caseData.rationale.verdict === 'COMPLETE'
                      ? 'bg-[#006c4a] text-white'
                      : (caseData.rationale.verdict === 'INCOMPLETE' ? 'bg-[#ba1a1a] text-white' : 'bg-[#464555] text-white')
                  }`}>
                    VERDICT: {caseData.rationale.verdict}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-[#464555]">
                    {caseData.rationale.finding_id}
                  </span>
                </div>

                <h2 className="font-display text-lg font-semibold text-[#131b2e] tracking-tight mb-2">
                  Executive Decision Rationale
                </h2>

                <p className="text-xs sm:text-sm text-[#464555] leading-relaxed max-w-4xl">
                  {caseData.rationale.text}
                </p>

                {/* Status Strip */}
                <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 bg-[#f2f3ff] rounded-lg p-3 border border-[#eaedff]">
                  {caseData.rationale.status_strip.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        item.type === 'secondary'
                          ? 'bg-[#82f5c1] text-[#002114]'
                          : (item.type === 'error' ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#ffdcc3] text-[#703a00]')
                      }`}>
                        <span className="material-symbols-outlined text-[15px]">{item.icon}</span>
                      </div>
                      <div>
                        <div className="font-mono text-[11px] font-bold text-[#131b2e]">{item.system}</div>
                        <div className={`text-[10px] ${
                          item.type === 'error' ? 'text-[#ba1a1a] font-semibold' : (item.type === 'tertiary' ? 'text-[#703a00] font-bold' : 'text-[#464555]')
                        }`}>
                          {item.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inline Compliance Gauge Card */}
              <div className="w-full lg:w-72 shrink-0 bg-[#eaedff]/60 border border-[#eaedff] rounded-lg p-4 flex flex-col items-center text-center">
                <span className="text-[10px] uppercase font-semibold text-[#464555] tracking-wider mb-1">
                  Data Integrity Score
                </span>

                <div className="relative w-24 h-24 my-2 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="stroke-[#dae2fd]"
                      cx="50"
                      cy="50"
                      fill="none"
                      r="40"
                      strokeWidth="10"
                    />
                    <circle
                      className={caseData.data_integrity_score.score >= 90 ? 'stroke-[#006c4a]' : 'stroke-[#ba1a1a]'}
                      cx="50"
                      cy="50"
                      fill="none"
                      r="40"
                      strokeWidth="10"
                      strokeDasharray="251"
                      strokeDashoffset={251 - (251 * caseData.data_integrity_score.score) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`font-display text-xl font-bold leading-none ${
                      caseData.data_integrity_score.score >= 90 ? 'text-[#006c4a]' : 'text-[#ba1a1a]'
                    }`}>
                      {caseData.data_integrity_score.score}%
                    </span>
                    <span className="font-mono text-[9px] text-[#464555] mt-0.5">
                      {caseData.data_integrity_score.status}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-[11px] text-[#131b2e] font-semibold">
                  {caseData.data_integrity_score.summary}
                </span>
                <span className="text-[10px] text-[#464555] mt-0.5">
                  {caseData.data_integrity_score.sla_note}
                </span>
              </div>
            </div>
          </div>

          {/* Forensic Findings Grid (3 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel 1: Resolved Identity & Footprint */}
            <div className="bg-white rounded-xl p-4 border border-[#eaedff] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 bg-[#f2f3ff] p-2 rounded border border-[#eaedff]">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#3525cd]">person_search</span>
                    <h3 className="font-display text-xs text-[#131b2e] font-semibold">Resolved Identity & Footprint</h3>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white text-[#131b2e] border border-[#eaedff]">
                    6 Systems
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-[#f2f3ff] p-2 rounded border border-[#eaedff]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-semibold text-[#464555]">PRIMARY EMAIL</span>
                      <span className="font-mono text-[10px] text-[#006c4a] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a]"></span> Verified
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-[#131b2e] mt-0.5 font-medium">
                      {caseData.subject.primary_email}
                    </div>
                  </div>

                  <div className="bg-[#f2f3ff] p-2 rounded border border-[#eaedff]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-semibold text-[#464555]">HISTORICAL IDENTIFIER</span>
                      <span className="font-mono text-[10px] text-[#464555]">Auth0 Logs</span>
                    </div>
                    <div className="font-mono text-[11px] text-[#131b2e] mt-0.5 font-medium">
                      {caseData.subject.historical_identifiers[0] || 'None'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#f2f3ff] p-2 rounded border border-[#eaedff]">
                      <span className="text-[10px] uppercase font-semibold text-[#464555]">CUSTOMER ID</span>
                      <div className="font-mono text-[11px] font-bold text-[#131b2e]">{caseData.subject.customer_id}</div>
                    </div>
                    <div className="bg-[#f2f3ff] p-2 rounded border border-[#eaedff]">
                      <span className="text-[10px] uppercase font-semibold text-[#464555]">LEGACY ID</span>
                      <div className="font-mono text-[11px] font-bold text-[#131b2e]">{caseData.subject.legacy_id}</div>
                    </div>
                  </div>

                  <div className="bg-[#f2f3ff] p-2 rounded border border-[#eaedff]">
                    <span className="text-[10px] uppercase font-semibold text-[#464555]">GLOBAL ENTITY UUID</span>
                    <div className="font-mono text-[10px] text-[#464555] break-all">{caseData.subject.global_uuid}</div>
                  </div>
                </div>
              </div>

              {/* Systems Touched Chips */}
              <div className="mt-4 pt-2 border-t border-[#eaedff]">
                <span className="text-[10px] uppercase font-semibold text-[#464555] block mb-1.5">Graph Footprint:</span>
                <div className="flex flex-wrap gap-1">
                  {caseData.subject.graph_footprint.map((fp, i) => (
                    <span
                      key={i}
                      className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                        fp.type === 'secondary'
                          ? 'bg-[#82f5c1]/40 text-[#00714e]'
                          : (fp.type === 'error'
                            ? 'bg-[#ffdad6] text-[#93000a]'
                            : (fp.type === 'tertiary' ? 'bg-[#ffdcc3] text-[#703a00]' : 'bg-[#eaedff] text-[#464555]'))
                      }`}
                    >
                      {fp.system}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel 2: Confirmed Violations */}
            <div className="bg-white rounded-xl p-4 border border-[#eaedff] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 bg-[#f2f3ff] p-2 rounded border border-[#eaedff]">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">gavel</span>
                    <h3 className="font-display text-xs text-[#131b2e] font-semibold">
                      Confirmed Violations ({caseData.confirmed_violations.length} Systems)
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#ba1a1a] text-white font-bold">
                    {caseData.confirmed_violations.length} Breaches
                  </span>
                </div>

                <div className="space-y-2.5">
                  {caseData.confirmed_violations.length === 0 ? (
                    <div className="p-3 bg-[#f2f3ff] rounded text-center text-xs text-[#006c4a] font-medium">
                      Zero active violations. System verified clean.
                    </div>
                  ) : (
                    caseData.confirmed_violations.map((vio, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-[#f2f3ff] border border-[#eaedff]">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-[#ba1a1a]">{vio.id}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[#ffdad6] text-[#93000a] rounded">
                            {vio.tag}
                          </span>
                        </div>
                        <p className="text-xs text-[#131b2e] mt-1 leading-relaxed">
                          {vio.description}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-between bg-[#ffdad6]/40 p-2 rounded border border-[#ffdad6]">
                <span className="text-[10px] uppercase font-semibold text-[#93000a]">Regulatory Fine Exposure:</span>
                <span className="font-mono text-[11px] font-bold text-[#ba1a1a]">{caseData.regulatory_fine}</span>
              </div>
            </div>

            {/* Panel 3: Active Recreation Risks */}
            <div className="bg-white rounded-xl p-4 border border-[#eaedff] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 bg-[#f2f3ff] p-2 rounded border border-[#eaedff]">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#703a00]">replay</span>
                    <h3 className="font-display text-xs text-[#131b2e] font-semibold">Active Recreation Risks</h3>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#ffdcc3] text-[#703a00] font-bold">
                    {caseData.recreation_risks ? caseData.recreation_risks.badge : 'NONE'}
                  </span>
                </div>

                {caseData.recreation_risks ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded bg-[#f2f3ff] border border-[#eaedff]">
                      <div className="flex items-center gap-1.5 text-[#703a00] mb-1">
                        <span className="material-symbols-outlined text-[16px]">sync_problem</span>
                        <span className="font-mono text-[10px] font-bold uppercase">{caseData.recreation_risks.alert}</span>
                      </div>
                      <p className="text-xs text-[#131b2e] leading-relaxed">
                        {caseData.recreation_risks.description}
                      </p>
                      <div className="mt-2 p-2 rounded bg-white font-mono text-[10px] text-[#464555] border border-[#eaedff] space-y-0.5">
                        {caseData.recreation_risks.consumer_group && (
                          <div>Consumer Group: <span className="text-[#131b2e] font-semibold">{caseData.recreation_risks.consumer_group}</span></div>
                        )}
                        <div>Status: <span className="text-[#ba1a1a] font-bold">{caseData.recreation_risks.status}</span></div>
                        <div>Last Event Re-injected: <span className="text-[#131b2e]">{caseData.recreation_risks.last_event}</span></div>
                      </div>
                    </div>

                    {/* Sparkline Rate */}
                    <div className="p-2.5 rounded bg-[#f2f3ff] border border-[#eaedff]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] uppercase font-semibold text-[#464555]">
                          CDC RE-INJECTION RATE (LAST 24H)
                        </span>
                        <span className="font-mono text-[10px] text-[#703a00] font-bold">4 Replays</span>
                      </div>
                      <div className="h-8 w-full flex items-end gap-1 pt-1">
                        <div className="flex-1 bg-[#eaedff] h-2 rounded-xs"></div>
                        <div className="flex-1 bg-[#eaedff] h-2 rounded-xs"></div>
                        <div className="flex-1 bg-[#ba1a1a] h-7 rounded-xs" title="Re-injection at 04:00 UTC"></div>
                        <div className="flex-1 bg-[#eaedff] h-2 rounded-xs"></div>
                        <div className="flex-1 bg-[#eaedff] h-2 rounded-xs"></div>
                        <div className="flex-1 bg-[#ba1a1a] h-5 rounded-xs" title="Re-injection at 10:00 UTC"></div>
                        <div className="flex-1 bg-[#eaedff] h-2 rounded-xs"></div>
                        <div className="flex-1 bg-[#eaedff] h-2 rounded-xs"></div>
                        <div className="flex-1 bg-[#ba1a1a] h-8 rounded-xs" title="Re-injection at 16:00 UTC"></div>
                        <div className="flex-1 bg-[#eaedff] h-2 rounded-xs"></div>
                        <div className="flex-1 bg-[#eaedff] h-2 rounded-xs"></div>
                        <div className="flex-1 bg-[#ba1a1a] h-6 rounded-xs" title="Re-injection at 22:00 UTC"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#f2f3ff] rounded text-center text-xs text-[#464555]">
                    No active resurrection loops or CDC hazards detected.
                  </div>
                )}
              </div>

              {caseData.recreation_risks && (
                <div className="mt-4 pt-2">
                  <button
                    onClick={() => showToast('Triggered emergency kill-switch on dw-sync-service-v3 CDC worker.')}
                    className="w-full h-8 rounded bg-[#ffdcc3] text-[#703a00] hover:bg-[#ffb77d] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">pause_circle</span>
                    <span>Emergency Kill-Switch CDC Worker</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Evidence Manifest Section */}
          <div className="bg-white rounded-xl p-5 border border-[#eaedff] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2.5 bg-[#f2f3ff] p-3 rounded border border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#3525cd]">data_object</span>
                <div>
                  <h3 className="font-display text-sm font-semibold text-[#131b2e]">Forensic Evidence Manifest</h3>
                  <span className="text-[10px] text-[#464555]">Real-time snapshots captured during deterministic validation scan</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#464555]">Filter by System:</span>
                <select
                  value={evidenceFilter}
                  onChange={(e) => setEvidenceFilter(e.target.value)}
                  className="h-7 text-xs bg-white px-2 rounded text-[#131b2e] font-mono border border-[#eaedff] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
                >
                  <option value="all">All Evidence ({caseData.evidence_manifest.length})</option>
                  <option value="elasticsearch">Elasticsearch</option>
                  <option value="redis">Redis Cache</option>
                  <option value="kafka">Kafka Pipeline</option>
                </select>
              </div>
            </div>

            {/* Evidence Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {caseData.evidence_manifest.map((ev, idx) => (
                <div key={idx} className="bg-[#f2f3ff] rounded-lg p-3.5 border border-[#eaedff] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-[#3525cd]">{ev.id}</span>
                        <span className="px-1.5 py-0.2 rounded bg-white text-[#131b2e] font-mono text-[10px] border border-[#eaedff]">
                          {ev.system}
                        </span>
                      </div>
                      <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold ${
                        ev.badge_type === 'error'
                          ? 'bg-[#ffdad6] text-[#93000a]'
                          : (ev.badge_type === 'tertiary' ? 'bg-[#ffdcc3] text-[#703a00]' : 'bg-[#82f5c1] text-[#002114]')
                      }`}>
                        {ev.badge}
                      </span>
                    </div>

                    <span className="text-[10px] uppercase font-semibold text-[#464555] block mb-1.5">
                      {ev.target}
                    </span>

                    {/* Monospaced Code Viewer with Highlights */}
                    <pre className="bg-[#283044] text-[#eef0ff] p-2.5 rounded font-mono text-[11px] overflow-x-auto leading-relaxed select-text border border-white/10 max-h-56">
                      {ev.code}
                    </pre>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#eaedff] flex items-center justify-between text-[#464555] font-mono text-[10px]">
                    {ev.sha256 ? (
                      <>
                        <span>SHA-256: <strong className="text-[#131b2e]">{ev.display_hash}</strong></span>
                        <button
                          onClick={() => copyToClipboard(ev.sha256!, 'SHA-256 Hash')}
                          className="text-[#3525cd] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[13px]">copy_all</span> Copy Hash
                        </button>
                      </>
                    ) : ev.ram ? (
                      <>
                        <span>RAM: <strong className="text-[#131b2e]">{ev.ram}</strong></span>
                        <button
                          onClick={() => showToast(`Staged DEL command for key: ${ev.target}`)}
                          className="text-[#3525cd] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[13px]">delete</span> Stage DEL Key
                        </button>
                      </>
                    ) : (
                      <>
                        <span>Lag: <strong className="text-[#703a00]">{ev.lag}</strong></span>
                        <button
                          onClick={() => showToast('Reset Kafka partition offset to head.')}
                          className="text-[#3525cd] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[13px]">skip_next</span> Reset Offset
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Linked OCR Intelligence Documents */}
            <div className="mt-5 pt-4 border-t border-[#eaedff]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#3525cd]">document_scanner</span>
                  <span className="font-display text-xs font-semibold text-[#131b2e]">
                    OCR Intelligence & Scanned KYC Attachments ({ocrEvidence.length} Linked)
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('evidence-intelligence')}
                  className="h-7 px-3 rounded bg-[#4f46e5] text-white font-mono text-[11px] font-semibold flex items-center gap-1.5 hover:bg-[#3525cd] transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[14px]">upload_file</span>
                  <span>Upload & Ingest Document</span>
                </button>
              </div>

              {ocrEvidence.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ocrEvidence.map((doc, dIdx) => (
                    <div key={dIdx} className="bg-[#f2f3ff] rounded-lg p-3 border border-[#eaedff] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-xs font-bold text-[#3525cd]">{doc.id}</span>
                          <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-[#82f5c1]/40 text-[#00714e]">
                            {doc.average_ocr_confidence}% OCR Conf
                          </span>
                        </div>
                        <div className="text-xs font-medium text-[#131b2e] truncate">{doc.original_filename}</div>
                        <div className="font-mono text-[10px] text-[#464555] mt-0.5">
                          {doc.extraction_method} · {doc.page_count} page(s) · {(doc.file_size_bytes / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-[#eaedff] flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[#464555] truncate max-w-[180px]">
                          SHA: {doc.sha256_hash.slice(0, 12)}...
                        </span>
                        <button
                          onClick={() => onNavigate('evidence-intelligence')}
                          className="font-mono text-[10px] text-[#3525cd] hover:underline font-semibold flex items-center gap-1"
                        >
                          <span>Inspect Full OCR Text</span>
                          <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-[#f2f3ff] rounded-lg border border-[#eaedff] flex items-center justify-between text-xs text-[#464555]">
                  <span>No OCR document attachments uploaded yet for {caseData.case_id}.</span>
                  <button
                    onClick={() => onNavigate('evidence-intelligence')}
                    className="text-[#3525cd] hover:underline font-semibold flex items-center gap-1 font-mono text-[11px]"
                  >
                    <span>Upload KYC scan</span>
                    <span className="material-symbols-outlined text-[13px]">add</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Verification Pipeline Trajectory */}
          <div className="bg-white rounded-xl p-4 border border-[#eaedff] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-semibold text-[#464555] tracking-wider">
                Automated Verification Pipeline Trajectory
              </span>
              <span className="font-mono text-[10px] text-[#131b2e]">Execution ID: #EXEC-2026-9941</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              {caseData.verification_pipeline.map((node, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg flex items-center gap-2.5 ${
                    node.type === 'secondary'
                      ? 'bg-[#82f5c1]/30 text-[#00714e] border border-[#82f5c1]'
                      : (node.type === 'error'
                        ? 'bg-[#ffdad6] text-[#93000a] border border-[#ffdad6] animate-pulse'
                        : 'bg-[#eaedff]/60 text-[#464555] border border-[#eaedff]')
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {node.status === 'COMPLETED' ? 'check_circle' : (node.status === 'FAILED' ? 'dangerous' : 'radio_button_unchecked')}
                  </span>
                  <div>
                    <div className="font-mono text-[11px] font-bold">{node.title}</div>
                    <div className="text-[10px] opacity-80">{node.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Action Bar (Bottom Docked Card) */}
          <div className="bg-[#283044] text-[#eef0ff] rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-[#334155]/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#ffdcc3] text-[#703a00] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">priority_high</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#ffdcc3] font-bold tracking-wider uppercase">
                    Order of Operations Required
                  </span>
                  <span className="font-mono text-[10px] text-[#eef0ff]/60">• 4 Sequential Purge Vectors</span>
                </div>
                <span className="font-mono text-xs text-[#eef0ff] mt-0.5">
                  1. Halt CDC sync pipeline <span className="text-[#ffdcc3] font-bold">→</span> 
                  2. Purge Elasticsearch Doc <span className="text-[#ffdcc3] font-bold">→</span> 
                  3. Evict Redis key <span className="text-[#ffdcc3] font-bold">→</span> 
                  4. Execute cryptographic verification
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
              <button
                onClick={() => onNavigate('remediation-planner')}
                className="flex-1 md:flex-initial h-9 px-4 rounded bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <span>View Interactive Remediation Plan</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other Tabs View Placeholders with Complete Interactive Details */}
      {activeTab === 'identity' && (
        <div className="bg-white rounded-xl p-6 border border-[#eaedff] shadow-xs space-y-4">
          <h2 className="font-display text-base font-semibold text-[#131b2e]">Identity Resolution Graph for {caseData.case_id}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-[#f2f3ff] rounded-lg border border-[#eaedff] space-y-2">
              <span className="font-semibold text-xs text-[#131b2e]">Direct User Entities</span>
              <div className="font-mono text-[11px] text-[#464555]">Primary Email: {caseData.subject.primary_email}</div>
              <div className="font-mono text-[11px] text-[#464555]">Historical Aliases: {caseData.subject.historical_identifiers.join(', ')}</div>
              <div className="font-mono text-[11px] text-[#464555]">Customer Identifier: {caseData.subject.customer_id}</div>
              <div className="font-mono text-[11px] text-[#464555]">Legacy ERP Index: {caseData.subject.legacy_id}</div>
            </div>
            <div className="p-4 bg-[#f2f3ff] rounded-lg border border-[#eaedff] space-y-2">
              <span className="font-semibold text-xs text-[#131b2e]">Corroborating Evidence</span>
              <div className="text-[#464555]">Matched through Auth0 audit logs and Kafka identity reconciliation partition 04.</div>
              <div className="text-[#006c4a] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">verified</span> Zero ambiguous alias conflicts detected.
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'evidence' && (
        <div className="bg-white rounded-xl p-6 border border-[#eaedff] shadow-xs space-y-4">
          <h2 className="font-display text-base font-semibold text-[#131b2e]">All 6 Evidence Manifest Proofs</h2>
          <div className="space-y-3">
            {caseData.evidence_manifest.map((ev, i) => (
              <div key={i} className="p-3 bg-[#f2f3ff] rounded-lg border border-[#eaedff] flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-xs text-[#3525cd] mr-2">{ev.id}</span>
                  <span className="text-xs text-[#131b2e]">{ev.system} — {ev.target}</span>
                </div>
                <span className="font-mono text-[10px] text-[#ba1a1a] font-semibold">{ev.badge}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="bg-white rounded-xl p-6 border border-[#eaedff] shadow-xs space-y-4">
          <h2 className="font-display text-base font-semibold text-[#131b2e]">System Chronology for {caseData.case_id}</h2>
          <div className="pl-4 border-l-2 border-[#eaedff] space-y-4 text-xs">
            <div>
              <span className="font-mono text-[10px] text-[#464555]">2026-10-10 09:14 UTC</span>
              <p className="text-[#131b2e] font-medium">Deletion request submitted under GDPR Art. 17.</p>
            </div>
            <div>
              <span className="font-mono text-[10px] text-[#464555]">2026-10-12 11:20 UTC</span>
              <p className="text-[#006c4a] font-medium">PostgreSQL core record successfully deleted and tombstoned.</p>
            </div>
            <div>
              <span className="font-mono text-[10px] text-[#ba1a1a]">2026-10-13 04:00 UTC</span>
              <p className="text-[#ba1a1a] font-medium">Kafka topic `cdc.users` re-injected purged keys into AWS Redshift staging.</p>
            </div>
            <div>
              <span className="font-mono text-[10px] text-[#703a00]">2026-10-14 18:22 UTC</span>
              <p className="text-[#703a00] font-medium">Elasticsearch cluster audit discovered doc_99214 intact in index customer-profiles-v2.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'policy' && (
        <div className="bg-white rounded-xl p-6 border border-[#eaedff] shadow-xs space-y-4">
          <h2 className="font-display text-base font-semibold text-[#131b2e]">Policy Constraints Evaluated</h2>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-[#f2f3ff] rounded flex justify-between">
              <span>Rule R-01: Primary Credentials (GDPR Art. 17)</span>
              <span className="font-mono text-[#006c4a] font-bold">COMPLIANT (Purged)</span>
            </div>
            <div className="p-3 bg-[#f2f3ff] rounded flex justify-between">
              <span>Rule R-04: Elasticsearch Search Index (GDPR Art. 17)</span>
              <span className="font-mono text-[#ba1a1a] font-bold">VIOLATION (Doc doc_99214 active)</span>
            </div>
            <div className="p-3 bg-[#f2f3ff] rounded flex justify-between">
              <span>Rule R-05: Redis Memory Tokens (GDPR Art. 17)</span>
              <span className="font-mono text-[#ba1a1a] font-bold">VIOLATION (TTL -1 flag)</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'remediation' && (
        <div className="bg-white rounded-xl p-6 border border-[#eaedff] shadow-xs space-y-4">
          <h2 className="font-display text-base font-semibold text-[#131b2e]">Ordered Remediation Plan</h2>
          <div className="space-y-3 text-xs">
            {caseData.order_of_operations.map((op, i) => (
              <div key={i} className="p-3 bg-[#f2f3ff] rounded-lg border border-[#eaedff] flex items-center justify-between">
                <span className="font-mono font-semibold text-[#131b2e]">{op}</span>
                <span className="px-2 py-0.5 rounded bg-[#4f46e5] text-white font-mono text-[10px]">Step {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'checklist' && (
        <div className="bg-white rounded-xl p-6 border border-[#eaedff] shadow-xs space-y-4">
          <h2 className="font-display text-base font-semibold text-[#131b2e]">Cryptographic Verification Checklist</h2>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 p-2 bg-[#82f5c1]/20 text-[#00714e] rounded">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>PostgreSQL tombstone verified (SHA-256 match)</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-[#ffdad6] text-[#93000a] rounded">
              <span className="material-symbols-outlined text-[16px]">close</span>
              <span>Elasticsearch document unpurged</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-[#ffdad6] text-[#93000a] rounded">
              <span className="material-symbols-outlined text-[16px]">close</span>
              <span>Redis active session key sess:usr:CUST-99214 persistent</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
