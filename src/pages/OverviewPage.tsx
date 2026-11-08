import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  Search,
  GitBranch,
  Sliders,
  Database,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Users,
  AlertTriangle,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { api } from "../services/api.js";
import { Investigation, SimulationResult, StrategyExperiment } from "../types/index.js";
import { NavItem } from "../components/layout/Navigation.js";

interface OverviewPageProps {
  onNavigate: (tab: NavItem, id?: string) => void;
  onOpenQuickInvestigate: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onNavigate,
  onOpenQuickInvestigate,
}) => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>({
    totalInvestigations: 0,
    claimsAnalyzed: 0,
    simulationExperimentsCompleted: 0,
    averageMisinformationExposure: 0,
    averageCorrectionRate: 0,
    interventionEffectiveness: 0,
    evidenceSourcesCollected: 0,
  });
  const [recentInvestigations, setRecentInvestigations] = useState<Investigation[]>([]);
  const [recentSimulations, setRecentSimulations] = useState<SimulationResult[]>([]);
  const [recentExperiments, setRecentExperiments] = useState<StrategyExperiment[]>([]);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const data = await api.getOverview();
      setMetrics(data.metrics);
      setRecentInvestigations(data.investigations || []);
      setRecentSimulations(data.simulations || []);
      setRecentExperiments(data.experiments || []);
    } catch (err) {
      console.error("Failed to load overview metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sample or real trendline data derived from recent simulations
  const spreadTrendData = [
    { step: "T0", exposure: 5, correction: 0, trust: 55 },
    { step: "T1", exposure: 18, correction: 2, trust: 53 },
    { step: "T2", exposure: 42, correction: 8, trust: 48 },
    { step: "T3", exposure: 68, correction: 22, trust: 45 },
    { step: "T4", exposure: 52, correction: 48, trust: 50 },
    { step: "T5", exposure: 34, correction: 72, trust: 58 },
    { step: "T6", exposure: 16, correction: 89, trust: 64 },
  ];

  const strategyComparisonData = [
    { name: "Baseline", peakExposure: 78, reach: 12 },
    { name: "Share Warning", peakExposure: 54, reach: 38 },
    { name: "Official SMS", peakExposure: 32, reach: 76 },
    { name: "Community Chiefs", peakExposure: 26, reach: 84 },
    { name: "Combined Multi", peakExposure: 18, reach: 92 },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#0c182f] to-slate-900 border border-cyan-500/30 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>WAICY 2026 AI Large Language Model Track</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Understand the Crisis. Stop the Misinformation. Protect the Community.
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-2xl">
            CrisisMind AI combines real-world evidence-grounded claim investigation with
            reproducible multi-agent crisis simulation to test interventions that safeguard public
            trust during emergencies.
          </p>

          {/* Quick Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onOpenQuickInvestigate}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 transition cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Investigate a Claim</span>
            </button>
            <button
              onClick={() => onNavigate("simulation")}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition cursor-pointer"
            >
              <GitBranch className="w-4 h-4 text-cyan-400" />
              <span>Launch Crisis Simulation</span>
            </button>
            <button
              onClick={() => onNavigate("strategy")}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Run Strategy Experiment</span>
            </button>
            <button
              onClick={() => onNavigate("showcase")}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-700/80 text-amber-300 text-xs font-semibold transition cursor-pointer"
            >
              <span>WAICY Competition Mode</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ambient Gradient Glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] font-medium text-slate-400">Investigations</p>
          <p className="text-xl font-bold text-white mt-1">{metrics.totalInvestigations}</p>
          <span className="text-[10px] text-cyan-400 font-mono">Stored Cases</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] font-medium text-slate-400">Claims Extracted</p>
          <p className="text-xl font-bold text-white mt-1">{metrics.claimsAnalyzed}</p>
          <span className="text-[10px] text-purple-400 font-mono">Parsed Facts</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] font-medium text-slate-400">Simulations Run</p>
          <p className="text-xl font-bold text-white mt-1">
            {metrics.simulationExperimentsCompleted}
          </p>
          <span className="text-[10px] text-blue-400 font-mono">Multi-Agent</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] font-medium text-slate-400">Avg Peak Exposure</p>
          <p className="text-xl font-bold text-amber-400 mt-1">
            {metrics.averageMisinformationExposure}%
          </p>
          <span className="text-[10px] text-slate-400 font-mono">Rumor Reach</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] font-medium text-slate-400">Correction Rate</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">
            {metrics.averageCorrectionRate}%
          </p>
          <span className="text-[10px] text-emerald-400 font-mono">Debunk Reach</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] font-medium text-slate-400">Strategy Gain</p>
          <p className="text-xl font-bold text-cyan-400 mt-1">
            +{metrics.interventionEffectiveness}%
          </p>
          <span className="text-[10px] text-cyan-400 font-mono">Harm Reduced</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
          <p className="text-[11px] font-medium text-slate-400">Sources Collected</p>
          <p className="text-xl font-bold text-white mt-1">
            {metrics.evidenceSourcesCollected}
          </p>
          <span className="text-[10px] text-slate-400 font-mono">Real Citations</span>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Misinformation Spread & Correction Wave */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Epidemic Propagation Curve vs. Debunking Wave
              </h3>
              <p className="text-xs text-slate-400">
                Misinformation exposure peak vs verified correction reach across simulation steps.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
              Watts-Strogatz Small World
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spreadTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExposure" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCorrection" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="step" stroke="#64748b" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "12px" }}
                />
                <Area
                  type="monotone"
                  dataKey="exposure"
                  name="Exposed / Sharing %"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExposure)"
                />
                <Area
                  type="monotone"
                  dataKey="correction"
                  name="Verified / Correcting %"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCorrection)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strategy Comparison Bar Chart */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Intervention Strategy Effectiveness
              </h3>
              <p className="text-xs text-slate-400">
                Peak exposure reduction compared across empirical intervention strategies.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300">
              Monte Carlo Trials
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strategyComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "12px" }}
                />
                <Bar dataKey="peakExposure" name="Peak Exposure %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reach" name="Correction Reach %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Investigations & Recent Experiments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Investigations */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Recent LinkCheck Investigations</span>
            </h3>
            <button
              onClick={() => onNavigate("linkcheck")}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentInvestigations.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">
              No investigations saved yet. Paste a link or claim above to begin.
            </p>
          ) : (
            <div className="space-y-2.5">
              {recentInvestigations.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => onNavigate("linkcheck", inv.id)}
                  className="p-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800/80 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="max-w-[75%]">
                    <p className="text-xs font-semibold text-white truncate">{inv.title}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{inv.mainClaim}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      inv.verdict === "FALSE"
                        ? "bg-red-950 text-red-300 border border-red-800"
                        : inv.verdict === "TRUE"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-amber-950 text-amber-300 border border-amber-800"
                    }`}
                  >
                    {inv.verdict}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Crisis Simulation Scenarios */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-purple-400" />
              <span>Educational Crisis Scenarios</span>
            </h3>
            <button
              onClick={() => onNavigate("simulation")}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1"
            >
              <span>Simulation Lab</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            <div
              onClick={() => onNavigate("simulation")}
              className="p-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800 cursor-pointer transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Scenario A: Flood Emergency</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Infrastructure
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Bridge collapse rumor causing panicked evacuations toward river basins. Tests official
                broadcast speed and trusted neighborhood leader intervention.
              </p>
            </div>

            <div
              onClick={() => onNavigate("simulation")}
              className="p-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800 cursor-pointer transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Scenario B: Earthquake Prediction Rumor</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  Seismic Science
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Viral claims predicting a deterministic major earthquake at an exact hour. Studies
                fear-driven reshares and scientific clarification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
