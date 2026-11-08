import React, { useState, useRef, useMemo } from "react";
import { AgentNode, NetworkEdge, AgentState } from "../../types/index.js";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Eye,
  X,
} from "lucide-react";

interface NetworkCanvasProps {
  agents: AgentNode[];
  edges: NetworkEdge[];
  selectedAgentId?: string | null;
  onSelectAgent: (agent: AgentNode | null) => void;
  filterGroup?: string;
}

const STATE_COLORS: Record<AgentState, { bg: string; border: string; glow: string; label: string }> = {
  UNEXPOSED: { bg: "#334155", border: "#475569", glow: "transparent", label: "Unexposed" },
  EXPOSED: { bg: "#f59e0b", border: "#fbbf24", glow: "rgba(245, 158, 11, 0.4)", label: "Exposed" },
  SHARING_MISINFO: { bg: "#ef4444", border: "#f87171", glow: "rgba(239, 68, 68, 0.6)", label: "Sharing Rumor" },
  QUESTIONING: { bg: "#8b5cf6", border: "#a78bfa", glow: "rgba(139, 92, 246, 0.5)", label: "Questioning" },
  CORRECTING: { bg: "#10b981", border: "#34d399", glow: "rgba(16, 185, 129, 0.6)", label: "Active Debunker" },
  VERIFIED_SAFE: { bg: "#06b6d4", border: "#22d3ee", glow: "rgba(6, 182, 212, 0.5)", label: "Verified Safe" },
};

export const NetworkCanvas: React.FC<NetworkCanvasProps> = ({
  agents,
  edges,
  selectedAgentId,
  onSelectAgent,
  filterGroup,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Group filtering
  const filteredAgents = useMemo(() => {
    if (!filterGroup || filterGroup === "all") return agents;
    return agents.filter((a) => a.group === filterGroup);
  }, [agents, filterGroup]);

  const agentMap = useMemo(() => {
    const map = new Map<string, AgentNode>();
    for (const a of agents) map.set(a.id, a);
    return map;
  }, [agents]);

  // Selected agent details
  const selectedAgent = useMemo(() => {
    if (!selectedAgentId) return null;
    return agentMap.get(selectedAgentId) || null;
  }, [selectedAgentId, agentMap]);

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof SVGElement && e.target.tagName !== "circle") {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (factor: number) => {
    setZoom((prev) => Math.max(0.4, Math.min(2.5, prev * factor)));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Limit rendering edges if count is huge for performance
  const displayEdges = useMemo(() => {
    return edges.slice(0, 450);
  }, [edges]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[520px] bg-[#070b14] border border-slate-800 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Network Background Grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#6366f1 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          backgroundPosition: `${pan.x % 32}px ${pan.y % 32}px`,
        }}
      />

      {/* Floating Canvas Controls */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-800 shadow-lg">
        <button
          onClick={() => handleZoom(1.2)}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(0.8)}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-slate-700 mx-1" />
        <span className="text-[11px] font-mono text-slate-400 px-1">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 hidden md:flex items-center space-x-2.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300">
        {Object.entries(STATE_COLORS).map(([key, style]) => (
          <div key={key} className="flex items-center space-x-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: style.bg, boxShadow: `0 0 6px ${style.glow}` }}
            />
            <span>{style.label}</span>
          </div>
        ))}
      </div>

      {/* SVG Network Graph */}
      <svg
        className="w-full h-full"
        viewBox="0 0 800 600"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 0.15s ease-out",
        }}
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Edges */}
        <g stroke="#1e293b" strokeWidth="1" strokeOpacity="0.6">
          {displayEdges.map((edge, idx) => {
            const s = agentMap.get(edge.source);
            const t = agentMap.get(edge.target);
            if (!s || !t) return null;

            const isMisinfoActive = s.state === "SHARING_MISINFO" && t.state === "EXPOSED";
            const isDebunkActive = s.state === "CORRECTING" && (t.state === "EXPOSED" || t.state === "SHARING_MISINFO");

            return (
              <line
                key={`edge_${idx}`}
                x1={s.x || 400}
                y1={s.y || 300}
                x2={t.x || 400}
                y2={t.y || 300}
                stroke={isMisinfoActive ? "#ef4444" : isDebunkActive ? "#10b981" : "#1e293b"}
                strokeWidth={isMisinfoActive || isDebunkActive ? "1.5" : "0.75"}
                strokeOpacity={isMisinfoActive || isDebunkActive ? 0.8 : 0.4}
              />
            );
          })}
        </g>

        {/* Agent Nodes */}
        <g>
          {filteredAgents.map((agent) => {
            const style = STATE_COLORS[agent.state];
            const isSelected = agent.id === selectedAgentId;
            const r = agent.archetype === "influencer" || agent.archetype === "community_leader" ? 8 : 5.5;

            return (
              <g
                key={agent.id}
                transform={`translate(${agent.x || 400}, ${agent.y || 300})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAgent(agent);
                }}
                className="cursor-pointer group"
              >
                {/* Active glow halo */}
                {(agent.state === "SHARING_MISINFO" || agent.state === "CORRECTING") && (
                  <circle
                    r={r + 4}
                    fill={style.bg}
                    opacity="0.3"
                    className="animate-ping"
                  />
                )}

                {/* Selection Ring */}
                {isSelected && (
                  <circle
                    r={r + 5}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    className="animate-spin"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r={r}
                  fill={style.bg}
                  stroke={isSelected ? "#ffffff" : style.border}
                  strokeWidth={isSelected ? 2 : 1}
                  style={{
                    filter: agent.state !== "UNEXPOSED" ? "url(#glow)" : undefined,
                  }}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Selected Agent Inspector Drawer */}
      {selectedAgent && (
        <div className="absolute top-3 right-3 bottom-3 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-4 shadow-2xl z-20 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: STATE_COLORS[selectedAgent.state].bg }}
                />
                <h4 className="font-semibold text-sm text-white">{selectedAgent.name}</h4>
              </div>
              <button
                onClick={() => onSelectAgent(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div>
                <span className="text-slate-400">Current Status:</span>
                <span className="ml-2 font-medium px-2 py-0.5 rounded text-[11px] bg-slate-800 text-cyan-300">
                  {STATE_COLORS[selectedAgent.state].label}
                </span>
              </div>

              <div>
                <span className="text-slate-400">Group / Location:</span>
                <span className="ml-2 font-medium text-slate-200">{selectedAgent.group}</span>
              </div>

              <div>
                <span className="text-slate-400">Peer Connections:</span>
                <span className="ml-2 font-medium text-slate-200">
                  {selectedAgent.connections.length} neighboring agents
                </span>
              </div>

              {/* Psychological & Cognitive Parameters */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Cognitive Baseline
                </p>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Information Literacy</span>
                    <span className="text-white font-mono">{Math.round(selectedAgent.infoLiteracy * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{ width: `${selectedAgent.infoLiteracy * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Critical Skepticism</span>
                    <span className="text-white font-mono">{Math.round(selectedAgent.skepticism * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${selectedAgent.skepticism * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Sharing Tendency</span>
                    <span className="text-white font-mono">{Math.round(selectedAgent.sharingTendency * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${selectedAgent.sharingTendency * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Institutional Trust</span>
                    <span className="text-white font-mono">{Math.round(selectedAgent.trustLevel * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${selectedAgent.trustLevel * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Agent thoughts / Quote */}
              {selectedAgent.reactionQuote && (
                <div className="mt-3 p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60 text-slate-300 italic text-[11px]">
                  "{selectedAgent.reactionQuote}"
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 text-center">
            Agent ID: {selectedAgent.id} • Mathematical Decision Node
          </div>
        </div>
      )}
    </div>
  );
};
