import type { Scenario } from "./types";

export const NIMBUS: Scenario = {
  id: "nimbus",
  vendor: "Nimbus Health AI Inc.",
  counterparty: "Ontario Health Sciences Network (OHSN)",
  headline: "Nimbus Health AI ↔ OHSN — Mutual NDA + Master Service Agreement",
  context:
    "Seed-stage clinical AI × 14-hospital consortium. $240K CAD ARR · 3-year initial term. Patient safety, PHIPA, and Health Canada licensure all in scope.",
  filenameMarkers: ["nimbus", "ohsn"],
  summaryTitle: "Nimbus Health AI — counter package for OHSN MSA / NDA",
  sensitiveNames: [
    "Nimbus Health AI",
    "OHSN",
    "Dr. Aisha Rahman",
    "Dr. Patel",
    "HIROC",
  ],
  paragraphs: [
    {
      id: 0,
      en: "NIMBUS HEALTH AI INC. & ONTARIO HEALTH SCIENCES NETWORK — Mutual Non-Disclosure Agreement and Master Service Agreement.",
      fr: "NIMBUS HEALTH AI INC. & RÉSEAU ONTARIEN DES SCIENCES DE LA SANTÉ — Entente mutuelle de non-divulgation et Contrat-cadre de services.",
    },
    {
      id: 1,
      en: "Effective Date: as of the date last signed below. Vendor: Nimbus Health AI Inc. (Ontario). Client: Ontario Health Sciences Network (consortium of 14 acute-care hospitals).",
      fr: "Date d'entrée en vigueur : à la date de la dernière signature ci-dessous. Fournisseur : Nimbus Health AI Inc. (Ontario). Client : Réseau ontarien des sciences de la santé (consortium de 14 hôpitaux de soins de courte durée).",
    },
    {
      id: 2,
      en: "1. PURPOSE. The parties wish to deploy Vendor's NimbusAlert clinical decision support platform across OHSN member hospitals to support sepsis and ICU deterioration prediction.",
      fr: "1. OBJET. Les parties souhaitent déployer la plateforme NimbusAlert d'aide à la décision clinique du Fournisseur dans les hôpitaux membres d'OHSN, pour la prédiction du sepsis et de la détérioration en USI.",
    },
    {
      id: 3,
      en: "2.3 PHI Carve-Out. \"Personal Health Information\" under PHIPA is NOT \"Confidential Information\" under this Agreement. PHI encountered by Vendor is governed exclusively by PHIPA, the Data Sharing Agreement, and OHSN's information governance policies.",
      fr: "2.3 Exclusion des RPS. Les « renseignements personnels sur la santé » au sens de la LPRPS ne sont PAS des « Renseignements confidentiels » aux termes de la présente entente. Les RPS rencontrés par le Fournisseur sont régis exclusivement par la LPRPS, l'entente de partage de données et les politiques de gouvernance d'OHSN.",
      flag: "info",
      flagReason: "PHI carve-out — PHIPA governs separately",
    },
    {
      id: 4,
      en: "4.2 Survival. Confidentiality survives termination for four (4) years, except obligations relating to Vendor's model architecture and training methodology, which survive indefinitely.",
      fr: "4.2 Survie. Les obligations de confidentialité survivent quatre (4) ans après la résiliation, sauf celles relatives à l'architecture du modèle et à la méthodologie d'entraînement du Fournisseur, qui survivent indéfiniment.",
      flag: "info",
      flagReason: "Indefinite survival for model IP",
    },
    {
      id: 5,
      en: "MASTER SERVICE AGREEMENT. Effective alongside the NDA. Initial term: three (3) years at $240,000 CAD per annum.",
      fr: "CONTRAT-CADRE DE SERVICES. En vigueur conjointement avec l'entente de non-divulgation. Durée initiale : trois (3) ans, 240 000 $ CAD par an.",
    },
    {
      id: 6,
      en: "2.1 Provision of Services. Vendor will use commercially reasonable efforts to ensure 99.99% uptime in any calendar month (≈ 52.6 minutes of unplanned downtime / month). Scheduled maintenance only between 22:00 and 06:00 ET.",
      fr: "2.1 Prestation des services. Le Fournisseur déploie ses efforts commercialement raisonnables pour assurer une disponibilité de 99,99 % par mois civil (≈ 52,6 minutes d'indisponibilité non planifiée / mois). Entretien planifié uniquement entre 22 h et 6 h HE.",
      flag: "bad",
      flagReason: "99.99% uptime — seed-stage Vendor cannot guarantee",
    },
    {
      id: 7,
      en: "2.2 Decision Support Only. NimbusAlert is a clinical decision support tool, NOT a diagnostic device. Vendor makes no representation that any Clinical Alert constitutes medical advice. Treating clinicians retain decision authority.",
      fr: "2.2 Aide à la décision uniquement. NimbusAlert est un outil d'aide à la décision clinique, et NON un dispositif diagnostique. Le Fournisseur ne déclare pas qu'une alerte constitue un avis médical. Le clinicien traitant conserve l'autorité décisionnelle.",
      flag: "info",
      flagReason: "Decision-support framing protects against device classification",
    },
    {
      id: 8,
      en: "2.3 Physician Override Documentation. Client (OHSN) shall maintain a workflow requiring clinicians to document, in the EHR, whether each Clinical Alert was acted upon, overridden, or unseen. Vendor provides the data field; OHSN enforces use.",
      fr: "2.3 Documentation des dérogations médicales. Le Client (OHSN) maintient un flux de travail exigeant que les cliniciens documentent dans le DSE si chaque alerte a été suivie, dérogée ou non vue. Le Fournisseur fournit le champ de données ; OHSN en assure l'application.",
      flag: "warn",
      flagReason: "OHSN enforces — Vendor provides only the field",
    },
    {
      id: 9,
      en: "2.4 Health Canada Status. Vendor operates under Health Canada's Digital Health Software Interim Policy and has submitted a Class II Medical Device Licence application. Vendor warrants Regulatory Approval within twenty-four (24) months of the Effective Date.",
      fr: "2.4 Statut Santé Canada. Le Fournisseur opère sous la politique provisoire des logiciels de santé numérique et a soumis une demande de licence d'instrument médical de Classe II. Le Fournisseur garantit l'obtention de l'approbation réglementaire dans les vingt-quatre (24) mois suivant la date d'entrée en vigueur.",
      flag: "bad",
      flagReason: "24-month forward warranty — risk if Health Canada delays",
    },
    {
      id: 10,
      en: "2.5 Explainability. Vendor shall provide, for each Clinical Alert, a structured summary of the top-three contributing data inputs. Roadmap commitments toward richer explainability are set out in Schedule B.",
      fr: "2.5 Explicabilité. Pour chaque alerte clinique, le Fournisseur fournit un résumé structuré des trois principales variables contributrices. Les engagements de feuille de route relatifs à une explicabilité enrichie figurent à l'annexe B.",
      flag: "warn",
      flagReason: "Roadmap milestones are material breach if missed",
    },
    {
      id: 11,
      en: "2.6 Support. Patient-Safety Critical: 30 minutes 24/7. Platform Unavailable: 1 hour 24/7. High Priority: 4 business hours. Standard: 1 business day.",
      fr: "2.6 Soutien. Critique pour la sécurité des patients : 30 minutes 24/7. Plateforme indisponible : 1 heure 24/7. Priorité élevée : 4 heures ouvrables. Standard : 1 jour ouvrable.",
      flag: "warn",
      flagReason: "30-minute critical SLA — pager rotation required",
    },
    {
      id: 12,
      en: "4.2 Payment Terms. Net forty-five (45) days from invoice date. Overdue amounts bear interest at 1.0% per month.",
      fr: "4.2 Modalités de paiement. Net quarante-cinq (45) jours à compter de la facturation. Tout solde impayé porte intérêt à 1,0 % par mois.",
      flag: "info",
      flagReason: "Net-45 — hospital AP cycle compromise",
    },
    {
      id: 13,
      en: "5.3 Convenience Termination. Client may terminate for convenience upon ninety (90) days' written notice plus an early-termination fee equal to fifty percent (50%) of fees that would have been payable for remaining months in the then-current contract year.",
      fr: "5.3 Résiliation pour convenance. Le Client peut résilier pour convenance moyennant un préavis écrit de quatre-vingt-dix (90) jours, plus des frais de résiliation anticipée égaux à 50 % des frais qui auraient été dus pour les mois restants de l'année contractuelle en cours.",
      flag: "info",
      flagReason: "ETF protects clinical implementation investment",
    },
    {
      id: 14,
      en: "6.3 Model Retraining Rights. Vendor may use anonymized derivatives of Client Clinical Data to retrain NimbusAlert, subject to anonymization standards (Schedule C), no patient re-identifiability, and an annual written retraining summary to Client.",
      fr: "6.3 Droits de réentraînement du modèle. Le Fournisseur peut utiliser des dérivés anonymisés des Données cliniques du Client pour réentraîner NimbusAlert, sous réserve des normes d'anonymisation (annexe C), de l'absence de ré-identification possible et d'un résumé annuel écrit des activités de réentraînement remis au Client.",
      flag: "warn",
      flagReason: "Core IP asset — strict anonymization required",
    },
    {
      id: 15,
      en: "7.1 Limitation of Liability. Capped at greater of (a) fees paid in 36 months, or (b) $720,000 CAD. UNCAPPED for: (i) gross negligence causing patient death/serious harm, (ii) PHIPA violations, (iii) indemnification — but with a $5M CAD per-event ceiling on (i).",
      fr: "7.1 Limitation de responsabilité. Plafonnée au plus élevé de (a) les frais payés dans les 36 mois ou (b) 720 000 $ CAD. NON PLAFONNÉE pour : (i) la négligence grave causant le décès ou des lésions graves d'un patient, (ii) les violations de la LPRPS, (iii) les indemnisations — avec un plafond de 5 M$ CAD par événement pour (i).",
      flag: "bad",
      flagReason: "Clinical liability — $5M per-event ceiling MUST be insurable",
    },
    {
      id: 16,
      en: "7.3 Insurance. Vendor must carry: $5M CGL, $10M cyber, and $5M clinical professional liability (NOT standard tech E&O). HIROC compatibility required.",
      fr: "7.3 Assurance. Le Fournisseur maintient : RCG 5 M$, cyber 10 M$ et responsabilité professionnelle clinique 5 M$ (différente de l'E&O technique standard). Compatibilité HIROC exigée.",
      flag: "warn",
      flagReason: "Clinical PL ≠ tech E&O — separate underwriting required",
    },
    {
      id: 17,
      en: "9. Data Protection. Subject to PHIPA. Data residency: Canadian region. Breach notification within twenty-four (24) hours to OHSN's Privacy Officer and the Information and Privacy Commissioner of Ontario as required.",
      fr: "9. Protection des données. Assujettie à la LPRPS. Hébergement : région canadienne. Notification d'atteinte dans les vingt-quatre (24) heures au responsable de la vie privée d'OHSN et au Commissaire à l'information et à la vie privée de l'Ontario, selon les exigences.",
      flag: "info",
      flagReason: "PHIPA + 24-hour breach clock",
    },
    {
      id: 18,
      en: "10.4 Step-In Rights. Limited to patient-safety emergencies declared by OHSN's Chief Medical Officer. Vendor cooperates fully with transition; Vendor may be reimbursed for transition costs.",
      fr: "10.4 Droits d'intervention. Limités aux urgences relatives à la sécurité des patients déclarées par le médecin en chef d'OHSN. Le Fournisseur coopère pleinement à la transition ; il peut être remboursé pour les coûts de transition.",
      flag: "info",
      flagReason: "Step-in narrowed to patient-safety emergencies",
    },
    {
      id: 19,
      en: "Governing Law. Province of Ontario. Exclusive jurisdiction in the courts of Ontario. PHIPA and the Personal Health Information Protection Act, 2004 govern all PHI matters.",
      fr: "Droit applicable. Province d'Ontario. Compétence exclusive des tribunaux de l'Ontario. La LPRPS et la Loi de 2004 sur la protection des renseignements personnels sur la santé régissent toutes les questions de RPS.",
    },
    {
      id: 20,
      en: "Counterparts. This Agreement may be executed in counterparts, including by electronic signature, each of which is deemed an original.",
      fr: "Exemplaires. La présente entente peut être signée en exemplaires, y compris par signature électronique, chacun étant considéré comme un original.",
      flag: "info",
      flagReason: "Electronic signature contemplated",
    },
    {
      id: 21,
      en: "SIGNATURES — NIMBUS HEALTH AI INC. (Vendor)\n\nSignature: ______________________________  Name: ______________________________  Title: ______________________________  Date: ______________________________",
      fr: "SIGNATURES — NIMBUS HEALTH AI INC. (Fournisseur)\n\nSignature : ______________________________  Nom : ______________________________  Titre : ______________________________  Date : ______________________________",
      isSignatureBlock: true,
    },
    {
      id: 22,
      en: "SIGNATURES — ONTARIO HEALTH SCIENCES NETWORK (Client)\n\nSignature: ______________________________  Name: ______________________________  Title: ______________________________  Date: ______________________________",
      fr: "SIGNATURES — RÉSEAU ONTARIEN DES SCIENCES DE LA SANTÉ (Client)\n\nSignature : ______________________________  Nom : ______________________________  Titre : ______________________________  Date : ______________________________",
      isSignatureBlock: true,
    },
  ],
  esig: {
    qcAvailable: true,
    signatureBlocksFound: 2,
    notes: [
      "Section 7.5 (NDA) and the MSA counterparts clause both contemplate electronic signature explicitly.",
      "Two signature blocks detected (Vendor + Client) — both wired up below for live drawing.",
      "Healthcare e-signature is well-established in Ontario for vendor procurement; PHIPA has no separate signature formality.",
      "Quebec recognises e-signatures under CQLR c. C-1.1 and UECA, provided the signer's identity and intent are reliably linked to the document.",
    ],
    citations: [
      {
        label: "Personal Health Information Protection Act, 2004 (PHIPA)",
        url: "https://www.ontario.ca/laws/statute/04p03",
      },
      {
        label: "Act to establish a legal framework for information technology, CQLR c. C-1.1",
        url: "https://www.legisquebec.gouv.qc.ca/en/document/cs/c-1.1",
      },
    ],
  },
  goalSamples: [
    "Cap clinical liability at insurable levels and ship to OHSN within 60 days.",
    "Protect model IP and retraining rights — they're our entire moat.",
    "Get a 6-month ramp on the 99.99% SLA so we can survive go-live.",
  ],
  agents: [
    {
      agentId: "pierre",
      questions: [
        "Which clauses are non-negotiable for legal counsel? (e.g. liability ceiling, IP)",
        "Does our cyber + clinical PL insurance currently cover the $5M-per-event ceiling in §7.1?",
      ],
      hint: {
        headline: "Pierre's read",
        detail:
          "§7.1 is workable IF the $5M per-event ceiling is insurable. §6.3 (model retraining) is your moat — do not concede on anonymized derivatives. The 24-month Health Canada warranty in §2.4 needs a force-majeure carve-out for regulator delay.",
        suggestedAnswer:
          "Non-negotiable: keep §6.3 retraining rights with anonymization as drafted, add a force-majeure carve-out to §2.4 for Health Canada delay, and confirm $5M per-event clinical liability is insurable (we have an in-principle quote from CFC).",
      },
      debateRounds: [
        [
          {
            text: "Counsel: §7.1 holds together IF — and only if — the $5M per-event ceiling is genuinely insurable. Without a clinical PL binder, this clause is a balance-sheet risk.",
            delta: -1,
          },
          {
            text: "I'll add a force-majeure carve-out to §2.4 — Health Canada Class II processing routinely slips past 24 months and we shouldn't be in default for the regulator's queue.",
            delta: 1,
          },
        ],
        [
          {
            text: "On §6.3 retraining — we cannot concede the right to anonymized derivatives. That clause is the moat.",
            delta: 1,
          },
          {
            text: "Add a confidential expert-determination clause for adverse-event disputes — keeps clinical fights out of public courtrooms.",
            delta: 1,
          },
        ],
      ],
    },
    {
      agentId: "marie",
      questions: [
        "Where will OHSN clinical data physically reside? Confirm Canadian region + tenant isolation.",
        "Have we mapped the 24-hour PHIPA breach notification path into our incident playbook?",
      ],
      hint: {
        headline: "Marie's compliance read",
        detail:
          "PHIPA + IPC of Ontario + HIROC are all in scope. Data residency must be Canadian region (no cross-border secondary processing). The 24-hour breach clock is non-negotiable. Add an explicit Schedule D referencing OHSN's information governance policies.",
        suggestedAnswer:
          "All clinical data hosted in AWS Canada Central (Montréal). PHIPA breach notification path mapped (Privacy Officer → IPC of Ontario within 24h via PagerDuty). Schedule D references OHSN's Information Governance Policy v3.1.",
      },
      debateRounds: [
        [
          {
            text: "Compliance: PHIPA + IPC + HIROC are all live. Hosting must be Canadian region only — no secondary processing in US-East under any circumstance.",
            delta: 0,
          },
          {
            text: "The 24-hour PHIPA notification window in §9 is hard-wired to OHSN's existing IPC reporting workflow — we're aligned, but we need a tested runbook before go-live.",
            delta: 1,
          },
        ],
        [
          {
            text: "I'd flag that §6.3 anonymization references Schedule C — make sure that schedule cites the Information and Privacy Commissioner's de-identification guidelines explicitly.",
            delta: 1,
          },
          {
            text: "Step-in (§10.4) is well-scoped to patient-safety emergencies, but I want a 4-hour CMO-to-CTO escalation path before any access is granted.",
            delta: 1,
          },
        ],
      ],
    },
    {
      agentId: "etienne",
      questions: [
        "What's the realistic close window — when does OHSN need this signed?",
        "Which sites (Sunnybrook, SickKids, others) are first to deploy and where is our internal champion?",
      ],
      hint: {
        headline: "Étienne's commercial read",
        detail:
          "OHSN's clinical informatics committee meets June 26. Their CMO sponsor (Dr. Aisha Rahman) has been pushing this internally for 9 months. We have leverage on 99.9% (with a 6-month ramp) and Health Canada wording. Push: net-30, ramped SLA, ETF stays as drafted.",
        suggestedAnswer:
          "Close before June 26 (clinical informatics committee). First deploy: Sunnybrook (sponsor: Dr. Aisha Rahman). Push 6-month SLA ramp at 99.9% then 99.99%, accept §5.3 ETF as drafted, target Net-30.",
      },
      debateRounds: [
        [
          {
            text: "Closer: their clinical informatics committee meets in 4 weeks — push for a 6-month ramp on the 99.99% SLA in §2.1 and they will trade.",
            delta: 2,
          },
          {
            text: "ETF in §5.3 is fine as drafted — protects our deployment cost. Don't waste leverage there.",
            delta: 1,
          },
        ],
        [
          {
            text: "On payment, push for net-30 — we have an active sponsor and they want this on the agenda. They'll take the friction over a delayed start.",
            delta: 1,
          },
          {
            text: "Frame the SLA ramp as \"clinical safety conservatism, not capability gap\" — that language gets through clinical governance untouched.",
            delta: 2,
          },
        ],
      ],
    },
    {
      agentId: "sophie",
      questions: [
        "What is OHSN's hardest internal audience — Legal, CMO's office, or HIROC?",
        "Which positions did OHSN hold even after concessions in similar past procurements?",
      ],
      hint: {
        headline: "Sophie's counterparty steelman",
        detail:
          "OHSN's HIROC liaison and CMO's office are louder than Legal. They WILL NOT move on §2.3 (physician override workflow ownership) or §7.1 PHIPA carve-out. They MAY move on uptime ramp, payment terms, and Health Canada warranty wording. Lead with the wins.",
        suggestedAnswer:
          "Hardest audience: HIROC liaison + CMO's office. Won't move: §2.3 physician override (clinical governance), §7.1 PHIPA carve-out. Will move: §2.1 SLA ramp, §4.2 payment terms, §2.4 Health Canada wording.",
      },
      debateRounds: [
        [
          {
            text: "Counterparty (steelman): OHSN cannot move on §2.3 — physician override documentation is patient-safety governance, not procurement preference.",
            delta: -1,
          },
          {
            text: "But — they will trade on uptime ramp, payment terms, and Health Canada warranty language. They've folded on all three in similar HIROC-covered deals.",
            delta: 0,
          },
        ],
        [
          {
            text: "If you push on §6.3 model retraining too aggressively, you'll trigger the clinical ethics committee — that adds 2 months. Frame anonymization as \"already PHIPA-aligned\" and you skip the committee path.",
            delta: -1,
          },
          {
            text: "Their CMO sponsor has internal political risk if this slips past June 26 — that's your real timing leverage.",
            delta: 1,
          },
        ],
      ],
    },
    {
      agentId: "antoine",
      questions: [
        "If you had to pick the single most important outcome, what is it?",
        "What's the absolute walk-away condition?",
      ],
      hint: {
        headline: "Antoine's synthesis",
        detail:
          "Top outcome: insurable §7.1 + protected §6.3 retraining rights + 6-month SLA ramp. Walk only if §6.3 model retraining is denied entirely (without it the platform decays). Trade Health Canada warranty wording and audit cadence to get there.",
        suggestedAnswer:
          "Top outcome: keep §6.3 (model retraining) intact, insurable §7.1 ceiling, 6-month SLA ramp at §2.1. Walk if §6.3 retraining is fully denied — without it the model decays and the platform becomes a static feature.",
      },
      debateRounds: [
        [
          {
            text: "Crown: counter today with three asks — 6-month SLA ramp on §2.1, force-majeure carve-out on §2.4 Health Canada, confirmed insurability of the §7.1 ceiling.",
            delta: 2,
          },
          {
            text: "§6.3 stays as drafted — that's the line. If they refuse, walk.",
            delta: -1,
          },
        ],
        [
          {
            text: "Recommendation: align with the CMO sponsor before redlines hit Legal — get their pre-approval on the SLA ramp framing.",
            delta: 2,
          },
          {
            text: "Goal alignment: insurable clinical liability + intact retraining + survivable SLA → that's the three-asks counter.",
            delta: 1,
          },
        ],
      ],
    },
  ],
  decisionRoot: [
    {
      id: "n_sla_ramp",
      label: "Counter: 6-month SLA ramp at 99.9% then step to 99.99%",
      detail:
        "Most important commercial ask. Lets Nimbus's seed-stage infrastructure stand up safely without violating clinical SLAs at go-live.",
      delta: 2,
      edits: [
        {
          paragraphId: 6,
          replacement:
            "2.1 Provision of Services. For the first six (6) months following the Effective Date, Vendor will provide 99.9% uptime per calendar month. Beginning month seven (7), Vendor will provide 99.99% uptime per calendar month (≈ 52.6 minutes of unplanned downtime / month). Scheduled maintenance only between 22:00 and 06:00 ET.",
          replacementFr:
            "2.1 Prestation des services. Pendant les six (6) premiers mois suivant la date d'entrée en vigueur, le Fournisseur assure une disponibilité de 99,9 % par mois civil. À compter du septième (7e) mois, le Fournisseur assure une disponibilité de 99,99 % par mois civil (≈ 52,6 minutes d'indisponibilité non planifiée / mois). Entretien planifié uniquement entre 22 h et 6 h HE.",
        },
      ],
      children: [
        {
          id: "n_hc_carveout",
          label: "Add force-majeure carve-out to §2.4 Health Canada warranty",
          detail:
            "Protects Nimbus if Health Canada Class II processing slips past 24 months due to regulator delay (well-documented historical pattern).",
          delta: 1,
          edits: [
            {
              paragraphId: 9,
              replacement:
                "2.4 Health Canada Status. Vendor operates under Health Canada's Digital Health Software Interim Policy and has submitted a Class II Medical Device Licence application. Vendor warrants Regulatory Approval within twenty-four (24) months of the Effective Date, with the deadline extended on a day-for-day basis for any delay caused by Health Canada or its agents.",
              replacementFr:
                "2.4 Statut Santé Canada. Le Fournisseur opère sous la politique provisoire des logiciels de santé numérique et a soumis une demande de licence d'instrument médical de Classe II. Le Fournisseur garantit l'obtention de l'approbation réglementaire dans les vingt-quatre (24) mois suivant la date d'entrée en vigueur, ce délai étant prolongé jour pour jour en cas de retard imputable à Santé Canada ou à ses agents.",
            },
          ],
          children: [
            {
              id: "n_payment_30",
              label: "Push payment to net-30 with prompt-pay discount",
              detail:
                "Recovers cashflow from net-45 to net-30; offer 1.5% prompt-pay incentive — typical for hospital procurement.",
              delta: 1,
              edits: [
                {
                  paragraphId: 12,
                  replacement:
                    "4.2 Payment Terms. Net thirty (30) days from invoice date with a 1.5% prompt-pay discount available within ten (10) days. Overdue amounts bear interest at 1.0% per month.",
                  replacementFr:
                    "4.2 Modalités de paiement. Net trente (30) jours à compter de la facturation, avec escompte de 1,5 % pour paiement dans les dix (10) jours. Tout solde impayé porte intérêt à 1,0 % par mois.",
                },
              ],
            },
            {
              id: "n_keep_45",
              label: "Keep net-45 — don't burn leverage on payment terms",
              detail:
                "Hospitals run on 45-day cycles; trying to push to net-30 may not be worth the relationship cost late in the negotiation.",
              delta: 0,
              edits: [],
            },
          ],
        },
        {
          id: "n_explainability_phased",
          label: "Convert §2.5 explainability roadmap to phased milestones",
          detail:
            "Lock in the structured-summary baseline at go-live; richer feature-level explainability only at Month 12.",
          delta: 1,
          edits: [
            {
              paragraphId: 10,
              replacement:
                "2.5 Explainability. At go-live, Vendor provides for each Clinical Alert a structured summary of the top-three contributing data inputs. By Month 12, Vendor commits to per-feature directional contribution scores. Schedule B sets specific milestones; failure to meet Month 12 milestone is a material breach subject to a sixty (60) day cure period.",
              replacementFr:
                "2.5 Explicabilité. Dès la mise en service, le Fournisseur fournit pour chaque alerte clinique un résumé structuré des trois principales variables contributrices. Au mois 12, le Fournisseur s'engage à fournir des scores directionnels par variable. L'annexe B fixe les jalons précis ; le non-respect du jalon du mois 12 constitue un manquement substantiel assorti d'un délai de remède de soixante (60) jours.",
            },
          ],
        },
      ],
    },
    {
      id: "n_hold_99_99",
      label: "Accept 99.99% from go-live and absorb the infra cost",
      detail:
        "Higher close probability today, but burns ~ $80K in cloud + on-call costs in year 1. Risky for a seed-stage Vendor.",
      delta: -1,
      edits: [],
      children: [
        {
          id: "n_etf_softer",
          label: "Soften §5.3 ETF to 25% in exchange",
          detail:
            "Trades the convenience-termination cost down for OHSN — preserves Nimbus's commercial position elsewhere.",
          delta: 0,
          edits: [
            {
              paragraphId: 13,
              replacement:
                "5.3 Convenience Termination. Client may terminate for convenience upon ninety (90) days' written notice plus an early-termination fee equal to twenty-five percent (25%) of fees that would have been payable for remaining months in the then-current contract year.",
              replacementFr:
                "5.3 Résiliation pour convenance. Le Client peut résilier pour convenance moyennant un préavis écrit de quatre-vingt-dix (90) jours, plus des frais de résiliation anticipée égaux à 25 % des frais qui auraient été dus pour les mois restants de l'année contractuelle en cours.",
            },
          ],
        },
        {
          id: "n_keep_etf",
          label: "Keep §5.3 ETF at 50% as drafted",
          detail:
            "Pure absorption of SLA risk without offsetting commercial concession — hardest path for the Vendor.",
          delta: -1,
          edits: [],
        },
      ],
    },
    {
      id: "n_concede_retraining",
      label: "Concede §6.3 model retraining — agree to OHSN data-use restriction",
      detail:
        "Closes today, but kills Nimbus's product moat. Model decays. Strongly not recommended.",
      delta: -3,
      edits: [
        {
          paragraphId: 14,
          replacement:
            "6.3 Model Retraining Rights. Vendor may NOT use Client Clinical Data, in any form (anonymized or otherwise), to retrain, validate, or improve NimbusAlert's machine learning models. Vendor's models remain frozen as of the Effective Date for purposes of OHSN deployments.",
          replacementFr:
            "6.3 Droits de réentraînement du modèle. Le Fournisseur NE PEUT PAS utiliser les Données cliniques du Client, sous quelque forme que ce soit (anonymisée ou autre), pour réentraîner, valider ou améliorer les modèles d'apprentissage automatique de NimbusAlert. Les modèles du Fournisseur demeurent figés à la date d'entrée en vigueur pour les déploiements d'OHSN.",
            sensitive: true,
        },
      ],
    },
  ],
};
