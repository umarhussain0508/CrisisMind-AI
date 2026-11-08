import {
  EvaluationReport,
  EvidenceSource,
  Investigation,
  SimulationConfig,
  SimulationResult,
  StrategyExperiment,
} from "../types/index.js";

export const api = {
  // Overview
  async getOverview() {
    const res = await fetch("/api/overview");
    if (!res.ok) throw new Error("Failed to load overview data");
    return res.json();
  },

  // LinkCheck AI
  async analyzeLinkCheck(payload: {
    input?: string;
    inputType: "url" | "text" | "image" | "transcript";
    imageBase64?: string;
    mimeType?: string;
  }): Promise<Investigation> {
    const res = await fetch("/api/linkcheck/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Analysis failed");
    return data;
  },

  async getInvestigations(): Promise<Investigation[]> {
    const res = await fetch("/api/linkcheck/investigations");
    if (!res.ok) throw new Error("Failed to fetch investigations");
    return res.json();
  },

  async getInvestigation(id: string): Promise<Investigation> {
    const res = await fetch(`/api/linkcheck/investigations/${id}`);
    if (!res.ok) throw new Error("Investigation not found");
    return res.json();
  },

  // Simulation
  async createSimulation(config: SimulationConfig): Promise<SimulationResult> {
    const res = await fetch("/api/simulation/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error("Failed to initialize simulation");
    return res.json();
  },

  async stepSimulation(simulationId: string, currentStep: number): Promise<SimulationResult> {
    const res = await fetch("/api/simulation/step", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ simulationId, currentStep }),
    });
    if (!res.ok) throw new Error("Simulation step failed");
    return res.json();
  },

  async runAllSimulation(simulationId: string, maxSteps = 15): Promise<SimulationResult> {
    const res = await fetch("/api/simulation/run-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ simulationId, maxSteps }),
    });
    if (!res.ok) throw new Error("Simulation run failed");
    return res.json();
  },

  async getSimulationResults(id: string): Promise<SimulationResult> {
    const res = await fetch(`/api/simulation/${id}/results`);
    if (!res.ok) throw new Error("Simulation results not found");
    return res.json();
  },

  async getSimulationHistory(): Promise<SimulationResult[]> {
    const res = await fetch("/api/simulation/history");
    if (!res.ok) throw new Error("Failed to load simulation history");
    return res.json();
  },

  // Strategy Lab
  async compareStrategies(payload: {
    baseConfig: SimulationConfig;
    interventions: any[];
    numTrials?: number;
  }): Promise<StrategyExperiment> {
    const res = await fetch("/api/strategy/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Strategy comparison failed");
    return res.json();
  },

  async getExperiments(): Promise<StrategyExperiment[]> {
    const res = await fetch("/api/strategy/experiments");
    if (!res.ok) throw new Error("Failed to load experiments");
    return res.json();
  },

  // Evidence
  async getEvidence(): Promise<EvidenceSource[]> {
    const res = await fetch("/api/evidence");
    if (!res.ok) throw new Error("Failed to load evidence");
    return res.json();
  },

  // Analyst Chat
  async chatAnalyst(payload: {
    messages: { role: string; content: string }[];
    contextScope?: string;
    useHighThinking?: boolean;
  }) {
    const res = await fetch("/api/analyst/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Chat failed");
    return data;
  },

  // Evaluation
  async runEvaluation(): Promise<EvaluationReport> {
    const res = await fetch("/api/evaluation/run", { method: "POST" });
    if (!res.ok) throw new Error("Evaluation run failed");
    return res.json();
  },

  async getLatestEvaluation(): Promise<EvaluationReport> {
    const res = await fetch("/api/evaluation/latest");
    if (!res.ok) throw new Error("Failed to get evaluation report");
    return res.json();
  },
};
