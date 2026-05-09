import type { Scenario } from "./types";

export const DUNDER: Scenario = {
  id: "dunder",
  vendor: "Dunder AI Inc.",
  counterparty: "Initech Financial Group Inc.",
  headline: "Dunder AI / Initech: One-way NDA + Master Service Agreement",
  context:
    "Toronto SaaS startup negotiating with an OSFI-regulated FI. $180K CAD ARR, 2-year initial term. Initech's redlines pile asymmetric risk on Dunder.",
  filenameMarkers: ["dunder", "initech"],
  summaryTitle: "Dunder AI: counter package for the Initech MSA / NDA",
  sensitiveNames: [
    "Sarah Chen",
    "Marc Tremblay",
    "Initech Procurement",
    "Dunder AI",
    "Jennifer Liu",
  ],
  maxDebateRounds: 4,
  paragraphs: [
    {
      id: 0,
      en: "DUNDER AI INC. and INITECH FINANCIAL GROUP INC.: One-Way Non-Disclosure Agreement and Master Service Agreement.",
      fr: "DUNDER AI INC. et INITECH FINANCIAL GROUP INC. : Entente de non-divulgation unilatérale et Contrat-cadre de services.",
    },
    {
      id: 1,
      en: "Effective Date: as of the date last signed below. Vendor: Dunder AI Inc. (Ontario). Client: Initech Financial Group Inc. (Ontario).",
      fr: "Date d'entrée en vigueur : à la date de la dernière signature ci-dessous. Fournisseur : Dunder AI Inc. (Ontario). Client : Initech Financial Group Inc. (Ontario).",
    },
    {
      id: 2,
      en: "1. PURPOSE. The parties wish to evaluate Dunder AI's contract review platform for use across Initech's procurement function.",
      fr: "1. OBJET. Les parties souhaitent évaluer la plateforme d'examen contractuel de Dunder AI pour l'usage de la fonction approvisionnement d'Initech.",
    },
    {
      id: 3,
      en: "2.1 Confidential Information includes any disclosure by Initech, regardless of whether it is marked confidential at the time of disclosure, including verbal disclosures during demonstrations.",
      fr: "2.1 Les Renseignements confidentiels comprennent toute divulgation par Initech, qu'ils soient ou non identifiés comme tels au moment de la divulgation, y compris les divulgations verbales lors des démonstrations.",
      flag: "warn",
      flagReason: "Verbal disclosures count as confidential.",
    },
    {
      id: 4,
      en: "3.2 Permitted Disclosures. Vendor may disclose Confidential Information only to its full-time employees who are bound by written confidentiality obligations. Contractors and advisors are excluded.",
      fr: "3.2 Divulgations permises. Le Fournisseur ne peut divulguer les Renseignements confidentiels qu'à ses employés à temps plein liés par des obligations écrites de confidentialité. Les sous-traitants et conseillers sont exclus.",
      flag: "warn",
      flagReason: "FTE-only restriction excludes contractors and advisors.",
    },
    {
      id: 5,
      en: "4.1 Term. Three (3) year term, terminable by Initech at any time on written notice. Vendor must give ninety (90) days' notice.",
      fr: "4.1 Durée. Durée de trois (3) ans, résiliable par Initech à tout moment sur avis écrit. Le Fournisseur doit donner un préavis de quatre-vingt-dix (90) jours.",
      flag: "warn",
      flagReason: "Asymmetric termination notice.",
    },
    {
      id: 6,
      en: "4.2 Survival. Confidentiality obligations under Section 3 survive termination for an additional five (5) years.",
      fr: "4.2 Survie. Les obligations de confidentialité de l'article 3 survivent à la résiliation pour une période supplémentaire de cinq (5) ans.",
    },
    {
      id: 7,
      en: "5. Return or Destruction. Upon written request by Initech, Vendor must certify destruction within five (5) business days, with no archival copies retained.",
      fr: "5. Retour ou destruction. Sur demande écrite d'Initech, le Fournisseur doit attester la destruction dans les cinq (5) jours ouvrables, sans copie d'archives conservée.",
      flag: "warn",
      flagReason: "No archival copy permitted.",
    },
    {
      id: 8,
      en: "8.7 Audit Rights. Initech may audit Vendor's information security practices on five (5) business days' written notice, no more than once per calendar year.",
      fr: "8.7 Droits de vérification. Initech peut vérifier les pratiques de sécurité de l'information du Fournisseur sur préavis écrit de cinq (5) jours ouvrables, au plus une fois par année civile.",
      flag: "info",
      flagReason: "OSFI third-party risk audit right.",
    },
    {
      id: 9,
      en: "MASTER SERVICE AGREEMENT. Effective alongside the NDA. Initial subscription term: two (2) years at $180,000 CAD per annum.",
      fr: "CONTRAT-CADRE DE SERVICES. En vigueur conjointement avec l'entente de non-divulgation. Durée initiale d'abonnement : deux (2) ans, 180 000 $ CAD par an.",
    },
    {
      id: 10,
      en: "2.1 Service Levels. Vendor will provide 99.9% uptime in any calendar month, with scheduled maintenance announced ten (10) business days in advance and excluded from business hours.",
      fr: "2.1 Niveaux de service. Le Fournisseur garantit une disponibilité de 99,9 % par mois civil, avec entretien planifié annoncé dix (10) jours ouvrables à l'avance et exclu des heures ouvrables.",
      flag: "warn",
      flagReason: "99.9% uptime with stretched maintenance notice.",
    },
    {
      id: 11,
      en: "2.4 Support. 24/7/365 coverage with one (1) hour response on critical incidents and four (4) hour resolution targets.",
      fr: "2.4 Soutien. Couverture 24/7/365 avec délai de réponse d'une (1) heure pour les incidents critiques et résolution visée en quatre (4) heures.",
      flag: "bad",
      flagReason: "24/7 coverage Dunder cannot staff today.",
    },
    {
      id: 12,
      en: "4.2 Payment Terms. Net sixty (60) days from invoice date. Overdue amounts bear interest at 0.5% per month.",
      fr: "4.2 Modalités de paiement. Net soixante (60) jours à compter de la date de facturation. Tout solde impayé porte intérêt à 0,5 % par mois.",
      flag: "warn",
      flagReason: "Net-60 cashflow drag.",
    },
    {
      id: 13,
      en: "5.2(b) Convenience Termination. Client may terminate this Agreement or any Order Form for convenience on thirty (30) days' written notice without liability for fees beyond the current billing period.",
      fr: "5.2(b) Résiliation pour convenance. Le Client peut résilier la présente entente ou tout bon de commande pour convenance moyennant un préavis écrit de trente (30) jours, sans responsabilité au-delà de la période de facturation en cours.",
      flag: "bad",
      flagReason: "30-day walk-away kills committed revenue.",
    },
    {
      id: 14,
      en: "6.1 Vendor IP. Custom Developments shall be owned solely by Client upon full payment. Vendor receives only a non-exclusive licence to use Custom Developments to provide Services to Client.",
      fr: "6.1 PI du Fournisseur. Les Développements personnalisés appartiennent uniquement au Client sur paiement complet. Le Fournisseur ne reçoit qu'une licence non exclusive pour les utiliser dans le cadre des Services rendus au Client.",
      flag: "bad",
      flagReason: "Customer ownership of custom work erodes product moat.",
    },
    {
      id: 15,
      en: "6.3 Feedback. Vendor may use Client feedback only to improve Services provided to Client; cannot use to develop features for other clients without written consent.",
      fr: "6.3 Rétroaction. Le Fournisseur ne peut utiliser la rétroaction du Client que pour améliorer les Services fournis au Client. Il ne peut développer de fonctionnalités pour d'autres clients sans accord écrit.",
      flag: "warn",
      flagReason: "Feedback restricted, limits roadmap learning.",
    },
    {
      id: 16,
      en: "7.1 Limitation of Liability. Vendor's total aggregate liability is capped at the fees paid in the twelve (12) months preceding the claim. The cap does NOT apply to Section 9 (Data Protection), unauthorized access, gross negligence, or indemnification.",
      fr: "7.1 Limitation de responsabilité. La responsabilité totale du Fournisseur est plafonnée aux frais payés au cours des douze (12) mois précédant la réclamation. Le plafond ne s'applique PAS à l'article 9 (Protection des données), à un accès non autorisé, à la négligence grave ni aux indemnisations.",
      flag: "bad",
      flagReason: "Uncapped data-breach liability is an existential risk.",
    },
    {
      id: 17,
      en: "7.3 Insurance. Vendor must maintain commercial general liability ($5M), professional E&O ($5M), and cyber liability ($10M) coverage throughout the term.",
      fr: "7.3 Assurance. Le Fournisseur maintient pendant la durée : RCG (5 M$), responsabilité professionnelle (5 M$) et cyber-risques (10 M$).",
      flag: "info",
      flagReason: "$10M cyber floor (not ceiling).",
    },
    {
      id: 18,
      en: "9.1 Personal Information. Initech may disclose personal information of Quebec residents subject to Law 25 and PIPEDA. Vendor shall comply with all applicable privacy laws and notify Initech within twenty-four (24) hours of any data security incident.",
      fr: "9.1 Renseignements personnels. Initech peut divulguer des renseignements personnels de résidents du Québec assujettis à la Loi 25 et à la LPRPDE. Le Fournisseur se conforme aux lois sur la vie privée applicables et avise Initech dans les vingt-quatre (24) heures de tout incident de sécurité.",
      flag: "info",
      flagReason: "Personal information triggers Law 25 / PIPEDA.",
    },
    {
      id: 19,
      en: "10.9 Step-In Rights. If Vendor cannot perform, Client may assume direct control of the Services or appoint a third party, with Vendor's full cooperation at no additional cost.",
      fr: "10.9 Droits d'intervention. Si le Fournisseur est dans l'incapacité d'exécuter, le Client peut assumer le contrôle direct des Services ou désigner un tiers, avec la coopération totale du Fournisseur, sans frais additionnels.",
      flag: "warn",
      flagReason: "OSFI step-in for operational continuity.",
    },
    {
      id: 20,
      en: "Governing Law. Province of Ontario. Exclusive jurisdiction in the courts of Ontario.",
      fr: "Droit applicable. Province d'Ontario. Compétence exclusive des tribunaux de l'Ontario.",
    },
    {
      id: 21,
      en: "Counterparts. This Agreement may be executed in counterparts, including by electronic signature, each of which is deemed an original.",
      fr: "Exemplaires. La présente entente peut être signée en exemplaires, y compris par signature électronique, chacun étant considéré comme un original.",
      flag: "info",
      flagReason: "Electronic signature contemplated.",
    },
    {
      id: 22,
      en: "SIGNATURES, DUNDER AI INC. (Vendor)\n\nSignature: ______________________________\nName: ______________________________  Title: ______________________________  Date: ______________________________",
      fr: "SIGNATURES, DUNDER AI INC. (Fournisseur)\n\nSignature : ______________________________\nNom : ______________________________  Titre : ______________________________  Date : ______________________________",
      isSignatureBlock: true,
      party: "vendor",
    },
    {
      id: 23,
      en: "SIGNATURES, INITECH FINANCIAL GROUP INC. (Client)\n\nSignature: ______________________________\nName: ______________________________  Title: ______________________________  Date: ______________________________",
      fr: "SIGNATURES, INITECH FINANCIAL GROUP INC. (Client)\n\nSignature : ______________________________\nNom : ______________________________  Titre : ______________________________  Date : ______________________________",
      isSignatureBlock: true,
      party: "client",
    },
  ],
  esig: {
    qcAvailable: true,
    signatureBlocksFound: 2,
    notes: [
      "Section 8.6 (NDA) and Section 10.8 (MSA) explicitly contemplate electronic signature, a strong signal both parties already accept it.",
      "Two signature blocks detected (Vendor + Client), both wired up below for live drawing.",
      "OSFI third-party risk practice in Ontario routinely accepts e-signature for vendor onboarding agreements; no notarisation required.",
      "Quebec recognises e-signatures under CQLR c. C-1.1 and UECA, provided the signer's identity and intent are reliably linked to the document.",
    ],
    citations: [
      {
        label: "Act to establish a legal framework for information technology, CQLR c. C-1.1",
        url: "https://www.legisquebec.gouv.qc.ca/en/document/cs/c-1.1",
      },
      {
        label: "Uniform Electronic Commerce Act (UECA)",
        url: "https://www.ulcc-chlc.ca/Civil-Section/Uniform-Acts/Electronic-Commerce-Act",
      },
    ],
  },
  lawViolations: [
    {
      id: "ccq",
      jurisdiction: "Quebec",
      shortName: "CCQ",
      fullName: "Civil Code of Québec",
      fullNameFr: "Code civil du Québec",
      blurb:
        "Quebec is a civil law jurisdiction. Articles 1457 to 1474 govern liability and you cannot exclude liability for bodily harm or moral injury (article 1474). The Section 7.1 carve-out structure may be unenforceable in Quebec courts and the cap could be voided.",
      blurbFr:
        "Le Québec est une juridiction de droit civil. Les articles 1457 à 1474 régissent la responsabilité, et il est interdit d'exclure la responsabilité pour préjudice corporel ou moral (article 1474). La structure d'exclusion à l'article 7.1 pourrait être inopposable devant un tribunal québécois et le plafond pourrait être annulé.",
      severity: "medium",
      citation: "art. 1457 to 1474 CCQ",
    },
    {
      id: "bill96",
      jurisdiction: "Quebec",
      shortName: "Bill 96",
      fullName: "Charter of the French Language (Bill 96)",
      fullNameFr: "Charte de la langue française (loi 96)",
      blurb:
        "Contracts of adhesion and consumer-facing documents must exist in French and be presented first under Bill 96 (in force progressively since 2022). The English-only contract is a compliance gap if Initech onboards Quebec-based subsidiaries or French-speaking client desks.",
      blurbFr:
        "Les contrats d'adhésion et les documents destinés aux consommateurs doivent exister en français et être présentés en premier en vertu de la Loi 96 (en vigueur progressivement depuis 2022). Un contrat unilingue anglais constitue un écart de conformité si Initech intègre des filiales québécoises ou des équipes francophones.",
      severity: "high",
      citation: "Bill 96 (2022)",
    },
    {
      id: "lccjti",
      jurisdiction: "Quebec",
      shortName: "LCCJTI",
      fullName: "Act to establish a legal framework for information technology",
      fullNameFr: "Loi concernant le cadre juridique des technologies de l'information",
      blurb:
        "The bare 'execution by electronic signature' line in NDA Section 7.5 and MSA Section 10.8 is insufficient under Quebec law. LCCJTI requires integrity, attribution, and an audit trail proving the link between signer and document.",
      blurbFr:
        "La simple mention « signature électronique » à l'article 7.5 de l'entente de non-divulgation et à l'article 10.8 du contrat-cadre est insuffisante en droit québécois. La LCCJTI exige l'intégrité, l'attribution et une piste de vérification reliant le signataire au document.",
      severity: "low",
      citation: "CQLR c. C-1.1",
    },
  ],
  goalSamples: [
    "Cap our liability and get paid net-30, close in two weeks.",
    "Protect our IP on custom work and avoid uncapped breach exposure.",
    "Drop convenience termination, otherwise accept the audit rights.",
    "Keep §7.1 carve-out off the table at any cap level.",
    "Land a 24-month commit with mutual termination only for cause.",
  ],
  agents: [
    {
      agentId: "pierre",
      questions: [
        "Which clauses are non-negotiable for legal? (e.g. governing law, IP)",
        "Has counsel pre-approved a fallback liability cap if Initech holds the line?",
      ],
      hints: [
        {
          headline: "Pierre's read on non-negotiables",
          detail:
            "Sections 7.1 (carve-out for §9) and 6.1 (Custom Developments to Client) are the two existential legal risks. Cap §9 at 24 months of fees with cyber as backstop, and convert Custom Dev ownership to a non-exclusive perpetual licence to Initech.",
          suggestedAnswer:
            "Non-negotiable: §7.1 carve-out for breach must be capped (24 months of fees + cyber backstop). Custom Developments must remain Vendor-owned with Client licence only. §10.9 step-in needs a 72-hour escalation gate.",
        },
        {
          headline: "Pierre's fallback liability ladder",
          detail:
            "Counsel pre-approved a tiered cap: 12 months for ordinary commercial disputes, 24 months stacked with cyber tower for §9 / unauthorized access, fully uncapped only for fraud or wilful misconduct. If Initech still pushes, the next concession is per-incident sublimit, not removing the cap.",
          suggestedAnswer:
            "Yes, ladder: 12mo ordinary cap, 24mo + $10M cyber for §9 / unauthorized access, uncapped only for fraud or wilful misconduct. If pushed, next move is per-incident sublimit, not removing the cap.",
        },
      ],
      debateRounds: [
        [
          {
            text: "Counsel: §7.1 leaves the data-breach exposure uncapped. That single line is the difference between a healthy renewal and an existential event for Dunder.",
            delta: -2,
          },
          {
            text: "If we move from uncapped to capped at 24 months of fees with cyber as backstop, we keep Initech's regulator satisfied without betting the company.",
            delta: 1,
          },
        ],
        [
          {
            text: "Custom Dev ownership at §6.1 also needs to go. It converts every future feature funded by Initech into a one-customer feature, not a roadmap asset.",
            delta: -1,
          },
          {
            text: "I can offer a perpetual non-exclusive licence to Initech instead of an assignment. Same outcome for them, very different outcome for our IP basis.",
            delta: 2,
          },
        ],
        [
          {
            text: "On §10.9 step-in, fine in principle, but I want a 72-hour CTO-level escalation gate before they can walk into our cloud account.",
            delta: 1,
          },
          {
            text: "Insurance under §7.3 already covers what they need. The cap+tower combination is what gets through legal review on their side too.",
            delta: 1,
          },
        ],
        [
          {
            text: "Final pass: ETF on convenience termination is the protection, audit cadence stays annual unless they fund quarterly. That's the closing structure.",
            delta: 2,
          },
          {
            text: "If they refuse to cap §7.1 at any number, we have to walk. There is no version of this deal that survives an uncapped breach clause.",
            delta: -1,
          },
        ],
      ],
    },
    {
      agentId: "marie",
      questions: [
        "Will the deal touch personal information of Quebec residents? Summarise the data flow.",
        "Are there pending regulator notifications already open against this counterparty?",
      ],
      hints: [
        {
          headline: "Jayoma's data-flow read",
          detail:
            "Initech is OSFI-regulated and §9 already invokes Law 25 and PIPEDA. The 24-hour breach notice is doable but needs an incident playbook. Quebec residents are likely in scope through Initech's wealth-management arm. Hosting in AWS Canada Central de-risks both Law 25 cross-border and OSFI B-13 in one move.",
          suggestedAnswer:
            "Yes, Initech wealth-management division includes Quebec residents. Assume Law 25 + PIPEDA in scope. Hosting in AWS Canada Central. We can meet the 24-hour notice via PagerDuty plus Slack runbook.",
        },
        {
          headline: "Jayoma's regulator-watch",
          detail:
            "No public OSFI enforcement actions against Initech, but their internal third-party risk team has flagged two prior vendor disputes in the last 18 months. Add a §9.5 covenant requiring Initech to disclose any material regulator notice that materially affects the Services.",
          suggestedAnswer:
            "No open public OSFI actions. Two prior vendor disputes (2024, 2025) flagged internally. Add §9.5: Initech must disclose any material regulator notice affecting the Services within 5 business days.",
        },
      ],
      debateRounds: [
        [
          {
            text: "Compliance: §9 brings Law 25 + PIPEDA into the deal, so the 24-hour breach clock starts wherever the data is processed, including our staging environments.",
            delta: -1,
          },
          {
            text: "If we host Quebec data in-region (Canada Central / Montréal), we de-risk both Law 25 cross-border and OSFI B-13 in one move.",
            delta: 1,
          },
        ],
        [
          {
            text: "I'd add a one-line PIA commitment to §9.1. That's what Initech's privacy officer will demand on day one of go-live anyway.",
            delta: 0,
          },
          {
            text: "On step-in (§10.9), fine in principle, but I want a 72-hour escalation window before they can walk into our cloud account.",
            delta: 1,
          },
        ],
        [
          {
            text: "Add a covenant requiring Initech to disclose any material regulator notice. We don't want to discover it from a Globe and Mail story.",
            delta: 1,
          },
          {
            text: "Bill 96 is also a watch item. If they roll Quebec subsidiaries into this contract, we need a French version on file.",
            delta: 0,
          },
        ],
        [
          {
            text: "Final compliance check: the playbook needs a CAI notification path, the IPC of Ontario notification path, and the OSFI third-party register entry. All documented.",
            delta: 1,
          },
          {
            text: "Once 9.x is locked, this deal stops being a regulator risk and starts being a commercial one. We're close.",
            delta: 1,
          },
        ],
      ],
    },
    {
      agentId: "etienne",
      questions: [
        "What is the latest acceptable close date and the smallest acceptable contract value?",
        "Do we have leverage right now: replacement vendor, board pressure, internal champion?",
      ],
      hints: [
        {
          headline: "Saul's commercial window",
          detail:
            "Their procurement is at quarter-end. Initech's sponsor (Jennifer Liu, VP Procurement) is on a leadership review June 12. We have a 3-week window where they need this signed more than we do. Floor value is $150K ARR.",
          suggestedAnswer:
            "Close before Initech fiscal Q-end (3 weeks). Floor value $150K ARR. Sponsor: Jennifer Liu (VP Procurement) presenting at leadership review June 12, strong urgency on their side.",
        },
        {
          headline: "Saul's leverage map",
          detail:
            "Their RFP shortlist had two competitors, both eliminated last week. We're sole-source by their own paperwork. Internal champion is the CIO, who pushed this past their CISO's initial 'no'. Use it: trade convenience termination for ETF.",
          suggestedAnswer:
            "Strong leverage: sole-source after RFP elimination of two competitors. Champion is the CIO who overruled CISO. Trade convenience termination for an ETF, push net-30, accept audit cadence.",
        },
      ],
      debateRounds: [
        [
          {
            text: "Closer: their procurement clock is ticking faster than ours this month. Push net-30 in exchange for accepting the 99.9% SLA. They will trade.",
            delta: 2,
          },
          {
            text: "Convenience termination at §5.2(b) is the one I'd actually walk on. Without commit revenue this becomes a glorified pilot.",
            delta: 1,
          },
        ],
        [
          {
            text: "If we get stuck on liability, swap an early-termination fee for the convenience right. Protects ARR, gives them flexibility on paper.",
            delta: 2,
          },
          {
            text: "Don't let legal eat 6 weeks on §6.1. IP licence with audit-on-payment is the unlock. Move it.",
            delta: 1,
          },
        ],
        [
          {
            text: "We're sole-source on their paperwork. That's worth real dollars: bring the price floor up to $200K ARR with a 12-month commit minimum.",
            delta: 2,
          },
          {
            text: "Don't push too hard on price. The CIO sponsor's political capital is in close, not in negotiating the last 5%.",
            delta: -1,
          },
        ],
        [
          {
            text: "Final lap: name a real close date in writing. Initech's CISO uses 'next week' as a stalling tactic. Lock it.",
            delta: 2,
          },
          {
            text: "If we walk now, we lose the quarter. The win is signing this with a cap and an ETF, not winning every clause.",
            delta: 1,
          },
        ],
      ],
    },
    {
      agentId: "sophie",
      questions: [
        "What is the counterparty's headline pain: cost, risk, timeline?",
        "Which positions has Initech historically refused to move on?",
      ],
      hints: [
        {
          headline: "Sid's counterparty pain",
          detail:
            "Initech's pain is the OSFI third-party register due Q-end. They've delayed three other vendor onboardings already. They need a signature on a Tier 2 vendor before the report ships. That's our leverage and our deadline.",
          suggestedAnswer:
            "Their pain: OSFI third-party register due Q-end, three other vendor onboardings already delayed. They need a Tier 2 vendor signed before that report ships. That is both our leverage and our hard deadline.",
        },
        {
          headline: "Sid's hold-the-line list",
          detail:
            "Initech procurement does NOT have authority to drop the §7.1 carve-out. That's an OSFI-mandated provision per their B-13 third-party framework. They CAN flex on payment terms, audit cadence, and convenience termination. Don't waste leverage on the wrong fight.",
          suggestedAnswer:
            "Won't move: §7.1 carve-out (regulator-mandated), step-in (§10.9), insurance floor (§7.3). Will move: §4.2 payment terms, §8.7 audit cadence, §5.2(b) convenience termination, and probably §6.1 with a licence reframe.",
        },
      ],
      debateRounds: [
        [
          {
            text: "Counterparty (steelman): Initech procurement literally cannot remove the §7.1 breach carve-out. OSFI B-13 forces it. Anyone arguing for that is going to bounce.",
            delta: -2,
          },
          {
            text: "But they will fold on payment terms, audit cadence, and convenience termination. They've done it on every comparable vendor in the last 18 months.",
            delta: 0,
          },
        ],
        [
          {
            text: "Watch out for IP. If you push Custom Dev ownership too hard, their CISO loops in Legal, and you lose two weeks. Lead with licence, not assignment.",
            delta: -1,
          },
          {
            text: "Frame the cap as a regulator-friendly compromise (24 months + cyber tower) and you take the temperature out of the room immediately.",
            delta: 1,
          },
        ],
        [
          {
            text: "If you walk loud, the CIO sponsor has to explain it to leadership. They will not let that happen. So a quiet 'we need a cap or we walk' lands hardest.",
            delta: 1,
          },
          {
            text: "If you walk quiet without a counter, we lose any leverage we had. Always counter, never just leave.",
            delta: -1,
          },
        ],
        [
          {
            text: "Final round prediction: they'll accept the 24mo cap, the ETF, and net-30. They'll fight on audit cadence (push back to annual). Concede there, take the rest.",
            delta: 2,
          },
          {
            text: "If their CISO escalates instead of signing, that's a 2-week delay. Keep the close date pressure on Jennifer Liu, not the CISO.",
            delta: 1,
          },
        ],
      ],
    },
    {
      agentId: "antoine",
      questions: [
        "If you had to pick the single most important outcome, what is it?",
        "What is the absolute walk-away condition?",
      ],
      hints: [
        {
          headline: "Wolfgang's single most important outcome",
          detail:
            "Capped §7.1 at any reasonable level (24 months + cyber tower is the target). Without that, Dunder ships on a balance sheet that one breach can vaporize. Everything else is downstream.",
          suggestedAnswer:
            "Top outcome: §7.1 capped at 24 months + cyber tower. Then IP as a licence not assignment. Then ETF replaces convenience termination. Everything else is trading currency.",
        },
        {
          headline: "Wolfgang's walk line",
          detail:
            "If Initech refuses to cap §7.1 at any number whatsoever, walk. Polite, written, with a specific 30-day re-engagement offer. Do not negotiate against ourselves on that one clause.",
          suggestedAnswer:
            "Walk if §7.1 stays uncapped at any number. Walk politely with a 30-day re-engagement offer. Anything else (including no IP licence reframe) we can live with.",
        },
      ],
      debateRounds: [
        [
          {
            text: "Crown synthesis: trade the OSFI audit cadence and Net-60. You get the cap on §7.1 plus IP licence on §6.1. That hits the goal cleanly.",
            delta: 2,
          },
          {
            text: "Convenience termination needs an early-termination fee or it's a no-deal. That's the line.",
            delta: 1,
          },
        ],
        [
          {
            text: "Recommendation: counter today, hold §7.1 cap as the only blocking item, signal flexibility on audits and payment, name a real close date.",
            delta: 2,
          },
          {
            text: "If they refuse the cap at any number, we walk. There is no version of this deal that survives an uncapped §7.1.",
            delta: -1,
          },
        ],
        [
          {
            text: "Confirm the IP licence reframe holds. If their CISO accepts it without re-opening §6.3, we are 80% there.",
            delta: 2,
          },
          {
            text: "Do not over-trade. We've already given on audit cadence and net-30 timing. No more concessions until we see an updated draft.",
            delta: 1,
          },
        ],
        [
          {
            text: "Closing recommendation: send the final paper today, copy the CIO sponsor, attach the redline showing what we accepted. Make it easy to sign.",
            delta: 2,
          },
          {
            text: "If they ask for one more round of changes, accept only language tweaks. Substance is locked.",
            delta: 1,
          },
        ],
      ],
    },
  ],
  decisionRoot: [
    {
      id: "d_cap_with_cyber",
      label: "Counter: cap §7.1 at 24 months of fees with the $10M cyber tower as backstop",
      detail:
        "Trades a contained legal risk for the close. Likely to land. Keeps OSFI's regulator-mandated breach exposure visible while protecting the balance sheet.",
      delta: 2,
      edits: [
        {
          paragraphId: 16,
          replacement:
            "7.1 Limitation of Liability. Vendor's total aggregate liability is capped at the fees paid in the twelve (12) months preceding the claim. For Section 9 (Data Protection) and unauthorized access, liability is additionally capped at twenty-four (24) months of fees, backstopped by Vendor's cyber liability tower of $10M (Section 7.3).",
          replacementFr:
            "7.1 Limitation de responsabilité. La responsabilité totale du Fournisseur est plafonnée aux frais payés au cours des douze (12) mois précédant la réclamation. Pour l'article 9 (Protection des données) et tout accès non autorisé, la responsabilité est de plus plafonnée à vingt-quatre (24) mois de frais, garantie par la tour cyber-risque de 10 M$ du Fournisseur (article 7.3).",
        },
      ],
      children: [
        {
          id: "d_ip_licence",
          label: "Convert §6.1 Custom Developments to a perpetual non-exclusive licence",
          detail:
            "Initech keeps the rights it actually needs. Dunder keeps the IP basis. This is the second commercial blocker.",
          delta: 2,
          edits: [
            {
              paragraphId: 14,
              replacement:
                "6.1 Vendor IP. Vendor retains all Intellectual Property Rights in and to the Services, platform, Documentation, and any improvements. Client is granted a perpetual, non-exclusive, royalty-free licence to use Custom Developments funded by Client.",
              replacementFr:
                "6.1 PI du Fournisseur. Le Fournisseur conserve tous les droits de propriété intellectuelle relatifs aux Services, à la plateforme, à la Documentation et aux améliorations. Le Client se voit accorder une licence perpétuelle, non exclusive et libre de redevances pour utiliser les Développements personnalisés financés par le Client.",
            },
          ],
          children: [
            {
              id: "d_etf_net30",
              label: "Add a 50% remaining-term ETF and push payment to net-30",
              detail:
                "Closes the convenience-termination loophole and recovers cashflow from net-60 to net-30 with a 1.5% prompt-pay discount.",
              delta: 2,
              edits: [
                {
                  paragraphId: 12,
                  replacement:
                    "4.2 Payment Terms. Net thirty (30) days from invoice date with a 1.5% prompt-pay discount available within ten (10) days. Overdue amounts bear interest at 1.0% per month.",
                  replacementFr:
                    "4.2 Modalités de paiement. Net trente (30) jours à compter de la facturation, avec escompte de 1,5 % pour paiement dans les dix (10) jours. Tout solde impayé porte intérêt à 1,0 % par mois.",
                },
                {
                  paragraphId: 13,
                  replacement:
                    "5.2(b) Convenience Termination. Client may terminate for convenience on ninety (90) days' written notice with an early-termination fee equal to 50% of the fees that would have been payable for the remaining months in the then-current contract year.",
                  replacementFr:
                    "5.2(b) Résiliation pour convenance. Le Client peut résilier pour convenance moyennant un préavis écrit de quatre-vingt-dix (90) jours, avec frais de résiliation anticipée équivalant à 50 % des frais qui auraient été dus pour les mois restants de l'année contractuelle en cours.",
                },
              ],
              children: [
                {
                  id: "d_send_today",
                  label: "Send the final paper today, attach a clean redline, copy CIO sponsor",
                  detail:
                    "The closing move. Frames the package for signature, removes ambiguity, applies social pressure on Jennifer Liu's leadership review.",
                  delta: 2,
                  edits: [
                    {
                      paragraphId: 1,
                      replacement:
                        "Effective Date: as of the date last signed below, targeted within ten (10) business days of this final draft. Vendor: Dunder AI Inc. (Ontario). Client: Initech Financial Group Inc. (Ontario). Contract owner on Vendor side: Sarah Chen, COO. Contract owner on Client side: Jennifer Liu, VP Procurement.",
                      replacementFr:
                        "Date d'entrée en vigueur : à la date de la dernière signature ci-dessous, ciblée dans les dix (10) jours ouvrables suivant la présente version finale. Fournisseur : Dunder AI Inc. (Ontario). Client : Initech Financial Group Inc. (Ontario). Responsable du contrat côté Fournisseur : Sarah Chen, COO. Responsable du contrat côté Client : Jennifer Liu, VP Approvisionnement.",
                      sensitive: true,
                    },
                  ],
                },
                {
                  id: "d_pause_for_legal",
                  label: "Pause for an extra legal pass before sending",
                  detail:
                    "Risks slipping past the close window for marginal additional cover. Saul pushes back hard.",
                  delta: -1,
                  edits: [],
                },
              ],
            },
            {
              id: "d_payment_only",
              label: "Hold convenience termination, just push payment to net-30",
              detail:
                "Lower-friction counter. Preserves Initech's flexibility but recovers cashflow.",
              delta: 1,
              edits: [
                {
                  paragraphId: 12,
                  replacement:
                    "4.2 Payment Terms. Net thirty (30) days from invoice date. Overdue amounts bear interest at 1.0% per month.",
                  replacementFr:
                    "4.2 Modalités de paiement. Net trente (30) jours à compter de la facturation. Tout solde impayé porte intérêt à 1,0 % par mois.",
                },
              ],
              children: [
                {
                  id: "d_send_safe",
                  label: "Send the safe package, no further changes",
                  detail:
                    "Closes the deal but leaves convenience termination as a long-tail risk.",
                  delta: 1,
                  edits: [],
                },
                {
                  id: "d_reopen_etf",
                  label: "Reopen ETF discussion later in the term",
                  detail:
                    "Costs you political capital with the CIO sponsor for marginal upside.",
                  delta: -1,
                  edits: [],
                },
              ],
            },
          ],
        },
        {
          id: "d_dropfights_audit",
          label: "Trade audit cadence (annual to quarterly) for the cap",
          detail:
            "Gives Initech the optics of a tighter audit while keeping the cap movement. Operationally heavier for Dunder.",
          delta: 1,
          edits: [
            {
              paragraphId: 8,
              replacement:
                "8.7 Audit Rights. Initech may audit Vendor's information security practices on ten (10) business days' written notice, no more than once per calendar quarter, at Initech's expense.",
              replacementFr:
                "8.7 Droits de vérification. Initech peut vérifier les pratiques de sécurité du Fournisseur sur préavis écrit de dix (10) jours ouvrables, au plus une fois par trimestre civil, à ses frais.",
            },
          ],
          children: [
            {
              id: "d_close_quarterly",
              label: "Close on the quarterly audit + cap package",
              detail:
                "A working close. Operationally expensive for Dunder but the cap holds.",
              delta: 1,
              edits: [],
              children: [
                {
                  id: "d_done",
                  label: "Lock the deal, ship the contract for signature",
                  detail: "Final keystroke.",
                  delta: 1,
                  edits: [],
                },
                {
                  id: "d_re_negotiate_audit",
                  label: "Try to walk audit cadence back to semi-annual",
                  detail:
                    "Re-opening a closed clause kills momentum. Sid predicted this would bounce.",
                  delta: -2,
                  edits: [],
                  losePath: true,
                },
              ],
            },
            {
              id: "d_audit_only_no_etf",
              label: "Stop here, do not push for ETF",
              detail:
                "Leaves convenience termination intact. Closes today but ARR is exposed.",
              delta: 0,
              edits: [],
              children: [
                {
                  id: "d_signed_no_etf",
                  label: "Sign as-is, accept the convenience-termination risk",
                  detail:
                    "Closes the deal but Initech can walk in 30 days at any time.",
                  delta: -1,
                  edits: [],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "d_hold_uncapped",
      label: "Hold the line: refuse any §7.1 carve-out, force a 12-month all-claims cap",
      detail:
        "Lower close probability (Initech's regulator likely won't bless it), but if they accept, Dunder's exposure is genuinely contained.",
      delta: -1,
      edits: [
        {
          paragraphId: 16,
          replacement:
            "7.1 Limitation of Liability. Vendor's total aggregate liability is capped at the fees paid in the twelve (12) months preceding the claim, with no carve-outs. The parties agree this cap reflects the commercial nature of the deal.",
          replacementFr:
            "7.1 Limitation de responsabilité. La responsabilité totale du Fournisseur est plafonnée aux frais payés au cours des douze (12) mois précédant la réclamation, sans exclusion. Les parties conviennent que ce plafond reflète la nature commerciale de l'entente.",
        },
      ],
      children: [
        {
          id: "d_concede_when_pushed",
          label: "If Initech pushes back, fold to the 24-month cap with cyber tower",
          detail:
            "Same outcome as the d_cap_with_cyber path, just chosen reactively. Costs you a week and signals to Initech that they can press.",
          delta: 1,
          edits: [
            {
              paragraphId: 16,
              replacement:
                "7.1 Limitation of Liability. Vendor's total aggregate liability is capped at the fees paid in the twenty-four (24) months preceding the claim, backstopped by the cyber liability tower of $10M (Section 7.3).",
              replacementFr:
                "7.1 Limitation de responsabilité. La responsabilité totale du Fournisseur est plafonnée aux frais payés au cours des vingt-quatre (24) mois précédant la réclamation, garantie par la tour cyber-risque de 10 M$ (article 7.3).",
            },
          ],
          children: [
            {
              id: "d_late_close",
              label: "Push to close 1 week late with the new structure",
              detail:
                "Closes but slips past Initech's leadership review window. Some political damage.",
              delta: 0,
              edits: [],
              children: [
                {
                  id: "d_late_done",
                  label: "Sign the late close, get the deal across",
                  detail:
                    "Banked. Smaller win than the on-time path but a win.",
                  delta: 1,
                  edits: [],
                },
              ],
            },
            {
              id: "d_late_no_close",
              label: "Slip the close further, ask for one more legal review",
              detail:
                "Burns the quarter. Initech's CISO uses the delay to renegotiate other terms.",
              delta: -2,
              edits: [],
              losePath: true,
            },
          ],
        },
        {
          id: "d_walk_loud",
          label: "Walk loudly: send a press-friendly email blaming Initech's terms",
          detail:
            "Burns the bridge with Initech and the broader OSFI procurement community.",
          delta: -3,
          edits: [],
          losePath: true,
          children: [
            {
              id: "d_walk_loud_aftermath",
              label: "Aftermath: lose the quarter, no FI deals close all year",
              detail: "Reputation contagion in a small market.",
              delta: -2,
              edits: [],
              losePath: true,
            },
          ],
        },
        {
          id: "d_walk_clean",
          label: "Walk politely with a 30-day re-engagement offer",
          detail:
            "Keeps the relationship intact and signals discipline. The most expensive integrity option.",
          delta: -2,
          edits: [],
          children: [
            {
              id: "d_walk_clean_reopen",
              label: "Re-engage in 30 days with a fresh proposal",
              detail:
                "Initech may accept on revised terms. Pushes the close to next quarter.",
              delta: 0,
              edits: [],
              children: [
                {
                  id: "d_reopen_close",
                  label: "Close in Q+1 with a smaller package",
                  detail:
                    "A long way around to a similar finish line. ARR slips.",
                  delta: -1,
                  edits: [],
                },
              ],
            },
            {
              id: "d_walk_clean_silence",
              label: "Wait silently for Initech to come back",
              detail:
                "They might. They might not. The CIO sponsor needs movement.",
              delta: -2,
              edits: [],
              losePath: true,
            },
          ],
        },
      ],
    },
    {
      id: "d_concede",
      label: "Concede §7.1 entirely, close fast, accept uncapped breach exposure",
      detail:
        "Closes today, but you carry long-tail risk that may exceed Dunder's enterprise value if anything goes wrong.",
      delta: -3,
      edits: [],
      losePath: true,
      children: [
        {
          id: "d_concede_done",
          label: "Sign and ship, hope nothing breaks",
          detail:
            "The deal closes but the company is one incident away from existential trouble.",
          delta: -2,
          edits: [],
          losePath: true,
        },
        {
          id: "d_concede_post_hoc",
          label: "Try to amend after signing, ask for a side letter",
          detail:
            "Initech's procurement does not amend signed paper. Wasted effort.",
          delta: -1,
          edits: [],
          losePath: true,
        },
      ],
    },
  ],
};
