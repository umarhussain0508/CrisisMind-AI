export type VerdictType =
  | "TRUE"
  | "FALSE"
  | "MOSTLY TRUE"
  | "PARTLY TRUE"
  | "MISLEADING"
  | "OUT OF CONTEXT"
  | "UNVERIFIED"
  | "INSUFFICIENT EVIDENCE";

export type ClaimType =
  | "emergency"
  | "health"
  | "infrastructure"
  | "weather"
  | "relief_fraud"
  | "public_safety"
  | "general";

export interface ExtractedClaim {
  id: string;
  statement: string;
  claimType: ClaimType;
  location?: string;
  entities: string[];
  timeSensitivity: "low" | "medium" | "high" | "critical";
  requiresVerification: boolean;
  potentialRisk: string;
}

export interface EvidenceSource {
  id: string;
  name: string;
  url: string;
  sourceType: "official_agency" | "news_outlet" | "fact_checker" | "scientific_body" | "social_web";
  publicationDate?: string;
  retrievalDate: string;
  excerpt: string;
  stance: "supporting" | "contradicting" | "contextual" | "inconclusive";
  reliabilityRating: "high" | "moderate" | "low" | "unverified";
  limitations?: string;
}

export interface Investigation {
  id: string;
  title: string;
  originalInput: string;
  inputType: "url" | "text" | "image" | "transcript";
  submittedAt: string;
  mainClaim: string;
  claimType: ClaimType;
  location?: string;
  entities: string[];
  timeSensitivity: "low" | "medium" | "high" | "critical";
  potentialRisk: string;
  extractedClaims: ExtractedClaim[];
  verdict: VerdictType;
  confidenceScore: number; // 0 to 1 calibrated evidence strength
  explanation: string;
  contextAnalysis: string;
  evidenceLimitations: string[];
  suggestedSteps: string[];
  evidenceSources: EvidenceSource[];
  imageUrl?: string;
}

// Simulation Types
export type AgentArchetype =
  | "high_trust_sharer"
  | "skeptical_citizen"
  | "community_leader"
  | "local_journalist"
  | "health_professional"
  | "emergency_responder"
  | "influencer"
  | "fact_checker"
  | "official"
  | "ordinary_citizen";

export type AgentState =
  | "UNEXPOSED"
  | "EXPOSED"
  | "SHARING_MISINFO"
  | "QUESTIONING"
  | "CORRECTING"
  | "VERIFIED_SAFE";

export interface AgentNode {
  id: string;
  name: string;
  archetype: AgentArchetype;
  group: string;
  state: AgentState;
  trustLevel: number; // 0 to 1
  skepticism: number; // 0 to 1
  sharingTendency: number; // 0 to 1
  infoLiteracy: number; // 0 to 1
  connections: string[]; // Connected agent IDs
  x?: number;
  y?: number;
  exposureStep?: number;
  reactionQuote?: string;
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight?: number;
}

export interface SimulationConfig {
  id: string;
  name: string;
  crisisType: "flood" | "earthquake" | "epidemic" | "wildfire" | "severe_weather" | "relief_fraud" | "evacuation" | "custom";
  description: string;
  misinformationMessage: string;
  populationSize: number;
  numGroups: number;
  socialDensity: number; // 0.05 to 0.5 (average connection probability)
  initialMisinfoPrevalence: number; // fraction of population initially exposed
  mediaInfluence: number; // 0 to 1
  officialSpeed: number; // step at which official notice arrives
  seed: number;
  interventions: InterventionConfig[];
}

export type InterventionType =
  | "official_announcement"
  | "fact_check_notification"
  | "trusted_messenger"
  | "info_literacy_nudge"
  | "share_warning_prompt"
  | "credibility_label"
  | "community_correction"
  | "expert_broadcast"
  | "reshare_delay"
  | "multi_source_prompt";

export interface InterventionConfig {
  id: string;
  type: InterventionType;
  name: string;
  enabled: boolean;
  activationStep: number;
  intensity: number; // 0.1 to 1.0
  coverage: number; // 0.1 to 1.0 (fraction of community reached)
  description: string;
}

export interface StepMetric {
  step: number;
  unexposedCount: number;
  exposedCount: number;
  sharingCount: number;
  questioningCount: number;
  correctingCount: number;
  verifiedCount: number;
  averageTrust: number;
  totalShares: number;
  totalCorrections: number;
}

export interface SimulationEvent {
  step: number;
  type: "exposure" | "share" | "question" | "correction" | "intervention";
  agentId: string;
  agentName: string;
  archetype: AgentArchetype;
  description: string;
  quote?: string;
}

export interface SimulationResult {
  id: string;
  config: SimulationConfig;
  status: "idle" | "running" | "completed" | "paused";
  currentStep: number;
  maxSteps: number;
  agents: AgentNode[];
  edges: NetworkEdge[];
  metricsHistory: StepMetric[];
  events: SimulationEvent[];
  summary: {
    peakExposureFraction: number;
    totalShares: number;
    totalCorrections: number;
    finalVerifiedFraction: number;
    timeToFiftyPercentCorrection: number | null;
    trustDelta: number;
    uncorrectedExposed: number;
  };
  aiQualitativeObservations?: string;
}

export interface StrategyExperiment {
  id: string;
  title: string;
  scenarioId: string;
  runs: {
    interventionName: string;
    interventionType: InterventionType;
    intensity: number;
    coverage: number;
    activationStep: number;
    peakExposure: number;
    totalShares: number;
    correctionReach: number;
    timeToCorrection: number | null;
    trustPreserved: number;
    uncorrectedRemaining: number;
    trials: {
      seed: number;
      peakExposure: number;
      correctionReach: number;
      totalShares: number;
    }[];
    meanPeakExposure: number;
    stdDevExposure: number;
  }[];
  createdAt: string;
  aiRecommendation?: {
    recommendedStrategy: string;
    reasoning: string;
    tradeoffs: string;
    nextExperiment: string;
  };
}

export interface EvaluationBenchmarkItem {
  id: string;
  claim: string;
  domain: string;
  groundTruthVerdict: VerdictType;
  context: string;
  referenceSource: string;
  predictedVerdict?: VerdictType;
  isCorrect?: boolean;
  citationFound?: boolean;
}

export interface EvaluationReport {
  id: string;
  timestamp: string;
  datasetName: string;
  totalClaims: number;
  accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  citationCoverage: number;
  unsupportedRate: number;
  abstentionRate: number;
  confusionMatrix: Record<string, Record<string, number>>;
  classMetrics: Record<string, { precision: number; recall: number; f1: number; support: number }>;
  items: EvaluationBenchmarkItem[];
}
