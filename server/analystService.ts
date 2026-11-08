import { ai, MODELS, ThinkingLevel } from "./gemini.js";
import { db } from "./db.js";

export interface ChatMessage {
  role: "user" | "model" | "assistant";
  content: string;
}

export async function askResearchAnalyst(params: {
  messages: ChatMessage[];
  contextScope?: "global" | "investigation" | "simulation" | "strategy" | "evaluation";
  activeId?: string;
  useHighThinking?: boolean;
}): Promise<{
  reply: string;
  citedInvestigationIds: string[];
  citedExperimentIds: string[];
  sourcesReferenced: string[];
}> {
  const { messages, contextScope = "global", activeId, useHighThinking = true } = params;

  // Retrieve grounded application data
  const investigations = db.getInvestigations();
  const simulations = db.getSimulations();
  const experiments = db.getExperiments();
  const evidence = db.getEvidence();
  const evalReports = db.getEvaluationReports();

  // Build condensed context representation
  const contextSummary = {
    totalInvestigations: investigations.length,
    recentInvestigations: investigations.slice(0, 4).map((i) => ({
      id: i.id,
      title: i.title,
      verdict: i.verdict,
      confidence: i.confidenceScore,
      claimType: i.claimType,
      mainClaim: i.mainClaim,
      evidenceSourcesCount: i.evidenceSources.length,
      limitations: i.evidenceLimitations,
    })),
    recentSimulations: simulations.slice(0, 3).map((s) => ({
      id: s.id,
      name: s.config.name,
      crisisType: s.config.crisisType,
      population: s.config.populationSize,
      peakExposure: s.summary.peakExposureFraction,
      totalShares: s.summary.totalShares,
      correctionReach: s.summary.finalVerifiedFraction,
      trustDelta: s.summary.trustDelta,
    })),
    recentExperiments: experiments.slice(0, 3).map((e) => ({
      id: e.id,
      title: e.title,
      runs: e.runs.map((r) => ({
        name: r.interventionName,
        peakExposure: r.peakExposure,
        correctionReach: r.correctionReach,
        stdDev: r.stdDevExposure,
      })),
      recommendation: e.aiRecommendation?.recommendedStrategy,
    })),
    evidenceCount: evidence.length,
    recentEvidence: evidence.slice(0, 5).map((e) => ({
      id: e.id,
      name: e.name,
      url: e.url,
      sourceType: e.sourceType,
      stance: e.stance,
    })),
    latestEvaluation: evalReports[0] ? {
      dataset: evalReports[0].datasetName,
      accuracy: evalReports[0].accuracy,
      f1: evalReports[0].macroF1,
      citationCoverage: evalReports[0].citationCoverage,
      totalClaims: evalReports[0].totalClaims,
    } : null,
  };

  const systemInstruction = `You are the Senior Research Scientist and AI Analyst for CrisisMind AI, an advanced platform for the WAICY 2026 AI Large Language Model Track.
Tagline: "Understand the Crisis. Stop the Misinformation. Protect the Community."

Your purpose is to explain crisis misinformation propagation dynamics, evaluate simulation experiments, analyze LinkCheck evidence, and recommend empirical interventions based on REAL APPLICATION DATA.

Guidelines:
1. Base all answers strictly on the actual investigations, simulation experiments, and evidence records provided in the context.
2. If data is not present to answer a query (e.g. "what happened in 2023 flood"), clearly state that no records exist in the current database, and suggest running a new investigation or simulation.
3. Distinguish between:
   - Exposure vs Sharing: An agent is exposed when encountering information; sharing requires high trust/low skepticism and active transmission.
   - Evidence strength vs Model confidence: Evidence strength comes from corroborating independent authoritative bodies (NDMA, USGS, WHO).
   - Deterministic simulation vs AI qualitative reasoning: State transitions and metrics are computed mathematically by the agent model, not hallucinated.
4. When referencing investigations or experiments, explicitly cite their IDs (e.g. inv_flood_bridge_01, exp_123).
5. Maintain a professional, scientific, scholarly, yet accessible tone suitable for international AI competition judges and emergency communication researchers.`;

  // Format chat history
  const historyContents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : m.role,
    parts: [{ text: m.content }],
  }));

  // Append context into user prompt or system instruction
  const modelToUse = useHighThinking ? MODELS.REASONING : MODELS.GENERAL;

  const response = await ai.models.generateContent({
    model: modelToUse,
    contents: [
      ...historyContents.slice(0, -1),
      {
        role: "user",
        parts: [
          {
            text: `[SYSTEM DATA CONTEXT]
Database State:
${JSON.stringify(contextSummary, null, 2)}
[END SYSTEM DATA CONTEXT]

User Question: ${messages[messages.length - 1]?.content || ""}`,
          },
        ],
      },
    ],
    config: {
      systemInstruction,
      ...(useHighThinking ? { thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } } : {}),
    },
  });

  const replyText = response.text || "I was unable to analyze the data for that inquiry.";

  // Extract cited IDs
  const citedInvestigationIds: string[] = [];
  for (const inv of investigations) {
    if (replyText.includes(inv.id)) {
      citedInvestigationIds.push(inv.id);
    }
  }

  const citedExperimentIds: string[] = [];
  for (const exp of experiments) {
    if (replyText.includes(exp.id)) {
      citedExperimentIds.push(exp.id);
    }
  }

  const sourcesReferenced: string[] = [];
  for (const ev of evidence) {
    if (replyText.toLowerCase().includes(ev.name.toLowerCase().slice(0, 15))) {
      sourcesReferenced.push(ev.name);
    }
  }

  return {
    reply: replyText,
    citedInvestigationIds,
    citedExperimentIds,
    sourcesReferenced,
  };
}
