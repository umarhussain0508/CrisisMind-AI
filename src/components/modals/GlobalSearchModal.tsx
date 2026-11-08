import React, { useState, useEffect } from "react";
import { Search, X, ShieldAlert, GitBranch, Database, FileText, ArrowRight } from "lucide-react";
import { Investigation, SimulationResult, EvidenceSource } from "../../types/index.js";
import { NavItem } from "../layout/Navigation.js";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  investigations: Investigation[];
  simulations: SimulationResult[];
  evidence: EvidenceSource[];
  onNavigate: (tab: NavItem, id?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  investigations,
  simulations,
  evidence,
  onNavigate,
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingInvestigations = q
    ? investigations.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.mainClaim.toLowerCase().includes(q) ||
          i.verdict.toLowerCase().includes(q)
      )
    : investigations.slice(0, 3);

  const matchingSimulations = q
    ? simulations.filter(
        (s) =>
          s.config.name.toLowerCase().includes(q) ||
          s.config.misinformationMessage.toLowerCase().includes(q) ||
          s.config.crisisType.toLowerCase().includes(q)
      )
    : simulations.slice(0, 2);

  const matchingEvidence = q
    ? evidence.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.excerpt.toLowerCase().includes(q) ||
          e.url.toLowerCase().includes(q)
      )
    : evidence.slice(0, 3);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search claims, simulations, interventions, evidence citations..."
            className="flex-1 bg-transparent border-none text-white placeholder-slate-500 text-sm focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Investigations */}
          <div>
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
              <span>LinkCheck Investigations</span>
            </h4>
            {matchingInvestigations.length === 0 ? (
              <p className="text-xs text-slate-500 italic pl-2">No matching investigations</p>
            ) : (
              <div className="space-y-1.5">
                {matchingInvestigations.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => {
                      onNavigate("linkcheck", inv.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800/80 text-left transition cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-medium text-white">{inv.title}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-md">{inv.mainClaim}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        inv.verdict === "FALSE"
                          ? "bg-red-950 text-red-300"
                          : inv.verdict === "TRUE"
                          ? "bg-emerald-950 text-emerald-300"
                          : "bg-amber-950 text-amber-300"
                      }`}
                    >
                      {inv.verdict}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Simulations */}
          <div>
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <GitBranch className="w-3.5 h-3.5 text-purple-400" />
              <span>Crisis Simulations</span>
            </h4>
            {matchingSimulations.length === 0 ? (
              <p className="text-xs text-slate-500 italic pl-2">No matching simulations</p>
            ) : (
              <div className="space-y-1.5">
                {matchingSimulations.map((sim) => (
                  <button
                    key={sim.id}
                    onClick={() => {
                      onNavigate("simulation", sim.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800/80 text-left transition cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-medium text-white">{sim.config.name}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-md">
                        {sim.config.misinformationMessage}
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {sim.config.populationSize} agents
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Evidence */}
          <div>
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Evidence Records</span>
            </h4>
            {matchingEvidence.length === 0 ? (
              <p className="text-xs text-slate-500 italic pl-2">No matching evidence records</p>
            ) : (
              <div className="space-y-1.5">
                {matchingEvidence.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => {
                      onNavigate("evidence", ev.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800/80 text-left transition cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-medium text-white">{ev.name}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-md">{ev.excerpt}</p>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                      {ev.stance}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with mouse or keyboard</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px]">
            ESC to close
          </kbd>
        </div>
      </div>
    </div>
  );
};
