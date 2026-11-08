import React, { useState } from "react";
import { Investigation, EvidenceSource } from "../../types/index.js";
import { ShieldCheck, ShieldAlert, FileText, Globe, Tag, ExternalLink } from "lucide-react";

interface EvidenceGraphProps {
  investigation: Investigation;
}

export const EvidenceGraph: React.FC<EvidenceGraphProps> = ({ investigation }) => {
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    type: "main_claim" | "sub_claim" | "source" | "entity" | "verdict";
    title: string;
    description: string;
    url?: string;
    stance?: string;
  } | null>(null);

  const mainClaim = investigation.mainClaim;
  const subClaims = investigation.extractedClaims || [];
  const sources = investigation.evidenceSources || [];
  const entities = investigation.entities || [];

  return (
    <div className="w-full bg-[#070b14] border border-slate-800 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Interactive Evidence & Entity Relationship Graph</span>
          </h3>
          <p className="text-xs text-slate-400">
            Click any node to inspect evidence passages, source stances, or factual dependencies.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-[11px] text-slate-400">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>Claim</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Supporting</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Contradicting</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Entity</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">
        {/* Graph Visual Nodes Container */}
        <div className="lg:col-span-2 relative min-h-[360px] bg-slate-950/70 border border-slate-800/80 rounded-lg p-6 flex flex-col justify-between">
          {/* Top Row: Entities & Subclaims */}
          <div className="flex flex-wrap gap-2.5">
            {entities.map((ent, idx) => (
              <button
                key={`ent_${idx}`}
                onClick={() =>
                  setSelectedNode({
                    id: `ent_${idx}`,
                    type: "entity",
                    title: `Named Entity: ${ent}`,
                    description: `Identified named entity extracted from claim text for independent registry and verification matching.`,
                  })
                }
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-purple-950/40 border border-purple-800/50 text-purple-300 text-xs hover:border-purple-500 transition cursor-pointer"
              >
                <Tag className="w-3 h-3 text-purple-400" />
                <span>{ent}</span>
              </button>
            ))}

            {subClaims.map((sc, idx) => (
              <button
                key={`sc_${idx}`}
                onClick={() =>
                  setSelectedNode({
                    id: `sc_${idx}`,
                    type: "sub_claim",
                    title: `Extracted Sub-Claim #${idx + 1}`,
                    description: sc.statement,
                  })
                }
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-cyan-950/40 border border-cyan-800/50 text-cyan-300 text-xs hover:border-cyan-500 transition cursor-pointer"
              >
                <FileText className="w-3 h-3 text-cyan-400" />
                <span>Sub-claim {idx + 1}</span>
              </button>
            ))}
          </div>

          {/* Central Main Claim Node */}
          <div className="my-6 flex justify-center">
            <div
              onClick={() =>
                setSelectedNode({
                  id: "main_claim",
                  type: "main_claim",
                  title: "Main Submitted Claim",
                  description: mainClaim,
                })
              }
              className="max-w-md w-full p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-2 border-cyan-500/60 shadow-xl shadow-cyan-500/10 cursor-pointer hover:border-cyan-400 transition"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                  Core Proposition
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    investigation.verdict === "FALSE"
                      ? "bg-red-950 text-red-300 border border-red-800"
                      : investigation.verdict === "TRUE"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : "bg-amber-950 text-amber-300 border border-amber-800"
                  }`}
                >
                  {investigation.verdict}
                </span>
              </div>
              <p className="text-xs font-medium text-white line-clamp-2">{mainClaim}</p>
            </div>
          </div>

          {/* Bottom Row: Retrieved Sources & Stances */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Connected Authoritative Evidence Sources ({sources.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {sources.map((src) => {
                const isContradicting = src.stance === "contradicting";
                const isSupporting = src.stance === "supporting";

                return (
                  <button
                    key={src.id}
                    onClick={() =>
                      setSelectedNode({
                        id: src.id,
                        type: "source",
                        title: src.name,
                        description: src.excerpt,
                        url: src.url,
                        stance: src.stance,
                      })
                    }
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs transition cursor-pointer ${
                      isContradicting
                        ? "bg-red-950/30 border-red-800/60 text-red-300 hover:border-red-500"
                        : isSupporting
                        ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-300 hover:border-emerald-500"
                        : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="max-w-[160px] truncate">{src.name}</span>
                    <span className="text-[10px] uppercase font-mono ml-1 px-1 rounded bg-black/40">
                      {src.stance}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Node Inspection Panel */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Selected Evidence Node
            </h4>
            {selectedNode ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-white">{selectedNode.title}</span>
                </div>

                {selectedNode.stance && (
                  <div className="text-xs">
                    <span className="text-slate-400">Relationship to Claim:</span>
                    <span className="ml-2 font-mono uppercase font-semibold text-cyan-400">
                      {selectedNode.stance}
                    </span>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                  {selectedNode.description}
                </div>

                {selectedNode.url && (
                  <a
                    href={selectedNode.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 hover:underline pt-1"
                  >
                    <span>View original source citation</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500 text-xs p-4">
                <Globe className="w-8 h-8 mb-2 opacity-40 text-cyan-400" />
                <p>Click on any entity, sub-claim, or source node in the graph to view full verification details.</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
            Evidence Strength: {Math.round(investigation.confidenceScore * 100)}% • Calibrated Grounding
          </div>
        </div>
      </div>
    </div>
  );
};
