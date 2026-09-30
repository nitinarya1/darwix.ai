import { LocalizationExample, ASRBenchmark, MultilingualCallTranscript } from '../../types';

export const PHILIPPINES_LOCALIZATION_EXAMPLES: LocalizationExample[] = [
  {
    category: 'Politeness & Relationship Building (Pakikipagkapwa)',
    englishLiteral: 'Your insurance premium payment of 2,500 pesos is due tomorrow. Please pay immediately.',
    literalTranslation: 'Ang iyong bayad sa premium ng seguro na 2,500 piso ay dapat bayaran bukas. Magbayad kaagad.',
    naturalLocalized: 'Magandang araw po Ma’am/Sir! Friendly reminder lang po mula sa BDO Bancassurance hinggil sa inyong life policy premium na ₱2,500 na due date po bukas para tuloy-tuloy po ang coverage at peace of mind ng inyong family.',
    culturalRationale: 'Direct literal translation in Filipino sounds blunt, harsh, and confrontational. Using "po", "friendly reminder lang po", and framing the payment around "tuloy-tuloy na coverage at peace of mind ng pamilya" honors Filipino social politeness (pakikisama) and emotional security.'
  },
  {
    category: 'Natural Taglish Code-Switching (Bancassurance Cross-Sell)',
    englishLiteral: 'Since you deposited money in the bank, we recommend you purchase an investment rider.',
    literalTranslation: 'Dahil nagdeposito ka ng pera sa bangko, inirerekomenda namin na bumili ka ng sakay sa pamumuhunan.',
    naturalLocalized: 'Napansin po namin na active ang inyong savings account. Perfect timing po para mag-dagdag ng investment rider sa inyong existing policy para may guaranteed insurance protection kayo while nag-e-earn ng dividends.',
    culturalRationale: 'In the Philippine banking sector, terms like "rider", "policy", "dividends", and "savings account" are never translated into pure Tagalog (which would translate "rider" as "sakay", confusing the customer). Taglish naturally blends English technical finance terms with Tagalog conversational glue particles (po, habang, para).'
  },
  {
    category: 'Objection & Grace Period Handling (Lapse Prevention)',
    englishLiteral: 'If you do not pay, your policy will lapse and your beneficiaries will get nothing.',
    literalTranslation: 'Kung hindi ka magbabayad, ang iyong patakaran ay magtatapos at ang iyong mga benepisyaryo ay walang makukuha.',
    naturalLocalized: 'Wag po kayong mag-alala, may 31-day grace period po tayo. Pwede po nating i-auto-debit sa inyong account or i-break down into quarterly hulog para hindi po mabigat sa budget at secured pa rin ang inyong mga beneficiaries.',
    culturalRationale: 'Threatening a customer with policy lapse violates trust. The localized approach offers relief ("Wag po kayong mag-alala"), cites the 31-day grace period, introduces colloquial installment terms ("quarterly hulog"), and reassures protection for loved ones.'
  }
];

export const PHILIPPINES_ASR_BENCHMARK: ASRBenchmark = {
  provider: 'OpenAI Whisper-large-v3 / Google Cloud Speech-to-Text v2',
  model: 'Chirp 2 & Whisper-v3 fine-tuned on Taglish corpora',
  testedLanguages: 'English (PH), Filipino (Tagalog), Taglish intra-sentential switching',
  codeSwitchingWER: 8.4,
  latencyMs: 380,
  colloquialHandlingScore: 9.1,
  regionalAccentPerformance: 'Strong on NCR (Metro Manila) Taglish and Southern Tagalog; minor phonetic substitution on Ilocano/Cebuano accented Tagalog (interchanging "e" and "i", "o" and "u").',
  knownLimitations: 'Struggles when speakers rapidly chain English abbreviations with Tagalog particles (e.g. "nag-ATM-withdraw po ako sa BDO"). Mitigated by domain dictionary lexicon masking.'
};

export const PHILIPPINES_RECORDED_CALLS: MultilingualCallTranscript[] = [
  {
    id: 'PH_CALL_001',
    scenarioTitle: 'Call 1: Bancassurance Cross-Sell & Health Rider Upgrade (Cooperative)',
    market: 'philippines',
    customerProfile: 'Mrs. Corazon Santos, 42, BDO Depositor with existing Term Life Policy',
    turns: [
      {
        speaker: 'Agent',
        originalText: 'Magandang hapon po Ma’am Corazon! This is Carlo from BDO Bancassurance. Tumatawag po ako kasi qualified po ang inyong account for an exclusive Critical Illness Rider add-on sa inyong existing life policy.',
        languageMix: 'Taglish (60% Tagalog, 40% English)',
        englishGroundedMeaning: 'Good afternoon Ma’am Corazon! This is Carlo from BDO Bancassurance. I am calling because your account qualifies for an exclusive Critical Illness Rider add-on to your existing life policy.',
        specialTermsUsed: ['Bancassurance', 'Critical Illness Rider', 'life policy', 'po']
      },
      {
        speaker: 'Customer',
        originalText: 'Ay hello Carlo. Magkano naman po ang dagdag sa monthly premium kung mag-a-add ako ng rider na yan?',
        languageMix: 'Taglish (70% Tagalog, 30% English)',
        englishGroundedMeaning: 'Oh hello Carlo. How much would be added to the monthly premium if I add that rider?',
        specialTermsUsed: ['monthly premium', 'rider', 'po']
      },
      {
        speaker: 'Agent',
        originalText: 'Napakaliit lang po Ma’am. Around ₱450 per month lang po ang additional premium, pero covered na po kayo up to ₱1,000,000 against 56 major medical conditions, plus direct bank auto-debit para hassle-free.',
        languageMix: 'Taglish (55% Tagalog, 45% English)',
        englishGroundedMeaning: 'It is very affordable Ma’am. Only around ₱450 per month additional premium, but you are covered up to ₱1,000,000 against 56 major medical conditions, plus direct bank auto-debit for a hassle-free experience.',
        specialTermsUsed: ['additional premium', 'covered', 'auto-debit', 'po']
      },
      {
        speaker: 'Customer',
        originalText: 'Sige Carlo, mukhang maganda nga para sa future ng mga kids. Padala mo na lang po sa registered email ko yung authorization form para ma-sign ko.',
        languageMix: 'Taglish (65% Tagalog, 35% English)',
        englishGroundedMeaning: 'Alright Carlo, that looks good for the kids’ future. Just send the authorization form to my registered email so I can sign it.',
        specialTermsUsed: ['authorization form', 'registered email', 'po']
      }
    ],
    outcome: 'Cross-sell accepted; Rider enrollment sent to verified customer email.',
    complianceAdherence: true
  },
  {
    id: 'PH_CALL_002',
    scenarioTitle: 'Call 2: Premium Pre-Due Reminder with Incomplete Funds Objection & Local Escalation',
    market: 'philippines',
    customerProfile: 'Mr. Eduardo Ramos, 37, Small Business Owner with Family Protect Policy',
    turns: [
      {
        speaker: 'Agent',
        originalText: 'Magandang araw po Sir Eduardo. Friendly reminder lang po mula sa AIA Bancassurance partner team hinggil sa inyong upcoming quarterly premium na ₱4,800 na due po sa October 5.',
        languageMix: 'Taglish (65% Tagalog, 35% English)',
        englishGroundedMeaning: 'Good day Sir Eduardo. Just a friendly reminder from the AIA Bancassurance partner team regarding your upcoming quarterly premium of ₱4,800 due on October 5.',
        specialTermsUsed: ['quarterly premium', 'due date', 'Bancassurance', 'po']
      },
      {
        speaker: 'Customer',
        originalText: 'Naku Carlo, medyo na-delay kasi ang collection ng delivery ko sa tindahan. Baka mag-lapse ba agad ang policy ko kung next week pa ako makabayad?',
        languageMix: 'Taglish (70% Tagalog, 30% English)',
        englishGroundedMeaning: 'Oh Carlo, collection from my store deliveries got delayed. Will my policy immediately lapse if I pay next week instead?',
        specialTermsUsed: ['lapse', 'policy', 'collection']
      },
      {
        speaker: 'Agent',
        originalText: 'Wag po kayong mag-alala Sir Eduardo. May automatic 31-day grace period po kayo from due date. Hindi po ma-la-lapse ang inyong coverage at protected pa rin po ang inyong beneficiaries.',
        languageMix: 'Taglish (60% Tagalog, 40% English)',
        englishGroundedMeaning: 'Do not worry Sir Eduardo. You have an automatic 31-day grace period from the due date. Your coverage will not lapse and your beneficiaries remain fully protected.',
        specialTermsUsed: ['grace period', 'coverage', 'beneficiaries', 'lapse']
      },
      {
        speaker: 'Customer',
        originalText: 'Salamat po sa clarification, napakalaking ginhawa. Gusto ko sanang magtanong kung pwede gawing monthly hulog na lang. Pwede ba akong kumausap sa policy officer niyo?',
        languageMix: 'Taglish (75% Tagalog, 25% English)',
        englishGroundedMeaning: 'Thank you for the clarification, that is a huge relief. I would like to ask if this can be turned into monthly installments instead. Can I speak with your policy officer?',
        specialTermsUsed: ['monthly hulog', 'policy officer', 'Salamat po']
      },
      {
        speaker: 'Agent',
        originalText: 'Opo Sir Eduardo, gladly po! Ililipat ko po kayo agad sa ating Bancassurance Servicing Specialist para matulungan kayo sa restructuring papuntang monthly payment. Paki-antay lang po sandali.',
        languageMix: 'Taglish (65% Tagalog, 35% English)',
        englishGroundedMeaning: 'Yes Sir Eduardo, with pleasure! I will transfer you immediately to our Bancassurance Servicing Specialist to assist you in restructuring to a monthly payment. Please hold on for just a moment.',
        specialTermsUsed: ['Servicing Specialist', 'restructuring', 'Opo', 'po']
      }
    ],
    outcome: 'Objection resolved with Grace Period assurance; gracefully escalated in Tagalog/Taglish without abrupt English fallback.',
    complianceAdherence: true
  }
];
