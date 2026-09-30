// ==========================================
// QUESTION 2: KNOWLEDGE BASE TYPES
// ==========================================

export type KnowledgeCategory = 
  | 'product_terms' 
  | 'underwriting_policy' 
  | 'qualification_rules' 
  | 'faq' 
  | 'objection_handling' 
  | 'compliance_disclaimer';

export interface RawDocumentInput {
  id: string;
  title: string;
  source: string;
  rawContent: string;
  category: KnowledgeCategory;
  hasDirtyContent: boolean;
  containsPII: boolean;
  isDuplicateOrNearDuplicate?: boolean;
}

export interface PIIEntity {
  type: 'SSN' | 'TAX_ID' | 'PHONE' | 'EMAIL' | 'CARD_NUMBER' | 'PERSON_NAME';
  original: string;
  masked: string;
  position: [number, number];
}

export interface CleanedDocument {
  id: string;
  record_id: string;
  title: string;
  cleanContent: string;
  category: KnowledgeCategory;
  source: string;
  version: string;
  pii_detected: boolean;
  pii_entities_removed: PIIEntity[];
  cleaning_actions: string[];
  is_near_duplicate: boolean;
  similarity_score?: number;
  duplicate_of_id?: string;
  chunks: KnowledgeChunk[];
}

export interface KnowledgeChunk {
  chunk_id: string;
  parent_record_id: string;
  title: string;
  category: KnowledgeCategory;
  source: string;
  version: string;
  content: string;
  tokens: number;
  keywords: string[];
  embedding: number[];
}

export interface SearchResult {
  chunk: KnowledgeChunk;
  score: number;
  denseScore: number;
  bm25Score: number;
  citation: string;
  relevanceExplanation: string;
}

export interface RetrievalTestCase {
  id: string;
  queryType: 'Product' | 'Policy' | 'Qualification' | 'FAQ' | 'Objection';
  userQuestion: string;
  expectedCategory: KnowledgeCategory;
  retrievedChunkId: string;
  sourceReference: string;
  relevanceExplanation: string;
  verdict: 'CORRECT' | 'PARTIALLY_CORRECT' | 'INCORRECT';
  confidenceScore: number;
}

// ==========================================
// QUESTION 1: VOICE AGENT TYPES
// ==========================================

export type CallStatus = 'IDLE' | 'CONNECTING' | 'ACTIVE' | 'ON_HOLD' | 'ESCALATED' | 'COMPLETED';

export type QualificationStatus = 'PENDING' | 'PRE_APPROVED' | 'REQUIRES_CO_SIGNER' | 'MANUAL_REVIEW' | 'INELIGIBLE';

export interface QualificationData {
  businessName: string;
  yearsInBusiness: number;
  annualRevenue: number;
  creditScore: number;
  requestedAmount: number;
  loanPurpose: string;
  bankruptcyHistory: boolean;
  taxReturnsAvailable: boolean;
  status: QualificationStatus;
  qualificationNotes: string[];
  preliminaryOffer?: {
    maxAmount: number;
    interestRateRange: string;
    termMonths: number;
    estimatedMonthlyPayment: number;
  };
}

export interface ConversationTurn {
  id: string;
  timestamp: string;
  speaker: 'agent' | 'user' | 'system';
  text: string;
  audioUrl?: string;
  isGrounded: boolean;
  citations: {
    recordId: string;
    title: string;
    source: string;
    snippet: string;
  }[];
  intentDetected?: string;
  sentiment?: 'positive' | 'neutral' | 'skeptical' | 'frustrated';
  wasEscalated?: boolean;
}

export interface CRMLeadPayload {
  leadId: string;
  timestamp: string;
  callerPhone: string;
  companyName: string;
  qualificationDecision: QualificationStatus;
  estimatedEligibleAmount: number;
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH';
  collectedAttributes: Record<string, string | number | boolean>;
  transcriptSummary: string;
  escalationNeeded: boolean;
  escalationReason?: string;
  webhookStatus: 'DISPATCHED' | 'QUEUED' | 'FAILED';
}

export interface VoiceCallPresetScenario {
  id: string;
  name: string;
  tag: 'cooperative' | 'objection' | 'conflicting' | 'out_of_scope' | 'escalation';
  description: string;
  dialogueScript: {
    speaker: 'agent' | 'user';
    text: string;
    expectedGrounding?: string;
    systemAction?: string;
  }[];
  expectedOutcome: string;
}

// ==========================================
// QUESTION 3: NATIVE MULTILINGUAL BOT TYPES
// ==========================================

export type MarketType = 'philippines' | 'indonesia';

export interface LocalizationExample {
  category: string;
  englishLiteral: string;
  literalTranslation: string;
  naturalLocalized: string;
  culturalRationale: string;
}

export interface ASRBenchmark {
  provider: string;
  model: string;
  testedLanguages: string;
  codeSwitchingWER: number; // Word Error Rate %
  latencyMs: number;
  colloquialHandlingScore: number; // 1-10
  regionalAccentPerformance: string;
  knownLimitations: string;
}

export interface MultilingualCallTranscript {
  id: string;
  scenarioTitle: string;
  market: MarketType;
  customerProfile: string;
  turns: {
    speaker: 'Agent' | 'Customer';
    originalText: string;
    languageMix: string; // e.g. "Taglish (70% Tagalog, 30% EN)"
    englishGroundedMeaning: string;
    specialTermsUsed: string[];
  }[];
  outcome: string;
  complianceAdherence: boolean;
}

// ==========================================
// QUESTION 4: REAL-TIME NUDGES & PIPELINE
// ==========================================

export type SignalType = 
  | 'missed_cross_sell' 
  | 'compliance_gap' 
  | 'rising_frustration' 
  | 'payment_difficulty' 
  | 'buying_signal' 
  | 'objection_unaddressed';

export type NudgePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface LiveAudioChunk {
  chunkIndex: number;
  timestampMs: number;
  speaker: 'Agent' | 'Customer';
  audioSnippetText: string;
  isAmbiguousOrNoisy: boolean;
  soundDecibels: number;
}

export interface DetectedSignal {
  id: string;
  type: SignalType;
  speaker: 'Agent' | 'Customer';
  triggerText: string;
  confidence: number;
  timestamp: string;
  extractedEntity?: string;
}

export interface LiveNudge {
  id: string;
  signalId: string;
  signalType: SignalType;
  priority: NudgePriority;
  headline: string;
  recommendedAction: string;
  suggestedScript: string;
  timestamp: string;
  cooldownRemainingSec: number;
  isSuppressed: boolean;
  suppressionReason?: 'COOLDOWN_ACTIVE' | 'LOW_CONFIDENCE' | 'DUPLICATE_TOPIC' | 'NOISY_CHANNEL';
  timeToDisplayMs: number;
  status: 'ACTIVE' | 'DISMISSED' | 'APPLIED' | 'EXPIRED';
}

export interface PipelineLatencyMetrics {
  chunkIndex: number;
  audioDurationMs: number;
  asrLatencyMs: number;
  signalExtractionLatencyMs: number;
  llmNudgeLatencyMs: number;
  uiDeliveryLatencyMs: number;
  totalEndToEndLatencyMs: number;
}

export interface LatencyAggregateReport {
  sampleCount: number;
  asrP50: number;
  asrP95: number;
  signalP50: number;
  signalP95: number;
  llmP50: number;
  llmP95: number;
  e2eP50: number;
  e2eP95: number;
}
