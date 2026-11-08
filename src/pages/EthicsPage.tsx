import React from "react";
import { Lock, ShieldCheck, AlertTriangle, Eye, UserCheck, HeartHandshake, PhoneCall } from "lucide-react";

export const EthicsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-white tracking-tight">Responsible AI & Ethics</h1>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            WAICY Ethical Charter
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Our foundational commitment to human safety, uncertainty communication, evidence transparency,
          and responsible crisis informatics.
        </p>
      </div>

      {/* Emergency Notice Banner */}
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-700/80 text-amber-200 text-xs flex items-start space-x-3">
        <PhoneCall className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-300 text-sm">
            Emergency Service Notice (911 / 112 / 999 Referral):
          </span>
          <p className="leading-relaxed">
            CrisisMind AI is an educational, research, and analytical platform. It does NOT replace local
            emergency first responders, 911 dispatch, or civil defense sirens. In an ongoing life-safety
            emergency, follow instructions issued directly by your local civil protection agency.
          </p>
        </div>
      </div>

      {/* Core Ethical Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Eye className="w-4 h-4" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              1. Transparent Evidence & Non-Infallibility
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            AI fact-checking is not infallible. We never output arbitrary binary truth assertions without
            attaching the direct retrieved citations, publication dates, and explicit limitations. If
            authoritative consensus is unavailable, the system strictly outputs UNVERIFIED.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-purple-400">
            <UserCheck className="w-4 h-4" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              2. Protection of Named Individuals
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            CrisisMind AI will never accuse or label a private citizen as a criminal, terrorist, or bad actor
            based on unverified social forwards. Factual verification is restricted to public infrastructure,
            health protocols, disaster weather, and official agency declarations.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Lock className="w-4 h-4" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              3. Privacy, SSRF & Anti-Scraping Safeguards
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            All URL fetches are validated against private RFC 1918 subnets and cloud metadata endpoints to
            prevent Server-Side Request Forgery. User text is processed ephemeral-first without harvesting
            personal identifiers or credentials.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400">
            <HeartHandshake className="w-4 h-4" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              4. Non-Stereotyping Social Simulation
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Our virtual agent population models cognitive information literacy and skepticism mathematically
            without stereotyping any real-world racial, national, or demographic community as inherently
            gullible or malicious.
          </p>
        </div>
      </div>

      {/* Prohibited Use Cases */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Strictly Prohibited System Operations</span>
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
          <li className="flex items-center space-x-2 p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-red-400">✕</span>
            <span>Never fabricate emergency evacuation instructions.</span>
          </li>
          <li className="flex items-center space-x-2 p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-red-400">✕</span>
            <span>Never bypass platform authentication walls.</span>
          </li>
          <li className="flex items-center space-x-2 p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-red-400">✕</span>
            <span>Never treat mere political disagreement as crisis misinformation.</span>
          </li>
          <li className="flex items-center space-x-2 p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-red-400">✕</span>
            <span>Never claim 100% certainty when ground evidence is incomplete.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
