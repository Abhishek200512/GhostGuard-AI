import React, { useState, useEffect } from 'react';
import { CaseSummary, PageRoute } from '../types';

interface DeletionRequestsViewProps {
  onSelectCase: (caseId: string) => void;
  onNavigate: (route: PageRoute) => void;
}

export const DeletionRequestsView: React.FC<DeletionRequestsViewProps> = ({
  onSelectCase,
  onNavigate
}) => {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCases, setTotalCases] = useState<number>(518);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams({
      page: String(page),
      limit: '20',
      search,
      status: statusFilter
    });

    fetch(`/api/requests?${query.toString()}`)
      .then(res => res.json())
      .then(data => {
        setCases(data.cases || []);
        setTotalPages(data.totalPages || 1);
        setTotalCases(data.total || 0);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [page, search, statusFilter]);

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#3525cd] font-bold">
              Dataset Ingestion Manifest
            </span>
            <span className="text-[#464555]/40 text-xs">•</span>
            <span className="font-mono text-xs text-[#464555]">deletion_requests.csv</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-[#131b2e] tracking-tight mt-1">
            Deletion Requests ({totalCases} Total)
          </h1>
          <p className="text-sm text-[#464555] mt-0.5">
            Audit status across all ingested customer deletion requests under GDPR Art. 17 and CCPA §1798.105.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onSelectCase('CASE-402');
              onNavigate('case-investigation');
            }}
            className="h-8 px-3 rounded-md bg-[#eaedff] text-[#3525cd] hover:bg-[#dae2fd] text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>Jump to Active CASE-402</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-[#eaedff] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-[#464555]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search Case ID (e.g. CASE-402), email, or violations..."
            className="w-full h-8 pl-8 pr-3 rounded bg-[#f2f3ff] border border-[#eaedff] text-xs text-[#131b2e] placeholder:text-[#464555]/60 focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#f2f3ff] p-1 rounded-md border border-[#eaedff] text-xs">
          {['ALL', 'COMPLETE', 'INCOMPLETE', 'NOT_APPLICABLE'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                statusFilter === st
                  ? 'bg-white text-[#3525cd] font-bold shadow-xs'
                  : 'text-[#464555] hover:text-[#131b2e]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg border border-[#eaedff] shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[960px] text-left border-collapse">
            <thead>
              <tr className="bg-[#f2f3ff] text-xs font-semibold text-[#464555] uppercase border-b border-[#eaedff]">
                <th className="py-3 px-3.5 whitespace-nowrap">Case ID</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Identity Subject</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Audit Status</th>
                <th className="py-3 px-3.5">Violations Summary</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Recreation Risk</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Severity</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaedff] text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#464555] font-mono text-sm">
                    <span className="material-symbols-outlined text-[24px] text-[#3525cd] animate-spin block mb-1">
                      refresh
                    </span>
                    Loading deletion requests...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#464555] text-sm">
                    No deletion requests match the filter criteria.
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr
                    key={c.case_id}
                    className={`hover:bg-[#f2f3ff] transition-colors ${
                      c.case_id === 'CASE-402' ? 'bg-[#e2dfff]/20 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-3.5 font-mono text-sm font-bold text-[#3525cd] whitespace-nowrap">
                      {c.case_id}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-sm text-[#131b2e] whitespace-nowrap">
                      {c.email}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${
                          c.status === 'COMPLETE'
                            ? 'bg-[#82f5c1]/40 text-[#00714e]'
                            : (c.status === 'INCOMPLETE'
                              ? 'bg-[#ffdad6] text-[#93000a]'
                              : 'bg-[#dae2fd] text-[#131b2e]')
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-[#131b2e] min-w-[220px] max-w-md truncate" title={c.violations}>
                      {c.violations}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {c.hazard !== 'None Detected' && c.hazard !== 'None' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffdcc3] text-[#703a00] font-mono text-xs font-bold">
                          <span className="material-symbols-outlined text-[13px]">warning</span>
                          {c.hazard}
                        </span>
                      ) : (
                        <span className="text-[#464555] font-mono text-xs">None Detected</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-sm whitespace-nowrap">
                      <span className={c.severity.includes('P0') || c.severity.includes('P1') ? 'text-[#ba1a1a] font-bold' : 'text-[#464555]'}>
                        {c.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          onSelectCase(c.case_id);
                          onNavigate('case-investigation');
                        }}
                        className="inline-flex items-center gap-1 h-8 px-3 rounded bg-[#4f46e5] text-white text-xs font-medium hover:bg-[#3525cd] transition-colors cursor-pointer"
                      >
                        <span>Investigate</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-[#f2f3ff] border-t border-[#eaedff] flex items-center justify-between text-xs text-[#464555]">
          <span>
            Page <strong className="text-[#131b2e]">{page}</strong> of <strong className="text-[#131b2e]">{totalPages}</strong> ({totalCases} cases)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="h-7 px-2.5 rounded bg-white border border-[#c7c4d8]/60 text-xs font-medium disabled:opacity-50 hover:bg-[#eaedff] transition-colors cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="h-7 px-2.5 rounded bg-white border border-[#c7c4d8]/60 text-xs font-medium disabled:opacity-50 hover:bg-[#eaedff] transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
