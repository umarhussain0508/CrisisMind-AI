import { EvaluationBenchmarkItem, EvaluationReport, VerdictType } from "../src/types/index.js";

export const BENCHMARK_DATASET: EvaluationBenchmarkItem[] = [
  {
    id: "eval_01",
    claim: "Scientists have predicted a 9.2 magnitude earthquake in California at 3:00 PM tomorrow.",
    domain: "Earthquake Rumors",
    groundTruthVerdict: "FALSE",
    context: "Viral TikTok and WhatsApp audio claiming seismologists privately alerted government officials.",
    referenceSource: "US Geological Survey (USGS) Earthquake Hazards Clarification Bulletin.",
  },
  {
    id: "eval_02",
    claim: "Drinking 100% pure chlorine dioxide solution prevents viral respiratory transmission during epidemics.",
    domain: "Health Hazards",
    groundTruthVerdict: "FALSE",
    context: "Substack article and Telegram channels selling industrial mineral solutions as miracle cures.",
    referenceSource: "World Health Organization & FDA Public Health Warning #2024-09.",
  },
  {
    id: "eval_03",
    claim: "The Grand River Crossing remains open and safe for designated emergency response vehicles.",
    domain: "Infrastructure & Floods",
    groundTruthVerdict: "TRUE",
    context: "Department of Transportation official press release with real-time bridge sensor data.",
    referenceSource: "State Department of Transportation Inspection Bureau.",
  },
  {
    id: "eval_04",
    claim: "Opening all house windows during a Category 4 hurricane equalizes indoor air pressure to prevent roof collapse.",
    domain: "Severe Weather",
    groundTruthVerdict: "FALSE",
    context: "Decades-old folkloric hurricane myth recirculated on Facebook during hurricane warnings.",
    referenceSource: "National Oceanic and Atmospheric Administration (NOAA) / FEMA Hurricane Safety Manual.",
  },
  {
    id: "eval_05",
    claim: "FEMA is confiscating civilian emergency supplies and diverting donation trucks at state borders.",
    domain: "Relief Disinformation",
    groundTruthVerdict: "FALSE",
    context: "Conspiracy video posted during flood disaster relief operations.",
    referenceSource: "FEMA Rumor Response & American Red Cross Dispatch.",
  },
  {
    id: "eval_06",
    claim: "Flash flooding in mountainous canyons can occur even when no rain is falling directly overhead at your location.",
    domain: "Hydrology & Public Safety",
    groundTruthVerdict: "TRUE",
    context: "Park service advisory regarding upstream storm runoffs travelling miles down dry riverbeds.",
    referenceSource: "National Weather Service Flash Flood Preparedness Guide.",
  },
  {
    id: "eval_07",
    claim: "An unofficial viral GoFundMe link managed by 'DisasterReliefGlobalHQ' is the sole authorized fund for city flood victims.",
    domain: "Relief Fraud",
    groundTruthVerdict: "FALSE",
    context: "Newly registered crowdfunding account using stolen emergency service logos.",
    referenceSource: "State Attorney General Consumer Protection Alert.",
  },
  {
    id: "eval_08",
    claim: "Wildfire smoke masks labeled N95 effectively filter harmful microscopic particulate matter (PM2.5) when fitted properly.",
    domain: "Wildfire Safety",
    groundTruthVerdict: "TRUE",
    context: "Public health guidance issued during regional wildfire inversion events.",
    referenceSource: "CDC NIOSH Certified Respiratory Protection Guide.",
  },
  {
    id: "eval_09",
    claim: "A secret military acoustic beam weapon triggered the recent coastal landslide.",
    domain: "Geotechnical Rumors",
    groundTruthVerdict: "FALSE",
    context: "YouTube influencer claiming radar anomalies caused sudden hillside slippage after 3 weeks of continuous rain.",
    referenceSource: "Geological Survey Hydrologic Soil Saturation Report.",
  },
  {
    id: "eval_10",
    claim: "The city municipal water grid has been 100% contaminated with industrial cyanide following river flooding.",
    domain: "Municipal Utilities",
    groundTruthVerdict: "FALSE",
    context: "Unverified SMS warning attributing alert to local hospital staff.",
    referenceSource: "Municipal Water Reclamation Authority Hourly Lab Diagnostics.",
  },
  {
    id: "eval_11",
    claim: "Certain high-elevation secondary roads in District 4 experienced localized culvert washouts and are closed.",
    domain: "Road Conditions",
    groundTruthVerdict: "MOSTLY TRUE",
    context: "Local council alert confirming road closure on Route 42 while Route 40 remains navigable.",
    referenceSource: "County Highway Maintenance Log #882.",
  },
  {
    id: "eval_12",
    claim: "An earthquake swarm under Yellowstone caldera means a supervolcanic eruption is imminent this weekend.",
    domain: "Geological Hazards",
    groundTruthVerdict: "MISLEADING",
    context: "Sensationalist tabloid taking regular microseismic activity out of context.",
    referenceSource: "Yellowstone Volcano Observatory (USGS Monthly Status).",
  },
  {
    id: "eval_13",
    claim: "A new unidentified biological pathogen is causing spontaneous blindness in 80% of affected patients.",
    domain: "Epidemic Rumors",
    groundTruthVerdict: "FALSE",
    context: "Fabricated audio memo imitating a nurse from an unnamed university clinic.",
    referenceSource: "National Public Health Institute Epidemiological Surveillance.",
  },
  {
    id: "eval_14",
    claim: "Local cellular towers may experience intermittent congestion during peak evacuation hours.",
    domain: "Communications",
    groundTruthVerdict: "TRUE",
    context: "Telecommunications regulatory advisory recommending text messaging over voice calls in emergencies.",
    referenceSource: "Federal Communications Commission (FCC) Emergency Communications Guide.",
  },
  {
    id: "eval_15",
    claim: "A viral photo depicts sharks swimming down flooded highway ramps in the city center.",
    domain: "Flood Hoaxes",
    groundTruthVerdict: "FALSE",
    context: "Recycled satirical shark-on-highway composite image that has appeared in every hurricane since 2011.",
    referenceSource: "Snopes / Reuters Fact Check Archives.",
  },
  {
    id: "eval_16",
    claim: "Applying raw butter to acute second-degree wildfire burns soothes tissue and accelerates healing.",
    domain: "Burn First Aid",
    groundTruthVerdict: "FALSE",
    context: "Viral traditional folk remedy circulating on Pinterest and parenting forums.",
    referenceSource: "American Burn Association Emergency Care Protocols.",
  },
  {
    id: "eval_17",
    claim: "Emergency shelters accept companion pets when crated according to municipal emergency protocols.",
    domain: "Emergency Evacuation",
    groundTruthVerdict: "MOSTLY TRUE",
    context: "Civil protection guidance under the PETS Act (Pets Evacuation and Transportation Standards).",
    referenceSource: "FEMA & Humane Society Emergency Pet Protocol.",
  },
  {
    id: "eval_18",
    claim: "A secret meeting between council leaders agreed to intentionally flood the lower district to save downtown villas.",
    domain: "Disaster Politics",
    groundTruthVerdict: "FALSE",
    context: "Anonymous blog post inciting civil unrest outside city hall.",
    referenceSource: "Civil Engineering Hydrology Basin Drainage Blueprint.",
  },
  {
    id: "eval_19",
    claim: "Volunteers entering disaster zones without personal flotation devices risk severe secondary hypothermia.",
    domain: "First Responder Safety",
    groundTruthVerdict: "TRUE",
    context: "Search and Rescue Volunteer Training Advisory.",
    referenceSource: "National Search and Rescue Committee Guidelines.",
  },
  {
    id: "eval_20",
    claim: "An anonymous text claims power will be cut permanently to the entire state for 3 months.",
    domain: "Critical Infrastructure",
    groundTruthVerdict: "FALSE",
    context: "Chain message attempting to cause panic runs on fuel stations.",
    referenceSource: "State Electric Reliability Council Public Release.",
  },
];

export function computeEvaluationMetrics(
  evaluatedItems: (EvaluationBenchmarkItem & { predictedVerdict: VerdictType; citationFound: boolean })[]
): EvaluationReport {
  const classes: VerdictType[] = [
    "TRUE",
    "FALSE",
    "MOSTLY TRUE",
    "PARTLY TRUE",
    "MISLEADING",
    "OUT OF CONTEXT",
    "UNVERIFIED",
    "INSUFFICIENT EVIDENCE",
  ];

  // Initialize confusion matrix
  const confusionMatrix: Record<string, Record<string, number>> = {};
  for (const c1 of classes) {
    confusionMatrix[c1] = {};
    for (const c2 of classes) {
      confusionMatrix[c1][c2] = 0;
    }
  }

  let totalCorrect = 0;
  let citationsFoundCount = 0;
  let unsupportedCount = 0;
  let abstentionCount = 0;

  for (const item of evaluatedItems) {
    const actual = item.groundTruthVerdict;
    const pred = item.predictedVerdict;

    if (!confusionMatrix[actual]) confusionMatrix[actual] = {};
    confusionMatrix[actual][pred] = (confusionMatrix[actual][pred] || 0) + 1;

    if (actual === pred) {
      totalCorrect++;
      item.isCorrect = true;
    } else {
      item.isCorrect = false;
    }

    if (item.citationFound) citationsFoundCount++;
    if (pred === "UNVERIFIED" || pred === "INSUFFICIENT EVIDENCE") abstentionCount++;
    if (pred !== "UNVERIFIED" && !item.citationFound) unsupportedCount++;
  }

  const n = evaluatedItems.length;
  const accuracy = n > 0 ? Math.round((totalCorrect / n) * 1000) / 1000 : 0;
  const citationCoverage = n > 0 ? Math.round((citationsFoundCount / n) * 1000) / 1000 : 0;
  const unsupportedRate = n > 0 ? Math.round((unsupportedCount / n) * 1000) / 1000 : 0;
  const abstentionRate = n > 0 ? Math.round((abstentionCount / n) * 1000) / 1000 : 0;

  // Calculate Precision, Recall, F1 per class
  const classMetrics: Record<string, { precision: number; recall: number; f1: number; support: number }> = {};
  let sumPrecision = 0;
  let sumRecall = 0;
  let sumF1 = 0;
  let activeClasses = 0;

  for (const c of classes) {
    // True Positives
    const tp = confusionMatrix[c]?.[c] || 0;

    // False Positives (predicted as c, but actually not c)
    let fp = 0;
    for (const actual of classes) {
      if (actual !== c) {
        fp += confusionMatrix[actual]?.[c] || 0;
      }
    }

    // False Negatives (actually c, but predicted as not c)
    let fn = 0;
    for (const pred of classes) {
      if (pred !== c) {
        fn += confusionMatrix[c]?.[pred] || 0;
      }
    }

    const support = tp + fn;
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    classMetrics[c] = {
      precision: Math.round(precision * 1000) / 1000,
      recall: Math.round(recall * 1000) / 1000,
      f1: Math.round(f1 * 1000) / 1000,
      support,
    };

    if (support > 0) {
      sumPrecision += precision;
      sumRecall += recall;
      sumF1 += f1;
      activeClasses++;
    }
  }

  const macroPrecision = activeClasses > 0 ? Math.round((sumPrecision / activeClasses) * 1000) / 1000 : 0;
  const macroRecall = activeClasses > 0 ? Math.round((sumRecall / activeClasses) * 1000) / 1000 : 0;
  const macroF1 = activeClasses > 0 ? Math.round((sumF1 / activeClasses) * 1000) / 1000 : 0;

  return {
    id: `eval_rep_${Date.now()}`,
    timestamp: new Date().toISOString(),
    datasetName: "WAICY Crisis Claims Benchmark (v2.6)",
    totalClaims: n,
    accuracy,
    macroPrecision,
    macroRecall,
    macroF1,
    citationCoverage,
    unsupportedRate,
    abstentionRate,
    confusionMatrix,
    classMetrics,
    items: evaluatedItems,
  };
}
