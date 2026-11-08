import {
  InterventionConfig,
  InterventionType,
  SimulationConfig,
  StrategyExperiment,
} from "../src/types/index.js";
import { createRng, executeSimulationStep, generateSimulationPopulation } from "./simulationEngine.js";
import { ai, MODELS, ThinkingLevel } from "./gemini.js";

export interface StrategyRunResult {
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
}

// Run a multi-trial Monte Carlo simulation for a specific intervention strategy configuration
export function runStrategyTrial(
  baseConfig: SimulationConfig,
  intervention: InterventionConfig | null,
  numSeeds = 5,
  maxSteps = 15
): StrategyRunResult {
  const trialResults: {
    seed: number;
    peakExposure: number;
    correctionReach: number;
    totalShares: number;
  }[] = [];

  let sumPeakExposure = 0;
  let sumShares = 0;
  let sumCorrectionReach = 0;
  let sumTrust = 0;
  let sumUncorrected = 0;
  let firstCorrectionTime: number | null = null;

  const baseSeeds = [101, 202, 303, 404, 505, 606, 707, 808, 909, 1001];

  for (let s = 0; s < numSeeds; s++) {
    const seed = baseSeeds[s % baseSeeds.length] + (baseConfig.seed || 42);
    const runConfig: SimulationConfig = {
      ...baseConfig,
      seed,
      interventions: intervention ? [intervention] : [],
    };

    const { agents } = generateSimulationPopulation(runConfig);
    const rng = createRng(seed);

    let currentAgents = agents;
    let peakExp = 0;
    let totalShares = 0;
    let lastMetric: any = null;

    for (let step = 1; step <= maxSteps; step++) {
      const { updatedAgents, metric } = executeSimulationStep(step, currentAgents, runConfig, rng);
      currentAgents = updatedAgents;
      lastMetric = metric;

      const exposedFraction = (metric.exposedCount + metric.sharingCount) / runConfig.populationSize;
      if (exposedFraction > peakExp) peakExp = exposedFraction;
      totalShares += metric.totalShares;

      if (metric.correctingCount + metric.verifiedCount > runConfig.populationSize * 0.4 && firstCorrectionTime === null) {
        firstCorrectionTime = step;
      }
    }

    const verifiedFraction =
      ((lastMetric?.verifiedCount || 0) + (lastMetric?.correctingCount || 0)) / runConfig.populationSize;

    trialResults.push({
      seed,
      peakExposure: Math.round(peakExp * 100),
      correctionReach: Math.round(verifiedFraction * 100),
      totalShares,
    });

    sumPeakExposure += peakExp;
    sumShares += totalShares;
    sumCorrectionReach += verifiedFraction;
    sumTrust += lastMetric?.averageTrust || 0.5;
    sumUncorrected += lastMetric?.exposedCount || 0;
  }

  const meanExposure = sumPeakExposure / numSeeds;

  // Calculate standard deviation
  let sumSqDiff = 0;
  for (const t of trialResults) {
    sumSqDiff += Math.pow((t.peakExposure / 100) - meanExposure, 2);
  }
  const stdDevExposure = Math.round(Math.sqrt(sumSqDiff / numSeeds) * 100);

  return {
    interventionName: intervention ? intervention.name : "Baseline (No Intervention)",
    interventionType: intervention ? intervention.type : ("official_announcement" as InterventionType),
    intensity: intervention ? intervention.intensity : 0,
    coverage: intervention ? intervention.coverage : 0,
    activationStep: intervention ? intervention.activationStep : 0,
    peakExposure: Math.round(meanExposure * 100),
    totalShares: Math.round(sumShares / numSeeds),
    correctionReach: Math.round((sumCorrectionReach / numSeeds) * 100),
    timeToCorrection: firstCorrectionTime,
    trustPreserved: Math.round((sumTrust / numSeeds) * 100),
    uncorrectedRemaining: Math.round(sumUncorrected / numSeeds),
    trials: trialResults,
    meanPeakExposure: Math.round(meanExposure * 100),
    stdDevExposure,
  };
}

// Generate AI Recommendation based on experimental results using Gemini with High Thinking
export async function generateStrategyRecommendation(
  experiment: StrategyExperiment
): Promise<{
  recommendedStrategy: string;
  reasoning: string;
  tradeoffs: string;
  nextExperiment: string;
}> {
  try {
    const prompt = `You are the Lead Scientific Advisor for CrisisMind AI (WAICY 2026).
Analyze the following multi-seed experimental data comparing crisis misinformation interventions:

Scenario Title: ${experiment.title}
Runs & Results:
${JSON.stringify(experiment.runs, null, 2)}

Provide a rigorous scientific recommendation answering:
1. Which tested intervention performed best at minimizing peak exposure and maximizing community trust?
2. What are the underlying communication mechanisms explaining the difference?
3. What are the operational tradeoffs (cost, community fatigue, emergency lead-time)?
4. What parameter sweep or combined intervention should be tested in the next experiment?

Output pure JSON:
{
  "recommendedStrategy": "Exact name of the winning intervention or combination",
  "reasoning": "Clear scientific rationale referencing peak exposure reduction and correction reach.",
  "tradeoffs": "Tradeoffs between speed, reach, and community compliance.",
  "nextExperiment": "Specific hypothesis and parameter to sweep in the next trial."
}`;

    const response = await ai.models.generateContent({
      model: MODELS.REASONING, // gemini-4-argon with high thinking
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return parsed;
  } catch (err) {
    console.warn("AI recommendation fallback:", err);
    // Fallback grounded in computed data
    const bestRun = [...experiment.runs]
      .filter((r) => r.interventionName !== "Baseline (No Intervention)")
      .sort((a, b) => a.peakExposure - b.peakExposure)[0] || experiment.runs[0];

    return {
      recommendedStrategy: bestRun.interventionName,
      reasoning: `Based on ${bestRun.trials.length} Monte Carlo trials, ${bestRun.interventionName} reduced peak exposure to ${bestRun.peakExposure}% with a correction reach of ${bestRun.correctionReach}%.`,
      tradeoffs: `High intensity (${Math.round(bestRun.intensity * 100)}%) requires rapid coordination with field liaisons.`,
      nextExperiment: `Test combining ${bestRun.interventionName} with reshare delay at step 2.`,
    };
  }
}
