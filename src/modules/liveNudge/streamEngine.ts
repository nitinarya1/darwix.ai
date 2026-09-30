import { 
  LiveAudioChunk, 
  DetectedSignal, 
  LiveNudge, 
  PipelineLatencyMetrics, 
  LatencyAggregateReport,
  SignalType,
  NudgePriority 
} from '../../types';

export interface StreamScenario {
  id: string;
  name: string;
  description: string;
  category: 'missed_cross_sell' | 'compliance_gap' | 'rising_frustration' | 'noisy_ambiguous';
  chunks: {
    speaker: 'Agent' | 'Customer';
    text: string;
    isNoisy?: boolean;
    expectedSignal?: SignalType;
  }[];
}

export const CALL_AUDIO_STREAM_SCENARIOS: StreamScenario[] = [
  {
    id: 'STREAM_01_CROSS_SELL',
    name: 'Scenario A: Missed Cross-Sell (Second Commercial Vehicle)',
    description: 'Customer mentions acquiring a second delivery van while applying for single-unit financing. Pipeline detects cross-sell opportunity and nudges agent to pitch multi-vehicle fleet discount.',
    category: 'missed_cross_sell',
    chunks: [
      { speaker: 'Agent', text: 'Good morning, thank you for calling commercial lending. How can I help you today?' },
      { speaker: 'Customer', text: 'Hi, I need a $45,000 equipment loan for a refrigerated Mercedes Sprinter van for my catering routes.' },
      { speaker: 'Agent', text: 'Understood. We can certainly finance that refrigerated van with a 36-month term.' },
      { speaker: 'Customer', text: 'Actually, we are also looking at picking up a second dry cargo van next month if our route contract gets signed.' },
      { speaker: 'Agent', text: 'Okay, let me run the numbers on the first Sprinter van for you right now.' }
    ]
  },
  {
    id: 'STREAM_02_COMPLIANCE_GAP',
    name: 'Scenario B: Skipped Compliance Disclosure (Mandatory Rate Disclaimer)',
    description: 'Agent quotes interest rate directly ("I can get you locked in at 9.25% APR") without providing the legally mandated preliminary estimate disclosure (Protocol 88). Immediate critical compliance nudge generated.',
    category: 'compliance_gap',
    chunks: [
      { speaker: 'Customer', text: 'Can you tell me what kind of interest rate I will be paying on a $100,000 credit line?' },
      { speaker: 'Agent', text: 'Based on your revenue, I can lock you in at a fixed 9.25% APR right now over the phone.' },
      { speaker: 'Customer', text: 'Sounds good. Can you send the loan contract over for signature?' },
      { speaker: 'Agent', text: 'Sure thing, I will prepare the final contract right away.' }
    ]
  },
  {
    id: 'STREAM_03_RISING_FRUSTRATION',
    name: 'Scenario C: Rising Customer Frustration & Escalation Risk',
    description: 'Customer experiences acoustic agitation and expresses annoyance over repeated document requests. Pipeline detects rising negative valence and nudges agent to de-escalate and empathize before continuing.',
    category: 'rising_frustration',
    chunks: [
      { speaker: 'Agent', text: 'I will also need you to resubmit your last three months of bank statements in PDF format.' },
      { speaker: 'Customer', text: 'Are you kidding me? I already uploaded my statements twice on your portal yesterday!' },
      { speaker: 'Agent', text: 'The files in the portal were unreadable, so policy requires another upload.' },
      { speaker: 'Customer', text: 'This is completely ridiculous! I have been on hold for 20 minutes and nobody seems to know what they are doing!' }
    ]
  },
  {
    id: 'STREAM_04_NOISY_AMBIGUOUS',
    name: 'Scenario D: Noisy / Ambiguous Call (Suppression Test)',
    description: 'Simulates heavy background street noise, ambiguous muttered speech, and low-confidence audio. System tests confidence thresholds and duplicate suppression to avoid annoying low-value alerts.',
    category: 'noisy_ambiguous',
    chunks: [
      { speaker: 'Agent', text: 'Hello, Apex Lending, how can I assist you today?' },
      { speaker: 'Customer', text: '...[heavy traffic noise]... yeah maybe looking... [muffled background chatter]...', isNoisy: true },
      { speaker: 'Agent', text: 'I am having a little trouble hearing you, could you repeat that?' },
      { speaker: 'Customer', text: '...[screeching car horn]... uh... just checking some rates or something... [static]...', isNoisy: true },
      { speaker: 'Agent', text: 'No problem at all, take your time.' }
    ]
  }
];

export class RealTimeCallNudgePipeline {
  private activeNudges: LiveNudge[] = [];
  private detectedSignals: DetectedSignal[] = [];
  private latencyHistory: PipelineLatencyMetrics[] = [];
  private topicCooldowns: Map<string, number> = new Map(); // topic -> timestamp
  private cooldownDurationMs = 30000; // 30s cooldown
  private confidenceThreshold = 0.75;

  public reset(): void {
    this.activeNudges = [];
    this.detectedSignals = [];
    this.latencyHistory = [];
    this.topicCooldowns.clear();
  }

  public getActiveNudges(): LiveNudge[] {
    return this.activeNudges.filter(n => !n.isSuppressed);
  }

  public getAllNudges(): LiveNudge[] {
    return this.activeNudges;
  }

  public getDetectedSignals(): DetectedSignal[] {
    return this.detectedSignals;
  }

  public getLatencyMetrics(): PipelineLatencyMetrics[] {
    return this.latencyHistory;
  }

  public processAudioChunk(
    chunkIndex: number,
    speaker: 'Agent' | 'Customer',
    text: string,
    isNoisy = false
  ): {
    chunk: LiveAudioChunk;
    signals: DetectedSignal[];
    nudges: LiveNudge[];
    latency: PipelineLatencyMetrics;
  } {
    const startOverall = performance.now();

    // 1. Simulate Streaming ASR Latency (chunk processing: 180ms - 290ms)
    const asrLatency = Math.floor(180 + Math.random() * 90 + (isNoisy ? 120 : 0));

    const audioChunk: LiveAudioChunk = {
      chunkIndex,
      timestampMs: Date.now(),
      speaker,
      audioSnippetText: text,
      isAmbiguousOrNoisy: isNoisy,
      soundDecibels: isNoisy ? 78 : 55
    };

    // 2. Signal Extraction
    const sigStart = performance.now();
    const signals = this.extractSignals(audioChunk);
    const signalExtractionLatency = Math.max(12, Math.floor(performance.now() - sigStart + 18));

    // 3. Nudge Generation & Control Logic
    const llmStart = performance.now();
    const nudges: LiveNudge[] = [];

    for (const signal of signals) {
      const nudge = this.evaluateNudgeRules(signal, isNoisy);
      if (nudge) {
        nudges.push(nudge);
        this.activeNudges.unshift(nudge);
      }
    }
    const llmNudgeLatency = Math.max(45, Math.floor(performance.now() - llmStart + 60));

    // 4. UI Delivery Latency
    const uiDeliveryLatency = 14;

    const totalLatency = asrLatency + signalExtractionLatency + llmNudgeLatency + uiDeliveryLatency;

    const latencyMetric: PipelineLatencyMetrics = {
      chunkIndex,
      audioDurationMs: 1500,
      asrLatencyMs: asrLatency,
      signalExtractionLatencyMs: signalExtractionLatency,
      llmNudgeLatencyMs: llmNudgeLatency,
      uiDeliveryLatencyMs: uiDeliveryLatency,
      totalEndToEndLatencyMs: totalLatency
    };

    this.latencyHistory.push(latencyMetric);

    return {
      chunk: audioChunk,
      signals,
      nudges,
      latency: latencyMetric
    };
  }

  private extractSignals(chunk: LiveAudioChunk): DetectedSignal[] {
    const signals: DetectedSignal[] = [];
    const text = chunk.audioSnippetText.toLowerCase();
    const now = new Date().toLocaleTimeString();

    // Signal A: Missed Cross-Sell (Customer mentions second vehicle / expanding fleet / secondary location)
    if (chunk.speaker === 'Customer' && /second (?:dry cargo |delivery )?van|second vehicle|another truck|two units|additional warehouse/i.test(text)) {
      signals.push({
        id: `SIG_CROSS_${Date.now()}`,
        type: 'missed_cross_sell',
        speaker: 'Customer',
        triggerText: chunk.audioSnippetText,
        confidence: 0.92,
        timestamp: now,
        extractedEntity: 'Commercial Fleet / Multi-Unit Asset Expansion'
      });
    }

    // Signal B: Compliance Gap (Agent quotes rate without mandatory disclosure)
    if (chunk.speaker === 'Agent' && /lock you in at|fixed [0-9.]+% apr|rate is [0-9.]+%|interest will be/i.test(text)) {
      if (!/preliminary|subject to underwriting|estimate/i.test(text)) {
        signals.push({
          id: `SIG_COMP_${Date.now()}`,
          type: 'compliance_gap',
          speaker: 'Agent',
          triggerText: chunk.audioSnippetText,
          confidence: 0.96,
          timestamp: now,
          extractedEntity: 'Omitted Protocol 88 Rate Disclaimer'
        });
      }
    }

    // Signal C: Rising Frustration
    if (chunk.speaker === 'Customer' && /are you kidding me|ridiculous|already uploaded|nobody seems to know|on hold for|wasting my time/i.test(text)) {
      signals.push({
        id: `SIG_FRUST_${Date.now()}`,
        type: 'rising_frustration',
        speaker: 'Customer',
        triggerText: chunk.audioSnippetText,
        confidence: 0.89,
        timestamp: now,
        extractedEntity: 'Acoustic Negative Valence / Process Fatigue'
      });
    }

    // Signal D: Payment Difficulty
    if (chunk.speaker === 'Customer' && /cannot afford|cash flow problem|invoice delayed|defer payment|struggling to pay/i.test(text)) {
      signals.push({
        id: `SIG_PAY_${Date.now()}`,
        type: 'payment_difficulty',
        speaker: 'Customer',
        triggerText: chunk.audioSnippetText,
        confidence: 0.87,
        timestamp: now,
        extractedEntity: 'Temporary Working Capital Constriction'
      });
    }

    // Signal E: Noisy Audio Ambiguity
    if (chunk.isAmbiguousOrNoisy) {
      signals.push({
        id: `SIG_NOISE_${Date.now()}`,
        type: 'objection_unaddressed',
        speaker: 'Customer',
        triggerText: chunk.audioSnippetText,
        confidence: 0.38, // LOW CONFIDENCE -> WILL BE SUPPRESSED
        timestamp: now,
        extractedEntity: 'Low SNR Speech Artifact'
      });
    }

    for (const sig of signals) {
      this.detectedSignals.unshift(sig);
    }

    return signals;
  }

  private evaluateNudgeRules(signal: DetectedSignal, isNoisy: boolean): LiveNudge | null {
    const now = Date.now();
    const lastTriggered = this.topicCooldowns.get(signal.type) || 0;
    const timeSinceLast = now - lastTriggered;

    // Check Rule 1: Confidence Threshold
    if (signal.confidence < this.confidenceThreshold) {
      return {
        id: `NUDGE_${signal.id}`,
        signalId: signal.id,
        signalType: signal.type,
        priority: 'LOW',
        headline: 'Suppressed: Low-Confidence Acoustic Signal',
        recommendedAction: 'Signal suppressed to prevent agent distraction.',
        suggestedScript: '',
        timestamp: new Date().toLocaleTimeString(),
        cooldownRemainingSec: 0,
        isSuppressed: true,
        suppressionReason: 'LOW_CONFIDENCE',
        timeToDisplayMs: 25,
        status: 'EXPIRED'
      };
    }

    // Check Rule 2: Cooldown Window (Duplicate Suppression)
    if (timeSinceLast < this.cooldownDurationMs) {
      const remainingSec = Math.ceil((this.cooldownDurationMs - timeSinceLast) / 1000);
      return {
        id: `NUDGE_${signal.id}`,
        signalId: signal.id,
        signalType: signal.type,
        priority: 'LOW',
        headline: `Suppressed: Cooldown Active (${signal.type})`,
        recommendedAction: `Recent nudge for ${signal.type} fired ${Math.round(timeSinceLast/1000)}s ago.`,
        suggestedScript: '',
        timestamp: new Date().toLocaleTimeString(),
        cooldownRemainingSec: remainingSec,
        isSuppressed: true,
        suppressionReason: 'COOLDOWN_ACTIVE',
        timeToDisplayMs: 22,
        status: 'EXPIRED'
      };
    }

    // Check Rule 3: Noisy Channel Suppression
    if (isNoisy) {
      return {
        id: `NUDGE_${signal.id}`,
        signalId: signal.id,
        signalType: signal.type,
        priority: 'LOW',
        headline: 'Suppressed: Noisy Audio Ambient Noise',
        recommendedAction: 'Channel SNR below threshold.',
        suggestedScript: '',
        timestamp: new Date().toLocaleTimeString(),
        cooldownRemainingSec: 0,
        isSuppressed: true,
        suppressionReason: 'NOISY_CHANNEL',
        timeToDisplayMs: 20,
        status: 'EXPIRED'
      };
    }

    // Register Cooldown
    this.topicCooldowns.set(signal.type, now);

    // Formulate Actionable Nudge based on Signal
    switch (signal.type) {
      case 'missed_cross_sell':
        return {
          id: `NUDGE_${signal.id}`,
          signalId: signal.id,
          signalType: signal.type,
          priority: 'MEDIUM',
          headline: 'Opportunity: Multi-Vehicle Commercial Fleet Package',
          recommendedAction: 'Borrower mentioned purchasing a 2nd van next month. Proactively present multi-unit line discount.',
          suggestedScript: '"Since you are planning to add a second van next month, we can bundle both into a multi-vehicle facility now to save you 50% on origination fees."',
          timestamp: new Date().toLocaleTimeString(),
          cooldownRemainingSec: 30,
          isSuppressed: false,
          timeToDisplayMs: 340,
          status: 'ACTIVE'
        };

      case 'compliance_gap':
        return {
          id: `NUDGE_${signal.id}`,
          signalId: signal.id,
          signalType: signal.type,
          priority: 'CRITICAL',
          headline: 'Compliance Warning: Missing Mandatory Rate Disclaimer',
          recommendedAction: 'State immediately that rate quotes are preliminary estimates subject to underwriting review (Protocol 88).',
          suggestedScript: '"Please note that this rate is a preliminary estimate subject to full bank statement review and final underwriting approval."',
          timestamp: new Date().toLocaleTimeString(),
          cooldownRemainingSec: 30,
          isSuppressed: false,
          timeToDisplayMs: 310,
          status: 'ACTIVE'
        };

      case 'rising_frustration':
        return {
          id: `NUDGE_${signal.id}`,
          signalId: signal.id,
          signalType: signal.type,
          priority: 'HIGH',
          headline: 'Customer Frustration: Portal Document Upload Friction',
          recommendedAction: 'Acknowledge portal fatigue, apologize for the inconvenience, and offer direct secure email submission.',
          suggestedScript: '"I completely understand how frustrating it is having to re-upload documents. Let me send a direct secure upload link directly to your cell phone right now."',
          timestamp: new Date().toLocaleTimeString(),
          cooldownRemainingSec: 30,
          isSuppressed: false,
          timeToDisplayMs: 325,
          status: 'ACTIVE'
        };

      case 'payment_difficulty':
        return {
          id: `NUDGE_${signal.id}`,
          signalId: signal.id,
          signalType: signal.type,
          priority: 'MEDIUM',
          headline: 'Servicing Support: Offer 3-Day Grace Period / Forbearance',
          recommendedAction: 'Remind borrower of our automatic 3-calendar-day grace period with zero penalty or explain 60-day interest-only option.',
          suggestedScript: '"We understand business cash flows fluctuate. You have a 3-day grace period with zero penalty, or we can look at an interest-only bridge for 60 days."',
          timestamp: new Date().toLocaleTimeString(),
          cooldownRemainingSec: 30,
          isSuppressed: false,
          timeToDisplayMs: 335,
          status: 'ACTIVE'
        };

      default:
        return null;
    }
  }

  // Aggregate Latency Metrics (P50 and P95)
  public computeLatencyReport(): LatencyAggregateReport {
    const list = this.latencyHistory;
    if (list.length === 0) {
      return {
        sampleCount: 0,
        asrP50: 210, asrP95: 285,
        signalP50: 28, signalP95: 42,
        llmP50: 95, llmP95: 140,
        e2eP50: 345, e2eP95: 480
      };
    }

    const percentile = (arr: number[], p: number) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const idx = Math.floor((sorted.length - 1) * p);
      return sorted[idx];
    };

    return {
      sampleCount: list.length,
      asrP50: percentile(list.map(l => l.asrLatencyMs), 0.5),
      asrP95: percentile(list.map(l => l.asrLatencyMs), 0.95),
      signalP50: percentile(list.map(l => l.signalExtractionLatencyMs), 0.5),
      signalP95: percentile(list.map(l => l.signalExtractionLatencyMs), 0.95),
      llmP50: percentile(list.map(l => l.llmNudgeLatencyMs), 0.5),
      llmP95: percentile(list.map(l => l.llmNudgeLatencyMs), 0.95),
      e2eP50: percentile(list.map(l => l.totalEndToEndLatencyMs), 0.5),
      e2eP95: percentile(list.map(l => l.totalEndToEndLatencyMs), 0.95)
    };
  }
}

export const callNudgePipelineInstance = new RealTimeCallNudgePipeline();
