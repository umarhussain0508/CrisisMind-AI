import React, { useState, useRef, useEffect } from "react";
import {
  BotMessageSquare,
  Send,
  Sparkles,
  BrainCircuit,
  Shield,
  Layers,
  ArrowRight,
  Info,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { api } from "../services/api.js";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  citedInvestigationIds?: string[];
  citedExperimentIds?: string[];
  sourcesReferenced?: string[];
}

export const AnalystPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_welcome",
      role: "assistant",
      content:
        "Greetings. I am the Lead Scientific Research Analyst for CrisisMind AI (WAICY 2026). I have live access to our application database, active LinkCheck investigations, multi-agent simulation trials, and intervention experiments. How can I assist your crisis research inquiry today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [useHighThinking, setUseHighThinking] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const payloadMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.chatAnalyst({
        messages: payloadMessages,
        useHighThinking,
      });

      const assistantMsg: Message = {
        id: `asst_${Date.now()}`,
        role: "assistant",
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        citedInvestigationIds: res.citedInvestigationIds,
        citedExperimentIds: res.citedExperimentIds,
        sourcesReferenced: res.sourcesReferenced,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Analyst chat failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content:
            "I encountered an issue connecting to the AI reasoning engine. Please ensure your query is formulated clearly or retry in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "Why did the flood bridge rumor spread so rapidly in the baseline simulation?",
    "Which intervention yielded the highest community trust preservation?",
    "Explain the scientific distinction between exposure and sharing in our model.",
    "What are the operational tradeoffs of rate-limiting forward cascades?",
    "What additional intervention experiment would you recommend next?",
  ];

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white tracking-tight">AI Research Analyst</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              {useHighThinking ? "gemini-4-argon • High Thinking" : "gemini-3.8-flash"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Grounded multi-turn scientific analyst with access to current investigations, simulations, and benchmark data.
          </p>
        </div>

        {/* High Thinking Toggle */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          <span className="text-slate-300 font-medium">High Thinking Mode:</span>
          <button
            onClick={() => setUseHighThinking(!useHighThinking)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition cursor-pointer ${
              useHighThinking
                ? "bg-purple-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {useHighThinking ? "ENABLED" : "OFF"}
          </button>
        </div>
      </div>

      {/* Chat Messages Thread */}
      <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isUser
                    ? "bg-cyan-600 text-white"
                    : "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
                }`}
              >
                {isUser ? <span className="text-xs font-bold">U</span> : <BotMessageSquare className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? "bg-cyan-600/20 border border-cyan-500/40 text-cyan-100 rounded-tr-none"
                    : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none space-y-3"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Grounded Citation Badges */}
                {!isUser && (
                  <>
                    {(msg.citedInvestigationIds && msg.citedInvestigationIds.length > 0) ||
                    (msg.sourcesReferenced && msg.sourcesReferenced.length > 0) ? (
                      <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2 text-[10px]">
                        {msg.citedInvestigationIds?.map((id) => (
                          <span
                            key={id}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono"
                          >
                            Case: {id}
                          </span>
                        ))}
                        {msg.sourcesReferenced?.map((src, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-300 font-mono"
                          >
                            Cited: {src}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </>
                )}

                <div className="flex justify-end text-[10px] text-slate-500 pt-0.5">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <BotMessageSquare className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
              <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span>
                {useHighThinking
                  ? "Deliberating with High Thinking reasoning (gemini-4-argon)..."
                  : "Synthesizing grounded data analysis..."}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[11px] text-slate-500 shrink-0 font-medium">Quick Inquiries:</span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            disabled={loading}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] truncate shrink-0 transition cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-2 shrink-0">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about simulation findings, intervention tradeoffs, or evidence reliability..."
          className="flex-1 bg-transparent border-none text-white text-xs placeholder-slate-500 focus:outline-none resize-none px-2 py-1"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition disabled:opacity-40 cursor-pointer shadow-md shadow-purple-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
