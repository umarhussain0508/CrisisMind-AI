import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Sliders,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  Volume2,
  Sparkles,
  Info,
  Layers,
  Activity,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { api } from "../services/api.js";
import {
  AgentNode,
  InterventionConfig,
  SimulationConfig,
  SimulationResult,
} from "../types/index.js";
import { NetworkCanvas } from "../components/simulation/NetworkCanvas.js";

interface SimulationPageProps {
  initialClaim?: string | null;
  initialTitle?: string | null;
}

export const SimulationPage: React.FC<SimulationPageProps> = ({
  initialClaim,
  initialTitle,
}) => {
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Configuration wizard state
  const [crisisType, setCrisisType] = useState<SimulationConfig["crisisType"]>(
    initialClaim ? "custom" : "flood"
  );
  const [scenarioName, setScenarioName] = useState(
    initialTitle || "Scenario A: Flood Emergency Bridge Collapse"
  );
  const [misinfoMessage, setMisinfoMessage] = useState(
    initialClaim ||
      "URGENT: Grand River Bridge has just collapsed! East bank residents must flee immediately before flood crests!"
  );
  const [popSize, setPopSize] = useState(120);
  const [numGroups, setNumGroups] = useState(4);
  const [socialDensity, setSocialDensity] = useState(0.08);
  const [officialSpeed, setOfficialSpeed] = useState(3);
  const [enableInterventionA, setEnableInterventionA] = useState(true);
  const [enableInterventionB, setEnableInterventionB] = useState(true);

  // Auto-initialize default simulation if none exists
  useEffect(() => {
    handleInitializeSimulation();
  }, []);

  // Play loop
  useEffect(() => {
    if (isPlaying && simulation && simulation.currentStep < simulation.maxSteps) {
      const interval = Math.max(250, 1200 / speed);
      timerRef.current = setTimeout(async () => {
        await handleStep();
      }, interval);
    } else if (simulation && simulation.currentStep >= simulation.maxSteps) {
      setIsPlaying(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, simulation, speed]);

  const handleInitializeSimulation = async () => {
    try {
      setLoading(true);
      setIsPlaying(false);
      setSelectedAgent(null);

      const interventions: InterventionConfig[] = [];
      if (enableInterventionA) {
        interventions.push({
          id: "int_official",
          type: "official_announcement",
          name: "Official Disaster Agency SMS Broadcast",
          enabled: true,
          activationStep: officialSpeed,
          intensity: 0.85,
          coverage: 0.8,
          description: "High-priority direct emergency SMS with live webcam verification link.",
        });
      }
      if (enableInterventionB) {
        interventions.push({
          id: "int_messenger",
          type: "trusted_messenger",
          name: "Trusted Community Leaders & First Responders",
          enabled: true,
          activationStep: Math.max(1, officialSpeed - 1),
          intensity: 0.9,
          coverage: 0.65,
          description: "Mobilize verified neighborhood chiefs and doctors in district group chats.",
        });
      }

      const config: SimulationConfig = {
        id: `sim_cfg_${Date.now()}`,
        name: scenarioName,
        crisisType,
        description: `Virtual community crisis simulation studying rumor propagation under ${scenarioName}.`,
        misinformationMessage: misinfoMessage,
        populationSize: popSize,
        numGroups,
        socialDensity,
        initialMisinfoPrevalence: 0.05,
        mediaInfluence: 0.2,
        officialSpeed,
        seed: Math.floor(Math.random() * 10000),
        interventions,
      };

      const result = await api.createSimulation(config);
      setSimulation(result);
    } catch (err) {
      console.error("Simulation init failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStep = async () => {
    if (!simulation || simulation.currentStep >= simulation.maxSteps) return;
    try {
      const updated = await api.stepSimulation(simulation.id, simulation.currentStep);
      setSimulation(updated);
      if (selectedAgent) {
        const fresh = updated.agents.find((a) => a.id === selectedAgent.id);
        if (fresh) setSelectedAgent(fresh);
      }
    } catch (err) {
      console.error("Simulation step error:", err);
      setIsPlaying(false);
    }
  };

  const handleRunAll = async () => {
    if (!simulation) return;
    try {
      setLoading(true);
      setIsPlaying(false);
      const updated = await api.runAllSimulation(simulation.id, simulation.maxSteps);
      setSimulation(updated);
    } catch (err) {
      console.error("Simulation run-all error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (preset: "flood" | "earthquake" | "evac" | "fraud") => {
    if (preset === "flood") {
      setCrisisType("flood");
      setScenarioName("Scenario A: Flood Emergency Bridge Collapse");
      setMisinfoMessage(
        "URGENT: Grand River Bridge has collapsed under torrential floods! Evacuate now!"
      );
    } else if (preset === "earthquake") {
      setCrisisType("earthquake");
      setScenarioName("Scenario B: Deterministic Earthquake Prediction Rumor");
      setMisinfoMessage(
        "ALERT: Seismologists privately warned a magnitude 9.0 earthquake will hit at 3:00 PM tomorrow!"
      );
    } else if (preset === "evac") {
      setCrisisType("evacuation");
      setScenarioName("Scenario E: Fake Chemical Evacuation Notice");
      setMisinfoMessage(
        "Toxic chemical spill from train derailment! Mandatory evacuation for District 3 immediately."
      );
    } else if (preset === "fraud") {
      setCrisisType("relief_fraud");
      setScenarioName("Scenario D: Disaster Relief Donation Scam");
      setMisinfoMessage(
        "Direct emergency funds exclusively to private wire account #8819 for flood victims."
      );
    }
  };

  const groups = simulation
    ? Array.from(new Set(simulation.agents.map((a) => a.group)))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Crisis Simulation Lab</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              Multi-Agent Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate virtual communities experiencing emergency rumors. Measure information propagation,
            peer verification, and the quantitative impact of targeted interventions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleInitializeSimulation}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Re-Seed Simulation</span>
          </button>
        </div>
      </div>

      {/* Configuration Accordion / Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-white">Scenario Setup & Interventions</span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-[11px] text-slate-400">Templates:</span>
            <button
              onClick={() => handlePresetSelect("flood")}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-cyan-300 transition cursor-pointer"
            >
              Flood Bridge
            </button>
            <button
              onClick={() => handlePresetSelect("earthquake")}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-purple-300 transition cursor-pointer"
            >
              Quake Rumor
            </button>
            <button
              onClick={() => handlePresetSelect("evac")}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-amber-300 transition cursor-pointer"
            >
              Fake Evac
            </button>
            <button
              onClick={() => handlePresetSelect("fraud")}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-emerald-300 transition cursor-pointer"
            >
              Donation Scam
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 text-xs">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Population Size</label>
            <select
              value={popSize}
              onChange={(e) => setPopSize(Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
            >
              <option value={60}>60 Agents (Quick)</option>
              <option value={120}>120 Agents (Standard)</option>
              <option value={200}>200 Agents (Dense)</option>
              <option value={350}>350 Agents (Metro)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Community Clusters</label>
            <select
              value={numGroups}
              onChange={(e) => setNumGroups(Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
            >
              <option value={3}>3 Districts</option>
              <option value={4}>4 Districts</option>
              <option value={6}>6 Districts</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Official Response Speed</label>
            <select
              value={officialSpeed}
              onChange={(e) => setOfficialSpeed(Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
            >
              <option value={2}>Step 2 (Rapid Alert)</option>
              <option value={4}>Step 4 (Moderate Delay)</option>
              <option value={7}>Step 7 (Lagged Response)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <input
              type="checkbox"
              id="intA"
              checked={enableInterventionA}
              onChange={(e) => setEnableInterventionA(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="intA" className="text-slate-300 text-xs cursor-pointer">
              Emergency Broadcast SMS
            </label>
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <input
              type="checkbox"
              id="intB"
              checked={enableInterventionB}
              onChange={(e) => setEnableInterventionB(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-purple-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="intB" className="text-slate-300 text-xs cursor-pointer">
              Trusted Community Chiefs
            </label>
          </div>
        </div>

        {/* Misinfo Message Input */}
        <div className="pt-2">
          <label className="text-[11px] text-slate-400 block mb-1">
            Simulated Misinformation Rumor:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={misinfoMessage}
              onChange={(e) => setMisinfoMessage(e.target.value)}
              className="flex-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleInitializeSimulation}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition cursor-pointer"
            >
              Apply & Re-generate
            </button>
          </div>
        </div>
      </div>

      {/* Main Simulation Arena */}
      {simulation && (
        <div className="space-y-4">
          {/* Timeline Playback Controls & Status Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={simulation.currentStep >= simulation.maxSteps}
                className={`p-2.5 rounded-lg text-white font-semibold transition cursor-pointer ${
                  isPlaying
                    ? "bg-amber-600 hover:bg-amber-500"
                    : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/20"
                } disabled:opacity-40`}
                title={isPlaying ? "Pause" : "Play Simulation"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={handleStep}
                disabled={isPlaying || simulation.currentStep >= simulation.maxSteps}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700/80 disabled:opacity-40 transition cursor-pointer"
                title="Advance 1 Step"
              >
                <SkipForward className="w-3.5 h-3.5 text-cyan-400" />
                <span>Step Forward</span>
              </button>

              <button
                onClick={handleRunAll}
                disabled={simulation.currentStep >= simulation.maxSteps}
                className="px-3 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-purple-300 text-xs font-medium border border-slate-700/80 disabled:opacity-40 transition cursor-pointer"
              >
                Fast-Forward to End
              </button>

              <div className="h-6 w-px bg-slate-800" />

              {/* Speed Slider */}
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span>Speed:</span>
                <button
                  onClick={() => setSpeed(1)}
                  className={`px-1.5 py-0.5 rounded text-[11px] ${
                    speed === 1 ? "bg-cyan-600 text-white font-bold" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  1x
                </button>
                <button
                  onClick={() => setSpeed(2)}
                  className={`px-1.5 py-0.5 rounded text-[11px] ${
                    speed === 2 ? "bg-cyan-600 text-white font-bold" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  2x
                </button>
                <button
                  onClick={() => setSpeed(4)}
                  className={`px-1.5 py-0.5 rounded text-[11px] ${
                    speed === 4 ? "bg-cyan-600 text-white font-bold" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  4x
                </button>
              </div>
            </div>

            {/* Current Step & Status */}
            <div className="flex items-center space-x-4">
              {/* Group Filter */}
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter:</span>
                <select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none"
                >
                  <option value="all">All Districts</option>
                  {groups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 font-mono text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <span>Time Step:</span>
                <span className="text-cyan-400 font-bold">
                  {simulation.currentStep} / {simulation.maxSteps}
                </span>
                <span className="text-[10px] text-slate-500 uppercase">
                  ({simulation.status})
                </span>
              </div>
            </div>
          </div>

          {/* Network Canvas */}
          <NetworkCanvas
            agents={simulation.agents}
            edges={simulation.edges}
            selectedAgentId={selectedAgent?.id}
            onSelectAgent={(agent) => setSelectedAgent(agent)}
            filterGroup={filterGroup}
          />

          {/* Simulation Summary Scorecards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Peak Misinfo Reach</span>
              <p className="text-lg font-bold text-red-400 mt-0.5">
                {Math.round(simulation.summary.peakExposureFraction * 100)}%
              </p>
              <span className="text-[10px] text-slate-500">Max exposed agents</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Final Verified Reach</span>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">
                {Math.round(simulation.summary.finalVerifiedFraction * 100)}%
              </p>
              <span className="text-[10px] text-slate-500">Debunked or safe</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Total Shares</span>
              <p className="text-lg font-bold text-amber-400 mt-0.5">
                {simulation.summary.totalShares}
              </p>
              <span className="text-[10px] text-slate-500">Amplification events</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Total Corrections</span>
              <p className="text-lg font-bold text-cyan-400 mt-0.5">
                {simulation.summary.totalCorrections}
              </p>
              <span className="text-[10px] text-slate-500">Peer debunk actions</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Time to 50% Safe</span>
              <p className="text-lg font-bold text-white mt-0.5 font-mono">
                {simulation.summary.timeToFiftyPercentCorrection !== null
                  ? `Step ${simulation.summary.timeToFiftyPercentCorrection}`
                  : "Not reached"}
              </p>
              <span className="text-[10px] text-slate-500">Critical tipping point</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Community Trust Delta</span>
              <p
                className={`text-lg font-bold mt-0.5 font-mono ${
                  simulation.summary.trustDelta >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {simulation.summary.trustDelta >= 0 ? "+" : ""}
                {Math.round(simulation.summary.trustDelta * 100)}%
              </p>
              <span className="text-[10px] text-slate-500">Institutional shift</span>
            </div>
          </div>

          {/* Quantitative Metrics Chart & Live Event Log */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Metrics History Chart */}
            <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-semibold text-white mb-1 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Information State Transitions Across Timeline</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Real-time agent population distribution per simulation time step.
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={simulation.metricsHistory}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="step" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Line
                      type="monotone"
                      dataKey="sharingCount"
                      name="Sharing Rumor"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="exposedCount"
                      name="Exposed / Unsure"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="correctingCount"
                      name="Active Correctors"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="verifiedCount"
                      name="Verified Safe"
                      stroke="#06b6d4"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live Event Stream Log */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1 flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  <span>Agent Reaction Event Log</span>
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Live feed of transmissions and citizen dialogue.
                </p>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {simulation.events.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-6 text-center">
                      Click 'Step Forward' or 'Play' to generate transmission events.
                    </p>
                  ) : (
                    simulation.events
                      .slice(-12)
                      .reverse()
                      .map((ev, idx) => (
                        <div
                          key={`ev_${idx}`}
                          className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white truncate max-w-[140px]">
                              {ev.agentName}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">
                              T{ev.step}
                            </span>
                          </div>
                          <p className="text-slate-400">{ev.description}</p>
                          {ev.quote && (
                            <p className="text-purple-300 italic text-[10px]">"{ev.quote}"</p>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>

              {simulation.aiQualitativeObservations && (
                <div className="mt-3 p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/60 text-[11px] text-purple-200">
                  <span className="font-semibold text-purple-300 block mb-1">
                    AI Research Observation:
                  </span>
                  <p className="leading-relaxed">{simulation.aiQualitativeObservations}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
