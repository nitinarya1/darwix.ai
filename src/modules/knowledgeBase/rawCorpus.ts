import { RawDocumentInput } from '../../types';

export const RAW_BUSINESS_CORPUS: RawDocumentInput[] = [
  {
    id: 'RAW_DOC_001',
    title: 'SME Commercial Growth Credit Line - Product Overview',
    source: 'Website > Commercial Products > Growth Line (Live Production Copy)',
    category: 'product_terms',
    hasDirtyContent: true,
    containsPII: false,
    rawContent: `
<!DOCTYPE html>
<header><nav><a href="/">Home</a> | <a href="/loans">Loans</a> | <a href="/rates">Live Rates</a> | <a href="/contact">Support</a></nav></header>
<main>
<h1>Apex Business SME Growth Line of Credit</h1>
<p>Empowering small and medium enterprises with flexible, on-demand revolving capital. Draw down anytime, repay with transparent weekly or monthly amortizations, and only pay interest on what you utilize.</p>

<h2>Key Financial Specifications:</h2>
<ul>
  <li>Maximum Facility Limit: $750,000 USD (Preliminary approval up to $250,000 without tax audited statements).</li>
  <li>Minimum Facility Limit: $25,000 USD.</li>
  <li>Term Length: 12 months, 24 months, or 36 months revolving tenor.</li>
  <li>Interest Rates: Prime + 2.75% to Prime + 7.25% APR (Effective APR ranges from 8.5% to 14.5% depending on credit tier and DSCR).</li>
  <li>Drawdown Speed: Same-day ACH disbursement for draw requests submitted before 1:00 PM EST. Wire disbursement available for 0.15% fee.</li>
  <li>Drawdown Fee: 1.0% origination fee per draw, automatically deducted from disbursement.</li>
  <li>Prepayment Penalty: $0. No prepayment penalties or early termination fees after 90 days of facility activation.</li>
</ul>
</main>
<footer>
  <p>&copy; 2026 Apex Financial Corp. All Rights Reserved. Member FDIC. Equal Housing Lender. Cookie Preferences | Privacy Policy | Terms of Service.</p>
</footer>
`
  },
  {
    id: 'RAW_DOC_002',
    title: 'Underwriting Criteria & Borrower Qualification Guidelines v3.4',
    source: 'Internal Risk & Underwriting Credit Policy Manual (PDF Excerpt)',
    category: 'qualification_rules',
    hasDirtyContent: true,
    containsPII: true,
    rawContent: `
[CONFIDENTIAL - INTERNAL CREDIT POLICY MANUAL - APEX LENDING GROUP - REV 3.4 - UPDATED 2026-02-15]
Page 14 of 98 | Authorized Underwriter Distribution Only

SECTION 4.2: MINIMUM APPLICANT ELIGIBILITY CRITERIA

All applicants seeking SME Commercial Lending must satisfy the baseline hurdles:
1. Operational History: Minimum of 24 consecutive months of active business operations under current ownership structure.
   - Exception Rule: Businesses operating between 18 and 23 months may qualify for a restricted provisional line (max $100,000) if trailing 6-month average gross revenue exceeds $35,000/month and Debt Service Coverage Ratio (DSCR) is >= 1.45x.
2. Gross Annual Revenue: Minimum $200,000 in verifiable gross annual business revenue (verified via 12 months business bank statements or Plaid connect).
3. Primary Guarantor Credit Score: Minimum FICO score of 620 for standard terms; 680+ unlocks preferred tier (under 10.5% APR).
4. Debt Service Coverage Ratio (DSCR): Minimum 1.20x trailing twelve-month DSCR based on Net Operating Income divided by total annual debt obligations.
5. Ineligible Business Structures:
   - Sole proprietorships with no separate business bank account.
   - Businesses with active unresolved tax liens exceeding $10,000 or open Chapter 7/11 bankruptcies within the past 36 months.
   - Prohibited industries: speculative cryptocurrency trading/mining, foreign exchange brokerages, adult entertainment, and unlicensed cannabis dispensaries.

AUDIT TEST RECORD (DO NOT LEAVE IN PUBLIC FACING DOCS):
Primary Test Case: Johnathan Miller, SSN: 382-49-1829, Personal Cell: (415) 892-0193, EIN: 94-8271928, Business: Miller Logistics LLC, Revenue: $480,000. Underwriter notes approved provisional facility.
`
  },
  {
    id: 'RAW_DOC_003',
    title: 'Objection Handling Playbook: Traditional Bank Rate Comparison',
    source: 'Sales Enablement & Agent Coaching Portal',
    category: 'objection_handling',
    hasDirtyContent: true,
    containsPII: false,
    rawContent: `
*** SALES TRAINING MODULE 7: HANDLING RATE AND COST OBJECTIONS ***
-----------------------------------------------------------------
Notice: For internal representative training only. Do not send raw bullet points to customers.

OBJECTION: "Traditional commercial banks (e.g. Chase, Wells Fargo) are offering loans at 6.0% to 7.0%. Why should I pay 8.5% to 14.5% with Apex?"

GROUNDED RESPONSE FRAMEWORK:
1. Underwriting Speed and Certainty: Traditional tier-1 commercial banks require 60 to 90 days, audited financial statements, personal home equity liens, and an average 75% rejection rate for businesses under $5M revenue. Apex delivers preliminary approval in 4 minutes and same-day capital access with no blanket personal real estate lien.
2. Structure Comparison: Traditional banks quote simple interest or benchmark indexes that mask maintenance fees, restrictive covenant checks, and mandatory compensating deposit balances (typically requiring 10-20% of the loan sitting idle in a zero-interest account).
3. Draw-As-You-Need Efficiency: On a term loan of $200,000 at 6%, you accrue interest on the full $200,000 from day one ($12,000/yr). With our revolving line, if you only draw $40,000 for 45 days to fulfill an inventory order, your actual interest paid is under $550.
4. Bridge Option: Our facilities have zero early termination penalty after 90 days. Borrowers frequently use Apex for immediate purchase discounts, then refinance once traditional banks complete their 3-month review.
`
  },
  {
    id: 'RAW_DOC_004',
    title: 'Frequently Asked Questions: Disbursement, Verification & Audits',
    source: 'Customer Support Portal Knowledgebase',
    category: 'faq',
    hasDirtyContent: true,
    containsPII: false,
    rawContent: `
Apex Business Support > Help Center > FAQ Category #39
------------------------------------------------------
Q: How quickly are funds disbursed after underwriting approval?
A: Once final digital loan agreements are signed and bank verification (Plaid or instant micro-deposits) is confirmed:
- ACH Transfers: Disbursed same business day if signed before 1:00 PM EST. Funds typically settle in the borrower's operating checking account within 12 to 24 hours.
- Federal Fedwire: Disbursed within 90 minutes of closing for same-day immediate settlement (nominal $25 domestic wire processing fee applies).
- Saturday / Sunday / Federal Holiday: Requests submitted on non-banking days are queued and executed on the immediate next banking business morning at 8:00 AM EST.

Q: What documents are required for preliminary vs final approval?
A:
- Preliminary approval (Instant Soft Pull): Basic business legal name, EIN, 3 months of electronic business bank statements (via Plaid or PDF upload), and driver's license of the majority owner. No impact to personal credit score.
- Final approval for lines > $250,000: 2 years of filed federal business tax returns (Form 1120/1120-S/1065) and debt schedule.
`
  },
  {
    id: 'RAW_DOC_005',
    title: 'DUPLICATE COPY: SME Commercial Growth Line Terms (Staging Mirror)',
    source: 'Staging Server Mirror /backup/product_terms_2026.html',
    category: 'product_terms',
    hasDirtyContent: true,
    containsPII: false,
    isDuplicateOrNearDuplicate: true,
    rawContent: `
<!DOCTYPE html>
<header><nav><a href="/">Home</a> | <a href="/loans">Loans</a></nav></header>
<main>
<h1>Apex Business SME Growth Line of Credit - Staging</h1>
<p>Empowering small and medium enterprises with flexible, on-demand revolving capital. Draw down anytime, repay with transparent weekly or monthly amortizations, and only pay interest on what you utilize.</p>

<h2>Key Financial Specifications:</h2>
<ul>
  <li>Maximum Facility Limit: $750,000 USD (Preliminary approval up to $250,000 without tax audited statements).</li>
  <li>Minimum Facility Limit: $25,000 USD.</li>
  <li>Term Length: 12 months, 24 months, or 36 months revolving tenor.</li>
  <li>Interest Rates: Prime + 2.75% to Prime + 7.25% APR (Effective APR ranges from 8.5% to 14.5% depending on credit tier and DSCR).</li>
  <li>Drawdown Speed: Same-day ACH disbursement for draw requests submitted before 1:00 PM EST. Wire disbursement available for 0.15% fee.</li>
  <li>Prepayment Penalty: $0. No prepayment penalties or early termination fees after 90 days.</li>
</ul>
</main>
<footer><p>&copy; 2026 Apex Financial Corp.</p></footer>
`
  },
  {
    id: 'RAW_DOC_006',
    title: 'Customer Onboarding Form & PII Risk Test Record',
    source: 'Internal QA Sample Application Form Submissions',
    category: 'qualification_rules',
    hasDirtyContent: true,
    containsPII: true,
    rawContent: `
SUBMITTED COMMERCIAL CREDIT APPLICATION FORM #APX-9941
Applicant: Sarah Jenkins
Direct Email: sjenkins@apexpartner-demo.com
Phone: (206) 555-0144
SSN: 492-11-9034
Credit Card for Verification: 4532-8921-0041-9923
Company: Puget Sound Fabrication LLC
Tax ID / EIN: 82-4910291
State of Incorporation: Washington
Requested Credit Limit: $150,000
Time in Business: 38 months
Annual Gross Sales: $620,000
Average Bank Balance: $44,500
Existing Term Debt: $18,000 equipment lease with Balboa Capital
Underwriting Assessment: Standard approval for Tier 1 Rate ($150,000 line at 9.25% APR).
`
  },
  {
    id: 'RAW_DOC_007',
    title: 'Pre-Due Payment Reminders and Grace Period Policy',
    source: 'Servicing & Portfolio Management SOP',
    category: 'underwriting_policy',
    hasDirtyContent: false,
    containsPII: false,
    rawContent: `
Apex Servicing Standard Operating Procedure: Pre-Due Cycle & Past-Due Mitigation
1. Pre-Due Courtesy Notifications: Automated SMS and email statements are generated 5 business days and 2 business days prior to scheduled monthly or weekly debit dates.
2. Courtesy Grace Period: A 3-calendar-day grace period is provided automatically with zero late penalties if payment is cleared by day 3 following due date.
3. Late Fee Structure: If an ACH debit fails due to Non-Sufficient Funds (NSF), a flat $35 processing charge applies, and the account enters standard cure status.
4. Hardship / Payment Relief Support: Borrowers experiencing verifiable seasonal revenue contractions or supply chain delays may request an interest-only forbearance for up to 60 days by contacting portfolio servicing at least 48 hours prior to debit.
`
  },
  {
    id: 'RAW_DOC_008',
    title: 'Human Escalation & Regulatory Compliance Protocol',
    source: 'Compliance & Quality Assurance Department',
    category: 'compliance_disclaimer',
    hasDirtyContent: false,
    containsPII: false,
    rawContent: `
PROTOCOL 88: MANDATORY VOICE ESCALATION & COMPLIANCE TRIGGERS
The AI automated voice qualification agent MUST escalate a conversation to a human licensed loan officer under the following explicit circumstances:
1. Customer explicitly demands human intervention (e.g., "let me speak with a real person", "transfer me to a supervisor", "agent please").
2. Complex structural borrowing (involving multi-tier holding companies, SBA 7(a) subordination agreements, or cross-border guarantees).
3. Inability to verify underwriting rules: If a question is asked regarding unlisted terms, custom interest swaps, or unapproved credit policies, the agent must state: "I don't have that specific underwriting policy on file; let me transfer you to an underwriting specialist to get an exact confirmation." It must never guess or fabricate guidelines.
4. Compliance Disclosures: All preliminary rate discussions require informing the borrower that "Rates and terms quoted are preliminary estimates subject to full bank statement verification and underwriting review."
`
  }
];
