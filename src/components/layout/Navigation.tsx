import React, { useState } from "react";
import {
  ShieldAlert,
  Search,
  Activity,
  GitBranch,
  Sliders,
  Database,
  BotMessageSquare,
  BarChart3,
  FileText,
  Award,
  Lock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Radio,
  Sparkles,
  Volume2,
} from "lucide-react";

export type NavItem =
  | "overview"
  | "linkcheck"
  | "simulation"
  | "strategy"
  | "evidence"
  | "analyst"
  | "evaluation"
  | "reports"
  | "showcase"
  | "ethics"
  | "settings";

interface NavigationProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  onOpenQuickInvestigate: () => void;
  onOpenVoiceModal: () => void;
  onOpenGlobalSearch: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickInvestigate,
  onOpenVoiceModal,
  onOpenGlobalSearch,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems: { id: NavItem; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "overview", label: "Overview", icon: <Activity className="w-5 h-5" /> },
    { id: "linkcheck", label: "LinkCheck AI", icon: <Search className="w-5 h-5" />, badge: "Fact-Check" },
    { id: "simulation", label: "Crisis Simulation", icon: <GitBranch className="w-5 h-5" />, badge: "Lab" },
    { id: "strategy", label: "Strategy Lab", icon: <Sliders className="w-5 h-5" /> },
    { id: "evidence", label: "Evidence Library", icon: <Database className="w-5 h-5" /> },
    { id: "analyst", label: "AI Research Analyst", icon: <BotMessageSquare className="w-5 h-5" />, badge: "Gemini" },
    { id: "evaluation", label: "Evaluation Center", icon: <BarChart3 className="w-5 h-5" />, badge: "Benchmark" },
    { id: "reports", label: "Research Reports", icon: <FileText className="w-5 h-5" /> },
    { id: "showcase", label: "WAICY Showcase", icon: <Award className="w-5 h-5 text-amber-400" />, badge: "2026" },
    { id: "ethics", label: "Responsible AI", icon: <Lock className="w-5 h-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800/80 z-30 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                  CrisisMind AI
                </span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  WAICY 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Crisis Simulation & Misinformation Protection
              </p>
            </div>
          </div>
        </div>

        {/* Top Middle Search Bar trigger */}
        <div className="hidden lg:flex items-center max-w-md w-full mx-6">
          <button
            onClick={onOpenGlobalSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 text-xs hover:border-slate-700 transition"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Search claims, simulations, evidence sources...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Live Voice Briefing button */}
          <button
            onClick={onOpenVoiceModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600/30 to-purple-600/20 hover:from-violet-600/50 hover:to-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-medium transition cursor-pointer"
            title="Start Live Voice Briefing (gemini-3.8-live)"
          >
            <Volume2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="hidden sm:inline">Voice Briefing</span>
          </button>

          {/* New Investigation Quick button */}
          <button
            onClick={onOpenQuickInvestigate}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Investigate Claim</span>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Telemetry / Live Status */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Engine Active</span>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 bg-[#0c1222] border-r border-slate-800/80 z-20 transition-all duration-300 flex flex-col justify-between ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="py-4 px-2.5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center rounded-lg transition text-left cursor-pointer ${
                  collapsed ? "justify-center p-2.5" : "px-3 py-2.5 justify-between"
                } ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-600/20 to-blue-600/10 text-cyan-300 border border-cyan-500/30 font-medium"
                    : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center space-x-3">
                  <span className={isActive ? "text-cyan-400" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="text-xs tracking-wide">{item.label}</span>
                  )}
                </div>
                {!collapsed && item.badge && (
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded tracking-wider uppercase ${
                      item.id === "showcase"
                        ? "bg-amber-950 text-amber-300 border border-amber-800"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          {!collapsed && (
            <div className="text-[10px] text-slate-500 font-mono">
              v2.6 • Model: Flash / Argon
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition mx-auto"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
