import React, { useState, useEffect } from 'react';
import { PageRoute } from '../types';

interface HeaderProps {
  currentRoute: PageRoute;
  activeCaseId: string;
  onSearchChange?: (val: string) => void;
  searchValue?: string;
  onSelectCase?: (caseId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  activeCaseId,
  onSearchChange,
  searchValue = '',
  onSelectCase
}) => {
  const [platformMode, setPlatformMode] = useState<string>('CANONICAL AUDIT DATASET — 518 CASES ACTIVE');
  const [isProductionMode, setIsProductionMode] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.mode && data.mode.includes('CANONICAL')) {
          setPlatformMode('CANONICAL AUDIT DATASET — 518 CASES ACTIVE');
          setIsProductionMode(true);
        } else if (data.mode && data.mode.includes('DEMO')) {
          setPlatformMode(data.mode);
          setIsProductionMode(false);
        }
      })
      .catch(() => {
        setPlatformMode('OFFLINE FALLBACK MODE');
        setIsProductionMode(false);
      });
  }, []);

  const getBreadcrumb = () => {
    switch (currentRoute) {
      case 'overview':
        return (
          <>
            <span className="text-[#131b2e] font-medium">Audit</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#464555]">Overview Dashboard</span>
          </>
        );
      case 'case-investigation':
        return (
          <>
            <span className="text-[#131b2e] font-medium">Audit</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#464555]">Deletion Requests</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-mono text-[#3525cd] font-semibold">{activeCaseId}</span>
          </>
        );
      case 'deletion-requests':
        return (
          <>
            <span className="text-[#131b2e] font-medium">Audit</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#464555]">Deletion Requests (518 Ingested)</span>
          </>
        );
      case 'submission-center':
        return (
          <>
            <span className="text-[#131b2e] font-medium">Audit</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#464555]">HackerRank Challenge Submission</span>
          </>
        );
      default:
        const title = currentRoute.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        return (
          <>
            <span className="text-[#131b2e] font-medium">Audit</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#464555]">{title}</span>
          </>
        );
    }
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-[#faf8ff]/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#eaedff] z-40 px-6 flex items-center justify-between gap-4">
      {/* Left: Breadcrumbs & Platform Dataset Mode Tag */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#464555] truncate">
          {getBreadcrumb()}
        </div>

        <div className={`hidden xl:flex items-center gap-1.5 px-2.5 py-0.5 rounded font-mono text-xs font-semibold border ${
          isProductionMode
            ? 'bg-[#82f5c1]/30 text-[#006c4a] border-[#006c4a]/20'
            : 'bg-[#ffdcc3] text-[#703a00] border-[#ffb77d]/30'
        }`}>
          <span className="material-symbols-outlined text-[14px]">
            {isProductionMode ? 'verified' : 'info'}
          </span>
          <span>{platformMode}</span>
        </div>
      </div>

      {/* Right: Search, Engine Pill, Notifications, User */}
      <div className="flex items-center gap-3.5">
        {/* Search */}
        <div className="relative hidden lg:flex items-center">
          <span className="material-symbols-outlined absolute left-2.5 text-[16px] text-[#464555]">
            search
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchValue.trim().toUpperCase().startsWith('CASE-')) {
                onSelectCase?.(searchValue.trim().toUpperCase());
              }
            }}
            placeholder="Search Case ID, SHA-256, customer email..."
            className="w-72 h-8 pl-8 pr-14 rounded-md bg-white border border-[#eaedff] text-xs text-[#131b2e] placeholder:text-[#464555]/60 focus:outline-none focus:ring-1 focus:ring-[#3525cd] shadow-xs"
          />
          <kbd className="absolute right-1.5 px-1.5 py-0.5 rounded bg-[#eaedff] font-mono text-xs text-[#464555] font-medium border border-[#c7c4d8]/40">
            Enter
          </kbd>
        </div>

        {/* Engine Ready Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#82f5c1]/30 text-[#00714e] font-mono text-xs font-medium border border-[#82f5c1]">
          <span className="w-2 h-2 rounded-full bg-[#006c4a]"></span>
          <span>Engine: Ready (Cutoff: Oct 14, 2026)</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#eaedff]">
          <div className="hidden sm:flex flex-col text-right">
            <span className="font-display text-xs sm:text-sm text-[#131b2e] font-semibold leading-tight">
              Dr. Elena Rostova
            </span>
            <span className="font-mono text-xs text-[#464555]">
              Privacy Engineering Lead
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#3525cd] flex items-center justify-center shadow-xs text-white">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};
