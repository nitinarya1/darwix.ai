import { VoiceCallPresetScenario } from '../../types';

export const VOICE_AGENT_TEST_SCENARIOS: VoiceCallPresetScenario[] = [
  {
    id: 'SCENARIO_1_COOPERATIVE',
    name: 'Scenario 1: Cooperative Customer (Clean Pre-Approval)',
    tag: 'cooperative',
    description: 'Applicant provides operational history (3 years), annual revenue ($520,000), credit score (710), and requested limit ($150,000). System grounds against Section 4.2 and issues instant pre-approval.',
    dialogueScript: [
      {
        speaker: 'agent',
        text: 'Welcome to Apex Commercial Lending. I can assist you with preliminary qualification for our SME Growth Line in just 3 minutes. How long has your business been operating under current ownership, and what is your approximate gross annual revenue?',
        expectedGrounding: 'kb_qualification_002 (Operational History >= 24mo)'
      },
      {
        speaker: 'user',
        text: 'Hello! Our company is Miller Logistics LLC. We have been running for 3 years and our gross revenue last year was around $520,000.'
      },
      {
        speaker: 'agent',
        text: 'Great, 3 years of operational history and $520,000 gross revenue satisfies our baseline eligibility. What is your approximate personal credit score or FICO range, and how much credit are you seeking?',
        expectedGrounding: 'kb_qualification_002 (Baseline $200k Revenue Check)'
      },
      {
        speaker: 'user',
        text: 'My FICO score is 710, and we are looking for a $150,000 line of credit to finance inventory and new warehouse equipment.'
      },
      {
        speaker: 'agent',
        text: 'Congratulations! Based on 3 years of operations and $520,000 in revenue, you are pre-approved for an Apex Growth Line of up to $150,000 at 8.5% - 10.25% APR. Rates and terms quoted are preliminary estimates subject to bank verification. Would you like me to dispatch your pre-approval packet to your email?',
        expectedGrounding: 'kb_product_001 (Preferred Tier APR & Limit)',
        systemAction: 'DISPATCH_CRM_LEAD'
      }
    ],
    expectedOutcome: 'Pre-Approved ($150k facility at 8.5% - 10.25% APR, Risk Tier: LOW, CRM Webhook Dispatched)'
  },
  {
    id: 'SCENARIO_2_OBJECTION',
    name: 'Scenario 2: Grounded Objection Handling (Bank Rate Comparison)',
    tag: 'objection',
    description: 'Customer objects that Chase/traditional banks offer 6% rates. The bot executes grounded objection retrieval from Sales Training Module 7 (KB_003) explaining speed, draw-as-you-need, and no prepayment penalty.',
    dialogueScript: [
      {
        speaker: 'agent',
        text: 'Our SME Growth Line ranges from 8.5% to 14.5% APR depending on credit tier and Debt Service Coverage Ratio, with facility limits up to $750,000.',
        expectedGrounding: 'kb_product_001'
      },
      {
        speaker: 'user',
        text: 'Wait a second, traditional commercial banks like Chase are offering business loans at 6.0%. Why should I pay 9% or 11% with your firm?'
      },
      {
        speaker: 'agent',
        text: 'Traditional banks require 60 to 90 days and average a 75% rejection rate. Apex provides preliminary qualification in 4 minutes, same-day capital drawdowns, and zero prepayment penalties after 90 days. Furthermore, with our revolving structure, you only pay interest on what you actually draw rather than the full principal from day one.',
        expectedGrounding: 'kb_objection_003 (Sales Training Module 7: Bank Rate Comparison)'
      },
      {
        speaker: 'user',
        text: 'I see. So if I only draw $30,000 for 60 days to buy inventory, I only pay interest on that $30,000?'
      },
      {
        speaker: 'agent',
        text: 'Exactly! On a $30,000 draw over 60 days, your total financing cost is under $450. You preserve liquidity without long-term debt drag.',
        expectedGrounding: 'kb_objection_003 (Draw-as-you-need efficiency)'
      }
    ],
    expectedOutcome: 'Objection resolved using grounded knowledge base facts without fabricating numbers.'
  },
  {
    id: 'SCENARIO_3_CONFLICTING',
    name: 'Scenario 3: Incomplete & Conflicting Financial Details',
    tag: 'conflicting',
    description: 'Caller initially claims $600k revenue, but states they have only been open for 14 months and have no business bank statements. Bot applies the 18-month minimum rule and safely flags manual review / ineligibility.',
    dialogueScript: [
      {
        speaker: 'agent',
        text: 'Welcome to Apex Commercial Lending. How long has your business been operating under current ownership, and what is your approximate gross annual revenue?'
      },
      {
        speaker: 'user',
        text: 'We are making huge money, over $600,000 this year, but we incorporated just 14 months ago and I do not have business tax filings yet.'
      },
      {
        speaker: 'agent',
        text: 'Under Section 4.2 of our Credit Policy Manual, our baseline requirement is 24 consecutive months of active operations, with a strict minimum of 18 months for our provisional exception. Because your business is at 14 months, we cannot issue an automated pre-approval today.',
        expectedGrounding: 'kb_qualification_002 (Underwriting Criteria: 24mo baseline, 18mo exception)'
      },
      {
        speaker: 'user',
        text: 'Can I still get at least $50,000 if I sign a personal guarantee?'
      },
      {
        speaker: 'agent',
        text: 'Our credit policy strictly enforces the 18-month tenure cutoff to comply with portfolio credit box guidelines. I will route your file to our business advisory queue once you cross the 18-month mark in four months.',
        expectedGrounding: 'kb_qualification_002 (Provisional exception rules)'
      }
    ],
    expectedOutcome: 'Safe Ineligibility Flag (Tenure < 18mo). Bot prevents hallucinated approval.'
  },
  {
    id: 'SCENARIO_4_OUT_OF_SCOPE',
    name: 'Scenario 4: Out-of-Scope Query (Cryptocurrency / Speculation)',
    tag: 'out_of_scope',
    description: 'Applicant asks to use the commercial line of credit to trade Bitcoin and speculative forex derivatives. Bot detects prohibited industry and states unavailability rather than inventing guidelines.',
    dialogueScript: [
      {
        speaker: 'agent',
        text: 'What will be the primary operational use of funds for this credit facility?'
      },
      {
        speaker: 'user',
        text: 'We want to draw $200,000 to set up a crypto mining facility and do automated bitcoin arbitrage and forex trading.'
      },
      {
        speaker: 'agent',
        text: "I don't have that specific underwriting policy on file for speculative or unapproved financing categories; let me transfer you to an underwriting specialist to get an exact confirmation.",
        expectedGrounding: 'kb_qualification_002 (Section 4.2: Prohibited Industries - Crypto/Forex)'
      },
      {
        speaker: 'user',
        text: 'Why cant an AI give me a direct approval for crypto equipment?'
      },
      {
        speaker: 'agent',
        text: 'Under Section 4.2 of our Credit Policy, speculative cryptocurrency trading and forex brokerages fall under restricted risk classes. Only an underwriting officer can issue an official determination.',
        expectedGrounding: 'kb_qualification_002 & kb_compliance_008'
      }
    ],
    expectedOutcome: 'Safe fallback triggered. States policy unavailability rather than inventing terms.'
  },
  {
    id: 'SCENARIO_5_ESCALATION',
    name: 'Scenario 5: Explicit Human Escalation Request',
    tag: 'escalation',
    description: 'Caller requests a human representative immediately. Bot immediately triggers Protocol 88 escalation, preserves conversation context, and connects to an underwriting officer.',
    dialogueScript: [
      {
        speaker: 'agent',
        text: 'Welcome to Apex Commercial Lending. How may I assist you with your business credit needs today?'
      },
      {
        speaker: 'user',
        text: 'Look, I do not want to talk to an automated voice. Transfer me to a human representative right now.'
      },
      {
        speaker: 'agent',
        text: 'I understand completely. I am transferring you directly to a Senior Commercial Underwriting Specialist right now. Please hold for one moment while I connect you.',
        expectedGrounding: 'kb_compliance_008 (Protocol 88: Mandatory Voice Escalation)',
        systemAction: 'EXECUTE_HUMAN_TRANSFER'
      }
    ],
    expectedOutcome: 'Call state escalated, CRM payload tagged with "Customer requested live licensed officer".'
  }
];
