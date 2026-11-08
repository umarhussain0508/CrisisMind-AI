import React, { useState, useEffect } from "react";
import { Navigation, NavItem } from "./components/layout/Navigation.js";
import { OverviewPage } from "./pages/OverviewPage.js";
import { LinkCheckPage } from "./pages/LinkCheckPage.js";
import { SimulationPage } from "./pages/SimulationPage.js";
import { StrategyLabPage } from "./pages/StrategyLabPage.js";
import { EvidenceLibraryPage } from "./pages/EvidenceLibraryPage.js";
import { AnalystPage } from "./pages/AnalystPage.js";
import { EvaluationPage } from "./pages/EvaluationPage.js";
import { ReportsPage } from "./pages/ReportsPage.js";
import { ShowcasePage } from "./pages/ShowcasePage.js";
import { EthicsPage } from "./pages/EthicsPage.js";
import { SettingsPage } from "./pages/SettingsPage.js";
import { VoiceBriefingModal } from "./components/voice/VoiceBriefingModal.js";
import { GlobalSearchModal } from "./components/modals/GlobalSearchModal.js";
import { api } from "./services/api.js";
import { Investigation, SimulationResult, EvidenceSource } from "./types/index.js";

export function App() {
  const [currentTab, setCurrentTab] = useState<NavItem>("overview");
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Cross-feature shared state (Claim -> Simulation)
  const [importedClaim, setImportedClaim] = useState<string | null>(null);
  const [importedTitle, setImportedTitle] = useState<string | null>(null);
  const [activeInvestigationId, setActiveInvestigationId] = useState<string | null>(null);

  // Global search data
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [evidence, setEvidence] = useState<EvidenceSource[]>([]);

  useEffect(() => {
    loadSearchData();
  }, [currentTab]);

  const loadSearchData = async () => {
    try {
      const invs = await api.getInvestigations();
      const sims = await api.getSimulationHistory();
      const ev = await api.getEvidence();
      setInvestigations(invs);
      setSimulations(sims);
      setEvidence(ev);
    } catch {
      // ignore
    }
  };

  const handleNavigateWithClaim = (claim: string, title: string) => {
    setImportedClaim(claim);
    setImportedTitle(title);
    setCurrentTab("simulation");
  };

  const handleNavigateFromSearch = (tab: NavItem, id?: string) => {
    if (tab === "linkcheck" && id) {
      setActiveInvestigationId(id);
    }
    setCurrentTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* TopBar & Sidebar */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenQuickInvestigate={() => setCurrentTab("linkcheck")}
        onOpenVoiceModal={() => setVoiceModalOpen(true)}
        onOpenGlobalSearch={() => setSearchModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="pt-20 pb-12 pl-4 sm:pl-20 sm:pr-6 pr-4 lg:pl-68 max-w-7xl w-full mx-auto transition-all duration-300">
        {currentTab === "overview" && (
          <OverviewPage
            onNavigate={(tab, id) => handleNavigateFromSearch(tab, id)}
            onOpenQuickInvestigate={() => setCurrentTab("linkcheck")}
          />
        )}

        {currentTab === "linkcheck" && (
          <LinkCheckPage
            initialInvestigationId={activeInvestigationId}
            onNavigateToSimulationWithClaim={handleNavigateWithClaim}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === "simulation" && (
          <SimulationPage
            initialClaim={importedClaim}
            initialTitle={importedTitle}
          />
        )}

        {currentTab === "strategy" && <StrategyLabPage />}

        {currentTab === "evidence" && <EvidenceLibraryPage />}

        {currentTab === "analyst" && <AnalystPage />}

        {currentTab === "evaluation" && <EvaluationPage />}

        {currentTab === "reports" && <ReportsPage />}

        {currentTab === "showcase" && (
          <ShowcasePage
            onNavigate={(tab) => setCurrentTab(tab)}
            onNavigateToSimulationWithClaim={handleNavigateWithClaim}
          />
        )}

        {currentTab === "ethics" && <EthicsPage />}

        {currentTab === "settings" && <SettingsPage />}
      </main>

      {/* Global Voice Modal */}
      <VoiceBriefingModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        investigations={investigations}
        simulations={simulations}
        evidence={evidence}
        onNavigate={handleNavigateFromSearch}
      />
    </div>
  );
}

export default App;
