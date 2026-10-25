import React from 'react';
import { PageRoute } from '../types';

interface SidebarProps {
  currentRoute: PageRoute;
  onRouteChange: (route: PageRoute) => void;
  activeCaseId: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onRouteChange,
  activeCaseId
}) => {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#283044] text-[#eef0ff] z-50 flex flex-col justify-between select-none border-r border-[#334155]/40 shadow-xl">
      <div className="flex flex-col min-h-0">
        {/* Brand Lockup */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#4f46e5] flex items-center justify-center text-white shadow-sm font-bold text-lg">
                <span className="material-symbols-outlined text-[20px]">shield_lock</span>
              </div>
              <span className="font-display text-[17px] font-semibold tracking-tight text-[#eef0ff]">
                GhostGuard AI
              </span>
            </div>
            <button
              className="flex items-center justify-center w-7 h-7 rounded hover:bg-white/10 text-[#eef0ff]/70 hover:text-white transition-colors"
              title="Collapse Rail"
            >
              <span className="material-symbols-outlined text-[18px]">first_page</span>
            </button>
          </div>

          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#85f8c4] text-[#002114] font-mono text-xs tracking-wide font-bold">
              DEMO MODE (Oct 2026 Challenge)
            </span>
          </div>
        </div>

        {/* Workspace Selector */}
        <div className="px-3 py-2 mx-3 mb-2 rounded bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 cursor-pointer transition-colors">
          <div className="flex flex-col truncate pr-2">
            <span className="text-xs uppercase font-semibold text-[#eef0ff]/60 tracking-wider">
              Workspace
            </span>
            <span className="font-mono text-xs text-[#eef0ff] font-medium truncate">
              Prod-Audit-Cluster-US / GDPR-CCPA 2026
            </span>
          </div>
          <span className="material-symbols-outlined text-[#eef0ff]/60 text-[16px]">unfold_more</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 overflow-y-auto space-y-1 py-1">
          {/* 1. Overview */}
          <button
            onClick={() => onRouteChange('overview')}
            className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-sm font-medium transition-colors ${
              currentRoute === 'overview'
                ? 'bg-[#4f46e5] text-white shadow-sm'
                : 'text-[#eef0ff]/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              <span>Overview</span>
            </div>
          </button>

          {/* 2. Deletion Requests */}
          <button
            onClick={() => onRouteChange('deletion-requests')}
            className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-sm font-medium transition-colors ${
              currentRoute === 'deletion-requests'
                ? 'bg-[#4f46e5] text-white shadow-sm'
                : 'text-[#eef0ff]/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              <span>Deletion Requests</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#4f46e5] text-white font-mono text-xs font-bold">
              518
            </span>
          </button>

          {/* 3. Case Investigation */}
          <button
            onClick={() => onRouteChange('case-investigation')}
            className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-sm font-medium transition-colors ${
              currentRoute === 'case-investigation'
                ? 'bg-[#4f46e5] text-white shadow-sm'
                : 'text-[#eef0ff]/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">find_in_page</span>
              <span>Case Investigation</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#ffdcc3] text-[#703a00] font-mono text-xs font-bold">
              Active: {activeCaseId}
            </span>
          </button>

          {/* Evidence Intelligence (OCR) */}
          <button
            onClick={() => onRouteChange('evidence-intelligence')}
            className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-sm font-medium transition-colors ${
              currentRoute === 'evidence-intelligence'
                ? 'bg-[#4f46e5] text-white shadow-sm'
                : 'text-[#eef0ff]/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">document_scanner</span>
              <span>Evidence Intelligence</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#82f5c1]/30 text-[#82f5c1] font-mono text-xs font-bold">
              OCR Engine
            </span>
          </button>

          {/* 4. Evidence Explorer */}
          <button
            onClick={() => onRouteChange('evidence-explorer')}
            className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-sm font-medium transition-colors ${
              currentRoute === 'evidence-explorer'
                ? 'bg-[#4f46e5] text-white shadow-sm'
                : 'text-[#eef0ff]/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">folder_zip</span>
              <span>Evidence Explorer</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[#eef0ff] font-mono text-xs">
              1,420 files
            </span>
          </button>

          {/* 5. Identity Resolution */}
          <button
            onClick={() => onRouteChange('identity-resolution')}
            className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-sm font-medium transition-colors ${
              currentRoute === 'identity-resolution'
                ? 'bg-[#4f46e5] text-white shadow-sm'
                : 'text-[#eef0ff]/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">hub</span>
              <span>Identity Resolution</span>
            </div>
          </button>

          {/* 6. System Activity & Lineage */}
          <button
            onClick={() => onRouteChange('system-activity-lineage')}
            className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-sm font-medium transition-colors ${
              currentRoute === 'system-activity-lineage'
                ? 'bg-[#4f46e5] text-white shadow-sm'
                : 'text-[#eef0ff]/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">account_tree</span>
              <span>System Activity & Lineage</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-mono text-xs font-bold">
              14
            </span>
          </button>

          {/* 7. Policy Rules */}
          <button
            onClick={() => onRouteChange('policy-rules')}
            className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-sm font-medium transition-colors ${
              currentRoute === 'policy-rules'
                ? 'bg-[#4f46e5] text-white shadow-sm'
                : 'text-[#eef0ff]/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">rule</span>
              <span>Policy Rules</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[#eef0ff] font-mono text-xs">
              42
            </span>
          </button>

          {/* 8. Remediation Planner */}
          <button
            onClick={() => onRouteChange('remediation-planner')}
            className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-sm font-medium transition-colors ${
              currentRoute === 'remediation-planner'
                ? 'bg-[#4f46e5] text-white shadow-sm'
                : 'text-[#eef0ff]/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
              <span>Remediation Planner</span>
            </div>
          </button>

          {/* 9. Evaluation Center */}
          <button
            onClick={() => onRouteChange('evaluation-center')}
            className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-sm font-medium transition-colors ${
              currentRoute === 'evaluation-center'
                ? 'bg-[#4f46e5] text-white shadow-sm'
                : 'text-[#eef0ff]/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">analytics</span>
              <span>Evaluation Center</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] font-mono text-xs font-bold">
              94.2%
            </span>
          </button>

          {/* 10. Submission Center */}
          <button
            onClick={() => onRouteChange('submission-center')}
            className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-sm font-medium transition-colors ${
              currentRoute === 'submission-center'
                ? 'bg-[#4f46e5] text-white shadow-sm'
                : 'text-[#eef0ff]/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              <span>Submission Center</span>
            </div>
          </button>

          {/* 11. Settings */}
          <button
            onClick={() => onRouteChange('settings')}
            className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-sm font-medium transition-colors ${
              currentRoute === 'settings'
                ? 'bg-[#4f46e5] text-white shadow-sm'
                : 'text-[#eef0ff]/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">settings</span>
              <span>Settings</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Bottom Ledger Sync Anchor */}
      <div className="p-3 mx-3 my-3 rounded bg-white/5 border border-white/5">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#85f8c4] text-[20px]">
            verified_user
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#eef0ff]">
              Audit Pipeline Live
            </span>
            <span className="font-mono text-xs text-[#eef0ff]/70">
              SHA-256 Ledger Synced
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
