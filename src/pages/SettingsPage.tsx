import React, { useState, useEffect } from "react";
import { Settings, Shield, Server, Database, Key, Sparkles, CheckCircle2 } from "lucide-react";
import { api } from "../services/api.js";

export const SettingsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    api.getOverview().then((res) => setMetrics(res.metrics)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-white tracking-tight">System & AI Configuration</h1>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            Platform Settings
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Review environment parameters, configured models, server API capabilities, and database storage.
        </p>
      </div>

      {/* Model Configuration Card */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Active Gemini AI Models (@google/genai SDK)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-cyan-400 font-mono font-semibold uppercase">
              General Tasks & Search Grounding
            </span>
            <p className="font-bold text-white">gemini-3.8-flash</p>
            <p className="text-[11px] text-slate-400">
              LinkCheck investigation, claim extraction, and Google Search Grounding.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-purple-400 font-mono font-semibold uppercase">
              Complex Reasoning & High Thinking
            </span>
            <p className="font-bold text-white">gemini-4-argon</p>
            <p className="text-[11px] text-slate-400">
              Deep research analysis, strategy recommendations with ThinkingLevel.HIGH.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-violet-400 font-mono font-semibold uppercase">
              Real-Time Voice API
            </span>
            <p className="font-bold text-white">gemini-3.8-live</p>
            <p className="text-[11px] text-slate-400">
              Low-latency WebSocket voice briefing with 16kHz audio in / 24kHz audio out.
            </p>
          </div>
        </div>
      </div>

      {/* Server & Environment Information */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>Server Security & Runtime Environment</span>
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400">GEMINI_API_KEY Storage:</span>
            <span className="font-mono text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Server-Side Secure Environment (process.env.GEMINI_API_KEY)</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Server Architecture:</span>
            <span className="font-mono text-white">Node.js Express + TypeScript Full-Stack</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Network & SSRF Protection:</span>
            <span className="font-mono text-cyan-400">Active (RFC 1918 & Cloud Metadata Blocked)</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Competition Track:</span>
            <span className="font-mono text-amber-300">WAICY 2026 AI Large Language Model Track</span>
          </div>
        </div>
      </div>

      {/* Database Statistics */}
      {metrics && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Persistent Database Metrics</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Investigations</span>
              <p className="text-lg font-bold text-white mt-1">{metrics.totalInvestigations}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Extracted Claims</span>
              <p className="text-lg font-bold text-white mt-1">{metrics.claimsAnalyzed}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Completed Simulations</span>
              <p className="text-lg font-bold text-white mt-1">{metrics.simulationExperimentsCompleted}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Evidence Sources</span>
              <p className="text-lg font-bold text-white mt-1">{metrics.evidenceSourcesCollected}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
