import React, { useState } from 'react';
import { 
  Languages, 
  Volume2, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Square,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { 
  PHILIPPINES_LOCALIZATION_EXAMPLES, 
  PHILIPPINES_ASR_BENCHMARK, 
  PHILIPPINES_RECORDED_CALLS 
} from '../modules/multilingual/philippinesBot';
import { 
  INDONESIA_LOCALIZATION_EXAMPLES, 
  INDONESIA_ASR_BENCHMARK, 
  INDONESIA_RECORDED_CALLS 
} from '../modules/multilingual/indonesiaBot';
import { speechServiceInstance } from '../modules/voiceAgent/speechService';
import { MarketType } from '../types';

export const Q3MultilingualView: React.FC = () => {
  const [activeMarket, setActiveMarket] = useState<MarketType>('philippines');
  const [activeTab, setActiveTab] = useState<'transcripts' | 'localization' | 'asr_benchmarks'>('transcripts');
  const [playingTurnId, setPlayingTurnId] = useState<string | null>(null);

  const localizationExamples = activeMarket === 'philippines' 
    ? PHILIPPINES_LOCALIZATION_EXAMPLES 
    : INDONESIA_LOCALIZATION_EXAMPLES;

  const asrBenchmark = activeMarket === 'philippines'
    ? PHILIPPINES_ASR_BENCHMARK
    : INDONESIA_ASR_BENCHMARK;

  const recordedCalls = activeMarket === 'philippines'
    ? PHILIPPINES_RECORDED_CALLS
    : INDONESIA_RECORDED_CALLS;

  const handlePlayAudio = (text: string, id: string) => {
    if (playingTurnId === id) {
      speechServiceInstance.stopSpeaking();
      setPlayingTurnId(null);
      return;
    }

    setPlayingTurnId(id);
    const lang = activeMarket === 'philippines' ? 'fil-PH' : 'id-ID';
    speechServiceInstance.speak(text, lang, () => {
      setPlayingTurnId(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Regional Conversational Systems
              </span>
              <span className="text-xs text-slate-500 font-medium">Philippines (Taglish) & Indonesia (Multifinance)</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Localized Conversational Models, Code-Switching & Dialect Fallbacks
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Engineered for natural financial dialogue, cultural honorifics, intra-sentential loanwords, and reliable localized escalation.
            </p>
          </div>

          {/* Market Switcher */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveMarket('philippines')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${
                activeMarket === 'philippines'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Philippines (Bancassurance)</span>
            </button>
            <button
              onClick={() => setActiveMarket('indonesia')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${
                activeMarket === 'indonesia'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Indonesia (Multifinance)</span>
            </button>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex space-x-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          {[
            { id: 'transcripts', label: 'Recorded Call Transcripts & Audio', icon: Volume2 },
            { id: 'localization', label: 'Localization vs. Literal Translation', icon: Sparkles },
            { id: 'asr_benchmarks', label: 'Language ASR & TTS Benchmark', icon: Layers },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: RECORDED CALL TRANSCRIPTS & AUDIO */}
      {activeTab === 'transcripts' && (
        <div className="space-y-6">
          {recordedCalls.map((call, cIdx) => (
            <div key={call.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                    {activeMarket === 'philippines' ? 'Bancassurance / Life Insurance' : 'Multifinance / Consumer Credit'}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{call.scenarioTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Caller: {call.customerProfile}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Native Fallback Adhered
                  </span>
                </div>
              </div>

              {/* Dialogue Turns */}
              <div className="mt-4 space-y-3">
                {call.turns.map((turn, tIdx) => {
                  const isAgent = turn.speaker === 'Agent';
                  const turnKey = `${call.id}_t_${tIdx}`;
                  const isPlaying = playingTurnId === turnKey;

                  return (
                    <div 
                      key={tIdx} 
                      className={`p-3.5 rounded-xl border text-xs ${
                        isAgent ? 'bg-slate-50/70 border-slate-200' : 'bg-blue-50/40 border-blue-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold uppercase tracking-wider text-[11px] ${
                            isAgent ? 'text-indigo-700' : 'text-blue-800'
                          }`}>
                            {turn.speaker}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            [{turn.languageMix}]
                          </span>
                        </div>

                        {/* Audio Playback Button */}
                        <button
                          onClick={() => handlePlayAudio(turn.originalText, turnKey)}
                          className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
                            isPlaying
                              ? 'bg-red-500 text-white border-red-600 animate-pulse'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                          }`}
                        >
                          {isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                          <span>{isPlaying ? 'Stop' : 'Play Voice'}</span>
                        </button>
                      </div>

                      {/* Native Dialogue */}
                      <p className="font-semibold text-slate-900 text-sm leading-relaxed">
                        "{turn.originalText}"
                      </p>

                      {/* English Meaning & Grounding */}
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between text-[11px] gap-2">
                        <span className="text-slate-600">
                          <strong className="text-slate-700">English Grounding:</strong> {turn.englishGroundedMeaning}
                        </span>
                        <div className="flex flex-wrap gap-1 shrink-0">
                          {turn.specialTermsUsed.map((term, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-mono">
                              {term}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Call Result Box */}
              <div className="mt-4 p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs text-emerald-900">
                <strong>Call Resolution & Escalation Proof:</strong> {call.outcome}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: LOCALIZATION VS LITERAL TRANSLATION (3 RIGOROUS EXAMPLES) */}
      {activeTab === 'localization' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Localization vs. Direct Literal Translation Matrix
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Demonstrates why literal translation fails in real SE Asian financial operations, contrasting rigid literal syntax against culturally tuned, code-switched dialogues.
            </p>

            <div className="space-y-4">
              {localizationExamples.map((ex, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                      Example #{idx + 1}: {ex.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      Cultural Alignment
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
                    {/* Literal Translation (Poor UX) */}
                    <div className="bg-red-50/50 border border-red-200 rounded-lg p-3">
                      <span className="font-bold text-red-800 block text-[11px] mb-1">
                        ❌ Literal Machine Translation (Unnatural & Rigid):
                      </span>
                      <p className="font-medium text-slate-800 italic mb-1.5">"{ex.literalTranslation}"</p>
                      <span className="text-[10px] text-slate-500 block">English Source: "{ex.englishLiteral}"</span>
                    </div>

                    {/* Localized Idiomatic Version */}
                    <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-3">
                      <span className="font-bold text-emerald-800 block text-[11px] mb-1">
                        ✅ Production Localized & Code-Switched:
                      </span>
                      <p className="font-semibold text-emerald-950 mb-1.5">"{ex.naturalLocalized}"</p>
                      <span className="text-[10px] text-emerald-700 font-semibold block">Natural Financial Register</span>
                    </div>
                  </div>

                  {/* Cultural Rationale */}
                  <div className="mt-3 p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700">
                    <strong className="text-slate-900">Cultural & Financial Rationale:</strong> {ex.culturalRationale}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: ASR & TTS BENCHMARK REPORT */}
      {activeTab === 'asr_benchmarks' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Language-Specific ASR & TTS Benchmark Report ({activeMarket === 'philippines' ? 'Philippines' : 'Indonesia'})
              </h3>
              <p className="text-xs text-slate-500">
                Evaluation of streaming speech recognition on intra-sentential code-switching and regional accents.
              </p>
            </div>
            <span className="px-3 py-1 rounded text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Provider: {asrBenchmark.provider}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Model Architecture</span>
              <span className="text-sm font-bold text-slate-900 block mt-1">{asrBenchmark.model}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Code-Switching WER</span>
              <span className="text-sm font-bold text-emerald-700 block mt-1">{asrBenchmark.codeSwitchingWER}% WER</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Streaming Latency</span>
              <span className="text-sm font-bold text-indigo-700 block mt-1">{asrBenchmark.latencyMs} ms / chunk</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Colloquial Score</span>
              <span className="text-sm font-bold text-blue-700 block mt-1">{asrBenchmark.colloquialHandlingScore} / 10.0</span>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <strong className="text-slate-900 block mb-1">Regional Accent Performance:</strong>
              <p className="text-slate-600 leading-relaxed">{asrBenchmark.regionalAccentPerformance}</p>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
              <strong className="text-amber-900 block mb-1">Documented Compromises & Known Gaps:</strong>
              <p className="text-amber-800 leading-relaxed">{asrBenchmark.knownLimitations}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
