import React, { useState } from 'react';

export const SettingsView: React.FC = () => {
  const [cutoffDate, setCutoffDate] = useState('2026-10-14 23:59:59');
  const [ocrEngine, setOcrEngine] = useState('tesseract');
  const [confidenceThreshold, setConfidenceThreshold] = useState('95');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col w-full pb-16 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[#3525cd] font-bold">
            Platform Configuration
          </span>
          <span className="text-[#464555]/40 text-xs">•</span>
          <span className="font-mono text-xs text-[#464555]">Prod-Audit-Cluster-US</span>
        </div>
        <h1 className="font-display text-2xl font-semibold text-[#131b2e] tracking-tight mt-1">
          Settings & Forensics Parameters
        </h1>
        <p className="text-sm text-[#464555] mt-0.5">
          Configure audit cutoff timestamps, OCR text extraction models, and regulatory compliance presets.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-lg p-6 border border-[#eaedff] shadow-xs space-y-5 text-sm">
        {saved && (
          <div className="p-3 bg-[#82f5c1]/30 text-[#00714e] rounded-md font-mono text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Settings saved successfully and anchored to audit ledger.</span>
          </div>
        )}

        <div>
          <label className="text-xs uppercase font-semibold text-[#464555] block mb-1">
            Audit Cutoff Timestamp (UTC)
          </label>
          <input
            type="text"
            value={cutoffDate}
            onChange={(e) => setCutoffDate(e.target.value)}
            className="w-full max-w-md h-9 px-3 rounded bg-[#f2f3ff] border border-[#eaedff] font-mono text-sm text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
          />
          <span className="text-xs text-[#464555] block mt-1">
            Official challenge cutoff: Oct 14, 2026 23:59:59 UTC. Events after this are marked post-cutoff.
          </span>
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-[#464555] block mb-1">
            OCR Document Parsing Engine
          </label>
          <select
            value={ocrEngine}
            onChange={(e) => setOcrEngine(e.target.value)}
            className="w-full max-w-md h-9 px-3 rounded bg-[#f2f3ff] border border-[#eaedff] font-mono text-sm text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
          >
            <option value="tesseract">Tesseract OCR v5.4 (High Reliability - Windows Engine)</option>
            <option value="donut">Donut Transformer OCR (Deep Document Vision)</option>
            <option value="paddle">PaddleOCR (Multilingual Identity Passports)</option>
          </select>
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-[#464555] block mb-1">
            OCR Character Confidence Threshold (%)
          </label>
          <input
            type="number"
            min="50"
            max="100"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(e.target.value)}
            className="w-32 h-9 px-3 rounded bg-[#f2f3ff] border border-[#eaedff] font-mono text-sm text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
          />
        </div>

        <div className="pt-3 border-t border-[#eaedff]">
          <button
            type="submit"
            className="h-9 px-5 rounded bg-[#4f46e5] text-white text-sm font-semibold hover:bg-[#3525cd] transition-colors cursor-pointer"
          >
            Save Audit Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
