import { LocalizationExample, ASRBenchmark, MultilingualCallTranscript } from '../../types';

export const INDONESIA_LOCALIZATION_EXAMPLES: LocalizationExample[] = [
  {
    category: 'Tone & Politeness in Debt Servicing (Rasa Hormat & Keramahan)',
    englishLiteral: 'You must pay your motorcycle loan installment immediately or we will charge a late fee.',
    literalTranslation: 'Anda harus membayar cicilan pinjaman sepeda motor Anda segera atau kami akan mengenakan biaya keterlambatan.',
    naturalLocalized: 'Selamat siang Bapak/Ibu. Mohon izin mengingatkan dari tim Pembiayaan Adira Finance, untuk angsuran motor bulan ini sudah mendekati tanggal jatuh tempo nggih. Supaya terhindar dari denda keterlambatan, pembayaran bisa via transfer m-Banking atau gerai Alfamart terdekat.',
    culturalRationale: 'Direct literal translation sounds punitive, aggressive, and disrespectful in Indonesian culture. Using polite markers ("Mohon izin mengingatkan"), natural finance terminology ("angsuran", "jatuh tempo", "denda keterlambatan"), and practical local payment channels (m-Banking, Alfamart) ensures compliance without inciting customer hostility.'
  },
  {
    category: 'Multifinance Vehicle Qualification & DP / Tenor Discussion',
    englishLiteral: 'What down payment and duration do you want for this vehicle financing?',
    literalTranslation: 'Berapa uang muka dan durasi yang Anda inginkan untuk pembiayaan kendaraan ini?',
    naturalLocalized: 'Untuk pengajuan unit Innova ini, rencana mau ambil tenor berapa bulan ya Mas? Di kami ada pilihan tenor 12 sampai 60 bulan, dengan promo DP ringan mulai 20% dan cicilan yang bisa disesuaikan dengan cash flow usaha Mas.',
    culturalRationale: 'In Indonesian consumer finance, "tenor" (loan duration in months), "DP" (down payment / uang muka), and "cicilan" are universal industry terms. Using the warm regional address "Mas/Mbak" and framing the option around "cash flow usaha" builds rapid rapport.'
  },
  {
    category: 'Colloquial Javanese Regional Accent Handling & Relief Option',
    englishLiteral: 'If you do not have money today, I will transfer you to a supervisor.',
    literalTranslation: 'Jika Anda tidak punya uang hari ini, saya akan mentransfer Anda ke penyelia.',
    naturalLocalized: 'Mboten nopo-nopo Mas Eko, ampun kuwatir. Kami paham kondisi omzet lagi agak seret. Kula sambungkan langsung ke Tim Restrukturisasi kami nggih, biar dibantu simulasi perpanjangan tenor atau keringanan denda.',
    culturalRationale: 'Switching abruptly to English or rigid formal jargon alienates regional borrowers. Incorporating natural Javanese conversational affixes ("mboten nopo-nopo", "ampun kuwatir", "nggih") immediately de-escalates stress and conveys genuine empathy.'
  }
];

export const INDONESIA_ASR_BENCHMARK: ASRBenchmark = {
  provider: 'Google Cloud Speech-to-Text v2 (id-ID) & Whisper-v3 Large',
  model: 'Chirp 2 (Southeast Asia Regional Accents) + Indonesian Financial Fine-Tune',
  testedLanguages: 'Bahasa Indonesia (Standard Jakarta), Colloquial Bahasa (Bahasa Gaul), Javanese-accented Indonesian (Jawa Timuran / Solo-Jogja)',
  codeSwitchingWER: 7.9,
  latencyMs: 360,
  colloquialHandlingScore: 9.3,
  regionalAccentPerformance: 'Excellent transcription on standard Jakarta and colloquial slang (kan, dong, nih, yaudah). Javanese regional inflections (glottal stop at word endings like "mbak", "nggih", "tenan") handled accurately with custom phoneme mapping.',
  knownLimitations: 'Minor phonetic confusion on colloquial contractions (e.g. "nggak ada" transcribed as "gaada" or "ngga ada"). Rectified via post-ASR regex normalization.'
};

export const INDONESIA_RECORDED_CALLS: MultilingualCallTranscript[] = [
  {
    id: 'ID_CALL_001',
    scenarioTitle: 'Call 1: Commercial Vehicle Multifinance Lead Qualification (Cooperative)',
    market: 'indonesia',
    customerProfile: 'Pak Hendra Pratama, 39, Logistics SME Owner in Surabaya, East Java',
    turns: [
      {
        speaker: 'Agent',
        originalText: 'Selamat pagi Mas Hendra, salam dari BAF Multifinance. Menindaklanjuti simulasi pembiayaan unit Mitsubishi Canter kemarin, apakah ada waktu sebentar untuk verifikasi data pengajuannya Mas?',
        languageMix: 'Bahasa Indonesia dengan sentuhan Jawa Timur santun',
        englishGroundedMeaning: 'Good morning Mas Hendra, greetings from BAF Multifinance. Following up on the Mitsubishi Canter financing simulation yesterday, do you have a quick moment to verify your application details?',
        specialTermsUsed: ['pembiayaan', 'unit', 'verifikasi data', 'Mas']
      },
      {
        speaker: 'Customer',
        originalText: 'Pagi Mas. Boleh, monggo. Rencana mau ambil 2 unit truk box buat perluasan rute logistik. Itu DP sama cicilan per bulannya jadinya berapa nggih?',
        languageMix: 'Colloquial Javanese-Indonesian (Surabaya/Jatim inflection)',
        englishGroundedMeaning: 'Morning Mas. Sure, please proceed. We plan to take 2 box truck units for logistics route expansion. What would the down payment and monthly installment be?',
        specialTermsUsed: ['monggo', 'DP', 'cicilan', 'nggih']
      },
      {
        speaker: 'Agent',
        originalText: 'Siap Mas Hendra. Untuk unit Canter, promo DP kami di 20%, sekitar Rp 95 juta per unit. Kalau Mas ambil tenor 36 bulan, angsuran per bulannya kena di kisaran Rp 11,8 juta sudah termasuk asuransi all-risk.',
        languageMix: 'Bahasa Indonesia Keuangan Terstruktur',
        englishGroundedMeaning: 'Understood Mas Hendra. For the Canter unit, our promotional DP is 20%, approximately Rp 95 million per unit. If you choose a 36-month tenor, the monthly installment is around Rp 11.8 million including all-risk insurance.',
        specialTermsUsed: ['DP', 'tenor', 'angsuran', 'asuransi all-risk']
      },
      {
        speaker: 'Customer',
        originalText: 'Oalah cocok itu angsurannya, masih masuk plafon cash flow gudang saya. Tolong dikirimkan rincian PO dan draft SPK ke WhatsApp saya ya Mas.',
        languageMix: 'Colloquial Jawa-Indonesia',
        englishGroundedMeaning: 'Ah that installment matches nicely, still within my warehouse cash flow ceiling. Please send the PO breakdown and SPK contract draft to my WhatsApp.',
        specialTermsUsed: ['angsuran', 'plafon', 'cash flow', 'SPK']
      }
    ],
    outcome: 'Qualification completed; Pre-approved SPK draft dispatched to customer WhatsApp.',
    complianceAdherence: true
  },
  {
    id: 'ID_CALL_002',
    scenarioTitle: 'Call 2: Installment Pre-Due Reminder with Cash Flow Objection & Local Escalation',
    market: 'indonesia',
    customerProfile: 'Ibu Rahayu Kusuma, 45, Catering Business Owner in Solo, Central Java',
    turns: [
      {
        speaker: 'Agent',
        originalText: 'Selamat siang Ibu Rahayu. Mohon maaf mengganggu waktunya sebentar, kami dari tim layanan Mega Auto Finance ingin memberikan reminder ramah terkait angsuran mobil Ertiga Ibu sebesar Rp 4.250.000 yang akan jatuh tempo tanggal 3 Oktober besok.',
        languageMix: 'Bahasa Indonesia Formal Sopan',
        englishGroundedMeaning: 'Good afternoon Ibu Rahayu. Apologies for taking a moment of your time, we are calling from Mega Auto Finance customer support to provide a friendly reminder regarding your Ertiga car installment of Rp 4,250,000 due tomorrow on October 3.',
        specialTermsUsed: ['angsuran', 'jatuh tempo', 'reminder ramah']
      },
      {
        speaker: 'Customer',
        originalText: 'Aduh Mbak, piye yo, tagihan katering dari kantor dinas belum cair minggu ini. Kalau misal telat bayar 3 hari, langsung kena denda nggak ya Mbak?',
        languageMix: 'Colloquial Javanese-Indonesian (Central Java inflection)',
        englishGroundedMeaning: 'Oh Mbak, how is it, my catering invoice from the government office has not cleared this week. If I am 3 days late, will I be penalized with a late fee immediately?',
        specialTermsUsed: ['piye yo', 'denda', 'Mbak']
      },
      {
        speaker: 'Agent',
        originalText: 'Mboten nopo-nopo Ibu Rahayu, ampun kuatir. Sesuai kebijakan SOP kami, ada masa tenggang toleransi (grace period) 3 hari kalender tanpa denda keterlambatan sama sekali. Jadi kalau Ibu bayar tanggal 6, tetap aman dan tidak ada biaya tambahan.',
        languageMix: 'Bahasa Indonesia Santun dengan Partikel Jawa',
        englishGroundedMeaning: 'No problem at all Ibu Rahayu, please do not worry. Under our SOP policy, there is a 3-calendar-day grace period with zero late fees. So if you pay on October 6, it is completely fine with no extra penalty.',
        specialTermsUsed: ['mboten nopo-nopo', 'ampun kuatir', 'masa tenggang', 'denda keterlambatan']
      },
      {
        speaker: 'Customer',
        originalText: 'Alhamdulillah matur nuwun infonya Mbak, tenang jadinya. Tapi kalau boleh, saya mau minta bantuan ngobrol sama petugas bagian restrukturisasi kredit dong, barangkali bisa minta keringanan tanggal jatuh tempo tiap bulan.',
        languageMix: 'Bahasa Indonesia & Krama Alus Jawa',
        englishGroundedMeaning: 'Praise God, thank you for the information Mbak, that gives me peace of mind. But if possible, I’d like to speak with an officer from the credit restructuring unit, maybe I can adjust the monthly due date.',
        specialTermsUsed: ['matur nuwun', 'restrukturisasi kredit', 'jatuh tempo']
      },
      {
        speaker: 'Agent',
        originalText: 'Nggih Ibu Rahayu, mangga kula sambungkan sakmenika ke Petugas Layanan Restrukturisasi kami nggih. Mohon ditunggu sekedap di telepon.',
        languageMix: 'Bahasa Jawa Krama Halus / Indonesia Santun (Eskalasi Tanpa Beralih ke Bahasa Inggris)',
        englishGroundedMeaning: 'Yes Ibu Rahayu, please allow me to connect you right now to our Restructuring Officer. Please hold the line for just a moment.',
        specialTermsUsed: ['Nggih', 'mangga kula sambungkan', 'sekedap']
      }
    ],
    outcome: 'Objection addressed with Grace Period assurance; smoothly escalated to Restructuring Unit entirely in polite Javanese-Indonesian register.',
    complianceAdherence: true
  }
];
