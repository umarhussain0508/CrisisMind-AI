import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Link as LinkIcon,
  FileText,
  Image as ImageIcon,
  Video,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  GitBranch,
  Copy,
  Check,
  RotateCcw,
  Info,
  Clock,
  MapPin,
  Tag,
  ArrowRight,
  Upload,
} from "lucide-react";
import { api } from "../services/api.js";
import { Investigation, VerdictType } from "../types/index.js";
import { EvidenceGraph } from "../components/linkcheck/EvidenceGraph.js";
import { NavItem } from "../components/layout/Navigation.js";

interface LinkCheckPageProps {
  initialInvestigationId?: string | null;
  onNavigateToSimulationWithClaim: (claim: string, title: string) => void;
  onNavigate: (tab: NavItem) => void;
}

export const LinkCheckPage: React.FC<LinkCheckPageProps> = ({
  initialInvestigationId,
  onNavigateToSimulationWithClaim,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<"text" | "url" | "image" | "transcript">("text");
  const [inputContent, setInputContent] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [transcriptInput, setTranscriptInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/png");
  const [imageFileName, setImageFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [history, setHistory] = useState<Investigation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadHistory();
    if (initialInvestigationId) {
      loadSpecificInvestigation(initialInvestigationId);
    }
  }, [initialInvestigationId]);

  const loadHistory = async () => {
    try {
      const invs = await api.getInvestigations();
      setHistory(invs);
      if (!investigation && invs.length > 0 && !initialInvestigationId) {
        setInvestigation(invs[0]);
      }
    } catch (err) {
      console.error("Failed to load investigation history:", err);
    }
  };

  const loadSpecificInvestigation = async (id: string) => {
    try {
      setLoading(true);
      const inv = await api.getInvestigation(id);
      setInvestigation(inv);
    } catch (err) {
      console.error("Failed to load specific investigation:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setError("File size exceeds 8MB limit. Please upload a smaller image.");
        return;
      }
      setImageFileName(file.name);
      setImageMime(file.type || "image/png");
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // strip prefix
        const base64 = result.split(",")[1];
        setSelectedImage(base64);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunInvestigation = async () => {
    setError(null);
    let payloadInput = "";
    let inputType = activeTab;

    if (activeTab === "text") {
      if (!inputContent.trim()) {
        setError("Please enter claim or message text to investigate.");
        return;
      }
      payloadInput = inputContent;
    } else if (activeTab === "url") {
      if (!urlInput.trim()) {
        setError("Please enter a valid URL to analyze.");
        return;
      }
      payloadInput = urlInput;
    } else if (activeTab === "transcript") {
      if (!transcriptInput.trim()) {
        setError("Please paste a video or audio transcript to analyze.");
        return;
      }
      payloadInput = transcriptInput;
    } else if (activeTab === "image") {
      if (!selectedImage) {
        setError("Please select a screenshot or image to upload.");
        return;
      }
      payloadInput = inputContent || "User uploaded screenshot";
    }

    try {
      setLoading(true);
      const result = await api.analyzeLinkCheck({
        input: payloadInput,
        inputType,
        imageBase64: activeTab === "image" ? selectedImage || undefined : undefined,
        mimeType: imageMime,
      });
      setInvestigation(result);
      loadHistory();
    } catch (err: any) {
      setError(err.message || "Failed to analyze claim. Please check network or input format.");
    } finally {
      setLoading(false);
    }
  };

  const setSampleClaim = (type: "bridge" | "earthquake" | "evac" | "cure" | "relief") => {
    setError(null);
    if (type === "bridge") {
      setActiveTab("text");
      setInputContent(
        "EMERGENCY WARNING! Flash floods have destroyed the central Grand River Crossing bridge! East bank is cut off and water is rising. Authorities are concealing this to avoid panic. Evacuate immediately!"
      );
    } else if (type === "earthquake") {
      setActiveTab("text");
      setInputContent(
        "ALERT: Seismologists have confirmed that a magnitude 9.0 catastrophic earthquake will strike our metropolitan region tomorrow at exactly 3:15 PM. Prepare your families immediately."
      );
    } else if (type === "evac") {
      setActiveTab("text");
      setInputContent(
        "Official Police Notice: Immediate mandatory evacuation ordered for all residents in District 3. Toxic chemical leak from derailed freight train. Leave all possessions and head North."
      );
    } else if (type === "cure") {
      setActiveTab("text");
      setInputContent(
        "Emergency Health Advisory: Inhaling concentrated saline vapor and gargling industrial hydrogen peroxide immediately cures the viral respiratory epidemic within 3 hours."
      );
    } else if (type === "relief") {
      setActiveTab("text");
      setInputContent(
        "URGENT DONATIONS: City disaster relief bank account #9921-482-192 is the sole authorized channel receiving funds for flood victims. Direct all wire transfers here."
      );
    }
  };

  const getVerdictBadge = (verdict: VerdictType) => {
    switch (verdict) {
      case "TRUE":
        return { bg: "bg-emerald-950", border: "border-emerald-800", text: "text-emerald-300", icon: ShieldCheck };
      case "MOSTLY TRUE":
        return { bg: "bg-emerald-950/70", border: "border-emerald-800/80", text: "text-emerald-300", icon: ShieldCheck };
      case "FALSE":
        return { bg: "bg-red-950", border: "border-red-800", text: "text-red-300", icon: ShieldAlert };
      case "MISLEADING":
        return { bg: "bg-amber-950", border: "border-amber-800", text: "text-amber-300", icon: AlertTriangle };
      case "OUT OF CONTEXT":
        return { bg: "bg-purple-950", border: "border-purple-800", text: "text-purple-300", icon: AlertTriangle };
      case "PARTLY TRUE":
        return { bg: "bg-amber-950/80", border: "border-amber-800", text: "text-amber-300", icon: AlertTriangle };
      default:
        return { bg: "bg-slate-800", border: "border-slate-700", text: "text-slate-300", icon: Info };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white tracking-tight">LinkCheck AI</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Real-World Evidence Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Investigate suspicious links, headlines, social posts, or emergency alerts using multimodal
            claim extraction and Google Search Grounding.
          </p>
        </div>

        {/* Import into Simulation Button */}
        {investigation && (
          <button
            onClick={() =>
              onNavigateToSimulationWithClaim(investigation.mainClaim, investigation.title)
            }
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition cursor-pointer self-start sm:self-auto"
          >
            <GitBranch className="w-4 h-4" />
            <span>Simulate Community Spread</span>
          </button>
        )}
      </div>

      {/* Investigation Input Box */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        {/* Input Method Tabs */}
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
          <div className="flex items-center space-x-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800">
            <button
              onClick={() => setActiveTab("text")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                activeTab === "text"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Text / Message</span>
            </button>
            <button
              onClick={() => setActiveTab("url")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                activeTab === "url"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Analyze URL</span>
            </button>
            <button
              onClick={() => setActiveTab("image")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                activeTab === "image"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Screenshot / Image</span>
            </button>
            <button
              onClick={() => setActiveTab("transcript")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                activeTab === "transcript"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video Transcript</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span className="text-[11px] font-medium hidden md:inline">Preset Samples:</span>
            <button
              onClick={() => setSampleClaim("bridge")}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-[11px] text-cyan-300 transition cursor-pointer"
            >
              Flood Bridge
            </button>
            <button
              onClick={() => setSampleClaim("earthquake")}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-[11px] text-purple-300 transition cursor-pointer"
            >
              Quake Prediction
            </button>
            <button
              onClick={() => setSampleClaim("cure")}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-[11px] text-emerald-300 transition cursor-pointer"
            >
              Toxic Cure
            </button>
            <button
              onClick={() => setSampleClaim("relief")}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-[11px] text-amber-300 transition cursor-pointer"
            >
              Donation Scam
            </button>
          </div>
        </div>

        {/* Tab Inputs */}
        <div className="pt-4 space-y-3">
          {activeTab === "text" && (
            <textarea
              rows={4}
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="Paste a viral WhatsApp message, news headline, crisis forward, or unverified public claim to investigate..."
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition resize-none leading-relaxed"
            />
          )}

          {activeTab === "url" && (
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/breaking-news-article"
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
                <LinkIcon className="w-4 h-4 text-cyan-400 absolute left-3 top-3.5" />
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Supports accessible news articles, government bulletins, and blogs. Note: Social platforms
                (X, Facebook, Instagram) require user authentication and block headless scrapers; for social
                posts, paste the post text directly or upload a screenshot.
              </p>
            </div>
          )}

          {activeTab === "image" && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-6 border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl bg-slate-950/60 cursor-pointer flex flex-col items-center justify-center transition"
              >
                <Upload className="w-8 h-8 text-cyan-400 mb-2" />
                <p className="text-xs font-medium text-slate-200">
                  {imageFileName ? `Selected: ${imageFileName}` : "Click to upload screenshot or claim image"}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, or WEBP up to 8MB</p>
              </div>

              {selectedImage && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-white">Image ready for Multimodal OCR & Analysis</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImageFileName("");
                    }}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              <input
                type="text"
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="Optional: Add context or where you found this image..."
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          )}

          {activeTab === "transcript" && (
            <div className="space-y-2">
              <textarea
                rows={4}
                value={transcriptInput}
                onChange={(e) => setTranscriptInput(e.target.value)}
                placeholder="Paste the audio/video transcript or spoken text to analyze..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition resize-none leading-relaxed"
              />
              <p className="text-[11px] text-slate-500">
                AI will distinguish factual claims from opinions, humor, and rhetorical commentary.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleRunInvestigation}
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Retrieving Grounded Evidence & Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute AI Fact-Check Investigation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Investigation Details View */}
      {investigation && (
        <div className="space-y-6">
          {/* Main Verdict Card */}
          {(() => {
            const badge = getVerdictBadge(investigation.verdict);
            const Icon = badge.icon;
            return (
              <div
                className={`p-6 rounded-2xl ${badge.bg} border ${badge.border} shadow-xl relative overflow-hidden`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${badge.bg} ${badge.text} border ${badge.border}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>VERDICT: {investigation.verdict}</span>
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Evidence Strength: {Math.round(investigation.confidenceScore * 100)}%
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
                      {investigation.mainClaim}
                    </h2>

                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {investigation.explanation}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap md:flex-col gap-2 shrink-0 md:min-w-[180px] bg-black/30 p-3 rounded-xl border border-slate-800/80 text-[11px]">
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <Tag className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="capitalize">{investigation.claimType}</span>
                    </div>
                    {investigation.location && (
                      <div className="flex items-center space-x-1.5 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        <span>{investigation.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="capitalize">Urgency: {investigation.timeSensitivity}</span>
                    </div>
                  </div>
                </div>

                {/* Potential Hazard / Panic Warning */}
                {investigation.potentialRisk && (
                  <div className="mt-4 p-3 rounded-xl bg-black/40 border border-amber-800/60 text-amber-200 text-xs flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-300">Potential Emergency Impact: </span>
                      <span>{investigation.potentialRisk}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Interactive Evidence Graph */}
          <EvidenceGraph investigation={investigation} />

          {/* Extracted Sub-Claims & Citations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Extracted Sub-Claims */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Structured Factual Propositions ({investigation.extractedClaims.length})</span>
              </h3>
              <div className="space-y-2.5">
                {investigation.extractedClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                  >
                    <p className="font-medium text-slate-200">{claim.statement}</p>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                        Type: {claim.claimType}
                      </span>
                      {claim.location && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {claim.location}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                        {claim.timeSensitivity} sensitivity
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Authoritative Retrieved Sources */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Authoritative Retrieved Evidence ({investigation.evidenceSources.length})</span>
              </h3>
              {investigation.evidenceSources.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4">
                  No direct external sources indexed. Evaluation relied on scientific consensus.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {investigation.evidenceSources.map((src) => (
                    <div
                      key={src.id}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white truncate max-w-[240px]">
                          {src.name}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                            src.stance === "contradicting"
                              ? "bg-red-950 text-red-300"
                              : src.stance === "supporting"
                              ? "bg-emerald-950 text-emerald-300"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {src.stance}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{src.excerpt}</p>
                      {src.url && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-[11px] text-cyan-400 hover:underline pt-0.5"
                        >
                          <span>Open verified source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Context, Evidence Limitations & Recommended Verification Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Info className="w-4 h-4 text-purple-400" />
                <span>Misinformation Context & Propagation Dynamics</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {investigation.contextAnalysis}
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Documented Evidence Limitations:
                </span>
                <ul className="list-disc list-inside text-xs text-slate-400 mt-1 space-y-1">
                  {investigation.evidenceLimitations.map((lim, idx) => (
                    <li key={`lim_${idx}`}>{lim}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Recommended Verification Steps for Citizens & Responders</span>
              </h3>
              <ul className="space-y-2 pt-1">
                {investigation.suggestedSteps.map((step, idx) => (
                  <li
                    key={`step_${idx}`}
                    className="flex items-start space-x-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300"
                  >
                    <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Investigation History Drawer / Table */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Saved Investigation Archive ({history.length})</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase">
              <tr>
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Submitted Content</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5">Verdict</th>
                <th className="p-2.5">Evidence Score</th>
                <th className="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {history.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-850 transition">
                  <td className="p-2.5 font-mono text-[11px] text-slate-400">
                    {new Date(inv.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="p-2.5 max-w-xs truncate font-medium text-white">
                    {inv.mainClaim}
                  </td>
                  <td className="p-2.5 capitalize">{inv.claimType}</td>
                  <td className="p-2.5">
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
                  </td>
                  <td className="p-2.5 font-mono text-cyan-400">
                    {Math.round(inv.confidenceScore * 100)}%
                  </td>
                  <td className="p-2.5 text-right space-x-2">
                    <button
                      onClick={() => setInvestigation(inv)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] cursor-pointer"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() =>
                        onNavigateToSimulationWithClaim(inv.mainClaim, inv.title)
                      }
                      className="px-2 py-1 rounded bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-300 text-[11px] cursor-pointer"
                    >
                      Simulate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
