import React from 'react';

export const IdentityResolutionView: React.FC = () => {
  return (
    <div className="flex flex-col w-full pb-16">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[#3525cd] font-bold">
            Entity Disambiguation & Alias Graph
          </span>
          <span className="text-[#464555]/40 text-xs">•</span>
          <span className="font-mono text-xs text-[#464555]">Zero-False-Merge Protocol</span>
        </div>
        <h1 className="font-display text-2xl font-semibold text-[#131b2e] tracking-tight mt-1">
          Identity Resolution Engine
        </h1>
        <p className="text-sm text-[#464555] mt-0.5">
          Reconstructs a person's distributed identity from historical email addresses, Auth0 UUIDs, and legacy ERP keys without contaminating unrelated users.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg border border-[#eaedff] shadow-xs">
          <span className="text-xs uppercase font-semibold text-[#464555]">Resolved Identities</span>
          <div className="font-display text-2xl font-bold text-[#131b2e] my-1">518 Entities</div>
          <span className="text-xs text-[#006c4a] font-medium">100% Deterministic match</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#eaedff] shadow-xs">
          <span className="text-xs uppercase font-semibold text-[#464555]">Historical Aliases Tracked</span>
          <div className="font-display text-2xl font-bold text-[#3525cd] my-1">1,248 Aliases</div>
          <span className="text-xs text-[#464555]">Extracted from user_audit_log.csv</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#eaedff] shadow-xs">
          <span className="text-xs uppercase font-semibold text-[#464555]">Conflicting Matches Prevented</span>
          <div className="font-display text-2xl font-bold text-[#006c4a] my-1">48 Discarded</div>
          <span className="text-xs text-[#006c4a] font-medium">Non-match zero footprint preserved</span>
        </div>
      </div>

      {/* Visual Identity Graph Node representation for Case 402 */}
      <div className="bg-white rounded-xl p-5 border border-[#eaedff] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
          <h2 className="font-display text-base font-semibold text-[#131b2e]">
            Identity Cluster Map: Marcus Vance (CASE-402)
          </h2>
          <span className="px-2.5 py-0.5 rounded bg-[#82f5c1]/30 text-[#00714e] font-mono text-xs font-bold">
            CONFIRMED LINKAGE
          </span>
        </div>

        <div className="p-6 bg-[#f2f3ff] rounded-xl border border-[#eaedff] flex flex-col md:flex-row items-center justify-around gap-6">
          <div className="bg-white p-4 rounded-lg border-2 border-[#3525cd] shadow-sm text-center">
            <span className="font-mono text-xs font-bold text-[#3525cd]">ANCHOR IDENTITY</span>
            <div className="font-bold text-sm text-[#131b2e] mt-1">m.vance@solardyne.tech</div>
            <div className="font-mono text-xs text-[#464555]">CUST-99214</div>
          </div>

          <span className="material-symbols-outlined text-[24px] text-[#3525cd] rotate-90 md:rotate-0">
            arrow_forward
          </span>

          <div className="bg-white p-4 rounded-lg border border-[#eaedff] shadow-xs text-center">
            <span className="font-mono text-xs text-[#703a00] font-semibold">HISTORICAL ALIAS</span>
            <div className="text-sm text-[#131b2e] mt-1 font-mono">marcus.vance.old@gmail.com</div>
            <div className="font-mono text-xs text-[#464555]">Auth0 User ID Log</div>
          </div>

          <span className="material-symbols-outlined text-[24px] text-[#3525cd] rotate-90 md:rotate-0">
            arrow_forward
          </span>

          <div className="bg-white p-4 rounded-lg border border-[#eaedff] shadow-xs text-center">
            <span className="font-mono text-xs text-[#464555] font-semibold">LEGACY ERP RECORD</span>
            <div className="text-sm text-[#131b2e] mt-1 font-mono">US-8812</div>
            <div className="font-mono text-xs text-[#464555]">Billing SAP Dump</div>
          </div>
        </div>
      </div>
    </div>
  );
};
