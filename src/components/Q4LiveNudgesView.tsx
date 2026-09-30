import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  ShieldAlert, 
  Activity, 
  Volume2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  CALL_AUDIO_STREAM_SCENARIOS, 
  callNudgePipelineInstance, 
  StreamScenario 
} from '../modules/liveNudge/streamEngine';
import { 
  LiveAudioChunk, 
  LiveNudge, 
  DetectedSignal, 
  PipelineLatencyMetrics, 
  LatencyAggregateReport 
} from '../types';

export const Q4LiveNudgesView: React.FC = () => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [streamChunks, setStreamChunks] = useState<LiveAudioChunk[]>([]);
  const [nudges, setNudges] = useState<LiveNudge[]>([]);
  const [signals, setSignals] = useState<DetectedSignal[]>([]);
  const [latencyHistory, setLatencyHistory] = useState<PipelineLatencyMetrics[]>([]);
  const [latencyReport, setLatencyReport] = useState<LatencyAggregateReport>(callNudgePipelineInstance.computeLatencyReport());
  const [activeSubTab, setActiveSubTab] = useState<'live_stream' | 'latency_report' | 'scale_analysis'>('live_stream');

  const currentScenario = CALL_AUDIO_STREAM_SCENARIOS[selectedScenarioIndex];

  // Streaming Loop Timer
  useEffect(() => {
    let timer: any = null;
    if (isStreaming && currentScenario) {
      if (currentChunkIndex < currentScenario.chunks.length) {
        timer = setTimeout(() => {
          const chunkData = currentScenario.chunks[currentChunkIndex];
          const result = callNudgePipelineInstance.processAudioChunk(
            currentChunkIndex + 1,
            chunkData.speaker,
            chunkData.text,
            chunkData.isNoisy || false
          );

          setStreamChunks(prev => [...prev, result.chunk]);
          setNudges(callNudgePipelineInstance.getAllNudges());
          setSignals(callNudgePipelineInstance.getDetectedSignals());
          setLatencyHistory(callNudgePipelineInstance.getLatencyMetrics());
          setLatencyReport(callNudgePipelineInstance.computeLatencyReport());

          setCurrentChunkIndex(prev => prev + 1);
        }, 1300); // 1.3s chunk intervals simulating real-time audio playback
      } else {
        setIsStreaming(false);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isStreaming, currentChunkIndex, selectedScenarioIndex, currentScenario]);

  const handleStartStream = () => {
    if (currentChunkIndex >= (currentScenario?.chunks.length || 0)) {
      handleResetStream();
    }
    setIsStreaming(true);
  };

  const handlePauseStream = () => {
    setIsStreaming(false);
  };

  const handleResetStream = () => {
    setIsStreaming(false);
    setCurrentChunkIndex(0);
    setStreamChunks([]);
    callNudgePipelineInstance.reset();
    setNudges([]);
    setSignals([]);
    setLatencyHistory([]);
    setLatencyReport(callNudgePipelineInstance.computeLatencyReport());
  };

  const handleSelectScenario = (index: number) => {
    setSelectedScenarioIndex(index);
    handleResetStream();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                Real-Time Telephony Nudge Engine
              </span>
              <span className="text-xs text-slate-500 font-medium">Real-Time Chunk Streaming & Sub-400ms Engine</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Live In-Call Recommendations, Suppression Controls, & Latency Telemetry
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Extracts intent, compliance gaps, and sentiment directly during active call audio; enforces 30s cooldowns and noise suppression.
            </p>
          </div>

          {/* Subtabs */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
            {[
              { id: 'live_stream', label: 'Streaming Console', icon: Activity },
              { id: 'latency_report', label: 'Latency Telemetry', icon: Clock },
              { id: 'scale_analysis', label: 'Scale & Noise Architecture', icon: ShieldAlert },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activeSubTab === tab.id
                      ? 'bg-white text-amber-800 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* VIEW 1: STREAMING NUDGE CONSOLE */}
      {activeSubTab === 'live_stream' && (
        <div className="space-y-6">
          {/* Scenario Selector & Audio Player Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <button
                  onClick={isStreaming ? handlePauseStream : handleStartStream}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-bold text-xs shadow-xs transition-colors ${
                    isStreaming
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isStreaming ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isStreaming ? 'Pause Stream' : 'Play Live Audio Stream'}</span>
                </button>
                <button
                  onClick={handleResetStream}
                  className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
                <div className="text-xs font-medium text-slate-500">
                  Chunk Progress: <span className="font-bold text-slate-800">{currentChunkIndex} / {currentScenario.chunks.length}</span>
                </div>
              </div>

              {/* Streaming Indicator */}
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isStreaming ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
                <span className="text-xs font-semibold text-slate-700">
                  {isStreaming ? 'Audio Stream Active (1.3s Chunks)' : 'Stream Paused / Ready'}
                </span>
              </div>
            </div>

            {/* Test Scenarios Grid (Required 4 Scenarios) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {CALL_AUDIO_STREAM_SCENARIOS.map((sc, idx) => (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(idx)}
                  className={`text-left p-3 rounded-lg border text-xs transition-all ${
                    selectedScenarioIndex === idx
                      ? 'border-amber-500 bg-amber-50/60 text-amber-950 font-medium ring-1 ring-amber-400'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-slate-900 truncate">{sc.name.split(':')[0]}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-1">{sc.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dual Feed: Real-Time Audio Transcription (Left) + Live Actionable Nudges (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Continuous Diarized Transcription Timeline (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col h-[540px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Streaming Transcription & Diarization</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  ASR P50: {latencyReport.asrP50}ms
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50 rounded-lg mt-3">
                {streamChunks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4">
                    <Activity className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-slate-600">No active audio stream</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Click "Play Live Audio Stream" above to simulate real-time phone audio chunks arriving at 1.3s intervals.
                    </p>
                  </div>
                ) : (
                  streamChunks.map((chunk, idx) => {
                    const isAgent = chunk.speaker === 'Agent';
                    return (
                      <div key={idx} className={`p-3 rounded-lg border text-xs ${
                        isAgent ? 'bg-white border-slate-200' : 'bg-blue-50/60 border-blue-200'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold uppercase tracking-wider text-[10px] ${
                            isAgent ? 'text-indigo-700' : 'text-blue-700'
                          }`}>
                            {chunk.speaker} (Chunk #{chunk.chunkIndex})
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {chunk.soundDecibels} dB • {chunk.isAmbiguousOrNoisy ? '⚠️ High Ambient Noise' : 'Clear Audio'}
                          </span>
                        </div>
                        <p className="text-slate-800 font-medium leading-relaxed">
                          "{chunk.audioSnippetText}"
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Live Nudges Feed & Action Suggestions (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col h-[540px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">Live Agent Recommendations & Nudges</h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Sub-400ms E2E Latency
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50 rounded-lg mt-3">
                {nudges.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4">
                    <Sparkles className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-slate-600">Awaiting audio signals</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      When compliance omissions, cross-sell opportunities, or customer frustration are detected, actionable nudges appear here in real time.
                    </p>
                  </div>
                ) : (
                  nudges.map((nudge) => {
                    const isSuppressed = nudge.isSuppressed;

                    return (
                      <div
                        key={nudge.id}
                        className={`p-4 rounded-xl border shadow-xs transition-all ${
                          isSuppressed
                            ? 'bg-slate-100/70 border-slate-300 opacity-60'
                            : nudge.priority === 'CRITICAL'
                            ? 'bg-red-50 border-red-300'
                            : nudge.priority === 'HIGH'
                            ? 'bg-amber-50 border-amber-300'
                            : 'bg-emerald-50 border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isSuppressed
                                ? 'bg-slate-200 text-slate-700'
                                : nudge.priority === 'CRITICAL'
                                ? 'bg-red-200 text-red-900'
                                : nudge.priority === 'HIGH'
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-emerald-200 text-emerald-900'
                            }`}>
                              {isSuppressed ? `Suppressed (${nudge.suppressionReason})` : nudge.priority}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">
                              {nudge.headline}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Delivery: {nudge.timeToDisplayMs}ms
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 mt-2 font-medium">
                          {nudge.recommendedAction}
                        </p>

                        {!isSuppressed && nudge.suggestedScript && (
                          <div className="mt-3 p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800">
                            <span className="font-bold text-indigo-700 block text-[10px] uppercase mb-0.5">
                              Recommended Telephony Script:
                            </span>
                            <p className="italic font-medium">{nudge.suggestedScript}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: P50 / P95 LATENCY TELEMETRY */}
      {activeTab_Telemetry(activeSubTab, latencyReport, latencyHistory)}

      {/* VIEW 3: 10X SCALE & NOISY AUDIO ARCHITECTURE */}
      {activeSubTab === 'scale_analysis' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Production Architecture: 10x Scale & Noisy Audio Mitigation
            </h3>
            <p className="text-xs text-slate-500">
              Technical roadmap and engineering controls ensuring sub-second nudge latency at 10,000 concurrent call streams.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 text-sm block">1. Scale Limitations & Mitigation (10x Streams)</span>
                <ul className="list-disc list-inside space-y-1.5 text-slate-700 leading-relaxed">
                  <li><strong>ASR Bottleneck:</strong> Centralized speech-to-text nodes saturate at ~800 concurrent audio streams. Mitigated via edge chunking with gRPC streaming to a horizontal Kubernetes cluster with dynamic GPU worker autoscaling (NVIDIA Triton + Whisper v3).</li>
                  <li><strong>LLM Inference Latency:</strong> Full LLM inference adds 400-800ms per utterance. We implement a two-tier extraction pipeline: Tier 1 uses lightweight regex and DistilBERT token classification (&lt; 25ms); Tier 2 queries high-parameter LLM only for ambiguous high-dollar objections.</li>
                  <li><strong>WebSocket Broker Overload:</strong> Direct Redis Pub/Sub channels partitioned by Call UUID with WebSocket connection pools guarantee &lt; 15ms fan-out delivery.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 text-sm block">2. Noisy Audio & False-Positive Controls</span>
                <ul className="list-disc list-inside space-y-1.5 text-slate-700 leading-relaxed">
                  <li><strong>Acoustic Pre-Processing:</strong> DeepFilterNet / WebRTC NS3 noise-suppression filter applied prior to ASR chunking, isolating speech from traffic and call-center murmur.</li>
                  <li><strong>Confidence Gating:</strong> Chunks with ASR acoustic confidence &lt; 0.75 are tagged as noisy and bypassed by the nudge engine, preventing spurious hallucinated triggers.</li>
                  <li><strong>30-Second Topic Cooldowns:</strong> Prevents repetitive alert bombardment by maintaining in-memory LRU cooldown registers per call session.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper renderer for Telemetry tab
function activeTab_Telemetry(activeSubTab: string, report: LatencyAggregateReport, history: PipelineLatencyMetrics[]) {
  if (activeSubTab !== 'latency_report') return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Real-Time Latency Telemetry Benchmark</h3>
          <p className="text-xs text-slate-500">
            Measured component latencies across Audio Ingestion → Streaming ASR → Signal Extraction → LLM Nudge → UI Display.
          </p>
        </div>
        <span className="px-3 py-1 rounded text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
          Target: &lt; 500ms P95
        </span>
      </div>

      {/* Latency Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
          <span className="text-xs font-semibold text-slate-500 block">ASR Chunk Latency</span>
          <span className="text-lg font-bold text-slate-900 block mt-1">P50: {report.asrP50}ms</span>
          <span className="text-[11px] text-slate-500">P95: {report.asrP95}ms</span>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
          <span className="text-xs font-semibold text-slate-500 block">Signal Extraction</span>
          <span className="text-lg font-bold text-slate-900 block mt-1">P50: {report.signalP50}ms</span>
          <span className="text-[11px] text-slate-500">P95: {report.signalP95}ms</span>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
          <span className="text-xs font-semibold text-slate-500 block">LLM Nudge Formulation</span>
          <span className="text-lg font-bold text-slate-900 block mt-1">P50: {report.llmP50}ms</span>
          <span className="text-[11px] text-slate-500">P95: {report.llmP95}ms</span>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
          <span className="text-xs font-bold text-emerald-800 block">Total End-to-End</span>
          <span className="text-lg font-bold text-emerald-950 block mt-1">P50: {report.e2eP50}ms</span>
          <span className="text-[11px] text-emerald-700 font-semibold">P95: {report.e2eP95}ms</span>
        </div>
      </div>

      {/* Recent Chunk Latency Stream Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <th className="py-2.5 px-3">Chunk #</th>
              <th className="py-2.5 px-3">Audio Duration</th>
              <th className="py-2.5 px-3">ASR Latency</th>
              <th className="py-2.5 px-3">Signal Latency</th>
              <th className="py-2.5 px-3">LLM Latency</th>
              <th className="py-2.5 px-3">UI Delivery</th>
              <th className="py-2.5 px-3 font-bold text-slate-900">Total E2E Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {history.slice(-6).map((h, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-2 px-3 font-bold text-slate-800">Chunk {h.chunkIndex}</td>
                <td className="py-2 px-3 text-slate-600">{h.audioDurationMs}ms</td>
                <td className="py-2 px-3 text-slate-600">{h.asrLatencyMs}ms</td>
                <td className="py-2 px-3 text-slate-600">{h.signalExtractionLatencyMs}ms</td>
                <td className="py-2 px-3 text-slate-600">{h.llmNudgeLatencyMs}ms</td>
                <td className="py-2 px-3 text-slate-600">{h.uiDeliveryLatencyMs}ms</td>
                <td className="py-2 px-3 font-bold text-emerald-700">{h.totalEndToEndLatencyMs}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
