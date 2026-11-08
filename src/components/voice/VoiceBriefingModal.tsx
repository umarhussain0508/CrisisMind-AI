import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, X, AlertCircle, Radio, Sparkles } from "lucide-react";

interface VoiceBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceBriefingModal: React.FC<VoiceBriefingModalProps> = ({ isOpen, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Ready to start Live voice conversation.");
  const [transcriptHistory, setTranscriptHistory] = useState<string[]>([
    "CrisisMind AI Live Voice Briefing is ready. Press 'Start Live Audio' to brief on emergency claims, simulation outcomes, or crisis communication.",
  ]);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) {
      stopSession();
    }
    return () => {
      stopSession();
    };
  }, [isOpen]);

  const startSession = async () => {
    try {
      setStatusMessage("Connecting to Gemini Live API...");
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });

      ws.onopen = async () => {
        setIsConnected(true);
        setStatusMessage("Live audio connected. Initializing microphone (16kHz)...");

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;

          const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 16000,
          });
          audioContextRef.current = inputCtx;

          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (ws.readyState === WebSocket.OPEN) {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = floatTo16BitPCM(inputData);
              const base64 = bufferToBase64(pcm16);
              ws.send(JSON.stringify({ audio: base64 }));
            }
          };

          source.connect(processor);
          processor.connect(inputCtx.destination);
          setIsRecording(true);
          setStatusMessage("Listening... Speak into your microphone.");
        } catch (micErr: any) {
          console.warn("Microphone access unavailable or denied:", micErr);
          setStatusMessage("Microphone permission denied. Live audio session active in monitor mode.");
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.audio) {
            setIsSpeaking(true);
            playAudioChunk(msg.audio);
          }
          if (msg.interrupted) {
            nextStartTimeRef.current = 0;
            setIsSpeaking(false);
          }
        } catch (err) {
          console.error("Error parsing audio message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("Live WebSocket error:", err);
        setStatusMessage("Live API connection notice. Please retry.");
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsRecording(false);
        setIsSpeaking(false);
        setStatusMessage("Session ended.");
      };
    } catch (err: any) {
      console.error("Failed to start Live session:", err);
      setStatusMessage("Failed to connect to Live API.");
    }
  };

  const stopSession = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsRecording(false);
    setIsSpeaking(false);
    nextStartTimeRef.current = 0;
  };

  const floatTo16BitPCM = (input: Float32Array): ArrayBuffer => {
    const output = new DataView(new ArrayBuffer(input.length * 2));
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return output.buffer;
  };

  const bufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const playAudioChunk = (base64Audio: string) => {
    if (!outputAudioCtxRef.current) return;
    const ctx = outputAudioCtxRef.current;

    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }

    const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
    audioBuffer.getChannelData(0).set(float32);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    const currentTime = ctx.currentTime;
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime;
    }
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;

    source.onended = () => {
      if (ctx.currentTime >= nextStartTimeRef.current) {
        setIsSpeaking(false);
      }
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Radio className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Live Voice Briefing</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  gemini-3.8-live
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Low-latency, real-time spoken intelligence briefing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visualizer / Waveform Arena */}
        <div className="p-8 bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center">
          <div className="relative mb-6">
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
                isSpeaking
                  ? "bg-purple-600/30 border-2 border-purple-400 shadow-[0_0_40px_rgba(168,85,247,0.5)] scale-105"
                  : isRecording
                  ? "bg-cyan-600/20 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                  : "bg-slate-800 border-2 border-slate-700"
              }`}
            >
              {isSpeaking ? (
                <Volume2 className="w-12 h-12 text-purple-300 animate-bounce" />
              ) : isRecording ? (
                <Mic className="w-12 h-12 text-cyan-300 animate-pulse" />
              ) : (
                <MicOff className="w-12 h-12 text-slate-500" />
              )}
            </div>

            {/* Ripple rings */}
            {(isRecording || isSpeaking) && (
              <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-ping pointer-events-none" />
            )}
          </div>

          <p className="text-xs font-medium text-slate-300 text-center max-w-sm mb-2">
            {statusMessage}
          </p>

          <p className="text-[11px] text-slate-500 text-center">
            {isSpeaking
              ? "Gemini is speaking live response (24kHz PCM)..."
              : isRecording
              ? "Capturing microphone at 16kHz sample rate..."
              : "Microphone paused. Click below to begin."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>WAICY Voice Conversational Agent</span>
          </div>

          <div className="flex items-center space-x-3">
            {!isConnected ? (
              <button
                onClick={startSession}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition cursor-pointer flex items-center space-x-1.5"
              >
                <Mic className="w-4 h-4" />
                <span>Start Live Audio</span>
              </button>
            ) : (
              <button
                onClick={stopSession}
                className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
              >
                <MicOff className="w-4 h-4" />
                <span>End Conversation</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
