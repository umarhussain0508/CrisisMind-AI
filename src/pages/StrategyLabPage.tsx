import React, { useState, useEffect } from "react";
import {
  Sliders,
  Sparkles,
  BarChart3,
  TrendingDown,
  Shield,
  Layers,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  Info,
  ArrowRight,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { api } from "../services/api.js";
import {
  InterventionConfig,
  InterventionType,
  SimulationConfig,
  StrategyExperiment,
} from "../types/index.js";

const INTERVENTION_REGISTRY: {
  type: InterventionType;
  name: string;
  defaultIntensity: number;
  defaultCoverage: number;
  costScore: number; // 1 to 5 complexity
  description: string;
}[] = [
  {
    type: "official_announcement",
    name: "Official Emergency Broadcast Notice",
    defaultIntensity: 0.85,
    defaultCoverage: 0.8,
    costScore: 3,
    description: "High-priority direct emergency SMS with live webcam and authority links.",
  },
  {
    type: "trusted_messenger",
    name: "Trusted Community Leaders & Doctors",
    defaultIntensity: 0.9,
    defaultCoverage: 0.65,
    costScore: 4,
    description: "Mobilize verified neighborhood liaisons and health professionals in district groups.",
  },
  {
    type: "share_warning_prompt",
    name: "Critical Thinking Friction Prompt",
    defaultIntensity: 0.7,
    defaultCoverage: 0.9,
    costScore: 2,
    description: "A mandatory 'Pause & Reflect: Has this been confirmed?' dialog before resharing.",
  },
  {
    type: "fact_check_notification",
    name: "Automated Fact-Check Badge & Alert",
    defaultIntensity: 0.8,
    defaultCoverage: 0.85,
    costScore: 2,
    description: "Real-time LinkCheck verdict badge injected onto rumor posts.",
  },
  {
    type: "reshare_delay",
    name: "Emergency Rate Limiting & Cooldown",
    defaultIntensity: 0.75,
    defaultCoverage: 0.95,
    costScore: 3,
    description: "A 3-minute cooling delay on viral forward cascades during active crisis.",
  },
  {
    type: "credibility_label",
    name: "Source Verification Labeling",
    defaultIntensity: 0.65,
    defaultCoverage: 0.75,
    costScore: 2,
    description: "Clear markers distinguishing unverified accounts from civil protection units.",
  },
  {
    type: "community_correction",
    name: "Crowdsourced Debunk Campaign",
    defaultIntensity: 0.7,
    defaultCoverage: 0.6,
    costScore: 3,
    description: "Empower verified citizen volunteers with fact-check kits.",
  },
  {
    type: "expert_broadcast",
    name: "Scientific Authority Clarification",
    defaultIntensity: 0.85,
    defaultCoverage: 0.7,
    costScore: 3,
    description: "Geophysicists or meteorologists live clarification video.",
  },
  {
    type: "info_literacy_nudge",
    name: "Disaster Information Literacy Tip",
    defaultIntensity: 0.5,
    defaultCoverage: 0.8,
    costScore: 1,
    description: "Brief visual guide explaining how emergency hoaxes exploit fear.",
  },
  {
    type: "multi_source_prompt",
    name: "Triangulation Requirement Prompt",
    defaultIntensity: 0.8,
    defaultCoverage: 0.85,
    costScore: 3,
    description: "Encourages users to verify against at least two independent agencies.",
  },
];

export const StrategyLabPage: React.FC = () => {
  const [selectedInterventions, setSelectedInterventions] = useState<InterventionType[]>([
    "official_announcement",
    "trusted_messenger",
    "share_warning_prompt",
  ]);
  const [numTrials, setNumTrials] = useState(5);
  const [loading, setLoading] = useState(false);
  const [experiment, setExperiment] = useState<StrategyExperiment | null>(null);
  const [experimentHistory, setExperimentHistory] = useState<StrategyExperiment[]>([]);

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    try {
      const exps = await api.getExperiments();
      setExperimentHistory(exps);
      if (exps.length > 0) {
        setExperiment(exps[0]);
      } else {
        // Run initial comparison automatically
        runComparison();
      }
    } catch (err) {
      console.error("Failed to load experiments:", err);
    }
  };

  const toggleIntervention = (type: InterventionType) => {
    if (selectedInterventions.includes(type)) {
      if (selectedInterventions.length > 1) {
        setSelectedInterventions(selectedInterventions.filter((t) => t !== type));
      }
    } else {
      if (selectedInterventions.length < 5) {
        setSelectedInterventions([...selectedInterventions, type]);
      }
    }
  };

  const runComparison = async () => {
    try {
      setLoading(true);
      const baseConfig: SimulationConfig = {
        id: "sim_strategy_base",
        name: "Standard Metropolitan Emergency Scenario",
        crisisType: "flood",
        description: "Comparative intervention benchmarking under simulated high-stress crisis.",
        misinformationMessage: "Severe infrastructure failure warning circulating on local networks.",
        populationSize: 100,
        numGroups: 4,
        socialDensity: 0.08,
        initialMisinfoPrevalence: 0.06,
        mediaInfluence: 0.25,
        officialSpeed: 3,
        seed: 42,
        interventions: [],
      };

      const candidateInterventions: InterventionConfig[] = selectedInterventions.map((type) => {
        const item = INTERVENTION_REGISTRY.find((i) => i.type === type)!;
        return {
          id: `int_${type}`,
          type,
          name: item.name,
          enabled: true,
          activationStep: 3,
          intensity: item.defaultIntensity,
          coverage: item.defaultCoverage,
          description: item.description,
        };
      });

      const exp = await api.compareStrategies({
        baseConfig,
        interventions: candidateInterventions,
        numTrials,
      });

      setExperiment(exp);
      setExperimentHistory((prev) => [exp, ...prev]);
    } catch (err) {
      console.error("Experiment failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const comparisonBarData = experiment
    ? experiment.runs.map((r) => ({
        name: r.interventionName.length > 20 ? r.interventionName.slice(0, 18) + "..." : r.interventionName,
        fullName: r.interventionName,
        peakExposure: r.peakExposure,
        correctionReach: r.correctionReach,
        trustPreserved: r.trustPreserved,
        stdDev: r.stdDevExposure,
      }))
    : [];

  // Pareto Frontier data: X = Estimated Cost/Complexity, Y = Exposure Reduction %
  const paretoData = experiment
    ? experiment.runs.map((r) => {
        const reg = INTERVENTION_REGISTRY.find((i) => i.type === r.interventionType);
        const cost = reg ? reg.costScore : 1;
        const baseline = experiment.runs[0];
        const reduction = Math.max(0, (baseline.peakExposure - r.peakExposure));
        return {
          name: r.interventionName,
          cost,
          reduction,
          reach: r.correctionReach,
        };
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Strategy Lab</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Intervention Optimization
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compare misinformation countermeasures using multi-seed Monte Carlo simulations,
            assess statistical distributions, and discover Pareto-optimal response strategies.
          </p>
        </div>

        <button
          onClick={runComparison}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 disabled:opacity-50 transition cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Simulating Repeated Trials...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run Scientific Strategy Trials</span>
            </>
          )}
        </button>
      </div>

      {/* Intervention Selector Grid */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Select Interventions to Test (Select up to 5)</span>
          </h3>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Monte Carlo Seeds:</span>
            <select
              value={numTrials}
              onChange={(e) => setNumTrials(Number(e.target.value))}
              className="p-1 rounded bg-slate-950 border border-slate-800 text-white text-xs"
            >
              <option value={3}>3 Seeds (Quick)</option>
              <option value={5}>5 Seeds (Standard)</option>
              <option value={10}>10 Seeds (High Precision)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2">
          {INTERVENTION_REGISTRY.map((item) => {
            const isSelected = selectedInterventions.includes(item.type);
            return (
              <button
                key={item.type}
                onClick={() => toggleIntervention(item.type)}
                className={`p-3 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-purple-950/40 border-purple-500 text-purple-200 shadow-sm shadow-purple-500/20"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-white truncate max-w-[140px]">
                      {item.name}
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                        isSelected ? "bg-purple-600 text-white font-bold" : "border border-slate-700"
                      }`}
                    >
                      {isSelected ? "✓" : ""}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2">{item.description}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-500">
                  <span>Coverage: {Math.round(item.defaultCoverage * 100)}%</span>
                  <span>Complexity: {item.costScore}/5</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Experiment Results */}
      {experiment && (
        <div className="space-y-6">
          {/* AI Strategy Recommendation Banner */}
          {experiment.aiRecommendation && (
            <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/40 shadow-xl">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/30">
                  <BrainCircuit className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      Adaptive Crisis Recommendation
                    </span>
                    <span className="text-xs font-semibold text-white">
                      Recommended: {experiment.aiRecommendation.recommendedStrategy}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {experiment.aiRecommendation.reasoning}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-black/30 border border-slate-800 text-slate-300">
                      <span className="font-semibold text-purple-300 block mb-0.5">
                        Tradeoffs & Limitations:
                      </span>
                      <span>{experiment.aiRecommendation.tradeoffs}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/30 border border-slate-800 text-slate-300">
                      <span className="font-semibold text-cyan-300 block mb-0.5">
                        Next Recommended Experiment:
                      </span>
                      <span>{experiment.aiRecommendation.nextExperiment}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comparative Metrics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Multi-Run Bar Chart */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Peak Misinformation Exposure vs. Correction Reach
                  </h3>
                  <p className="text-xs text-slate-400">
                    Averaged across {numTrials} randomized seed trials per intervention.
                  </p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Bar dataKey="peakExposure" name="Peak Exposure %" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="correctionReach" name="Correction Reach %" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="trustPreserved" name="Trust Preserved %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pareto Frontier Optimization (Complexity vs Exposure Reduction) */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Pareto Frontier: Harm Reduction vs. Operational Complexity
                  </h3>
                  <p className="text-xs text-slate-400">
                    Upper-left quadrant represents maximum misinformation reduction for lowest cost.
                  </p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 15, right: 20, left: -10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      type="number"
                      dataKey="cost"
                      name="Operational Complexity"
                      stroke="#64748b"
                      domain={[0, 5.5]}
                      tick={{ fontSize: 11 }}
                      label={{ value: "Complexity (1-5)", position: "insideBottom", offset: -5, fill: "#64748b", fontSize: 11 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="reduction"
                      name="Exposure Reduction"
                      stroke="#64748b"
                      tick={{ fontSize: 11 }}
                      label={{ value: "Exposure Drop %", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "12px" }}
                    />
                    <Scatter name="Strategies" data={paretoData} fill="#8b5cf6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Statistical Results Table */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Empirical Experiment Data Matrix</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                  <tr>
                    <th className="p-2.5">Strategy / Intervention</th>
                    <th className="p-2.5">Intensity</th>
                    <th className="p-2.5">Coverage</th>
                    <th className="p-2.5">Mean Exposure (±σ)</th>
                    <th className="p-2.5">Total Shares</th>
                    <th className="p-2.5">Correction Reach</th>
                    <th className="p-2.5">Time to 50%</th>
                    <th className="p-2.5">Trust Retained</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {experiment.runs.map((run, idx) => (
                    <tr key={`run_${idx}`} className="hover:bg-slate-850 transition">
                      <td className="p-2.5 font-semibold text-white">{run.interventionName}</td>
                      <td className="p-2.5 font-mono">{run.intensity ? `${Math.round(run.intensity * 100)}%` : "N/A"}</td>
                      <td className="p-2.5 font-mono">{run.coverage ? `${Math.round(run.coverage * 100)}%` : "N/A"}</td>
                      <td className="p-2.5 font-mono font-bold text-red-400">
                        {run.peakExposure}% <span className="text-slate-500 font-normal">±{run.stdDevExposure}%</span>
                      </td>
                      <td className="p-2.5 font-mono">{run.totalShares}</td>
                      <td className="p-2.5 font-mono text-emerald-400">{run.correctionReach}%</td>
                      <td className="p-2.5 font-mono">{run.timeToCorrection ? `Step ${run.timeToCorrection}` : "N/A"}</td>
                      <td className="p-2.5 font-mono text-cyan-400">{run.trustPreserved}%</td>
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
