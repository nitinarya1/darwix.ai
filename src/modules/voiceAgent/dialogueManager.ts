import { ConversationTurn, QualificationData, CRMLeadPayload, SearchResult } from '../../types';
import { knowledgeEngineInstance } from '../knowledgeBase/engine';

export class VoiceDialogueManager {
  private qualificationData: QualificationData = {
    businessName: '',
    yearsInBusiness: 0,
    annualRevenue: 0,
    creditScore: 0,
    requestedAmount: 0,
    loanPurpose: '',
    bankruptcyHistory: false,
    taxReturnsAvailable: true,
    status: 'PENDING',
    qualificationNotes: []
  };

  private turns: ConversationTurn[] = [];
  private isEscalated = false;
  private currentStage: 'GREETING' | 'REVENUE' | 'TIME_IN_BIZ' | 'FICO' | 'PURPOSE' | 'DECISION' = 'GREETING';

  public reset(): void {
    this.qualificationData = {
      businessName: '',
      yearsInBusiness: 0,
      annualRevenue: 0,
      creditScore: 0,
      requestedAmount: 0,
      loanPurpose: '',
      bankruptcyHistory: false,
      taxReturnsAvailable: true,
      status: 'PENDING',
      qualificationNotes: []
    };
    this.turns = [];
    this.isEscalated = false;
    this.currentStage = 'GREETING';
  }

  public getQualificationData(): QualificationData {
    return this.qualificationData;
  }

  public getTurns(): ConversationTurn[] {
    return this.turns;
  }

  public getIsEscalated(): boolean {
    return this.isEscalated;
  }

  // Core dialogue engine linking directly to Q2 Knowledge Base
  public processUserInput(userInput: string): { turn: ConversationTurn; qualification: QualificationData; escalated: boolean } {
    const turnId = `turn_${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const cleanInput = userInput.trim().toLowerCase();

    // 1. Check for Human Escalation Request
    if (this.detectHumanEscalationRequest(cleanInput)) {
      this.isEscalated = true;
      const turn: ConversationTurn = {
        id: turnId,
        timestamp,
        speaker: 'agent',
        text: 'I understand completely. I am transferring you directly to a Senior Commercial Underwriting Specialist right now. Please hold for one moment while I connect you.',
        isGrounded: true,
        citations: [
          {
            recordId: 'kb_compliance_008',
            title: 'Human Escalation & Regulatory Compliance Protocol',
            source: 'Compliance Department SOP',
            snippet: 'PROTOCOL 88: Trigger immediate transfer when caller explicitly demands human agent.'
          }
        ],
        intentDetected: 'HUMAN_ESCALATION_REQUEST',
        sentiment: 'frustrated',
        wasEscalated: true
      };
      this.turns.push(turn);
      this.updateEligibility();
      return { turn, qualification: this.qualificationData, escalated: true };
    }

    // 2. Check for Out-of-Scope / Unsupported Questions (Crypto, Forex, Speculation, Consumer Personal Loans)
    if (this.detectOutOfScopeQuestion(cleanInput)) {
      const turn: ConversationTurn = {
        id: turnId,
        timestamp,
        speaker: 'agent',
        text: "I don't have that specific underwriting policy on file for speculative or unapproved financing categories; let me transfer you to an underwriting specialist to get an exact confirmation.",
        isGrounded: true,
        citations: [
          {
            recordId: 'kb_qualification_002',
            title: 'Underwriting Criteria & Borrower Guidelines',
            source: 'Section 4.2 Prohibited Industries',
            snippet: 'Prohibited industries: speculative cryptocurrency trading/mining, foreign exchange brokerages, and unlicensed dispensaries.'
          }
        ],
        intentDetected: 'OUT_OF_SCOPE_QUERY',
        sentiment: 'skeptical',
        wasEscalated: false
      };
      this.turns.push(turn);
      return { turn, qualification: this.qualificationData, escalated: false };
    }

    // 3. Check if input is a Knowledge Base Question (Product, Objection, FAQ, Policy)
    const kbResults = knowledgeEngineInstance.search(userInput, 2);
    const topResult = kbResults[0];

    const isQuestionOrObjection = 
      /why|rate|cost|bank|chase|how fast|disburs|time|interest|apr|prepayment|penalty|grace|document/i.test(cleanInput) ||
      (topResult && topResult.score > 2.0 && cleanInput.split(' ').length > 3);

    if (isQuestionOrObjection && topResult) {
      let responseText = '';
      if (/why|bank|expensive|higher|cheaper/i.test(cleanInput)) {
        // Objection Handling grounded in KB_003
        responseText = `Traditional banks require 60 to 90 days and average a 75% rejection rate. Apex provides preliminary qualification in 4 minutes, same-day capital drawdowns, and zero prepayment penalties after 90 days. Furthermore, you only pay interest on funds actively drawn.`;
      } else if (/disburs|how fast|when|wire|ach/i.test(cleanInput)) {
        // FAQ grounded in KB_004
        responseText = `Once digital agreements are executed, funds are disbursed the same business day via ACH if signed before 1:00 PM EST, or within 90 minutes via Fedwire for immediate settlement.`;
      } else if (/rate|apr|interest|cost/i.test(cleanInput)) {
        // Product Terms grounded in KB_001
        responseText = `Our SME Growth Line ranges from 8.5% to 14.5% APR depending on credit tier and Debt Service Coverage Ratio, with facility limits up to $750,000 and zero prepayment penalty after 90 days.`;
      } else {
        // General Grounded Extraction
        responseText = `According to our commercial credit policy: ${topResult.chunk.content.slice(0, 220)}...`;
      }

      const turn: ConversationTurn = {
        id: turnId,
        timestamp,
        speaker: 'agent',
        text: responseText,
        isGrounded: true,
        citations: kbResults.map(r => ({
          recordId: r.chunk.parent_record_id,
          title: r.chunk.title,
          source: r.chunk.source,
          snippet: r.chunk.content.slice(0, 140) + '...'
        })),
        intentDetected: 'GROUNDED_KNOWLEDGE_INQUIRY',
        sentiment: 'neutral'
      };
      this.turns.push(turn);
      return { turn, qualification: this.qualificationData, escalated: false };
    }

    // 4. Conversation Flow: Parse qualification entities and progress
    this.extractQualificationEntities(cleanInput);
    this.updateEligibility();

    const turn = this.generateQualificationTurn(turnId, timestamp, cleanInput, topResult);
    this.turns.push(turn);

    return { turn, qualification: this.qualificationData, escalated: this.isEscalated };
  }

  private detectHumanEscalationRequest(input: string): boolean {
    const escalationPhrases = [
      'human', 'real person', 'agent', 'representative', 'operator',
      'speak with someone', 'talk to someone', 'transfer me', 'supervisor', 'manager'
    ];
    return escalationPhrases.some(phrase => input.includes(phrase));
  }

  private detectOutOfScopeQuestion(input: string): boolean {
    const outOfScopePhrases = [
      'crypto', 'bitcoin', 'ethereum', 'forex', 'currency trading',
      'gambling', 'casino', 'payday loan', 'personal student loan'
    ];
    return outOfScopePhrases.some(phrase => input.includes(phrase));
  }

  private extractQualificationEntities(input: string): void {
    // Extract Business Name
    if (/name is|company is|business is|called ([a-z0-9 &]+)/i.test(input)) {
      const match = input.match(/(?:name is|company is|business is|called) ([a-z0-9 &]+)/i);
      if (match && match[1]) this.qualificationData.businessName = match[1].trim();
    } else if (!this.qualificationData.businessName && /([a-z0-9 &]+ (?:llc|inc|corp|co|technologies|logistics|store))/i.test(input)) {
      const match = input.match(/([a-z0-9 &]+ (?:llc|inc|corp|co|technologies|logistics|store))/i);
      if (match && match[1]) this.qualificationData.businessName = match[1].trim();
    }

    // Extract Revenue
    if (/\$?\b([0-9]{1,4})(?:k|,000)\b/i.test(input) || /\$([0-9,]+)/.test(input) || /revenue is \$?([0-9,]+)/i.test(input)) {
      const kMatch = input.match(/\$?\b([0-9]{1,4})k\b/i);
      if (kMatch) {
        this.qualificationData.annualRevenue = parseInt(kMatch[1], 10) * 1000;
      } else {
        const numMatch = input.match(/\$?([0-9]{2,3}),?([0-9]{3})/);
        if (numMatch) {
          this.qualificationData.annualRevenue = parseInt(numMatch[1] + numMatch[2], 10);
        }
      }
    }

    // Extract Operational History (Months or Years)
    if (/([0-9]{1,2})\s*(?:years|yrs)/i.test(input)) {
      const yrMatch = input.match(/([0-9]{1,2})\s*(?:years|yrs)/i);
      if (yrMatch) this.qualificationData.yearsInBusiness = parseFloat(yrMatch[1]);
    } else if (/([0-9]{1,2})\s*(?:months|mo)/i.test(input)) {
      const moMatch = input.match(/([0-9]{1,2})\s*(?:months|mo)/i);
      if (moMatch) this.qualificationData.yearsInBusiness = Number((parseInt(moMatch[1], 10) / 12).toFixed(1));
    }

    // Extract Credit Score (FICO)
    const ficoMatch = input.match(/\b(score|fico|credit)?\s*([5-8][0-9]{2})\b/i);
    if (ficoMatch && ficoMatch[2]) {
      const score = parseInt(ficoMatch[2], 10);
      if (score >= 500 && score <= 850) {
        this.qualificationData.creditScore = score;
      }
    }

    // Extract Requested Amount
    if (/need \$?([0-9]{1,4})k/i.test(input) || /looking for \$?([0-9]{1,4})k/i.test(input) || /requesting \$?([0-9,]+)/i.test(input)) {
      const reqK = input.match(/\$?([0-9]{1,4})k/i);
      if (reqK) this.qualificationData.requestedAmount = parseInt(reqK[1], 10) * 1000;
    }

    // Purpose
    if (/inventory|equipment|expansion|payroll|working capital/i.test(input)) {
      const purposeMatch = input.match(/(inventory|equipment|expansion|payroll|working capital)/i);
      if (purposeMatch) this.qualificationData.loanPurpose = purposeMatch[1];
    }

    // Bankruptcy check
    if (/bankruptcy|chapter 7|chapter 11/i.test(input)) {
      this.qualificationData.bankruptcyHistory = true;
    }
  }

  private updateEligibility(): void {
    const q = this.qualificationData;
    const notes: string[] = [];

    if (q.annualRevenue > 0 && q.annualRevenue < 200000) {
      q.status = 'INELIGIBLE';
      notes.push('Gross revenue below minimum policy requirement ($200,000).');
    } else if (q.yearsInBusiness > 0 && q.yearsInBusiness < 1.5) {
      q.status = 'INELIGIBLE';
      notes.push('Operating history below 18-month minimum exception threshold.');
    } else if (q.bankruptcyHistory) {
      q.status = 'INELIGIBLE';
      notes.push('Active or recent bankruptcy reported within 36 months.');
    } else if (q.yearsInBusiness >= 1.5 && q.yearsInBusiness < 2.0) {
      q.status = 'MANUAL_REVIEW';
      notes.push('Provisional 18-23 month exception policy applies (Requires $35k/mo trailing revenue & 1.45x DSCR).');
    } else if (q.creditScore > 0 && q.creditScore < 620) {
      q.status = 'REQUIRES_CO_SIGNER';
      notes.push('FICO score between 580 and 619 requires secondary guarantor or collateral lien.');
    } else if (q.annualRevenue >= 200000 && q.yearsInBusiness >= 2.0 && (q.creditScore >= 620 || q.creditScore === 0)) {
      q.status = 'PRE_APPROVED';
      const approvedAmount = Math.min(q.requestedAmount || 150000, 250000);
      const isPreferred = q.creditScore >= 680;
      q.preliminaryOffer = {
        maxAmount: approvedAmount,
        interestRateRange: isPreferred ? '8.5% - 10.25% APR' : '10.5% - 13.5% APR',
        termMonths: 24,
        estimatedMonthlyPayment: Math.round((approvedAmount / 24) * 1.05)
      };
      notes.push(`Pre-approved based on standard underwriting guideline (Rev >= $200k, Time >= 2 yrs). Preliminary line up to $${approvedAmount.toLocaleString()}.`);
    }

    q.qualificationNotes = notes;
  }

  private generateQualificationTurn(
    turnId: string, 
    timestamp: string, 
    input: string, 
    topResult?: SearchResult
  ): ConversationTurn {
    const q = this.qualificationData;

    let responseText = '';
    const citations = topResult ? [{
      recordId: topResult.chunk.parent_record_id,
      title: topResult.chunk.title,
      source: topResult.chunk.source,
      snippet: topResult.chunk.content.slice(0, 120) + '...'
    }] : [];

    // Stage progression
    if (this.currentStage === 'GREETING') {
      this.currentStage = 'TIME_IN_BIZ';
      responseText = `Welcome to Apex Commercial Lending. I can assist you with preliminary qualification for our SME Growth Line in just 3 minutes. How long has your business been operating under current ownership, and what is your approximate gross annual revenue?`;
    } else if (q.yearsInBusiness > 0 && q.annualRevenue === 0) {
      responseText = `Great, ${q.yearsInBusiness} years of operational history satisfies our baseline tenure. What was your approximate gross revenue over the trailing 12 months?`;
    } else if (q.annualRevenue > 0 && q.creditScore === 0) {
      responseText = `Got it, $${q.annualRevenue.toLocaleString()} in gross revenue meets our threshold. What is your approximate personal credit score or FICO range?`;
    } else if (q.status === 'PRE_APPROVED' && q.preliminaryOffer) {
      responseText = `Congratulations! Based on ${q.yearsInBusiness} years of operations and $${q.annualRevenue.toLocaleString()} in revenue, you are pre-approved for an Apex Growth Line of up to $${q.preliminaryOffer.maxAmount.toLocaleString()} at ${q.preliminaryOffer.interestRateRange}. Rates and terms quoted are preliminary estimates subject to bank verification. Would you like me to dispatch your pre-approval packet to your email?`;
    } else if (q.status === 'REQUIRES_CO_SIGNER') {
      responseText = `Thank you for sharing your credit score. Under Section 4.2 of our credit policy, a score below 620 requires a secondary co-guarantor or additional asset coverage. We can still proceed with a joint applicant.`;
    } else if (q.status === 'MANUAL_REVIEW') {
      responseText = `Because your business is between 18 and 23 months old, you qualify under our provisional exception rule for up to $100,000 facility limit, subject to trailing 6-month bank statement review showing at least $35,000 monthly revenue.`;
    } else {
      responseText = `Thank you for providing those details. I have logged your company details for preliminary underwriting assessment. How much capital are you seeking to draw for your upcoming operations?`;
    }

    return {
      id: turnId,
      timestamp,
      speaker: 'agent',
      text: responseText,
      isGrounded: citations.length > 0,
      citations,
      intentDetected: 'QUALIFICATION_PROGRESSION',
      sentiment: 'positive'
    };
  }

  // Generate Optional Business Action: Mock CRM Lead Payload & Webhook
  public generateCRMLeadPayload(callerPhone = '+1 (555) 782-9901'): CRMLeadPayload {
    const q = this.qualificationData;
    const isEsc = this.isEscalated;
    
    return {
      leadId: `LEAD-APX-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      callerPhone,
      companyName: q.businessName || 'Provisional Commercial Applicant',
      qualificationDecision: q.status,
      estimatedEligibleAmount: q.preliminaryOffer ? q.preliminaryOffer.maxAmount : 0,
      riskTier: q.creditScore >= 680 ? 'LOW' : q.creditScore >= 620 ? 'MEDIUM' : 'HIGH',
      collectedAttributes: {
        yearsInBusiness: q.yearsInBusiness,
        annualRevenue: q.annualRevenue,
        creditScore: q.creditScore,
        requestedAmount: q.requestedAmount,
        purpose: q.loanPurpose || 'General Working Capital',
        bankruptcy: q.bankruptcyHistory
      },
      transcriptSummary: `Caller inquired about SME Growth line. Operational history: ${q.yearsInBusiness} yrs, Revenue: $${q.annualRevenue}. Qualification status: ${q.status}. Grounded underwriting citations verified.`,
      escalationNeeded: isEsc,
      escalationReason: isEsc ? 'Customer requested live licensed underwriting officer' : undefined,
      webhookStatus: 'DISPATCHED'
    };
  }
}

export const dialogueManagerInstance = new VoiceDialogueManager();
