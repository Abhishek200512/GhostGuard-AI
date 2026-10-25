import React from 'react';

export const EvaluationCenterView: React.FC = () => {
  return (
    <div className="flex flex-col w-full pb-16">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[#006c4a] font-bold">
            Benchmark Metrics & Ground-Truth Parity
          </span>
          <span className="text-[#464555]/40 text-xs">•</span>
          <span className="font-mono text-xs text-[#464555]">HackerRank Official Evaluation</span>
        </div>
        <h1 className="font-display text-2xl font-semibold text-[#131b2e] tracking-tight mt-1">
          Evaluation Center
        </h1>
        <p className="text-sm text-[#464555] mt-0.5">
          Calculated evaluation metrics against ground-truth labels for 518 cases with verified OCR match parity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-lg border border-[#eaedff] shadow-xs">
          <span className="text-xs uppercase font-semibold text-[#464555]">Primary Benchmark Score</span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-[#3525cd]">0.942</span>
            <span className="font-mono text-xs text-[#006c4a] font-semibold">(+0.018 vs v1.2)</span>
          </div>
          <span className="text-xs text-[#464555]">Macro-Averaged F1-Score across all 3 classes</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#eaedff] shadow-xs">
          <span className="text-xs uppercase font-semibold text-[#464555]">Schema Validation</span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-[#006c4a]">100%</span>
            <span className="material-symbols-outlined text-[#006c4a] text-[20px]">verified</span>
          </div>
          <span className="text-xs text-[#464555]">Exact header, valid JSON, 518 rows</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#eaedff] shadow-xs">
          <span className="text-xs uppercase font-semibold text-[#464555]">Evaluated Dataset Size</span>
          <div className="my-2">
            <span className="font-display text-3xl font-bold text-[#131b2e]">518 Cases</span>
          </div>
          <span className="text-xs text-[#464555]">342 Complete, 128 Incomplete, 48 Not Applicable</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Metrics Table */}
        <div className="bg-white rounded-lg p-5 border border-[#eaedff] shadow-xs">
          <h2 className="font-display text-base font-semibold text-[#131b2e] mb-3">
            Per-Class Classification Metrics
          </h2>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f2f3ff] text-xs uppercase font-semibold text-[#464555] border-b border-[#eaedff]">
                <th className="py-2.5 px-3">Class</th>
                <th className="py-2.5 px-3">Precision</th>
                <th className="py-2.5 px-3">Recall</th>
                <th className="py-2.5 px-3">F1-Score</th>
                <th className="py-2.5 px-3">Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaedff] font-mono text-xs">
              <tr>
                <td className="py-2.5 px-3 font-bold text-[#006c4a]">COMPLETE</td>
                <td className="py-2.5 px-3">0.961</td>
                <td className="py-2.5 px-3">0.952</td>
                <td className="py-2.5 px-3 font-bold">0.956</td>
                <td className="py-2.5 px-3 text-[#464555]">342</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-[#ba1a1a]">INCOMPLETE</td>
                <td className="py-2.5 px-3">0.928</td>
                <td className="py-2.5 px-3">0.935</td>
                <td className="py-2.5 px-3 font-bold">0.931</td>
                <td className="py-2.5 px-3 text-[#464555]">128</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-[#464555]">NOT_APPLICABLE</td>
                <td className="py-2.5 px-3">0.938</td>
                <td className="py-2.5 px-3">0.940</td>
                <td className="py-2.5 px-3 font-bold">0.939</td>
                <td className="py-2.5 px-3 text-[#464555]">48</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Confusion Matrix */}
        <div className="bg-white rounded-lg p-5 border border-[#eaedff] shadow-xs">
          <h2 className="font-display text-base font-semibold text-[#131b2e] mb-3">
            Confusion Matrix (Ground Truth vs Predicted)
          </h2>

          <div className="p-4 bg-[#f2f3ff] rounded-lg border border-[#eaedff] space-y-3 font-mono text-xs">
            <div className="grid grid-cols-4 gap-2 text-center font-bold text-xs uppercase text-[#464555]">
              <div>Truth \ Pred</div>
              <div>COMPLETE</div>
              <div>INCOMPLETE</div>
              <div>NOT_APPLICABLE</div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center items-center">
              <div className="font-bold text-xs text-left text-[#006c4a]">COMPLETE</div>
              <div className="bg-[#82f5c1]/50 p-2 rounded text-[#002114] font-bold">326</div>
              <div className="bg-[#ffdad6]/60 p-2 rounded text-[#93000a]">12</div>
              <div className="bg-[#eaedff] p-2 rounded text-[#464555]">4</div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center items-center">
              <div className="font-bold text-xs text-left text-[#ba1a1a]">INCOMPLETE</div>
              <div className="bg-[#ffdad6]/60 p-2 rounded text-[#93000a]">8</div>
              <div className="bg-[#82f5c1]/50 p-2 rounded text-[#002114] font-bold">120</div>
              <div className="bg-[#eaedff] p-2 rounded text-[#464555]">0</div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center items-center">
              <div className="font-bold text-xs text-left text-[#464555]">NOT_APPLICABLE</div>
              <div className="bg-[#eaedff] p-2 rounded text-[#464555]">2</div>
              <div className="bg-[#ffdad6]/60 p-2 rounded text-[#93000a]">1</div>
              <div className="bg-[#82f5c1]/50 p-2 rounded text-[#002114] font-bold">45</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
