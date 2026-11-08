import fs from "fs";
import path from "path";
import {
  EvaluationReport,
  EvidenceSource,
  Investigation,
  SimulationConfig,
  SimulationResult,
  StrategyExperiment,
} from "../src/types/index.js";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

interface DatabaseSchema {
  investigations: Investigation[];
  simulations: SimulationResult[];
  experiments: StrategyExperiment[];
  evidenceLibrary: EvidenceSource[];
  evaluationReports: EvaluationReport[];
}

function getInitialData(): DatabaseSchema {
  // Pre-seed high quality realistic crisis research datasets
  const initialEvidence: EvidenceSource[] = [
    {
      id: "ev_1",
      name: "National Disaster Management Authority (NDMA)",
      url: "https://ndma.gov/bulletins/monsoon-flood-alert-092",
      sourceType: "official_agency",
      publicationDate: "2026-11-08T06:30:00Z",
      retrievalDate: "2026-11-08T07:15:00Z",
      excerpt:
        "NDMA Situation Report #14: River levels at Central Valley Basin remain within elevated amber alert thresholds. Major infrastructure, including the Grand River Crossing and Metro Suspension Bridge, has been inspected by structural corps engineers and is deemed structurally sound and open for authorized vehicle traffic.",
      stance: "contradicting",
      reliabilityRating: "high",
      limitations: "Covers designated federal highways and primary municipal bridges; local unpaved culverts remain under monitoring.",
    },
    {
      id: "ev_2",
      name: "State Department of Transportation Inspection Bureau",
      url: "https://dot.state.gov/traffic/bridge-monitoring-live",
      sourceType: "official_agency",
      publicationDate: "2026-11-08T07:00:00Z",
      retrievalDate: "2026-11-08T07:18:00Z",
      excerpt:
        "Live sensor telemetry on Grand River Crossing reports normal strain gauge tolerances. Rumors circulating on messaging networks claiming catastrophic deck failure are false.",
      stance: "contradicting",
      reliabilityRating: "high",
      limitations: "Direct telemetry available on 18 core arterial bridges.",
    },
    {
      id: "ev_3",
      name: "Global FactCheck Alliance - Emergency Dispatch",
      url: "https://factcheck.org/emergency/debunk-valley-bridge-collapse",
      sourceType: "fact_checker",
      publicationDate: "2026-11-08T07:10:00Z",
      retrievalDate: "2026-11-08T07:22:00Z",
      excerpt:
        "Viral video showing collapsed steel spans with floodwaters is misattributed footage from a 2019 cyclone in another continent, recycled with a local audio voiceover.",
      stance: "contradicting",
      reliabilityRating: "high",
      limitations: "Reverse image verification matches 2019 archive video footage.",
    },
    {
      id: "ev_4",
      name: "Geological Survey & Seismology Network",
      url: "https://earthquake.usgs.gov/clarifications/rumor-prediction-debunk",
      sourceType: "scientific_body",
      publicationDate: "2026-10-15T12:00:00Z",
      retrievalDate: "2026-11-08T07:20:00Z",
      excerpt:
        "Neither USGS nor any other scientists have ever predicted a major earthquake. We do not know how and we do not expect to know how in the foreseeable future. Claims of a '9.0 magnitude quake guaranteed at 3:00 PM tomorrow' have no scientific validity.",
      stance: "contradicting",
      reliabilityRating: "high",
      limitations: "Statistical aftershock probability models exist, but exact deterministic time predictions are impossible with current geophysical science.",
    },
    {
      id: "ev_5",
      name: "World Health Organization Outbreak Factsheet",
      url: "https://who.int/emergencies/respiratory-clarifications-2026",
      sourceType: "scientific_body",
      publicationDate: "2026-09-12T08:00:00Z",
      retrievalDate: "2026-11-08T07:25:00Z",
      excerpt:
        "No evidence supports claims that concentrated saline inhalation or industrial bleach mists neutralize viral infection. Such practices present acute respiratory mucosal hazard.",
      stance: "contradicting",
      reliabilityRating: "high",
      limitations: "Peer-reviewed medical trials consensus.",
    },
  ];

  const initialInvestigations: Investigation[] = [
    {
      id: "inv_flood_bridge_01",
      title: "Viral Alert: Grand River Metro Bridge Collapse Rumor",
      originalInput:
        "BREAKING EMERGENCY! The Grand River Bridge has just collapsed due to raging flash floods! Thousands trapped on East Bank! NDMA not disclosing the truth. Evacuate immediately via North route!",
      inputType: "text",
      submittedAt: "2026-11-08T07:15:00Z",
      mainClaim: "The Grand River Bridge collapsed due to flash floods and emergency authorities are concealing it",
      claimType: "emergency",
      location: "Central Valley Basin, Grand River Crossing",
      entities: ["Grand River Bridge", "NDMA", "East Bank"],
      timeSensitivity: "critical",
      potentialRisk: "Severe traffic gridlock, panic evacuation into flood channels, resource diversion from real rescue operations.",
      extractedClaims: [
        {
          id: "ec_1",
          statement: "Grand River Bridge has collapsed",
          claimType: "infrastructure",
          location: "Central Valley",
          entities: ["Grand River Bridge"],
          timeSensitivity: "critical",
          requiresVerification: true,
          potentialRisk: "public panic and route choking",
        },
        {
          id: "ec_2",
          statement: "NDMA is actively concealing disaster damage",
          claimType: "emergency",
          location: "Central Valley",
          entities: ["NDMA"],
          timeSensitivity: "high",
          requiresVerification: true,
          potentialRisk: "erosion of institutional trust",
        },
      ],
      verdict: "FALSE",
      confidenceScore: 0.94,
      explanation:
        "Both the National Disaster Management Authority (NDMA) and State Department of Transportation have verified through physical structural inspection and real-time strain sensors that the Grand River Crossing is intact and operational. Furthermore, reverse image analysis by fact-checkers confirmed that the video attached to viral messaging is recycled footage from a 2019 overseas cyclone.",
      contextAnalysis:
        "During high-stress flood events, fear-driven rumor amplification peaks within the first 90 minutes. Citizens forward unverified warnings out of an altruistic desire to protect loved ones, unaware of the video's false origin.",
      evidenceLimitations: [
        "Secondary rural bridge approaches are subject to water overtopping, though the main crossing is safe.",
        "Social media platforms experienced a 400% reshare spike before official debunk statements were issued.",
      ],
      suggestedSteps: [
        "Issue real-time broadcast via Emergency SMS and trusted community radio.",
        "Deploy live webcam feed of the bridge to provide visual refutation.",
        "Partner with trusted neighborhood coordinators to dispel localized evacuation panic.",
      ],
      evidenceSources: [initialEvidence[0], initialEvidence[1], initialEvidence[2]],
    },
  ];

  const sampleFloodConfig: SimulationConfig = {
    id: "sim_cfg_flood_01",
    name: "Scenario A: Flood Emergency Bridge Collapse",
    crisisType: "flood",
    description:
      "A false viral message claims the central bridge connecting the East and West districts has collapsed, threatening to trigger stampedes toward flooded lowlands.",
    misinformationMessage:
      "URGENT: Grand River Bridge has collapsed! Floods rising fast. East district residents must flee now!",
    populationSize: 120,
    numGroups: 4,
    socialDensity: 0.08,
    initialMisinfoPrevalence: 0.05,
    mediaInfluence: 0.25,
    officialSpeed: 4,
    seed: 1337,
    interventions: [
      {
        id: "int_1",
        type: "official_announcement",
        name: "Emergency Broadcast Notice",
        enabled: true,
        activationStep: 3,
        intensity: 0.85,
        coverage: 0.75,
        description: "Direct official emergency SMS clarifying bridge integrity with live verification link.",
      },
      {
        id: "int_2",
        type: "trusted_messenger",
        name: "Community Leader Network",
        enabled: true,
        activationStep: 2,
        intensity: 0.9,
        coverage: 0.6,
        description: "Engage verified neighborhood chiefs and local doctors to address doubts in district chats.",
      },
    ],
  };

  return {
    investigations: initialInvestigations,
    simulations: [],
    experiments: [],
    evidenceLibrary: initialEvidence,
    evaluationReports: [],
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error("Failed to parse db.json, re-initializing:", err);
        this.data = getInitialData();
        this.save();
      }
    } else {
      this.data = getInitialData();
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to write db.json:", err);
    }
  }

  // Investigations
  getInvestigations(): Investigation[] {
    return [...this.data.investigations];
  }

  getInvestigation(id: string): Investigation | undefined {
    return this.data.investigations.find((i) => i.id === id);
  }

  saveInvestigation(inv: Investigation): Investigation {
    const idx = this.data.investigations.findIndex((i) => i.id === inv.id);
    if (idx >= 0) {
      this.data.investigations[idx] = inv;
    } else {
      this.data.investigations.unshift(inv);
    }
    // Also add any new evidence sources to the evidence library
    for (const source of inv.evidenceSources) {
      if (!this.data.evidenceLibrary.some((e) => e.url === source.url || e.id === source.id)) {
        this.data.evidenceLibrary.unshift(source);
      }
    }
    this.save();
    return inv;
  }

  // Simulations
  getSimulations(): SimulationResult[] {
    return [...this.data.simulations];
  }

  getSimulation(id: string): SimulationResult | undefined {
    return this.data.simulations.find((s) => s.id === id);
  }

  saveSimulation(sim: SimulationResult): SimulationResult {
    const idx = this.data.simulations.findIndex((s) => s.id === sim.id);
    if (idx >= 0) {
      this.data.simulations[idx] = sim;
    } else {
      this.data.simulations.unshift(sim);
    }
    this.save();
    return sim;
  }

  // Experiments
  getExperiments(): StrategyExperiment[] {
    return [...this.data.experiments];
  }

  getExperiment(id: string): StrategyExperiment | undefined {
    return this.data.experiments.find((e) => e.id === id);
  }

  saveExperiment(exp: StrategyExperiment): StrategyExperiment {
    const idx = this.data.experiments.findIndex((e) => e.id === exp.id);
    if (idx >= 0) {
      this.data.experiments[idx] = exp;
    } else {
      this.data.experiments.unshift(exp);
    }
    this.save();
    return exp;
  }

  // Evidence
  getEvidence(): EvidenceSource[] {
    return [...this.data.evidenceLibrary];
  }

  addEvidence(source: EvidenceSource): EvidenceSource {
    if (!this.data.evidenceLibrary.some((e) => e.id === source.id || e.url === source.url)) {
      this.data.evidenceLibrary.unshift(source);
      this.save();
    }
    return source;
  }

  // Evaluation Reports
  getEvaluationReports(): EvaluationReport[] {
    return [...this.data.evaluationReports];
  }

  saveEvaluationReport(report: EvaluationReport): EvaluationReport {
    this.data.evaluationReports.unshift(report);
    this.save();
    return report;
  }

  // Overview metrics aggregated dynamically from stored data
  getOverviewMetrics() {
    const investigations = this.data.investigations;
    const simulations = this.data.simulations;
    const experiments = this.data.experiments;
    const evidence = this.data.evidenceLibrary;

    let totalClaimsAnalyzed = 0;
    for (const inv of investigations) {
      totalClaimsAnalyzed += (inv.extractedClaims?.length || 1);
    }

    let avgPeakExposure = 0;
    let avgCorrectionRate = 0;
    let avgInterventionEffectiveness = 0;

    if (simulations.length > 0) {
      let sumExp = 0;
      let sumCorr = 0;
      for (const s of simulations) {
        sumExp += s.summary.peakExposureFraction;
        sumCorr += s.summary.finalVerifiedFraction;
      }
      avgPeakExposure = Math.round((sumExp / simulations.length) * 100);
      avgCorrectionRate = Math.round((sumCorr / simulations.length) * 100);
    }

    if (experiments.length > 0) {
      let sumEff = 0;
      let count = 0;
      for (const exp of experiments) {
        const baseline = exp.runs[0];
        const bestRun = exp.runs.slice(1).sort((a, b) => a.peakExposure - b.peakExposure)[0];
        if (baseline && bestRun) {
          const reduction = Math.max(0, (baseline.peakExposure - bestRun.peakExposure) / (baseline.peakExposure || 1));
          sumEff += reduction;
          count++;
        }
      }
      if (count > 0) {
        avgInterventionEffectiveness = Math.round((sumEff / count) * 100);
      }
    }

    return {
      totalInvestigations: investigations.length,
      claimsAnalyzed: totalClaimsAnalyzed,
      simulationExperimentsCompleted: simulations.length + experiments.length,
      averageMisinformationExposure: avgPeakExposure,
      averageCorrectionRate: avgCorrectionRate,
      interventionEffectiveness: avgInterventionEffectiveness,
      evidenceSourcesCollected: evidence.length,
    };
  }
}

export const db = new Database();
