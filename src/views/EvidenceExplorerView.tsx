import React, { useState } from 'react';

export const EvidenceExplorerView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFile, setActiveFile] = useState<string>('EV-0941');
  const [search, setSearch] = useState<string>('');

  const evidenceItems = [
    {
      id: 'EV-0941',
      system: 'Elasticsearch v8.9',
      category: 'search',
      file: 'customer-profiles-v2/doc_99214.json',
      sha256: '3b994fc812a01f782390a442e912891f7a0128910a39',
      snippet: `{\n  "_index": "customer-profiles-v2",\n  "_id": "doc_99214",\n  "_source": {\n    "account_id": "CUST-99214",\n    "full_name": "Marcus Vance",\n    "phone": "+1-555-019-2831",\n    "address": "404 Solar Way, Austin TX"\n  }\n}`,
      pii: ['full_name', 'phone', 'address'],
      is_violation: true
    },
    {
      id: 'EV-0112',
      system: 'Redis Cluster',
      category: 'cache',
      file: 'memory_dump/sess_usr_CUST_99214.rdb',
      sha256: '99214fa881b29a7f34c21e0992384a237f81ab92',
      snippet: `127.0.0.1:6379> HGETALL sess:usr:CUST-99214\n1) "user_email"\n2) "m.vance@solardyne.tech"\n3) "role"\n4) "enterprise_admin"\n5) "session_token"\n6) "auth0|648a1...f0"`,
      pii: ['user_email', 'session_token'],
      is_violation: true
    },
    {
      id: 'EV-0842',
      system: 'Kafka 3.4',
      category: 'stream',
      file: 'partitions/user-account-cdc_p4_o8840291.log',
      sha256: '8840291e9fca21748291a01fc82b471201aa8810',
      snippet: `Partition: 4 | Offset: 8840291\nTimestamp: 2026-10-13 04:00:22 UTC\nPayload: { "uid": "CUST-99214", "email": "m.vance@solardyne.tech" }`,
      pii: ['email', 'uid'],
      is_violation: true
    },
    {
      id: 'EV-0319',
      system: 'AWS S3 KYC Vault',
      category: 's3',
      file: 'kyc_vault/invoices/m_vance_drivers_license.pdf',
      sha256: 'd199201f88ba219a334812a8849102cae8841092',
      snippet: `[PDF OCR Text Extraction - Tesseract Engine v5.4]\nSTATE OF TEXAS DRIVER LICENSE\nDL: 99214-TX\nEXP: 2028-11-20\nMARCUS VANCE\nDOB: 1988-04-12\nADDR: 404 SOLAR WAY, AUSTIN TX`,
      pii: ['driver_license_id', 'dob', 'full_name', 'address'],
      is_violation: true
    },
    {
      id: 'EV-1040',
      system: 'PostgreSQL 15',
      category: 'sql',
      file: 'sql_snapshots/users_tombstone_20261012.sql',
      sha256: 'd8a9f00129a88310c884210a8819402a77382109',
      snippet: `-- PostgreSQL Vacuum & Tombstone Receipt\nUPDATE users SET deleted_at = '2026-10-12 11:20:00+00', email = 'TOMBSTONE_99214', password_hash = NULL WHERE id = 'usr_88291';\nVACUUM (FULL, ANALYZE) users;`,
      pii: [],
      is_violation: false
    }
  ];

  const filteredItems = evidenceItems.filter(e => {
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    if (search && !e.id.toLowerCase().includes(search.toLowerCase()) && !e.file.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeEvidence = evidenceItems.find(e => e.id === activeFile) || evidenceItems[0];

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-[#3525cd]">
              Cryptographic Proof Vault
            </span>
            <span className="text-[#464555]/40 text-xs">•</span>
            <span className="font-mono text-xs text-[#464555]">1,420 Evidence Records Ingested</span>
          </div>
          <h1 className="font-display text-2xl lg:text-[28px] font-semibold text-[#131b2e] tracking-tight mt-1">
            Evidence Explorer
          </h1>
          <p className="text-xs sm:text-sm text-[#464555] mt-0.5">
            Inspect raw forensic artifacts, SQL tombstone receipts, memory keys, Kafka offset streams, and OCR text extractions.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded-md bg-[#82f5c1]/30 text-[#00714e] font-semibold border border-[#82f5c1]">
            1,397 SHA-256 Hashes Anchored
          </span>
        </div>
      </div>

      {/* Explorer Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-[#eaedff] shadow-xs p-4 flex flex-col gap-3">
          {/* Search & Categories */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[16px] text-[#464555]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search evidence ID or file path..."
              className="w-full h-9 pl-8 pr-3 rounded bg-[#f2f3ff] border border-[#eaedff] text-xs sm:text-sm text-[#131b2e] placeholder:text-[#464555]/60 focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 text-xs">
            {['all', 'search', 'cache', 'stream', 's3', 'sql'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded uppercase font-mono font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#4f46e5] text-white shadow-xs'
                    : 'bg-[#eaedff] text-[#464555] hover:bg-[#dae2fd]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* List items */}
          <div className="space-y-2 mt-1 max-h-[550px] overflow-y-auto pr-1">
            {filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => setActiveFile(item.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  activeFile === item.id
                    ? 'bg-[#e2dfff]/20 border-[#3525cd] shadow-xs'
                    : 'bg-[#f2f3ff] border-[#eaedff] hover:border-[#c7c4d8]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-[#3525cd]">{item.id}</span>
                  <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                    item.is_violation ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#82f5c1] text-[#002114]'
                  }`}>
                    {item.is_violation ? 'PII DETECTED' : 'TOMBSTONE PROOF'}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-medium text-[#131b2e] truncate">{item.system}</div>
                <div className="font-mono text-xs text-[#464555] truncate mt-0.5">{item.file}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Inspector (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-[#eaedff] shadow-xs p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-[#3525cd]">{activeEvidence.id}</span>
                <span className="px-2.5 py-0.5 rounded bg-[#f2f3ff] text-[#131b2e] font-mono text-xs border border-[#eaedff]">
                  {activeEvidence.system}
                </span>
              </div>
              <span className="font-mono text-xs text-[#464555] block mt-1">{activeEvidence.file}</span>
            </div>

            <div className="text-right">
              <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${
                activeEvidence.is_violation ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#82f5c1] text-[#002114]'
              }`}>
                {activeEvidence.is_violation ? 'LEGAL VIOLATION' : 'CRYPTOGRAPHIC ATTESTATION'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#464555] block mb-1.5">
              Extracted Payload Content
            </span>
            <pre className="bg-[#283044] text-[#eef0ff] p-3.5 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-white/10 max-h-72 select-text">
              {activeEvidence.snippet}
            </pre>
          </div>

          <div className="p-3.5 bg-[#f2f3ff] rounded-lg border border-[#eaedff] space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#464555]">Detected PII Attributes:</span>
              <div className="flex gap-1.5">
                {activeEvidence.pii.length > 0 ? (
                  activeEvidence.pii.map((p, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#93000a] font-mono text-xs font-semibold">
                      {p}
                    </span>
                  ))
                ) : (
                  <span className="text-[#006c4a] font-semibold text-xs">None (Zero Residual PII)</span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-[#eaedff] flex items-center justify-between font-mono text-xs">
              <span className="text-[#464555]">SHA-256 Hash Digest:</span>
              <span className="text-[#131b2e] font-semibold">{activeEvidence.sha256}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
