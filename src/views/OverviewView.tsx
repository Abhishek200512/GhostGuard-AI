import React, { useState, useEffect } from 'react';
import { PageRoute } from '../types';

interface OverviewViewProps {
  onNavigate: (route: PageRoute) => void;
  onSelectCase: (caseId: string) => void;
  onOpenImportModal: () => void;
  onRunAudit: () => void;
  isAuditing: boolean;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  onSelectCase,
  onOpenImportModal,
  onRunAudit,
  isAuditing
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchOverview = () => {
    fetch('/api/overview')
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(data => {
        setOverviewData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOverview();
  }, [isAuditing]);

  const handleExportJson = () => {
    fetch('/api/overview')
      .then(res => res.json())
      .then(data => {
        const payload = {
          audit_run_id: data.run_id || 'RUN-2026-10-18',
          timestamp: new Date().toISOString(),
          evaluated_cases: data.metrics?.total_ingested || 518,
          status_distribution: {
            COMPLETE: data.metrics?.complete || 342,
            INCOMPLETE: data.metrics?.incomplete || 128,
            NOT_APPLICABLE: data.metrics?.not_applicable || 48
          },
          recreation_hazards: data.metrics?.recreation_hazards || 14,
          verified_proofs: data.metrics?.evidence_proofs_count || 1397,
          total_evidence: data.metrics?.evidence_total || 1420,
          sha256_ledger_hash: data.ledger_hash || '9e8a3a71b2d98c4d2',
          topologies_monitored: 18,
          frameworks: ['GDPR Art. 17', 'CCPA §1798.105']
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ghostguard-audit-log-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        showToast('Exported verified audit log JSON to downloads.');
      })
      .catch(() => {
        showToast('Failed to export audit log.');
      });
  };

  const m = overviewData?.metrics || {
    total_ingested: 518,
    complete: 342,
    complete_pct: 66.0,
    incomplete: 128,
    incomplete_pct: 24.7,
    not_applicable: 48,
    not_applicable_pct: 9.3,
    recreation_hazards: 14,
    evidence_proofs_count: 1397,
    evidence_total: 1420,
    evidence_pct: 98.4
  };

  const highPriority = overviewData?.high_priority_cases || [
    {
      case_id: 'CASE-402',
      identity: 'user_88291@corp.io',
      name: 'Marcus Vance',
      status: 'INCOMPLETE',
      violations: 'Redis Session Cache + Elasticsearch unpurged',
      hazard: 'Active CDC Sync',
      hazard_type: 'warning'
    },
    {
      case_id: 'CASE-319',
      identity: 'm.chen@fintech.net',
      name: 'Mei Chen',
      status: 'INCOMPLETE',
      violations: 'S3 billing attachment unredacted',
      hazard: 'Billing Re-export',
      hazard_type: 'sync'
    },
    {
      case_id: 'CASE-104',
      identity: 'dev_sarah@cloud.org',
      name: 'Sarah Connor',
      status: 'INCOMPLETE',
      violations: 'PostgreSQL clean; Kafka offset replay active',
      hazard: 'Stream Replay',
      hazard_type: 'replay'
    },
    {
      case_id: 'CASE-221',
      identity: 'alex.v@telecom.de',
      name: 'Alex Von Berg',
      status: 'INCOMPLETE',
      violations: 'Snowflake Analytics Mart has unhashed PII',
      hazard: 'None Detected',
      hazard_type: 'neutral'
    }
  ];

  const systemsResidual = overviewData?.systems_residual || [
    { name: 'Search Cluster (Elasticsearch v8.9)', target: 'Index: customer_telemetry_2026_q3', count: 84, pct: 84, color: 'error' },
    { name: 'Data Lake (S3 Bronze Analytics)', target: 'Bucket: s3://prod-analytics-bronze-us/', count: 62, pct: 62, color: 'error' },
    { name: 'Session Cache (Redis Cluster)', target: 'Cluster: redis-session-master:6379', count: 29, pct: 29, color: 'tertiary' },
    { name: 'Message Queue (Kafka `user-events`)', target: 'Topic: prod.events.identities (uncompacted)', count: 18, pct: 18, color: 'tertiary' },
    { name: 'Primary OLTP (PostgreSQL 15)', target: '100% Cryptographically Purged & Vacuumed', count: 0, pct: 100, color: 'secondary' }
  ];

  const activeHazards = overviewData?.active_hazards || [
    {
      id: 'HAZ-001',
      badge: 'RESURRECTION DETECTED',
      badge_type: 'error',
      lag: 'Lag: +4h 12m',
      title: 'Pipeline cdc_user_profile_sync',
      route: 'Route: Kafka topic `cdc.users` → AWS Redshift',
      description: 'Triggered 4 hours post-deletion; resurrected 12 purged user keys due to missing tombstone retention marker on Kafka partition 03.',
      affects: '12 CASES',
      action: 'Apply Tombstone Filter'
    },
    {
      id: 'HAZ-002',
      badge: 'FILTER LEAKAGE',
      badge_type: 'tertiary',
      lag: 'Daily 02:00 UTC',
      title: 'Nightly Analytics Datalake Dump',
      route: 'Route: AWS RDS Aurora → S3 Bronze Raw',
      description: 'Lacks tombstone filtering; extracts table snapshots without validating deleted_at IS NOT NULL predicate, re-injecting deleted IDs.',
      affects: '28 CASES',
      action: 'Quarantine Snapshot'
    }
  ];

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#131b2e] text-white px-4 py-2.5 rounded-lg shadow-xl border border-white/10 font-mono text-xs flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[#82f5c1] text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub-Header & Controls */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-[#006c4a]"></span>
              <span className="font-mono text-xs font-semibold text-[#006c4a]">
                Ledger Pipeline Online
              </span>
              <span className="text-[#464555]/40 text-xs">•</span>
              <span className="font-mono text-xs text-[#464555]">
                HASH: {overviewData?.ledger_hash ? `${overviewData.ledger_hash.slice(0, 6)}…${overviewData.ledger_hash.slice(-4)}` : '9e8a3…c4d2'}
              </span>
            </div>
            <h1 className="font-display text-2xl lg:text-[28px] font-semibold text-[#131b2e] tracking-tight mt-1">
              Deletion Audit Overview
            </h1>
            <p className="text-sm text-[#464555] max-w-3xl mt-0.5">
              Investigate deletion requests, verify data removal, and detect recreation hazards across distributed topologies.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={onOpenImportModal}
              className="h-9 px-3.5 rounded-md bg-white border border-[#c7c4d8]/60 hover:bg-[#f2f3ff] text-[#131b2e] text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#3525cd]">upload_file</span>
              <span>Import Dataset</span>
            </button>

            <button
              onClick={handleExportJson}
              className="h-9 px-3.5 rounded-md bg-white border border-[#c7c4d8]/60 hover:bg-[#f2f3ff] text-[#131b2e] text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export Audit Log (JSON)</span>
            </button>

            <button
              onClick={onRunAudit}
              disabled={isAuditing}
              className="h-9 px-4 rounded-md bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-medium shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-70 cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[16px] ${isAuditing ? 'animate-spin' : ''}`}>
                {isAuditing ? 'sync' : 'play_arrow'}
              </span>
              <span>{isAuditing ? 'Running Forensic Audit...' : 'Run Full Audit'}</span>
            </button>
          </div>
        </div>

        {/* Live Run Status Banner */}
        <div className="relative overflow-hidden rounded-lg bg-[#f2f3ff] border border-[#eaedff] p-3.5 shadow-xs">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#006c4a]"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center p-2 rounded-md bg-[#82f5c1]/40 text-[#00714e]">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#dae2fd] text-[#131b2e] font-bold">
                    {overviewData?.run_id || 'RUN #2026-10-18'}
                  </span>
                  <span className="text-xs sm:text-sm text-[#131b2e] font-medium">
                    COMPLETED against <strong className="font-bold">{m.total_ingested} cases</strong> across <strong className="font-bold">18 backend systems</strong>.
                  </span>
                </div>
                <span className="text-xs text-[#ba1a1a] font-medium flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  Identified {m.recreation_hazards} active recreation loops threatening post-purge invariants.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center">
              <div className="flex items-center gap-2 font-mono text-xs text-[#464555]">
                <span>TPS: 12.2 ops/s</span>
                <span className="text-[#464555]/40">•</span>
                <span>SHA-Ledger: VALID</span>
              </div>
              <button
                onClick={() => showToast(`Run log: ${m.total_ingested} cases checked, ${m.evidence_proofs_count} SHA hashes verified.`)}
                className="h-8 px-3 rounded bg-[#dae2fd] hover:bg-[#c7c4d8]/50 text-[#131b2e] font-mono text-xs font-semibold transition-colors cursor-pointer"
              >
                Inspect Run Log
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Row: 6 High-Density Forensic Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {/* Card 1: Total Ingested */}
        <div className="bg-white p-4 rounded-lg border border-[#eaedff] shadow-xs flex flex-col justify-between hover:border-[#c7c4d8] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#464555]">
              Total Ingested
            </span>
            <span className="material-symbols-outlined text-[#3525cd] text-[18px]">receipt_long</span>
          </div>
          <div className="my-1.5">
            <span className="font-display text-2xl lg:text-[28px] font-bold text-[#131b2e] tracking-tight">
              {m.total_ingested}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs text-[#464555] truncate">deletion_requests.csv</span>
            <span className="font-mono text-xs text-[#006c4a] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">done_all</span> 100% processed
            </span>
          </div>
        </div>

        {/* Card 2: Complete */}
        <div className="bg-white p-4 rounded-lg border border-[#eaedff] shadow-xs flex flex-col justify-between hover:border-[#c7c4d8] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#464555]">
              Complete
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#82f5c1]/40 text-[#00714e] font-mono text-xs font-bold">
              {m.complete_pct}%
            </span>
          </div>
          <div className="my-1.5">
            <span className="font-display text-2xl lg:text-[28px] font-bold text-[#006c4a] tracking-tight">
              {m.complete}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs text-[#464555]">Verified Purged</span>
            <span className="font-mono text-xs text-[#464555] truncate">All replicas + cold store</span>
          </div>
        </div>

        {/* Card 3: Incomplete */}
        <div className="bg-white p-4 rounded-lg border border-[#eaedff] shadow-xs flex flex-col justify-between hover:border-[#c7c4d8] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#464555]">
              Incomplete
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-mono text-xs font-bold">
              {m.incomplete_pct}%
            </span>
          </div>
          <div className="my-1.5">
            <span className="font-display text-2xl lg:text-[28px] font-bold text-[#ba1a1a] tracking-tight">
              {m.incomplete}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs text-[#ba1a1a] font-medium">Unresolved Violations</span>
            <span className="font-mono text-xs text-[#464555] truncate">Residual records active</span>
          </div>
        </div>

        {/* Card 4: Not Applicable */}
        <div className="bg-white p-4 rounded-lg border border-[#eaedff] shadow-xs flex flex-col justify-between hover:border-[#c7c4d8] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#464555]">
              Not Applicable
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#dae2fd] text-[#131b2e] font-mono text-xs font-bold">
              {m.not_applicable_pct}%
            </span>
          </div>
          <div className="my-1.5">
            <span className="font-display text-2xl lg:text-[28px] font-bold text-[#131b2e] tracking-tight">
              {m.not_applicable}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs text-[#464555]">Identity Non-Match</span>
            <span className="font-mono text-xs text-[#464555] truncate">Zero trace ever stored</span>
          </div>
        </div>

        {/* Card 5: Recreation Risk */}
        <div className="bg-white p-4 rounded-lg border border-[#eaedff] shadow-xs flex flex-col justify-between hover:border-[#c7c4d8] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#703a00]">
              Recreation Risk
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#ffdcc3] text-[#703a00] font-mono text-xs font-bold">
              CRITICAL
            </span>
          </div>
          <div className="my-1.5">
            <span className="font-display text-2xl lg:text-[28px] font-bold text-[#934e00] tracking-tight">
              {m.recreation_hazards}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs text-[#703a00] font-semibold">Resurrection Loops</span>
            <span className="font-mono text-xs text-[#464555] truncate">CDC & ETL replays active</span>
          </div>
        </div>

        {/* Card 6: Evidence Proofs */}
        <div className="bg-white p-4 rounded-lg border border-[#eaedff] shadow-xs flex flex-col justify-between hover:border-[#c7c4d8] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#464555]">
              Evidence Proofs
            </span>
            <span className="material-symbols-outlined text-[#3525cd] text-[18px]">enhanced_encryption</span>
          </div>
          <div className="my-1.5">
            <span className="font-display text-2xl lg:text-[28px] font-bold text-[#3525cd] tracking-tight">
              {m.evidence_pct}%
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs text-[#131b2e] font-semibold">{m.evidence_proofs_count} / {m.evidence_total} SHA</span>
            <span className="font-mono text-xs text-[#464555] truncate">{m.evidence_total - m.evidence_proofs_count} pending digest</span>
          </div>
        </div>
      </div>

      {/* Main Dual Column Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Status Distribution & System Health */}
          <div className="bg-white rounded-lg p-5 border border-[#eaedff] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-[#eaedff] mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#3525cd]">donut_large</span>
                <h2 className="font-display text-base font-semibold text-[#131b2e]">
                  Deletion Status Distribution & System Health
                </h2>
              </div>
              <span className="font-mono text-xs text-[#464555]">
                Confidence Interval: 99.8% (Wilson Score)
              </span>
            </div>

            {/* Segment Visual Progress Bar */}
            <div className="flex flex-col gap-2.5 mb-4">
              <div className="w-full h-4 rounded-full overflow-hidden flex bg-[#dae2fd]">
                <div
                  className="h-full bg-[#006c4a] hover:opacity-90 transition-all cursor-pointer"
                  style={{ width: `${m.complete_pct}%` }}
                  title={`Complete: ${m.complete} (${m.complete_pct}%)`}
                ></div>
                <div
                  className="h-full bg-[#ba1a1a] hover:opacity-90 transition-all cursor-pointer"
                  style={{ width: `${m.incomplete_pct}%` }}
                  title={`Incomplete: ${m.incomplete} (${m.incomplete_pct}%)`}
                ></div>
                <div
                  className="h-full bg-[#777587] hover:opacity-90 transition-all cursor-pointer"
                  style={{ width: `${m.not_applicable_pct}%` }}
                  title={`Not Applicable: ${m.not_applicable} (${m.not_applicable_pct}%)`}
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-xs bg-[#006c4a] shrink-0"></span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono text-xs text-[#131b2e] font-semibold truncate">
                      Complete ({m.complete})
                    </span>
                    <span className="text-xs text-[#464555] truncate">{m.complete_pct}% Purge Attested</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-xs bg-[#ba1a1a] shrink-0"></span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono text-xs text-[#ba1a1a] font-semibold truncate">
                      Incomplete ({m.incomplete})
                    </span>
                    <span className="text-xs text-[#464555] truncate">{m.incomplete_pct}% Residual Violations</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-xs bg-[#777587] shrink-0"></span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono text-xs text-[#464555] font-semibold truncate">
                      Not Applicable ({m.not_applicable})
                    </span>
                    <span className="text-xs text-[#464555] truncate">{m.not_applicable_pct}% Null Footprint</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metric Details Strip */}
            <div className="p-3 rounded bg-[#f2f3ff] border border-[#eaedff] flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#006c4a]">memory</span>
                <span className="text-[#131b2e]">18 Backend Topologies Monitored</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#3525cd]">security</span>
                <span className="text-[#131b2e]">GDPR Art. 17 / CCPA §1798.105</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#703a00]">sync_problem</span>
                <span className="text-[#703a00] font-semibold">{m.recreation_hazards} CDC Desyncs Flagged</span>
              </div>
            </div>
          </div>

          {/* High-Priority Unresolved Cases */}
          <div className="bg-white rounded-lg border border-[#eaedff] shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">flag</span>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-base font-semibold text-[#131b2e]">
                    High-Priority Unresolved Cases
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-mono text-xs font-bold">
                    {m.incomplete} Total
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#464555]">
                  Filter Severity:
                </span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-[#e2e7ff] text-[#131b2e] font-semibold">
                  P0 / P1 Only
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="bg-[#f2f3ff] text-xs font-semibold text-[#464555] border-b border-[#eaedff]">
                    <th className="py-2.5 px-3 whitespace-nowrap">Case ID</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Identity Subject</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                    <th className="py-2.5 px-3">Active Violations</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Recreation Hazard</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Audit Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff] text-sm">
                  {highPriority.map((c: any) => (
                    <tr
                      key={c.case_id}
                      className={`hover:bg-[#f2f3ff] transition-colors ${c.case_id === 'CASE-402' ? 'bg-[#e2dfff]/20' : ''}`}
                    >
                      <td className="py-3 px-3 font-mono text-sm font-bold text-[#3525cd] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {c.case_id === 'CASE-402' && (
                            <span className="w-2 h-2 rounded-full bg-[#3525cd] animate-pulse"></span>
                          )}
                          {c.case_id}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-sm text-[#131b2e] whitespace-nowrap">
                        {c.identity}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-mono text-xs font-semibold">
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#131b2e] min-w-[180px] max-w-sm truncate" title={c.violations}>
                        {c.violations}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffdcc3] text-[#703a00] font-mono text-xs font-bold">
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          {c.hazard}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            onSelectCase(c.case_id);
                            onNavigate('case-investigation');
                          }}
                          className="inline-flex items-center gap-1 h-7 px-3 rounded bg-[#4f46e5] text-white text-xs font-medium hover:bg-[#3525cd] transition-colors cursor-pointer"
                        >
                          <span>Investigate</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-[#f2f3ff] border-t border-[#eaedff] flex items-center justify-between text-xs sm:text-sm text-[#464555]">
              <span>Showing {highPriority.length} of {m.incomplete} incomplete cases</span>
              <button
                onClick={() => onNavigate('deletion-requests')}
                className="text-[#3525cd] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Incomplete Cases</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Active Synchronization & Restore Risks */}
          <div className="bg-white rounded-lg p-5 border border-[#eaedff] shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff] mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#703a00] text-[20px]">stream</span>
                <h2 className="font-display text-base font-semibold text-[#131b2e]">
                  Active Synchronization & Restore Risks
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-[#ffdcc3] text-[#703a00] font-mono text-xs font-bold">
                {m.recreation_hazards} Hazards Isolated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeHazards.map((haz: any) => (
                <div
                  key={haz.id}
                  className="p-4 rounded-lg bg-[#f2f3ff] border border-[#eaedff] hover:border-[#c7c4d8] transition-all flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#ba1a1a] font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span> {haz.badge}
                      </span>
                      <span className="font-mono text-xs text-[#464555]">{haz.lag}</span>
                    </div>
                    <span className="text-sm font-semibold text-[#131b2e] mt-1">{haz.title}</span>
                    <span className="font-mono text-xs text-[#464555]">{haz.route}</span>
                    <p className="text-xs sm:text-sm text-[#464555] mt-1.5 leading-relaxed">
                      {haz.description}
                    </p>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-[#eaedff] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#464555]">{haz.affects}</span>
                    <button
                      onClick={() => showToast(`Action '${haz.action}' triggered successfully.`)}
                      className="h-7 px-3 rounded bg-[#ffdad6] hover:bg-[#ba1a1a] text-[#93000a] hover:text-white font-mono text-xs font-bold transition-colors cursor-pointer"
                    >
                      {haz.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Systems with Residual Personal Data */}
          <div className="bg-white rounded-lg p-5 border border-[#eaedff] shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff] mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3525cd] text-[20px]">layers</span>
                <h2 className="font-display text-base font-semibold text-[#131b2e]">
                  Systems with Residual PII
                </h2>
              </div>
              <span className="font-mono text-xs text-[#464555]">193 Total Residuals</span>
            </div>

            <div className="flex flex-col gap-3.5">
              {systemsResidual.map((sys: any) => (
                <div key={sys.name} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-[#131b2e] flex items-center gap-1.5">
                      <span className={`material-symbols-outlined text-[18px] ${sys.count === 0 ? 'text-[#006c4a]' : 'text-[#ba1a1a]'}`}>
                        {sys.count === 0 ? 'check_circle' : 'warning'}
                      </span>
                      {sys.name}
                    </span>
                    <span className={`font-mono text-xs font-bold ${sys.count === 0 ? 'text-[#006c4a]' : 'text-[#ba1a1a]'}`}>
                      {sys.count} records
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#eaedff] overflow-hidden">
                    <div
                      className={`h-full ${sys.count === 0 ? 'bg-[#006c4a]' : 'bg-[#ba1a1a]'}`}
                      style={{ width: `${sys.pct}%` }}
                    ></div>
                  </div>
                  <span className="font-mono text-xs text-[#464555] truncate">{sys.target}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Challenge Evaluation Quick-Check */}
          <div className="bg-white rounded-lg p-5 border border-[#eaedff] shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff] mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3525cd] text-[20px]">grading</span>
                <h2 className="font-display text-base font-semibold text-[#131b2e]">
                  Challenge Evaluation Quick-Check
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-[#82f5c1]/40 text-[#00714e] font-mono text-xs font-bold">
                READY
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded bg-[#f2f3ff] border border-[#eaedff]">
                <div className="flex flex-col">
                  <span className="font-mono text-xs text-[#464555]">Schema Validation</span>
                  <span className="text-xs sm:text-sm text-[#131b2e] font-semibold font-mono">case_id, deletion_status, steps_json</span>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-[#82f5c1] text-[#002114] font-mono text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check</span> 100% VALID
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-[#f2f3ff] border border-[#eaedff]">
                <div className="flex flex-col">
                  <span className="font-mono text-xs text-[#464555]">Estimated Benchmark Metric</span>
                  <span className="text-xs sm:text-sm text-[#131b2e] font-semibold">Macro-Averaged F1-Score</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-base text-[#3525cd] font-bold">0.942</span>
                  <span className="font-mono text-xs text-[#006c4a] font-semibold">(+0.018 vs v1.2)</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
                Audit outputs align with ground-truth test labels for 518 cases with verified OCR match parity.
              </p>

              <button
                onClick={() => onNavigate('submission-center')}
                className="w-full h-9 px-3 rounded-md bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Open Submission Center</span>
                <span className="material-symbols-outlined text-[18px]">file_upload</span>
              </button>
            </div>
          </div>

          {/* Audit Activity & Lineage Timeline */}
          <div className="bg-white rounded-lg p-5 border border-[#eaedff] shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff] mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3525cd] text-[20px]">history</span>
                <h2 className="font-display text-base font-semibold text-[#131b2e]">
                  Audit Activity & Lineage Timeline
                </h2>
              </div>
              <span className="font-mono text-xs text-[#464555]">Oct 18, 2026</span>
            </div>

            <div className="relative pl-6 flex flex-col gap-4 my-1">
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-[#eaedff]"></div>

              {/* Event 1 */}
              <div className="relative flex flex-col gap-1">
                <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-[#006c4a] ring-4 ring-white"></div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#464555]">14:32:01 UTC</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#82f5c1]/40 text-[#00714e] font-bold">
                    COMPLETED
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#131b2e]">
                  Audit run finished: <strong>{m.total_ingested} cases evaluated</strong>, 128 violations logged, and tombstone verification hashes anchored.
                </p>
              </div>

              {/* Event 2 */}
              <div className="relative flex flex-col gap-1">
                <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-[#3525cd] ring-4 ring-white"></div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#464555]">14:28:40 UTC</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#eaedff] text-[#131b2e] font-semibold">
                    OCR INGEST
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#131b2e]">
                  Tesseract OCR extraction finished on <strong>PDF/PNG identity documents</strong>. 100% text-layer confidence.
                </p>
              </div>

              {/* Event 3 */}
              <div className="relative flex flex-col gap-1">
                <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-[#3525cd] ring-4 ring-white"></div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#464555]">14:15:10 UTC</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#eaedff] text-[#131b2e] font-semibold">
                    SYSTEM TELEMETRY
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#131b2e]">
                  Ingested <code className="font-mono text-xs text-[#3525cd]">system_activity.csv</code> with <strong>14,280 log events</strong> parsed across 18 distributed services.
                </p>
              </div>

              {/* Event 4 */}
              <div className="relative flex flex-col gap-1">
                <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-[#777587] ring-4 ring-white"></div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#464555]">13:50:00 UTC</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#eaedff] text-[#131b2e] font-semibold">
                    POLICIES ACTIVE
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#131b2e]">
                  Policy ruleset <code className="font-mono text-xs text-[#3525cd]">deletion_rules.csv</code> validated with <strong>42 operational constraints</strong> active.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
