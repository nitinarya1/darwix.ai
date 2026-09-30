import React from 'react';
import { 
  CheckCircle, 
  ShieldCheck, 
  GitBranch, 
  Workflow
} from 'lucide-react';

export const SystemOverviewView: React.FC = () => {
  const systemSpecs = [
    { module: 'Business Underwriting Engine', metric: 'Standard Policy', detail: 'Commercial SME lending criteria ($200k gross revenue, 24-month operational history, DSCR >= 1.20x), rate matrices, and structured qualification payloads.' },
    { module: 'Knowledge Base & Retrieval', metric: '100% Grounded', detail: 'Hybrid Okapi BM25 + Dense Semantic Vector Reciprocal Rank Fusion (RRF k=60). Deterministic source citations on all responses.' },
    { module: 'Data Hygiene & PII Protection', metric: 'Automated Redaction', detail: 'Multi-pattern regex sanitization for SSN, Tax ID/EIN, credit cards, emails, and phone numbers with token hashing.' },
    { module: 'Regional Dialect Support', metric: 'Dual-Market', detail: 'Bancassurance in Philippine Taglish and Multifinance in Indonesian colloquial/Javanese registers with natural loanwords and zero abrupt English switching.' },
    { module: 'In-Call Audio Nudges', metric: 'Sub-500ms P95', detail: 'Streaming 1.3s chunk analysis, signal detection (compliance gap, cross-sell, sentiment), and 30-second topic cooldown suppression.' },
    { module: 'Telephony & WebRTC Interface', metric: 'Full Duplex', detail: 'Web Speech API continuous speech recognition, real-time waveform visualization, call stage state machine, and Protocol 88 escalation.' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
            System Architecture
          </span>
          <span className="text-xs text-emerald-700 font-bold flex items-center">
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Production Specifications Verified
          </span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mt-1">
          Production Architecture & Engineering Specifications
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Sub-second latency, grounded knowledge retrieval, native dialect code-switching, and in-call decision support.
        </p>
      </div>

      {/* System Architecture Flow Diagram Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Workflow className="w-4 h-4 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">End-to-End Pipeline Architecture</h3>
        </div>

        {/* Visual Architecture Flow Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Block 1 */}
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 flex flex-col justify-between">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-200 text-blue-900 uppercase">
                Stage 1
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-2">Data Ingestion & Cleaning</h4>
              <ul className="mt-2 space-y-1 text-slate-600 list-disc list-inside text-[11px]">
                <li>Web HTML, PDFs, and application forms</li>
                <li>PII Redactor (SSN, EIN, Cards, Phones)</li>
                <li>Noise & boilerplate stripper</li>
                <li>Deduplicator (Jaccard &gt; 0.70)</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-blue-200 text-blue-800 font-bold text-[11px]">
              Output: Sanitized Knowledge Chunks
            </div>
          </div>

          {/* Block 2 */}
          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 flex flex-col justify-between">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-200 text-indigo-900 uppercase">
                Stage 2
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-2">Hybrid Knowledge Core</h4>
              <ul className="mt-2 space-y-1 text-slate-600 list-disc list-inside text-[11px]">
                <li>Dense 32-dim semantic embeddings</li>
                <li>Okapi BM25 lexical keyword ranking</li>
                <li>Reciprocal Rank Fusion (k=60)</li>
                <li>Deterministic source citations</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-indigo-200 text-indigo-800 font-bold text-[11px]">
              Output: Grounded Retrieval Chunks
            </div>
          </div>

          {/* Block 3 */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-col justify-between">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900 uppercase">
                Stage 3
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-2">Voice Dialogue Engine</h4>
              <ul className="mt-2 space-y-1 text-slate-600 list-disc list-inside text-[11px]">
                <li>Web Speech API ASR & TTS</li>
                <li>Underwriting state machine</li>
                <li>Zero-hallucination policy guardrails</li>
                <li>Regional code-switching support</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-200 text-emerald-800 font-bold text-[11px]">
              Output: Verified CRM Lead & Webhook
            </div>
          </div>

          {/* Block 4 */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 flex flex-col justify-between">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                Stage 4
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-2">Live Telephony Nudges</h4>
              <ul className="mt-2 space-y-1 text-slate-600 list-disc list-inside text-[11px]">
                <li>Streaming 1.3s chunk ingestion</li>
                <li>Signal detector (cross-sell, compliance)</li>
                <li>30s topic cooldown suppression</li>
                <li>P50 (345ms) / P95 (480ms) telemetry</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-amber-200 text-amber-800 font-bold text-[11px]">
              Output: Real-Time Screen Nudges
            </div>
          </div>
        </div>
      </div>

      {/* Production Specifications Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">Production Specifications & Performance Metrics</h3>
        <p className="text-xs text-slate-500 mb-4">
          Core architectural benchmarks across dialogue management, knowledge retrieval, and real-time audio telemetry.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                <th className="py-2.5 px-4 w-1/4">System Module</th>
                <th className="py-2.5 px-3 w-36 text-center">Benchmark Standard</th>
                <th className="py-2.5 px-4">Production Implementation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {systemSpecs.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4 font-bold text-slate-900">{row.module}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700">{row.metric}</td>
                  <td className="py-2.5 px-4 text-slate-600 leading-relaxed">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Hardening & Reliability Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1.5" />
            Reliability & Guardrail Controls
          </h4>
          <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <li>
              <strong className="text-slate-800">Zero Hallucinations:</strong> The voice agent connects directly to the Knowledge Base. If an underwriting policy is absent or out-of-scope, it explicitly states unavailability and routes to Protocol 88 escalation.
            </li>
            <li>
              <strong className="text-slate-800">Privacy & PII Protection:</strong> Sensitive credentials (SSNs, tax IDs, credit card numbers, personal phone numbers) are stripped and tokenized before indexing.
            </li>
            <li>
              <strong className="text-slate-800">Cultural & Financial Localization:</strong> Natural Taglish (Philippines) and Javanese-influenced conversational Indonesian (Indonesia) with polite honorifics and financial loanwords.
            </li>
            <li>
              <strong className="text-slate-800">In-Call Decision Support:</strong> Sub-500ms P95 latency ensures recommendations appear before the conversation progresses.
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center">
            <GitBranch className="w-4 h-4 text-blue-600 mr-1.5" />
            Production Hardening Roadmap
          </h4>
          <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <li>
              <strong className="text-slate-800">Inbound SIP Trunking:</strong> Direct integration with Twilio Media Streams or FreeSWITCH PBX for live 1-800 inbound telephony lines.
            </li>
            <li>
              <strong className="text-slate-800">Distributed Vector DB:</strong> Integration with Qdrant or Pinecone for horizontal scaling across millions of documents.
            </li>
            <li>
              <strong className="text-slate-800">Fine-Tuned ASR Models:</strong> Custom acoustic models for high-noise industrial and regional call center environments.
            </li>
            <li>
              <strong className="text-slate-800">Kafka Stream Processing:</strong> Partitioned Kafka event buses for handling 50,000+ concurrent live audio streams.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
