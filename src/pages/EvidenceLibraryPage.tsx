import React, { useState, useEffect } from "react";
import { Database, Search, Filter, ExternalLink, Download, FileText, CheckCircle2, ShieldAlert } from "lucide-react";
import { api } from "../services/api.js";
import { EvidenceSource } from "../types/index.js";

export const EvidenceLibraryPage: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EvidenceSource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStance, setSelectedStance] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<EvidenceSource | null>(null);

  useEffect(() => {
    loadEvidence();
  }, []);

  const loadEvidence = async () => {
    try {
      const data = await api.getEvidence();
      setEvidenceList(data);
      if (data.length > 0) setSelectedSource(data[0]);
    } catch (err) {
      console.error("Failed to load evidence:", err);
    }
  };

  const filteredEvidence = evidenceList.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.url.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStance = selectedStance === "all" || e.stance === selectedStance;
    const matchesType = selectedType === "all" || e.sourceType === selectedType;

    return matchesSearch && matchesStance && matchesType;
  });

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(evidenceList, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `crisismind_evidence_library_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  const exportToCsv = () => {
    const headers = ["ID", "Name", "Source Type", "Stance", "Reliability", "URL", "Excerpt", "Limitations"];
    const rows = evidenceList.map((e) => [
      `"${e.id}"`,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.sourceType}"`,
      `"${e.stance}"`,
      `"${e.reliabilityRating}"`,
      `"${e.url}"`,
      `"${e.excerpt.replace(/"/g, '""')}"`,
      `"${(e.limitations || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `crisismind_evidence_library_${Date.now()}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Evidence Library</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Corpus & Citations
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Searchable repository of indexed official agency bulletins, fact-checker clarifications,
            and peer-reviewed scientific citations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportToCsv}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportToJson}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by agency name, excerpt keywords, or domain..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span>Stance:</span>
            <select
              value={selectedStance}
              onChange={(e) => setSelectedStance(e.target.value)}
              className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none"
            >
              <option value="all">All Stances</option>
              <option value="contradicting">Contradicting (Debunk)</option>
              <option value="supporting">Supporting (Confirmed)</option>
              <option value="contextual">Contextual</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-slate-400">
            <span>Source Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="official_agency">Official Agency (NDMA, FEMA)</option>
              <option value="scientific_body">Scientific Body (USGS, WHO)</option>
              <option value="fact_checker">Fact-Checker</option>
              <option value="news_outlet">News Outlet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Evidence Cards + Selected Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List Column */}
        <div className="lg:col-span-2 space-y-3">
          {filteredEvidence.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-xs">
              No evidence records matched your search criteria.
            </div>
          ) : (
            filteredEvidence.map((item) => {
              const isSelected = selectedSource?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedSource(item)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? "bg-slate-850 border-cyan-500 shadow-md shadow-cyan-500/10"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-semibold text-white">{item.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.excerpt}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded shrink-0 ${
                        item.stance === "contradicting"
                          ? "bg-red-950 text-red-300 border border-red-800"
                          : item.stance === "supporting"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {item.stance}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="capitalize">Type: {item.sourceType.replace("_", " ")}</span>
                    <span className="truncate max-w-[200px]">{item.url}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Evidence Detail Column */}
        <div>
          {selectedSource ? (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 sticky top-20 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Source Verification Dossier
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                  {selectedSource.reliabilityRating} reliability
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white leading-snug">{selectedSource.name}</h3>
                <span className="text-[11px] text-slate-400 capitalize block mt-0.5">
                  Category: {selectedSource.sourceType.replace("_", " ")}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Verified Quote / Excerpt:
                </span>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-56 overflow-y-auto">
                  "{selectedSource.excerpt}"
                </div>
              </div>

              {selectedSource.limitations && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Documented Evidence Limitations:
                  </span>
                  <p className="text-xs text-slate-400 italic bg-black/30 p-2.5 rounded-lg border border-slate-800/80">
                    {selectedSource.limitations}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <a
                  href={selectedSource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center space-x-1.5 p-2 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-medium transition"
                >
                  <span>Open Primary Source URL</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-xs">
              Select an evidence item to view source credentials and full passage.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
