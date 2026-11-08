import React, { useState, useEffect } from "react";
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  ShieldAlert,
  Layers,
  FileCheck,
} from "lucide-react";
import { api } from "../services/api.js";
import { EvaluationReport, VerdictType } from "../types/index.js";

export const EvaluationPage: React.FC = () => {
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvaluation();
  }, []);

  const loadEvaluation = async () => {
    try {
      setLoading(true);
      const data = await api.getLatestEvaluation();
      setReport(data);
    } catch (err) {
      console.error("Failed to load evaluation report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunEvaluation = async () => {
    try {
      setLoading(true);
      const newReport = await api.runEvaluation();
      setReport(newReport);
    } catch (err) {
      console.error("Failed to run evaluation:", err);
    } finally {
      setLoading(false);
    }
  };

  const verdictClasses: VerdictType[] = [
    "TRUE",
    "FALSE",
    "MOSTLY TRUE",
    "PARTLY TRUE",
    "MISLEADING",
    "OUT OF CONTEXT",
    "UNVERIFIED",
    "INSUFFICIENT EVIDENCE",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Evaluation Center</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              Scientific Benchmark
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Empirical scientific testing suite evaluating LinkCheck AI fact-checking accuracy, citation
            coverage, confusion matrices, and abstention behavior on labeled emergency claims.
          </p>
        </div>

        <button
          onClick={handleRunEvaluation}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 disabled:opacity-50 transition cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Running Benchmark Pipeline...</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>Execute Full Benchmark Suite</span>
            </>
          )}
        </button>
      </div>

      {report && (
        <div className="space-y-6">
          {/* Key Metric Scorecards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Classification Accuracy</span>
              <p className="text-2xl font-bold text-cyan-400 mt-1 font-mono">
                {Math.round(report.accuracy * 100)}%
              </p>
              <span className="text-[10px] text-slate-500 font-mono">
                {report.totalClaims} Ground Truth Claims
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Macro F1 Score</span>
              <p className="text-2xl font-bold text-purple-400 mt-1 font-mono">
                {report.macroF1.toFixed(3)}
              </p>
              <span className="text-[10px] text-slate-500 font-mono">Balanced Harmonic Mean</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Macro Precision</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                {report.macroPrecision.toFixed(3)}
              </p>
              <span className="text-[10px] text-slate-500 font-mono">Positive Predictive Value</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Macro Recall</span>
              <p className="text-2xl font-bold text-blue-400 mt-1 font-mono">
                {report.macroRecall.toFixed(3)}
              </p>
              <span className="text-[10px] text-slate-500 font-mono">True Positive Coverage</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Citation Coverage</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                {Math.round(report.citationCoverage * 100)}%
              </p>
              <span className="text-[10px] text-slate-500 font-mono">Authoritative Source Backed</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Unsupported Verdicts</span>
              <p className="text-2xl font-bold text-amber-400 mt-1 font-mono">
                {Math.round(report.unsupportedRate * 100)}%
              </p>
              <span className="text-[10px] text-slate-500 font-mono">Hallucination Safeguard</span>
            </div>
          </div>

          {/* Confusion Matrix Arena */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>Verdict Confusion Matrix (Ground Truth vs Model Prediction)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rows represent actual labeled ground truth; columns represent predicted verdicts.
                </p>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Diagonal = Correct Classifications
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border border-slate-800">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-[10px]">
                    <th className="p-2 border border-slate-800 text-left">Actual \ Pred</th>
                    {verdictClasses.map((vc) => (
                      <th key={vc} className="p-2 border border-slate-800 truncate max-w-[90px]">
                        {vc}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {verdictClasses.map((actual) => (
                    <tr key={actual} className="hover:bg-slate-850">
                      <td className="p-2 border border-slate-800 text-left font-semibold text-slate-300 text-[11px]">
                        {actual}
                      </td>
                      {verdictClasses.map((pred) => {
                        const count = report.confusionMatrix[actual]?.[pred] || 0;
                        const isDiagonal = actual === pred;
                        return (
                          <td
                            key={`${actual}_${pred}`}
                            className={`p-2 border border-slate-800 font-mono text-xs ${
                              count > 0 && isDiagonal
                                ? "bg-emerald-950/60 text-emerald-300 font-bold"
                                : count > 0 && !isDiagonal
                                ? "bg-red-950/60 text-red-300 font-bold"
                                : "text-slate-600"
                            }`}
                          >
                            {count}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Labeled Benchmark Claims Dataset Breakdown */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-purple-400" />
              <span>Benchmark Dataset Test Cases ({report.items.length})</span>
            </h3>

            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Domain</th>
                    <th className="p-2.5">Claim Statement</th>
                    <th className="p-2.5">Ground Truth</th>
                    <th className="p-2.5">Model Predicted</th>
                    <th className="p-2.5">Citation Authority</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {report.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-850">
                      <td className="p-2.5 text-cyan-300 font-medium whitespace-nowrap">
                        {item.domain}
                      </td>
                      <td className="p-2.5 max-w-sm truncate text-white">{item.claim}</td>
                      <td className="p-2.5 font-bold font-mono text-[11px]">
                        {item.groundTruthVerdict}
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-300">
                        {item.predictedVerdict}
                      </td>
                      <td className="p-2.5 text-slate-400 truncate max-w-[200px]">
                        {item.referenceSource}
                      </td>
                      <td className="p-2.5 text-center">
                        {item.isCorrect ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            MATCH
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            DISCREPANCY
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
