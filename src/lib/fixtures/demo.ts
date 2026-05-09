import type {
  GhostProfile,
  GameTree,
  WalkawayLine,
  ComplianceReport,
  RedlineChange,
  DealSession,
  DebateEvent,
  Playbook,
  TimelineEvent,
} from "@/lib/contracts/models";

export const FIXTURE_DIR = "Example Scenario (Optional)";

export const DEMO_DEAL_SESSION: DealSession = {
  dealId: "deal_initech_msa_001",
  vendorId: "dunder_ai",
  counterpartyId: "initech_procurement",
  documents: [
    {
      id: "msa_redlines",
      type: "msa",
      label: "MSA — Initech Redlines",
      originalRef: "msa_dunder_original.md",
      redlinedRef: "msa_initech_redlines.md",
    },
    {
      id: "nda_redlines",
      type: "nda",
      label: "NDA — Initech Redlines",
      originalRef: "nda_dunder_original.md",
      redlinedRef: "nda_initech_redlines.md",
    },
  ],
  precedentRefs: ["initech_vendor_2022", "initech_vendor_2023", "initech_vendor_2024"],
  locale: "en",
  activeDocumentId: "msa_redlines",
};

export const DEMO_GHOST: GhostProfile = {
  counterpartyId: "initech_procurement",
  displayName: "INITECH PROCUREMENT",
  elo: 2341,
  styleLabel: "Hardline · Regulated FI",
  playstyle: "Anchors high on liability and audit, probes for concessions on payment timing and SLA grace periods.",
  fightsOn: ["Uncapped breach liability", "24/7 SLA + step-in rights", "Ontario-only data residency", "Audit cadence (2×/yr)"],
  oftenConcedes: ["Payment timing within ±10 days", "Minor SLA grace extensions", "Feedback usage carve-outs"],
  walksWhen: [
    "We won't accept Ontario-only data residency",
    "We refuse 24h breach notification",
    "We reject their insurance minimums ($10M cyber)",
  ],
  trainingSummary: "Trained on 3 prior Initech vendor deals · 47 clauses analyzed",
  precedentDealIds: ["initech_vendor_2022", "initech_vendor_2023", "initech_vendor_2024"],
};

export const DEMO_GAME_TREE: GameTree = {
  rootId: "root",
  evalScore: -2.4,
  primaryBranchIds: ["move_a", "move_b", "move_c"],
  nodes: {
    root: {
      id: "root",
      parentId: null,
      childrenIds: ["move_a", "move_b", "move_c"],
    },
    move_a: {
      id: "move_a",
      parentId: "root",
      childrenIds: ["move_a_1", "move_a_2"],
      move: {
        id: "move_a",
        label: "Accept §7 cap carve-out with breach ceiling",
        notation: "!!",
        summary: "Cap liability at 24-month fees for breach; carve out gross negligence only. Offer Ontario residency + 4h breach notification.",
        closeProbability: 0.82,
        retainedValueCad: 162000,
        riskNote: "Exposure limited; concedes residency but preserves deal.",
      },
      ghostReplyPreview: "Initech likely accepts — residency concession unlocks board approval.",
    },
    move_b: {
      id: "move_b",
      parentId: "root",
      childrenIds: [],
      move: {
        id: "move_b",
        label: "Counter liability with mutual carve-out",
        notation: "?!",
        summary: "Propose mutual breach carve-out, 18-month cap. Push back on 24/7 SLA with tiered response model.",
        closeProbability: 0.51,
        retainedValueCad: 145000,
        riskNote: "Initech rarely accepts mutual breach framing — elongates negotiation.",
      },
      ghostReplyPreview: "Initech likely counters again — precedent shows they hold on breach uncapped.",
    },
    move_c: {
      id: "move_c",
      parentId: "root",
      childrenIds: [],
      move: {
        id: "move_c",
        label: "Walk away — restructure as services agreement",
        notation: "??",
        summary: "Reject current MSA terms; propose time-limited SOW to derisks uncapped exposure.",
        closeProbability: 0.12,
        retainedValueCad: 0,
        riskNote: "Kills enterprise logo. Not a real option at this deal stage.",
      },
      ghostReplyPreview: "Initech terminates pipeline — they have 3 other qualified vendors.",
    },
    move_a_1: {
      id: "move_a_1",
      parentId: "move_a",
      childrenIds: [],
      move: {
        id: "move_a_1",
        label: "Confirm Ontario residency in SLA schedule",
        notation: "!",
        summary: "Codify data residency commitment in Exhibit B; add 24h breach clock.",
        closeProbability: 0.91,
        retainedValueCad: 178000,
      },
      ghostReplyPreview: "Initech procurement signals sign-off pending exec review.",
    },
    move_a_2: {
      id: "move_a_2",
      parentId: "move_a",
      childrenIds: [],
      move: {
        id: "move_a_2",
        label: "Add step-in limitation clause",
        notation: "!?",
        summary: "Accept step-in but cap to 90-day limit with cure period.",
        closeProbability: 0.74,
        retainedValueCad: 155000,
      },
      ghostReplyPreview: "Possible — depends on Initech legal bandwidth.",
    },
  },
};

export const DEMO_MSA_REDLINES: RedlineChange[] = [
  {
    id: "R01",
    clauseRef: "§4.1 Uptime SLA",
    summary: "Uptime target raised; maintenance window restricted",
    ours: "99.5% uptime; 48h maintenance notice",
    theirs: "99.9% uptime; 10 business days notice; no maintenance during business hours",
    comment: "High impact — operational cost to meet 24/7 standard",
  },
  {
    id: "R02",
    clauseRef: "§4.3 Support",
    summary: "Support scope expanded to 24/7/365 with tiered SLAs",
    ours: "Business hours support",
    theirs: "24/7/365 support; P1: 1h, P2: 4h, P3: 8h response",
    comment: "Requires dedicated ops hire or outsourcing",
  },
  {
    id: "R03",
    clauseRef: "§7.1 Liability Cap",
    summary: "Cap removed for data breach and §9 claims — uncapped exposure",
    ours: "12-month fees cap, all claims",
    theirs: "Cap does NOT apply to data-breach or §9 claims → effectively uncapped",
    comment: "EXISTENTIAL RISK — one incident = company-ending exposure",
  },
  {
    id: "R04",
    clauseRef: "§7.2 Consequential Damages",
    summary: "Carve-outs from mutual exclusion for data breach",
    ours: "Broad mutual exclusion of consequential damages",
    theirs: "Carve-outs for data breach and gross negligence",
    comment: "Linked to R03 — compounds uncapped risk",
  },
  {
    id: "R05",
    clauseRef: "§8.1 IP Ownership",
    summary: "Client ownership of custom work funded by Client",
    ours: "Vendor retains all IP including custom work",
    theirs: "Client owns any custom work funded by Client",
    comment: "Standard enterprise ask — negotiable with carve-out for platform",
  },
  {
    id: "R06",
    clauseRef: "§8.3 Feedback License",
    summary: "Restriction on using feedback for other clients",
    ours: "Vendor free to use feedback for product improvement",
    theirs: "Cannot use feedback for other clients without written consent",
    comment: "Manageable — limits ML training data pipeline",
  },
  {
    id: "R07",
    clauseRef: "§9.1 Payment Terms",
    summary: "Net 60, dispute withholding, no suspension during dispute",
    ours: "Net 30; 18% annual interest on late payments",
    theirs: "Net 60; 6% interest; may withhold full invoice in dispute; no service suspension",
    comment: "Cash-flow risk for startup — prefer Net 45 compromise",
  },
  {
    id: "R08",
    clauseRef: "§9.4 Fee Increases",
    summary: "Cap at 3%/year with 90-day notice",
    ours: "Up to 5% per year with 60-day notice at renewal",
    theirs: "Up to 3% per year; 90-day notice required",
    comment: "Acceptable if deal economics hold",
  },
  {
    id: "R09",
    clauseRef: "§10.2 Termination",
    summary: "15-day cure + client convenience termination added",
    ours: "30-day cure for cause",
    theirs: "15-day cure; Client convenience termination on 30-day notice",
    comment: "High risk — convenience termination gives Initech unlimited exit option",
  },
  {
    id: "R10",
    clauseRef: "§9.3 Audit Rights",
    summary: "2×/year audit right added with 48h notice",
    ours: "No audit rights in base draft",
    theirs: "Client may audit 2× per year on 48h notice",
    comment: "Operational burden — negotiate to 72h and annual",
  },
  {
    id: "R11",
    clauseRef: "§11.1 Data Residency",
    summary: "Ontario-only; cross-border requires written consent",
    ours: "Canada-wide data residency",
    theirs: "Ontario only; no cross-border transfer without prior written consent",
    comment: "TRIGGERS LAW 25 if Quebec customers involved",
  },
  {
    id: "R12",
    clauseRef: "§12.1 Insurance",
    summary: "Mandatory $10M cyber + $5M E&O coverage",
    ours: "No minimum insurance specified",
    theirs: "$5M CGL, $5M E&O, $10M cyber liability required",
    comment: "Significant premium cost — may need D&O policy review",
  },
  {
    id: "R13",
    clauseRef: "§13.1 Step-In Rights",
    summary: "Client can assume services on vendor failure",
    ours: "No step-in rights in draft",
    theirs: "Client may assume operational control of service if vendor fails SLA thresholds",
    comment: "Unprecedented for our size — negotiate 90-day notice + cure",
  },
];

export const DEMO_NDA_REDLINES: RedlineChange[] = [
  {
    id: "N01",
    clauseRef: "§1 Mutuality",
    summary: "One-way NDA — only vendor as recipient",
    ours: "Mutual NDA protecting both parties",
    theirs: "One-way — only Dunder AI as recipient; Initech not bound",
  },
  {
    id: "N02",
    clauseRef: "§2.1 Definition",
    summary: "All information confidential — marked or not",
    ours: "Reasonable-person confidential standard",
    theirs: "Everything confidential including unmarked and verbal disclosures",
  },
  {
    id: "N03",
    clauseRef: "§6.2 Injunctive Relief",
    summary: "No bond required for Initech injunction",
    ours: "Bond required for injunctive relief",
    theirs: "No bond requirement for Initech; Dunder must post bond",
  },
  {
    id: "N04",
    clauseRef: "§7 Term",
    summary: "Extended term and asymmetric survival",
    ours: "2-year term + 2-year survival",
    theirs: "3-year term + 5-year survival; asymmetric termination rights",
  },
  {
    id: "N05",
    clauseRef: "§8.1 Return",
    summary: "No archival copy without consent",
    ours: "Archival copy permitted for compliance",
    theirs: "No archival copy without written consent; must certify destruction",
  },
];

export const DEMO_WALKAWAY: WalkawayLine = {
  thresholdSummary: "Walk if: uncapped breach stays + Ontario-only data residency + 24h breach clock + $10M cyber insurance",
  citations: [
    {
      dealLabel: "CoreBank vendor (2022)",
      quote: "Initech did not budge on breach notification window below 24h — deal collapsed at final review.",
      clauseRef: "§7.1 breach carve-out",
    },
    {
      dealLabel: "Fintech SaaS (2023)",
      quote: "Step-in rights accepted at 90-day limit; below that Initech walked in all three precedent deals.",
      clauseRef: "§13.1 step-in",
    },
    {
      dealLabel: "Data Platform (2024)",
      quote: "Ontario-only residency was non-negotiable — they accepted Canada-wide only once with SOC 2 Type II evidence.",
      clauseRef: "§11.1 data residency",
    },
  ],
};

export const DEMO_COMPLIANCE: ComplianceReport = {
  trueSight: {
    status: "substituted",
    claims: [
      {
        original: "Pursuant to OSFI Guideline B-13 §4.2(c) (2019) — third-party operational resilience",
        verified: "OSFI Guideline B-13 Technology and Cyber Risk Management (2023) — §2.3 Third-Party Risk",
        sourceUrl: "https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/technology-cyber-risk-management",
      },
    ],
  },
  osfi: {
    triggered: true,
    triggers: [
      "Third-party operational risk (B-13 §2.3) — vendor provides critical AI services to regulated FI",
      "Breach notification timeline (B-13 §3.1) — 24h window required by Initech aligns with OSFI guidance",
      "Resilience testing obligation — step-in rights and SLA thresholds map to B-13 §4.1",
    ],
    notes: ["Initech's OSFI posture is authentic to scenario; Dunder must evidence SOC 2 Type II"],
  },
  pipeda: {
    triggered: true,
    triggers: [
      "Cross-border data transfer accountability (PIPEDA §4.1.3) — US analytics subprocessor in scope",
      "Third-party processor agreement required (PIPEDA §4.1) — MSA §11.1 triggers processor addendum",
      "Retention and disposal schedule — Initech requires certified destruction (PIPEDA §4.5)",
    ],
    notes: ["Accountability principle requires Dunder to contractually bind US subprocessors"],
  },
  law25: {
    triggered: true,
    triggers: [
      "US analytics subprocessor + Quebec-resident customer data → PIA required under Law 25 Art. 63",
      "Cross-border personal information transfer — prior impact assessment and notification required",
    ],
    pia: {
      id: "pia_initech_001",
      generatedAt: new Date().toISOString(),
      sectionsEn: {
        "Purpose & Scope": "Privacy Impact Assessment for cross-border transfer of personal information to US-based analytics subprocessor engaged by Dunder AI Inc. for Initech Financial Group Inc. SaaS deployment.",
        "Data Flows": "Personal data originates with Quebec-resident Initech customers. Processed by Dunder AI platform (Ontario). Analytics subprocessor (US) receives anonymized event telemetry.",
        "Risk Assessment": "Moderate risk — US subprocessor not subject to Law 25. Mitigation: contractual safeguards, anonymization prior to transfer, SOC 2 Type II attestation.",
        "Mitigation Measures": "1. Contractual clauses binding US subprocessor. 2. Data minimization before transfer. 3. Annual review of subprocessor PIMS compliance. 4. Initech notification prior to any new subprocessor.",
      },
      sectionsFr: {
        "Objectif et portée": "Évaluation des facteurs relatifs à la vie privée pour le transfert transfrontalier de renseignements personnels vers un sous-traitant analytique basé aux États-Unis, engagé par Dunder AI Inc. pour le déploiement SaaS d'Initech Financial Group Inc.",
        "Flux de données": "Les données personnelles proviennent des clients québécois d'Initech. Traitement par la plateforme Dunder AI (Ontario). Le sous-traitant analytique (États-Unis) reçoit des données télémétriques anonymisées.",
        "Évaluation des risques": "Risque modéré — le sous-traitant américain n'est pas soumis à la Loi 25. Atténuation : clauses contractuelles, anonymisation avant transfert, attestation SOC 2 Type II.",
        "Mesures d'atténuation": "1. Clauses contractuelles liant le sous-traitant américain. 2. Minimisation des données avant transfert. 3. Examen annuel de la conformité PIMS du sous-traitant. 4. Notification d'Initech avant tout nouveau sous-traitant.",
      },
    },
  },
};

export const DEMO_DEBATE_EVENTS: DebateEvent[] = [
  { t: 0, agent: "counsel", message: "Move A captures the breach carve-out upside without exposing us past 24-month fees. Defensible precedent.", vote: "accept", influenceDelta: 0.8 },
  { t: 2, agent: "closer", message: "Close probability 82% on Move A. Every round of counter costs us 3–5% on the close. Take it.", vote: "accept", influenceDelta: 1.2 },
  { t: 4, agent: "counterpart", message: "Initech will push back on the cap ceiling but they need this deal for their Q2 vendor diversity target.", vote: "likely_counter_accept", influenceDelta: 0.4 },
  { t: 6, agent: "compliance", message: "Move A satisfies OSFI B-13 §2.3 — Ontario residency + 24h breach clock. PIPEDA processor addendum still needed.", vote: "accept", influenceDelta: 0.6 },
  { t: 8, agent: "crown", message: "Council synthesis: 4–0 for Move A. Recommend: Play Best Line — accept §7 cap carve-out with breach ceiling.", vote: "clear", influenceDelta: 1.5 },
];

export const DEMO_PLAYBOOK: Playbook = {
  id: "playbook_enterprise_bank_v1",
  name: "Dunder Enterprise Bank Playbook v1.0",
  version: "1.0.0",
  createdBy: "persona_sarah",
  updatedAt: new Date().toISOString(),
  blocks: [
    { id: "b1", type: "spellbook_issue_detector", position: { x: 50, y: 200 }, params: { sensitivity: "high" } },
    { id: "b2", type: "ghost", position: { x: 300, y: 200 }, params: { elo_threshold: 2000 } },
    { id: "b3", type: "osfi_vendor_management", position: { x: 550, y: 100 }, params: { regime: "b13", strictness: "high" } },
    { id: "b4", type: "pipeda_watcher", position: { x: 550, y: 300 }, params: { cross_border: true } },
    { id: "b5", type: "law25", position: { x: 800, y: 200 }, params: { pia_required: true, bilingual: true } },
    { id: "b6", type: "crown", position: { x: 1050, y: 200 }, params: { consensus_threshold: 0.75 } },
    { id: "b7", type: "supervisor_pdf", position: { x: 1300, y: 200 }, params: { modes: "legal,plain" } },
  ],
  edges: [
    { id: "e1", source: "b1", target: "b2" },
    { id: "e2", source: "b2", target: "b3" },
    { id: "e3", source: "b2", target: "b4" },
    { id: "e4", source: "b3", target: "b5" },
    { id: "e5", source: "b4", target: "b5" },
    { id: "e6", source: "b5", target: "b6" },
    { id: "e7", source: "b6", target: "b7" },
  ],
};

export const DEMO_TIMELINE: TimelineEvent[] = [
  { step: "email_received", status: "done", at: new Date(Date.now() - 3600000).toISOString(), detail: "MSA redlines received from procurement-legal@initechfg.demo" },
  { step: "counter_sent", status: "done", at: new Date(Date.now() - 1800000).toISOString(), detail: "Counter-redline DOCX sent via Gmail draft" },
  { step: "invoice_generated", status: "done", at: new Date(Date.now() - 900000).toISOString(), detail: "Stripe invoice CAD $90,000 generated (test mode)" },
  { step: "seats_provisioned", status: "pending", detail: "Initech vendor portal — 50 seats queued" },
  { step: "notary_queued", status: "pending", detail: "Electronic notary queue — awaiting GC sign-off" },
];
