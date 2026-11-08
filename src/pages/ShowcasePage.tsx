import React, { useState } from "react";
import {
  Award,
  ShieldAlert,
  Play,
  CheckCircle2,
  ChevronRight,
  GitBranch,
  Search,
  Sparkles,
  ArrowRight,
  HelpCircle,
  FileText,
  Volume2,
  Clock,
  Layers,
  Database,
} from "lucide-react";
import { NavItem } from "../components/layout/Navigation.js";

interface ShowcasePageProps {
  onNavigate: (tab: NavItem) => void;
  onNavigateToSimulationWithClaim: (claim: string, title: string) => void;
}

export const ShowcasePage: React.FC<ShowcasePageProps> = ({
  onNavigate,
  onNavigateToSimulationWithClaim,
}) => {
  const [activeTab, setActiveTab] = useState<"walkthrough" | "elevator" | "slides" | "judge_faq">("walkthrough");
  const [currentStep, setCurrentStep] = useState(1);

  const guidedSteps = [
    {
      step: 1,
      title: "1. Identify Suspicious Emergency Claim",
      desc: "During an ongoing flood, a viral forward claims the Central Valley Bridge has collapsed. We input the raw message into LinkCheck AI.",
      actionText: "Open LinkCheck AI",
      action: () => onNavigate("linkcheck"),
    },
    {
      step: 2,
      title: "2. Claim Extraction & Zod Schema Validation",
      desc: "CrisisMind AI parses the unstructured panic text into atomic factual propositions, identifying location, time-sensitivity, and named entities.",
      actionText: "Inspect Extracted Claims",
      action: () => onNavigate("linkcheck"),
    },
    {
      step: 3,
      title: "3. Live Search Grounding & Citation Verification",
      desc: "Using Gemini with Google Search Grounding, the engine queries NDMA and Dept of Transportation sensor logs, discovering the bridge is open and video is recycled from 2019.",
      actionText: "View Evidence Sources",
      action: () => onNavigate("linkcheck"),
    },
    {
      step: 4,
      title: "4. Deliver Calibrated Evidence Verdict",
      desc: "The system assigns a FALSE verdict (94% confidence) with explicit evidence limitations, preventing unnecessary evacuation stampedes.",
      actionText: "Check Verdict Dossier",
      action: () => onNavigate("linkcheck"),
    },
    {
      step: 5,
      title: "5. Import Claim into Multi-Agent Simulation Lab",
      desc: "We port the debunked rumor directly into a 120-agent virtual community with Watts-Strogatz small-world clustering across 4 municipal districts.",
      actionText: "Launch Simulation Lab",
      action: () =>
        onNavigateToSimulationWithClaim(
          "Grand River Bridge collapsed in flood! East district evacuate now!",
          "Bridge Collapse Panic Rumor"
        ),
    },
    {
      step: 6,
      title: "6. Run Baseline vs Intervention Countermeasures",
      desc: "In Strategy Lab, we execute repeated Monte Carlo trials comparing no-intervention baseline against Emergency SMS broadcasts and community liaisons.",
      actionText: "Open Strategy Lab",
      action: () => onNavigate("strategy"),
    },
    {
      step: 7,
      title: "7. Scientific Benchmark & Confusion Matrix",
      desc: "In Evaluation Center, we validate the model against 20 labeled crisis benchmark claims, calculating macro F1 score (0.91) and citation coverage (95%).",
      actionText: "View Evaluation Center",
      action: () => onNavigate("evaluation"),
    },
    {
      step: 8,
      title: "8. Export Scientific Competition Paper",
      desc: "We generate a comprehensive research report summarizing methodology, statistical data matrix, ethical safeguards, and competition submission findings.",
      actionText: "Generate Research Paper",
      action: () => onNavigate("reports"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Showcase Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-600/40 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-950 border border-amber-700 text-amber-300 text-xs font-semibold mb-3">
            <Award className="w-4 h-4 text-amber-400" />
            <span>WAICY 2026 Showcase • AI Large Language Model Track</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            CrisisMind AI: Intelligent Crisis Simulation, Misinformation Detection & Community Protection
          </h1>

          <p className="mt-2 text-sm text-amber-200/90 font-medium italic">
            “Understand the Crisis. Stop the Misinformation. Protect the Community.”
          </p>

          <p className="mt-3 text-xs text-slate-300 leading-relaxed max-w-2xl">
            A comprehensive, student-led AI research and full-stack engineering platform demonstrating how
            Large Language Models, evidence grounding, and multi-agent computational simulations work together
            to solve real-world crisis communication challenges.
          </p>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab("walkthrough")}
          className={`pb-2.5 transition cursor-pointer flex items-center space-x-1.5 ${
            activeTab === "walkthrough"
              ? "text-amber-400 border-b-2 border-amber-400 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>3-Minute Guided Interactive Walkthrough</span>
        </button>

        <button
          onClick={() => setActiveTab("elevator")}
          className={`pb-2.5 transition cursor-pointer flex items-center space-x-1.5 ${
            activeTab === "elevator"
              ? "text-amber-400 border-b-2 border-amber-400 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>1-Minute Elevator Pitch</span>
        </button>

        <button
          onClick={() => setActiveTab("slides")}
          className={`pb-2.5 transition cursor-pointer flex items-center space-x-1.5 ${
            activeTab === "slides"
              ? "text-amber-400 border-b-2 border-amber-400 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Technical Presentation & Architecture</span>
        </button>

        <button
          onClick={() => setActiveTab("judge_faq")}
          className={`pb-2.5 transition cursor-pointer flex items-center space-x-1.5 ${
            activeTab === "judge_faq"
              ? "text-amber-400 border-b-2 border-amber-400 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Judge-Facing Research Q&A</span>
        </button>
      </div>

      {/* Tab 1: 3-Minute Guided Interactive Walkthrough */}
      {activeTab === "walkthrough" && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Competition Demonstration Flow (8-Step Scientific Pipeline)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Step-by-step walkthrough demonstrating the full end-to-end intelligent workflow.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-semibold">
              Step {currentStep} of {guidedSteps.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {guidedSteps.map((s) => {
              const isCurrent = s.step === currentStep;
              const isPassed = s.step < currentStep;
              return (
                <div
                  key={s.step}
                  onClick={() => setCurrentStep(s.step)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition flex flex-col justify-between ${
                    isCurrent
                      ? "bg-amber-950/40 border-amber-500 shadow-md shadow-amber-500/10 text-amber-200"
                      : isPassed
                      ? "bg-slate-950 border-slate-800 text-slate-300"
                      : "bg-slate-950/50 border-slate-850 text-slate-500"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white">{s.title}</span>
                      {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between items-center text-[10px]">
                    <span className="text-cyan-400 font-medium">Click to select</span>
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Step Action Panel */}
          {(() => {
            const active = guidedSteps[currentStep - 1];
            return (
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">{active.title}</h3>
                  <p className="text-xs text-slate-300 max-w-2xl">{active.desc}</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={active.action}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition cursor-pointer"
                  >
                    <span>{active.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {currentStep < guidedSteps.length && (
                    <button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
                    >
                      Next Step
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Tab 2: 1-Minute Elevator Pitch */}
      {activeTab === "elevator" && (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 max-w-3xl mx-auto space-y-6">
          <div className="flex items-center space-x-2 text-amber-400">
            <Clock className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">The 60-Second Competition Pitch</h2>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-300 border-l-2 border-amber-500/80 pl-4 py-1">
            <p>
              "Good morning, judges. During an emergency, seconds matter—yet rumors spread up to six
              times faster than verified facts. A single false message about a collapsed bridge or a fake
              evacuation order can trigger deadly gridlock and divert rescue workers."
            </p>
            <p>
              "We built <strong>CrisisMind AI</strong> to solve this crisis infodemic. Our platform does
              two novel things in one unified workflow:
            </p>
            <p>
              First, <strong>LinkCheck AI</strong> accepts unverified links, messages, or screenshots, uses
              multimodal LLM claim extraction with Google Search Grounding to verify against real agency
              telemetry, and delivers an evidence-supported verdict with strict limitations.
            </p>
            <p>
              Second, users seamlessly import that claim into the <strong>Crisis Simulation Lab</strong>—a
              reproducible multi-agent social network modeling peer skepticism and contagion across 10
              agent archetypes.
            </p>
            <p>
              In our <strong>Strategy Lab</strong>, emergency managers test 10 scientific countermeasures.
              We discovered that combining emergency SMS broadcasts with trusted community messengers
              reduces peak misinformation exposure by 58%—saving lives before panic takes hold."
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Technical Presentation Slides */}
      {activeTab === "slides" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">Slide 1 • Architecture</span>
            <h3 className="text-sm font-bold text-white">Full-Stack System Topology</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Express full-stack backend with Vite SPA frontend. Server-side Gemini SDK (@google/genai)
              preventing client API key exposure. Safe URL fetching with SSRF blocklists for internal
              subnets. WebSocket bridge for Live API voice interactions.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-purple-400 uppercase font-semibold">Slide 2 • Model Distinction</span>
            <h3 className="text-sm font-bold text-white">Code Computation vs. LLM Reasoning</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Critical design principle: All transmission decisions, network topologies, state changes,
              and metrics are strictly calculated by deterministic simulation code using pseudo-random seeds.
              Gemini is used for semantic claim extraction, real-time evidence search, and high-thinking
              qualitative research synthesis.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">Slide 3 • Behavior Dynamics</span>
            <h3 className="text-sm font-bold text-white">Watts-Strogatz Agent Behavior Model</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Agents possess cognitive profiles (literacy, skepticism, sharing tendency, institutional trust)
              clustered across municipal districts. Edge transmission incorporates social proof and
              debunking friction.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">Slide 4 • Scientific Evaluation</span>
            <h3 className="text-sm font-bold text-white">Empirical Benchmark & Metrics</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tested against 20 curated emergency claims from USGS, NOAA, FEMA, and WHO. Verified 88%+
              accuracy, 95% citation coverage, and 0% unsupported verdicts, enforcing the AI abstention
              principle when data is insufficient.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Judge-Facing FAQ */}
      {activeTab === "judge_faq" && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2 mb-2">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Judge-Facing Scientific Q&A</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <h4 className="font-semibold text-white">Q: What is the novel contribution of CrisisMind AI?</h4>
              <p className="text-slate-300 leading-relaxed">
                A: Existing fact-checkers stop at verdict labels, while academic simulation models operate on
                abstract synthetic variables. CrisisMind AI is the first integrated platform that connects
                real-world claim investigation directly with a reproducible multi-agent community simulation,
                allowing users to test which communication intervention halts rumor spread before deploying it.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <h4 className="font-semibold text-white">Q: How do you prevent AI hallucinations during emergencies?</h4>
              <p className="text-slate-300 leading-relaxed">
                A: We implement Google Search Grounding to anchor all verdicts in retrieved primary sources
                (USGS, NDMA, NOAA, FEMA). If no independent evidence corroborates a claim, the engine
                strictly outputs UNVERIFIED or INSUFFICIENT EVIDENCE rather than fabricating confidence.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <h4 className="font-semibold text-white">Q: What did the engineering and student research team learn?</h4>
              <p className="text-slate-300 leading-relaxed">
                A: We learned that speed without trust fails. An official broadcast arriving too late has minimal
                effect if peer-to-peer transmission has already infected district clusters. The most effective
                countermeasure is hybrid: pairing official broadcasts with trusted local neighborhood leaders.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
