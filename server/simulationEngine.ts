import {
  AgentArchetype,
  AgentNode,
  AgentState,
  InterventionConfig,
  NetworkEdge,
  SimulationConfig,
  SimulationEvent,
  StepMetric,
} from "../src/types/index.js";

// Pseudo-Random Number Generator (Mulberry32) for reproducible scientific simulations
export function createRng(seed: number) {
  let s = Math.floor(seed) >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ARCHETYPE_PROFILES: Record<
  AgentArchetype,
  {
    baseTrust: number;
    baseSkepticism: number;
    baseSharing: number;
    baseLiteracy: number;
    weight: number;
    title: string;
  }
> = {
  high_trust_sharer: { baseTrust: 0.85, baseSkepticism: 0.15, baseSharing: 0.8, baseLiteracy: 0.35, weight: 18, title: "High-Trust Citizen" },
  skeptical_citizen: { baseTrust: 0.3, baseSkepticism: 0.85, baseSharing: 0.25, baseLiteracy: 0.75, weight: 15, title: "Critical Inquirer" },
  community_leader: { baseTrust: 0.65, baseSkepticism: 0.6, baseSharing: 0.5, baseLiteracy: 0.8, weight: 6, title: "Community Leader" },
  local_journalist: { baseTrust: 0.4, baseSkepticism: 0.8, baseSharing: 0.6, baseLiteracy: 0.9, weight: 4, title: "Local Journalist" },
  health_professional: { baseTrust: 0.5, baseSkepticism: 0.8, baseSharing: 0.45, baseLiteracy: 0.95, weight: 5, title: "Health Professional" },
  emergency_responder: { baseTrust: 0.6, baseSkepticism: 0.75, baseSharing: 0.5, baseLiteracy: 0.9, weight: 5, title: "Emergency Responder" },
  influencer: { baseTrust: 0.7, baseSkepticism: 0.3, baseSharing: 0.9, baseLiteracy: 0.5, weight: 5, title: "Social Influencer" },
  fact_checker: { baseTrust: 0.35, baseSkepticism: 0.95, baseSharing: 0.4, baseLiteracy: 0.98, weight: 4, title: "Fact Checker" },
  official: { baseTrust: 0.55, baseSkepticism: 0.7, baseSharing: 0.4, baseLiteracy: 0.88, weight: 4, title: "Public Official" },
  ordinary_citizen: { baseTrust: 0.55, baseSkepticism: 0.45, baseSharing: 0.45, baseLiteracy: 0.55, weight: 34, title: "Resident" },
};

export function generateSimulationPopulation(config: SimulationConfig): {
  agents: AgentNode[];
  edges: NetworkEdge[];
} {
  const rng = createRng(config.seed || 42);
  const n = Math.max(20, Math.min(500, config.populationSize));
  const numGroups = Math.max(2, Math.min(8, config.numGroups || 4));
  const groupNames = Array.from({ length: numGroups }, (_, i) => `District ${String.fromCharCode(65 + i)}`);

  // Build weighted archetype selection pool
  const archetypes: AgentArchetype[] = [];
  for (const [arch, profile] of Object.entries(ARCHETYPE_PROFILES)) {
    for (let i = 0; i < profile.weight; i++) {
      archetypes.push(arch as AgentArchetype);
    }
  }

  const agents: AgentNode[] = [];
  for (let i = 0; i < n; i++) {
    const arch = archetypes[Math.floor(rng() * archetypes.length)];
    const profile = ARCHETYPE_PROFILES[arch];
    const group = groupNames[Math.floor(rng() * groupNames.length)];

    // Add mild individual variance (+-15%)
    const trustLevel = Math.max(0.05, Math.min(0.98, profile.baseTrust + (rng() - 0.5) * 0.2));
    const skepticism = Math.max(0.05, Math.min(0.98, profile.baseSkepticism + (rng() - 0.5) * 0.2));
    const sharingTendency = Math.max(0.05, Math.min(0.98, profile.baseSharing + (rng() - 0.5) * 0.2));
    const infoLiteracy = Math.max(0.05, Math.min(0.98, profile.baseLiteracy + (rng() - 0.5) * 0.15));

    // Distribute positions in 2D space clustered around groups for network layout
    const groupIdx = groupNames.indexOf(group);
    const angle = (groupIdx / numGroups) * 2 * Math.PI;
    const centerRadius = 260;
    const cx = 400 + Math.cos(angle) * centerRadius;
    const cy = 300 + Math.sin(angle) * centerRadius;
    const r = rng() * 110;
    const theta = rng() * 2 * Math.PI;

    agents.push({
      id: `agent_${i + 1}`,
      name: `${profile.title} #${i + 1}`,
      archetype: arch,
      group,
      state: "UNEXPOSED",
      trustLevel,
      skepticism,
      sharingTendency,
      infoLiteracy,
      connections: [],
      x: Math.round(cx + Math.cos(theta) * r),
      y: Math.round(cy + Math.sin(theta) * r),
    });
  }

  // Create network edges: Small-World (Watts-Strogatz variant with community homophily)
  // Higher probability of connecting within the same group, lower probability across groups
  const edges: NetworkEdge[] = [];
  const edgeSet = new Set<string>();

  const baseDensity = Math.max(0.02, Math.min(0.2, config.socialDensity || 0.08));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const sameGroup = agents[i].group === agents[j].group;
      const prob = sameGroup ? baseDensity * 3.5 : baseDensity * 0.4;

      // Influencers have extra reach
      const isInfluencer =
        agents[i].archetype === "influencer" ||
        agents[j].archetype === "influencer" ||
        agents[i].archetype === "community_leader" ||
        agents[j].archetype === "community_leader";

      const finalProb = isInfluencer ? prob * 2.2 : prob;

      if (rng() < finalProb) {
        agents[i].connections.push(agents[j].id);
        agents[j].connections.push(agents[i].id);
        const edgeKey = `${agents[i].id}-${agents[j].id}`;
        edgeSet.add(edgeKey);
        edges.push({ source: agents[i].id, target: agents[j].id });
      }
    }
  }

  // Ensure minimum connectivity: each agent should have at least 1 neighbor
  for (let i = 0; i < n; i++) {
    if (agents[i].connections.length === 0) {
      // Connect to closest neighbor in the same group or random
      const sameGroupCandidates = agents.filter((a, idx) => idx !== i && a.group === agents[i].group);
      const target = sameGroupCandidates.length > 0
        ? sameGroupCandidates[Math.floor(rng() * sameGroupCandidates.length)]
        : agents[(i + 1) % n];

      agents[i].connections.push(target.id);
      target.connections.push(agents[i].id);
      edges.push({ source: agents[i].id, target: target.id });
    }
  }

  // Seed initial misinformation exposure (patient zeroes)
  const initialCount = Math.max(1, Math.round(n * (config.initialMisinfoPrevalence || 0.05)));
  // Prefer high trust or influencers for initial seed if available
  const sortedBySharer = [...agents].sort((a, b) => b.sharingTendency - a.sharingTendency);
  for (let k = 0; k < initialCount; k++) {
    const seedAgent = sortedBySharer[k];
    seedAgent.state = "SHARING_MISINFO";
    seedAgent.exposureStep = 0;
    seedAgent.reactionQuote = "Did you see this alert? Sharing right away!";
  }

  return { agents, edges };
}

export function executeSimulationStep(
  currentStep: number,
  agents: AgentNode[],
  config: SimulationConfig,
  rng: () => number
): {
  updatedAgents: AgentNode[];
  stepEvents: SimulationEvent[];
  metric: StepMetric;
} {
  const agentMap = new Map<string, AgentNode>();
  for (const a of agents) {
    agentMap.set(a.id, { ...a, connections: [...a.connections] });
  }

  const stepEvents: SimulationEvent[] = [];
  const nextStates = new Map<string, AgentState>();

  // Active interventions at this step
  const activeInterventions = (config.interventions || []).filter(
    (int) => int.enabled && currentStep >= int.activationStep
  );

  // Compute intervention modifier effects
  let warningReduction = 0;
  let factCheckDebunkPower = 0;
  let trustedMessengerBoost = 0;
  let delaySuppression = 0;

  for (const int of activeInterventions) {
    const coverage = int.coverage;
    const intensity = int.intensity;

    if (
      int.type === "share_warning_prompt" ||
      int.type === "credibility_label" ||
      int.type === "info_literacy_nudge"
    ) {
      warningReduction += intensity * coverage * 0.45;
    } else if (
      int.type === "official_announcement" ||
      int.type === "fact_check_notification" ||
      int.type === "expert_broadcast"
    ) {
      factCheckDebunkPower += intensity * coverage * 0.55;
    } else if (
      int.type === "trusted_messenger" ||
      int.type === "community_correction"
    ) {
      trustedMessengerBoost += intensity * coverage * 0.5;
    } else if (int.type === "reshare_delay" || int.type === "multi_source_prompt") {
      delaySuppression += intensity * coverage * 0.4;
    }
  }

  // Pass 1: Determine transmissions from SHARING_MISINFO and CORRECTING agents
  for (const [id, agent] of agentMap.entries()) {
    nextStates.set(id, agent.state);

    if (agent.state === "UNEXPOSED") {
      // Count sharing neighbors
      let sharingNeighbors = 0;
      let correctingNeighbors = 0;

      for (const connId of agent.connections) {
        const neighbor = agentMap.get(connId);
        if (neighbor?.state === "SHARING_MISINFO") sharingNeighbors++;
        if (neighbor?.state === "CORRECTING") correctingNeighbors++;
      }

      // External media or official broadcast influence
      const externalExposure = rng() < (config.mediaInfluence || 0.1) * 0.15;

      if (sharingNeighbors > 0 || externalExposure) {
        // Exposed to misinformation
        // Probability of exposure depends on number of sharing neighbors
        const exposureProb = 1 - Math.pow(1 - 0.4, Math.max(1, sharingNeighbors));
        if (rng() < exposureProb || externalExposure) {
          nextStates.set(id, "EXPOSED");
          stepEvents.push({
            step: currentStep,
            type: "exposure",
            agentId: agent.id,
            agentName: agent.name,
            archetype: agent.archetype,
            description: `Encountered crisis rumor via ${sharingNeighbors} peer(s).`,
          });
        }
      } else if (correctingNeighbors > 0 && factCheckDebunkPower > 0.2) {
        // Pre-bunked: agent learns verified facts before ever seeing the rumor!
        nextStates.set(id, "VERIFIED_SAFE");
        stepEvents.push({
          step: currentStep,
          type: "intervention",
          agentId: agent.id,
          agentName: agent.name,
          archetype: agent.archetype,
          description: `Pre-bunked by community fact-checker. Immune to misinformation.`,
        });
      }
    } else if (agent.state === "EXPOSED") {
      // Agent evaluates the claim
      // Mathematical decision model:
      // P(share) = sharingTendency * (1 - skepticism * 0.7) * (1 - warningReduction) * (1 - delaySuppression)
      // P(question) = skepticism * infoLiteracy * (1 + trustedMessengerBoost)
      // P(correct) = fact_checker/leader/responder/journalist bonus or high literacy + active fact-checking

      const isTruthDefender =
        agent.archetype === "fact_checker" ||
        agent.archetype === "emergency_responder" ||
        agent.archetype === "local_journalist" ||
        agent.archetype === "health_professional";

      let pShare = agent.sharingTendency * (1 - agent.skepticism * 0.65);
      pShare = Math.max(0.02, pShare * (1 - Math.min(0.85, warningReduction + delaySuppression)));

      let pQuestion = agent.skepticism * agent.infoLiteracy * 1.2;
      pQuestion = Math.min(0.9, pQuestion * (1 + trustedMessengerBoost));

      let pCorrect = (agent.infoLiteracy * 0.4 + factCheckDebunkPower * 0.6);
      if (isTruthDefender) pCorrect += 0.4;

      const roll = rng();

      if (roll < pShare) {
        nextStates.set(id, "SHARING_MISINFO");
        agent.exposureStep = currentStep;
        stepEvents.push({
          step: currentStep,
          type: "share",
          agentId: agent.id,
          agentName: agent.name,
          archetype: agent.archetype,
          description: `Amplified unverified claim to ${agent.connections.length} peers.`,
          quote: getReactionQuote(agent.archetype, "share"),
        });
      } else if (roll < pShare + pQuestion) {
        nextStates.set(id, "QUESTIONING");
        stepEvents.push({
          step: currentStep,
          type: "question",
          agentId: agent.id,
          agentName: agent.name,
          archetype: agent.archetype,
          description: `Skeptical. Pausing to check official confirmation.`,
          quote: getReactionQuote(agent.archetype, "question"),
        });
      } else if (rng() < pCorrect) {
        nextStates.set(id, "CORRECTING");
        stepEvents.push({
          step: currentStep,
          type: "correction",
          agentId: agent.id,
          agentName: agent.name,
          archetype: agent.archetype,
          description: `Disproved rumor and shared verified notice to network.`,
          quote: getReactionQuote(agent.archetype, "correct"),
        });
      } else {
        // Ignored / silently debunked
        nextStates.set(id, "VERIFIED_SAFE");
      }
    } else if (agent.state === "SHARING_MISINFO") {
      // May receive corrective signals from neighbors or official broadcasts
      let correctingNeighbors = 0;
      for (const connId of agent.connections) {
        const neighbor = agentMap.get(connId);
        if (neighbor?.state === "CORRECTING") correctingNeighbors++;
      }

      // Correction probability:
      // Depends on correcting neighbors, active official announcement, and agent skepticism
      const correctionChance =
        (correctingNeighbors * 0.35 + factCheckDebunkPower * 0.5 + trustedMessengerBoost * 0.4) *
        (0.3 + agent.infoLiteracy * 0.7);

      if (rng() < Math.min(0.9, correctionChance)) {
        nextStates.set(id, "CORRECTING");
        stepEvents.push({
          step: currentStep,
          type: "correction",
          agentId: agent.id,
          agentName: agent.name,
          archetype: agent.archetype,
          description: `Corrected earlier post after receiving verified debunk.`,
          quote: "I checked the official update—this rumor is FALSE. Please do not repost.",
        });
      }
    } else if (agent.state === "QUESTIONING") {
      // Transition to VERIFIED_SAFE or CORRECTING
      if (factCheckDebunkPower > 0.2 || rng() < agent.infoLiteracy * 0.8) {
        const willAdvocate = agent.archetype !== "ordinary_citizen" || rng() < 0.35;
        nextStates.set(id, willAdvocate ? "CORRECTING" : "VERIFIED_SAFE");
      }
    }
  }

  // Update states
  let unexposedCount = 0;
  let exposedCount = 0;
  let sharingCount = 0;
  let questioningCount = 0;
  let correctingCount = 0;
  let verifiedCount = 0;
  let totalTrust = 0;

  const updatedAgents: AgentNode[] = [];
  for (const [id, agent] of agentMap.entries()) {
    const newState = nextStates.get(id) || agent.state;

    // Trust updates: exposed to misinformation without correction lowers trust;
    // official correction restores trust
    let newTrust = agent.trustLevel;
    if (newState === "SHARING_MISINFO") {
      newTrust = Math.max(0.1, newTrust - 0.03);
    } else if (newState === "CORRECTING" || newState === "VERIFIED_SAFE") {
      newTrust = Math.min(0.98, newTrust + 0.02);
    }

    if (newState === "UNEXPOSED") unexposedCount++;
    else if (newState === "EXPOSED") exposedCount++;
    else if (newState === "SHARING_MISINFO") sharingCount++;
    else if (newState === "QUESTIONING") questioningCount++;
    else if (newState === "CORRECTING") correctingCount++;
    else if (newState === "VERIFIED_SAFE") verifiedCount++;

    totalTrust += newTrust;

    updatedAgents.push({
      ...agent,
      state: newState,
      trustLevel: Math.round(newTrust * 100) / 100,
    });
  }

  const metric: StepMetric = {
    step: currentStep,
    unexposedCount,
    exposedCount,
    sharingCount,
    questioningCount,
    correctingCount,
    verifiedCount,
    averageTrust: Math.round((totalTrust / updatedAgents.length) * 100) / 100,
    totalShares: sharingCount,
    totalCorrections: correctingCount,
  };

  return { updatedAgents, stepEvents, metric };
}

function getReactionQuote(archetype: AgentArchetype, action: "share" | "question" | "correct"): string {
  const quotes = {
    share: [
      "Everyone need to be careful! Just forwarding what I saw.",
      "Is this confirmed? Sharing just in case!",
      "Urgent emergency update, pass it on!",
      "Please stay safe, read this now!",
    ],
    question: [
      "Has the Disaster Management Agency confirmed this?",
      "Wait, the photos look like they are from an older storm.",
      "Let's not panic until official news confirms it.",
      "Where did this link originate from?",
    ],
    correct: [
      "Official authorities confirmed this is FALSE. Do not share.",
      "Civil Protection just released a statement debunking this claim.",
      "The bridge is open and operational. Please verify before sharing.",
      "Fact-check alert: this alert is fraudulent.",
    ],
  };

  const list = quotes[action];
  return list[Math.floor(Math.random() * list.length)];
}
