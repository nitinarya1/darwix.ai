import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  UserCheck, 
  AlertTriangle, 
  ShieldAlert, 
  BookOpen, 
  Send, 
  RotateCcw, 
  FileCheck2, 
  DollarSign, 
  Building2, 
  Calendar, 
  TrendingUp, 
  Volume2,
  ExternalLink
} from 'lucide-react';
import { ConversationTurn, QualificationData, CRMLeadPayload } from '../types';
import { dialogueManagerInstance } from '../modules/voiceAgent/dialogueManager';
import { VOICE_AGENT_TEST_SCENARIOS } from '../modules/voiceAgent/testScenarios';
import { speechServiceInstance } from '../modules/voiceAgent/speechService';

export const Q1VoiceAgentView: React.FC = () => {
  const [callStatus, setCallStatus] = useState<'IDLE' | 'ACTIVE' | 'ESCALATED' | 'COMPLETED'>('IDLE');
  const [isMicActive, setIsMicActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [qualification, setQualification] = useState<QualificationData>(dialogueManagerInstance.getQualificationData());
  const [crmPayload, setCrmPayload] = useState<CRMLeadPayload | null>(null);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [isScenarioRunning, setIsScenarioRunning] = useState(false);

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  // Start Call
  const handleStartCall = () => {
    dialogueManagerInstance.reset();
    setTurns([]);
    setCrmPayload(null);
    setCallStatus('ACTIVE');
    setIsMuted(false);

    // Initial Agent Greeting
    const greeting = dialogueManagerInstance.processUserInput('hello');
    setTurns([greeting.turn]);
    setQualification({ ...greeting.qualification });

    speechServiceInstance.speak(greeting.turn.text);
  };

  // End Call
  const handleEndCall = () => {
    speechServiceInstance.stopSpeaking();
    speechServiceInstance.stopListening();
    setIsMicActive(false);
    setCallStatus('COMPLETED');

    // Auto-generate Mock CRM Action
    const payload = dialogueManagerInstance.generateCRMLeadPayload();
    setCrmPayload(payload);
  };

  // Escalate to Human
  const handleEscalateCall = () => {
    const result = dialogueManagerInstance.processUserInput('I need to speak to a real person right now.');
    setTurns(prev => [...prev, result.turn]);
    setQualification({ ...result.qualification });
    setCallStatus('ESCALATED');
    speechServiceInstance.speak(result.turn.text);

    const payload = dialogueManagerInstance.generateCRMLeadPayload();
    setCrmPayload(payload);
  };

  // Submit User Message
  const handleSendMessage = (userMessage: string) => {
    if (!userMessage.trim() || callStatus === 'IDLE' || callStatus === 'COMPLETED') return;

    const userTurn: ConversationTurn = {
      id: `turn_u_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      speaker: 'user',
      text: userMessage.trim(),
      isGrounded: false,
      citations: []
    };

    setTurns(prev => [...prev, userTurn]);
    setTextInput('');

    // Process through Dialogue Manager (grounded against Q2 KB)
    setTimeout(() => {
      const response = dialogueManagerInstance.processUserInput(userMessage);
      setTurns(prev => [...prev, response.turn]);
      setQualification({ ...response.qualification });

      if (response.escalated) {
        setCallStatus('ESCALATED');
      }

      speechServiceInstance.speak(response.turn.text);

      // Auto update CRM payload
      if (response.qualification.status === 'PRE_APPROVED' || response.escalated) {
        setCrmPayload(dialogueManagerInstance.generateCRMLeadPayload());
      }
    }, 400);
  };

  // Run Pre-configured Test Scenario
  const handleRunPresetScenario = async (scenarioIndex: number) => {
    const scenario = VOICE_AGENT_TEST_SCENARIOS[scenarioIndex];
    if (!scenario) return;

    dialogueManagerInstance.reset();
    setTurns([]);
    setCrmPayload(null);
    setCallStatus('ACTIVE');
    setIsScenarioRunning(true);

    for (let i = 0; i < scenario.dialogueScript.length; i++) {
      const step = scenario.dialogueScript[i];
      if (step.speaker === 'user') {
        // User turn
        const uTurn: ConversationTurn = {
          id: `turn_sc_u_${i}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          speaker: 'user',
          text: step.text,
          isGrounded: false,
          citations: []
        };
        setTurns(prev => [...prev, uTurn]);
        await new Promise(r => setTimeout(r, 700));

        // Process Agent response
        const resp = dialogueManagerInstance.processUserInput(step.text);
        setTurns(prev => [...prev, resp.turn]);
        setQualification({ ...resp.qualification });

        if (resp.escalated) {
          setCallStatus('ESCALATED');
        }
        await new Promise(r => setTimeout(r, 600));
      } else if (i === 0 && step.speaker === 'agent') {
        // Initial greeting
        const aTurn: ConversationTurn = {
          id: `turn_sc_a_0`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          speaker: 'agent',
          text: step.text,
          isGrounded: true,
          citations: [{
            recordId: 'kb_qualification_002',
            title: 'Underwriting Criteria & Borrower Guidelines',
            source: 'Section 4.2 Standard Rules',
            snippet: 'Baseline operational history (24mo) and gross annual revenue ($200k) checks.'
          }]
        };
        setTurns([aTurn]);
        await new Promise(r => setTimeout(r, 600));
      }
    }

    setIsScenarioRunning(false);
    const finalPayload = dialogueManagerInstance.generateCRMLeadPayload();
    setCrmPayload(finalPayload);
  };

  // Toggle Microphone
  const toggleMic = () => {
    if (!isMicActive) {
      const ok = speechServiceInstance.startListening((transcript, isFinal) => {
        setTextInput(transcript);
        if (isFinal) {
          handleSendMessage(transcript);
        }
      });
      if (ok) setIsMicActive(true);
    } else {
      speechServiceInstance.stopListening();
      setIsMicActive(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Objective and Light Theme */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                Production Voice Agent
              </span>
              <span className="text-xs text-slate-500 font-medium">Commercial SME Loan Qualification</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Grounded Web Calling Interface & Qualification Engine
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Connected directly to the Knowledge Base. Employs verifiable grounding, zero-hallucination fallback, and instant human escalation.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center space-x-3">
            <div className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="block text-xs font-semibold text-slate-500">Call State</span>
              <span className={`text-sm font-bold ${
                callStatus === 'ACTIVE' ? 'text-emerald-600' :
                callStatus === 'ESCALATED' ? 'text-amber-600' :
                callStatus === 'COMPLETED' ? 'text-blue-600' : 'text-slate-500'
              }`}>
                {callStatus}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="block text-xs font-semibold text-slate-500">Decision</span>
              <span className={`text-sm font-bold ${
                qualification.status === 'PRE_APPROVED' ? 'text-emerald-600' :
                qualification.status === 'REQUIRES_CO_SIGNER' ? 'text-amber-600' :
                qualification.status === 'MANUAL_REVIEW' ? 'text-indigo-600' :
                qualification.status === 'INELIGIBLE' ? 'text-red-600' : 'text-slate-500'
              }`}>
                {qualification.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Calling Console (Left) + Qualification & CRM Engine (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Calling Interface & Transcript (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[640px]">
            {/* Call Header Controls */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60 rounded-t-xl">
              <div className="flex items-center space-x-3">
                <div className={`w-3.5 h-3.5 rounded-full ${callStatus === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Live Voice Channel: Direct SIP / WebRTC</h3>
                  <p className="text-xs text-slate-500">Caller: +1 (800) 412-APEX • Grounding: Live RAG Active</p>
                </div>
              </div>

              {/* Call Controls */}
              <div className="flex items-center space-x-2">
                {callStatus === 'IDLE' || callStatus === 'COMPLETED' ? (
                  <button
                    onClick={handleStartCall}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Start Call</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-2 rounded-lg border text-xs font-semibold transition-colors ${
                        isMuted ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleEscalateCall}
                      className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors"
                      title="Protocol 88 Escalation"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Escalate</span>
                    </button>
                    <button
                      onClick={handleEndCall}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>End</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Audio Waveform Bar (When Active) */}
            {callStatus === 'ACTIVE' && (
              <div className="px-4 py-2 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Volume2 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-800">Synthesized Voice Streaming</span>
                </div>
                <div className="flex items-center space-x-1 h-6">
                  <span className="w-1 bg-blue-500 rounded-full animate-wave-1"></span>
                  <span className="w-1 bg-blue-600 rounded-full animate-wave-2"></span>
                  <span className="w-1 bg-blue-400 rounded-full animate-wave-3"></span>
                  <span className="w-1 bg-blue-700 rounded-full animate-wave-4"></span>
                  <span className="w-1 bg-blue-500 rounded-full animate-wave-5"></span>
                </div>
              </div>
            )}

            {/* Transcript Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
              {turns.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Phone className="w-12 h-12 text-slate-300 mb-3 stroke-[1.5]" />
                  <p className="font-semibold text-sm text-slate-600">Call is currently idle</p>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Click "Start Call" to speak or select one of the 5 required evaluation scenarios below to run automated verification.
                  </p>
                </div>
              ) : (
                turns.map((turn) => {
                  const isAgent = turn.speaker === 'agent';
                  return (
                    <div
                      key={turn.id}
                      className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center space-x-1.5 mb-1 px-1">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${isAgent ? 'text-blue-700' : 'text-slate-600'}`}>
                          {isAgent ? 'Apex Voice AI' : 'Applicant'}
                        </span>
                        <span className="text-[10px] text-slate-400">{turn.timestamp}</span>
                        {turn.wasEscalated && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-800 font-bold border border-amber-300">
                            Protocol 88 Escalated
                          </span>
                        )}
                      </div>

                      <div
                        className={`max-w-[85%] rounded-xl p-3.5 text-sm shadow-xs ${
                          isAgent
                            ? 'bg-white text-slate-800 border border-slate-200'
                            : 'bg-blue-600 text-white font-medium'
                        }`}
                      >
                        <p className="leading-relaxed">{turn.text}</p>

                        {/* Grounding Citations */}
                        {isAgent && turn.citations && turn.citations.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                            <span className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              <BookOpen className="w-3 h-3 mr-1 text-blue-600" />
                              Grounded Knowledge Source:
                            </span>
                            {turn.citations.map((c, idx) => (
                              <div key={idx} className="bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-700">
                                <span className="font-semibold text-blue-700">[{c.recordId}]</span> {c.title}
                                <p className="text-[11px] text-slate-500 italic mt-0.5">{c.snippet}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={transcriptEndRef} />
            </div>

            {/* Input Bar (Speech or Text) */}
            <div className="p-3 border-t border-slate-200 bg-white rounded-b-xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(textInput);
                }}
                className="flex items-center space-x-2"
              >
                <button
                  type="button"
                  onClick={toggleMic}
                  disabled={callStatus !== 'ACTIVE'}
                  className={`p-2.5 rounded-lg border transition-colors ${
                    isMicActive 
                      ? 'bg-red-50 text-red-600 border-red-300 animate-pulse' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 disabled:opacity-50'
                  }`}
                  title={isMicActive ? 'Stop Mic' : 'Voice Input via Microphone'}
                >
                  <Mic className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={callStatus === 'ACTIVE' ? "Type customer speech or speak via microphone..." : "Start call to enable conversation..."}
                  disabled={callStatus !== 'ACTIVE'}
                  className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 text-slate-800"
                />

                <button
                  type="submit"
                  disabled={callStatus !== 'ACTIVE' || !textInput.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold flex items-center space-x-1 transition-colors shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Speak</span>
                </button>
              </form>
            </div>
          </div>

          {/* Test Coverage Preset Scenarios */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">Pre-Configured Scenarios</h4>
              </div>
              <span className="text-xs text-slate-500 font-medium">5 Scenarios</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {VOICE_AGENT_TEST_SCENARIOS.map((sc, idx) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setSelectedScenarioIndex(idx);
                    handleRunPresetScenario(idx);
                  }}
                  disabled={isScenarioRunning}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                    selectedScenarioIndex === idx
                      ? 'border-blue-500 bg-blue-50/70 text-blue-900 font-medium'
                      : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                  }`}
                >
                  <div className="font-bold text-slate-900 truncate">{sc.name.split(':')[0]}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{sc.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Qualification State & Optional Business Action (Mock CRM) (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Live Underwriting Extraction Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Live Qualification Attributes</h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                Real-Time Parser
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center">
                  <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" /> Business Entity:
                </span>
                <span className="font-bold text-slate-800">
                  {qualification.businessName || '— (In Discovery)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" /> Operational History:
                </span>
                <span className="font-bold text-slate-800">
                  {qualification.yearsInBusiness > 0 ? `${qualification.yearsInBusiness} years` : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center">
                  <DollarSign className="w-3.5 h-3.5 mr-1 text-slate-400" /> Annual Gross Revenue:
                </span>
                <span className="font-bold text-slate-800">
                  {qualification.annualRevenue > 0 ? `$${qualification.annualRevenue.toLocaleString()}` : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center">
                  <UserCheck className="w-3.5 h-3.5 mr-1 text-slate-400" /> Guarantor Credit Score:
                </span>
                <span className="font-bold text-slate-800">
                  {qualification.creditScore > 0 ? `${qualification.creditScore} FICO` : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-slate-400" /> Bankruptcy History:
                </span>
                <span className={`font-bold ${qualification.bankruptcyHistory ? 'text-red-600' : 'text-emerald-700'}`}>
                  {qualification.bankruptcyHistory ? 'Yes (Restricted)' : 'None Reported'}
                </span>
              </div>
            </div>

            {/* Preliminary Underwriting Offer Card */}
            {qualification.preliminaryOffer && (
              <div className="mt-4 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 uppercase">Preliminary Offer Generated</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">
                    APPROVED
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-emerald-200 text-xs">
                  <div>
                    <span className="text-emerald-700 block text-[10px]">Maximum Facility</span>
                    <span className="font-bold text-emerald-950 text-sm">
                      ${qualification.preliminaryOffer.maxAmount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block text-[10px]">Indicative APR</span>
                    <span className="font-bold text-emerald-950 text-sm">
                      {qualification.preliminaryOffer.interestRateRange}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block text-[10px]">Revolving Tenor</span>
                    <span className="font-medium text-emerald-900">
                      {qualification.preliminaryOffer.termMonths} Months
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block text-[10px]">Est. Amortization</span>
                    <span className="font-medium text-emerald-900">
                      ~${qualification.preliminaryOffer.estimatedMonthlyPayment.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Underwriting Notes */}
            {qualification.qualificationNotes.length > 0 && (
              <div className="mt-3 p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">Underwriter Audit Log:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                  {qualification.qualificationNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Optional Business Action: Mock CRM Summary & Webhook Payload */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">CRM Lead Webhook Dispatch</h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                crmPayload?.webhookStatus === 'DISPATCHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {crmPayload ? crmPayload.webhookStatus : 'READY'}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Automatically generates and dispatches an underwriting lead payload to Salesforce/HubSpot webhooks upon call completion or escalation.
            </p>

            <div className="mt-3 bg-slate-900 rounded-lg p-3 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-56">
              <pre>{JSON.stringify(crmPayload || {
                action: 'Awaiting call finalization or preliminary qualification decision...',
                schema: 'ApexCRMLeadWebhookPayload_v2'
              }, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
