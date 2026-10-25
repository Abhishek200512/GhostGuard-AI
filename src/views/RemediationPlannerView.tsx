import React, { useState } from 'react';
import { PageRoute } from '../types';

interface RemediationPlannerViewProps {
  onSelectCase: (caseId: string) => void;
  onNavigate: (route: PageRoute) => void;
}

export const RemediationPlannerView: React.FC<RemediationPlannerViewProps> = ({
  onSelectCase,
  onNavigate
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const batches = [
    {
      id: 'BATCH-V1',
      title: 'Vector 1: Halt Active Re-Injection Stream Workers (14 Cases)',
      action: 'HALT_CDC_PIPELINE',
      system: 'Kafka 3.4 (`cdc.users`)',
      status: 'CRITICAL P0',
      description: 'Pause uncompacted CDC stream workers before modifying search indexes to prevent immediate resurrection.',
      cases: ['CASE-402', 'CASE-104', 'CASE-012', 'CASE-088']
    },
    {
      id: 'BATCH-V2',
      title: 'Vector 2: Elasticsearch Cluster Document Purges (84 Records)',
      action: 'PURGE_INDEX_DOCUMENT',
      system: 'Elasticsearch v8.9',
      status: 'HIGH P1',
      description: 'Issue hard DELETE requests for unredacted documents in `customer-profiles-v2` and `customer_telemetry_2026_q3`.',
      cases: ['CASE-402', 'CASE-319', 'CASE-019', 'CASE-045']
    },
    {
      id: 'BATCH-V3',
      title: 'Vector 3: Redis Session Key Eviction (29 Keys)',
      action: 'EVICT_CACHE_KEY',
      system: 'Redis Cluster',
      status: 'HIGH P1',
      description: 'Evict persistent session tokens having TTL -1 from cluster node memory.',
      cases: ['CASE-402', 'CASE-055', 'CASE-112', 'CASE-199']
    },
    {
      id: 'BATCH-V4',
      title: 'Vector 4: Anchor Cryptographic Tombstone Hashes (128 Cases)',
      action: 'EXECUTE_TOMBSTONE_VERIFICATION',
      system: 'Audit Ledger',
      status: 'FINAL ATTESTATION',
      description: 'Assert cryptographic verification seals across all 18 backend topologies to achieve COMPLETE status.',
      cases: ['ALL 128 INCOMPLETE CASES']
    }
  ];

  return (
    <div className="flex flex-col w-full pb-16">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#131b2e] text-white px-4 py-2.5 rounded-lg shadow-xl border border-white/10 font-mono text-xs flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[#82f5c1] text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#3525cd] font-bold">
              Automated Remediation Sequencer
            </span>
            <span className="text-[#464555]/40 text-xs">•</span>
            <span className="font-mono text-xs text-[#464555]">Strict Dependency Order</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-[#131b2e] tracking-tight mt-1">
            Remediation Planner
          </h1>
          <p className="text-sm text-[#464555] mt-0.5">
            Execute ordered purge vectors to remediate 128 incomplete cases without triggering CDC resurrection loops.
          </p>
        </div>

        <button
          onClick={() => showToast('Batch remediation executed in Staging sandbox. 128 cases verified.')}
          className="h-9 px-4 rounded bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">play_arrow</span>
          <span>Execute All Sequential Batches</span>
        </button>
      </div>

      <div className="space-y-4">
        {batches.map((batch, idx) => (
          <div key={idx} className="bg-white rounded-lg p-5 border border-[#eaedff] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#3525cd]">{batch.id}</span>
                <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                  batch.status.includes('CRITICAL')
                    ? 'bg-[#ffdcc3] text-[#703a00]'
                    : (batch.status.includes('HIGH') ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#82f5c1]/30 text-[#00714e]')
                }`}>
                  {batch.status}
                </span>
                <span className="font-mono text-xs text-[#464555]">[{batch.action}]</span>
              </div>
              <h3 className="font-display text-base font-semibold text-[#131b2e] mt-1">{batch.title}</h3>
              <p className="text-sm text-[#464555] leading-relaxed">{batch.description}</p>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-xs font-semibold text-[#464555]">AFFECTED CASES:</span>
                {batch.cases.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (c.startsWith('CASE-')) {
                        onSelectCase(c);
                        onNavigate('case-investigation');
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-[#eaedff] hover:bg-[#dae2fd] text-[#3525cd] font-mono text-xs font-medium"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => showToast(`Executed ${batch.id} (${batch.action})`)}
                className="h-8 px-3 rounded bg-white border border-[#c7c4d8]/60 hover:bg-[#f2f3ff] text-xs font-medium text-[#131b2e] transition-colors cursor-pointer"
              >
                Run Step {idx + 1}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
