/**
 * Pre-authored Dunder counter-proposals keyed by Initech redline IDs from
 * docs/SCENARIO_CONTEXT.md (R01–R13 for the MSA, N01–N05 for the NDA).
 *
 * Why static: the engine produces a `Decision`, not per-clause counter text.
 * For T8 we don't reach back to Claude; the demo document needs to look
 * polished offline. Aditya's T4/T5 can later supply override text via a new
 * field on Decision; until then this is the source.
 *
 * EN + FR per entry so T8 can render bilingual without a runtime translate
 * call when locale === "fr".
 */

export interface CounterProposal {
  id: string; // "R01" .. "R13" / "N01" .. "N05"
  clauseRef: string;
  title: string;
  initechAsk: string;
  dunderCounterEn: string;
  dunderCounterFr: string;
  severity: "low" | "medium" | "high" | "existential";
}

export const MSA_COUNTER_PROPOSALS: readonly CounterProposal[] = [
  {
    id: "R01",
    clauseRef: "2.1 Provision of Services",
    title: "Uptime SLA",
    initechAsk: "99.9% uptime, maintenance only outside business hours, 10 business days notice.",
    dunderCounterEn:
      "Vendor will commit to 99.7% monthly uptime measured outside scheduled maintenance, with 5 business days notice for non-urgent maintenance windows. 99.9% available as an Order Form upgrade.",
    dunderCounterFr:
      "Le Fournisseur s'engage sur une disponibilité mensuelle de 99,7 % hors maintenance planifiée, avec un préavis de 5 jours ouvrables pour la maintenance non urgente. Le 99,9 % est disponible en option par bon de commande.",
    severity: "medium",
  },
  {
    id: "R02",
    clauseRef: "2.4 Support",
    title: "24/7 support",
    initechAsk: "24/7/365 with 1h critical response, 4h critical resolution.",
    dunderCounterEn:
      "Business-hours support remains the base offering. Vendor will provide 24/7 critical-incident pager support (1h response, best-effort resolution) for an additional support fee aligned with prevailing enterprise rates.",
    dunderCounterFr:
      "Le support en heures ouvrables demeure inclus. Le Fournisseur offre un support critique 24/7 (réponse 1 h, résolution au mieux) moyennant un supplément de support aligné sur les tarifs entreprise.",
    severity: "high",
  },
  {
    id: "R03",
    clauseRef: "9.1 Limitation of Liability",
    title: "Liability cap — uncapped breach carve-out",
    initechAsk:
      "Cap of 12 months' fees applies generally, but does NOT apply to data-breach or §9 claims (i.e., uncapped).",
    dunderCounterEn:
      "Cap raised to greater of (a) 24 months' fees or (b) CAD $5,000,000 for data-breach claims; otherwise 12 months' fees applies. No uncapped exposure. Cyber insurance per §X provides additional coverage.",
    dunderCounterFr:
      "Le plafond est porté au plus élevé de (a) 24 mois de frais ou (b) 5 000 000 $ CAD pour les réclamations liées aux atteintes aux données ; sinon 12 mois de frais. Aucune exposition non plafonnée. L'assurance cyber selon §X fournit une couverture additionnelle.",
    severity: "existential",
  },
  {
    id: "R04",
    clauseRef: "9.2 Consequential Damages",
    title: "Consequential damages carve-outs",
    initechAsk:
      "Mutual exclusion of consequentials does NOT apply to data breach or gross negligence.",
    dunderCounterEn:
      "Mutual exclusion stands. Carve-out limited to gross negligence and willful misconduct (no data-breach carve-out — addressed via raised liability cap in §9.1).",
    dunderCounterFr:
      "L'exclusion mutuelle est maintenue. La dérogation se limite à la faute lourde et à la conduite délibérée (sans dérogation pour atteinte aux données — couverte par le plafond rehaussé au §9.1).",
    severity: "high",
  },
  {
    id: "R05",
    clauseRef: "8 IP Ownership",
    title: "IP on custom work",
    initechAsk: "Client owns anything custom-built and funded by Client.",
    dunderCounterEn:
      "Vendor retains ownership of all platform IP, including improvements and generalizable components built during custom work. Client receives a perpetual, royalty-free license to Client-specific configurations and outputs.",
    dunderCounterFr:
      "Le Fournisseur conserve la propriété de l'ensemble de la plateforme et des composants généralisables, y compris les améliorations issues des développements sur mesure. Le Client reçoit une licence perpétuelle et libre de redevances sur les configurations et livrables spécifiques au Client.",
    severity: "existential",
  },
  {
    id: "R06",
    clauseRef: "8.4 Feedback",
    title: "Feedback usage",
    initechAsk: "Vendor cannot use Client feedback to build features for other clients without consent.",
    dunderCounterEn:
      "Vendor may use anonymized, generalized feedback. Specific competitive intelligence or Client-confidential workflows will not be incorporated into other Client deployments.",
    dunderCounterFr:
      "Le Fournisseur peut utiliser des retours anonymisés et généralisés. Les informations concurrentielles spécifiques et les flux confidentiels du Client ne seront pas intégrés aux déploiements d'autres Clients.",
    severity: "low",
  },
  {
    id: "R07",
    clauseRef: "4.2 Payment Terms / 4.5 Disputed Invoices",
    title: "Payment terms",
    initechAsk: "Net 60, 0.5%/mo interest, full invoice withholding during dispute.",
    dunderCounterEn:
      "Net 45 with 1% per month overdue interest. Disputed amounts may be withheld; undisputed portion paid by due date. No service suspension during good-faith dispute.",
    dunderCounterFr:
      "Net 45 avec intérêt de 1 % par mois sur les retards. Les montants contestés peuvent être retenus ; la portion non contestée est payée à l'échéance. Aucune suspension du service pendant un différend de bonne foi.",
    severity: "medium",
  },
  {
    id: "R08",
    clauseRef: "4.4 Fee Increases",
    title: "Annual fee increases",
    initechAsk: "Up to 3% / 90 days notice on renewal.",
    dunderCounterEn:
      "Up to 5% per renewal indexed to CPI, 60 days written notice. Increases above 5% require Client consent.",
    dunderCounterFr:
      "Jusqu'à 5 % par renouvellement indexé sur l'IPC, préavis écrit de 60 jours. Toute hausse supérieure à 5 % requiert le consentement du Client.",
    severity: "low",
  },
  {
    id: "R09",
    clauseRef: "5.2 Termination",
    title: "Convenience termination + 15-day cure",
    initechAsk: "Convenience termination by Client on 30 days; 15-day cure for cause.",
    dunderCounterEn:
      "30-day cure period for material breach (industry standard). No convenience termination — Client may exit at the end of the then-current Term with 60 days notice. Pro-rata refund for unused months on uncured Vendor breach.",
    dunderCounterFr:
      "Période de remédiation de 30 jours pour manquement substantiel (norme du secteur). Pas de résiliation pour convenance — le Client peut sortir au terme de la période en cours avec un préavis de 60 jours. Remboursement au prorata des mois non utilisés en cas de manquement non corrigé du Fournisseur.",
    severity: "existential",
  },
  {
    id: "R10",
    clauseRef: "9.3 Audit Rights",
    title: "Audit rights",
    initechAsk: "Twice per year audits, 48 hours notice.",
    dunderCounterEn:
      "Annual SOC 2 Type II report shared. On-site audit once per year, 30 days notice, scoped to Client-data systems, at Client's expense unless a finding triggers cause.",
    dunderCounterFr:
      "Rapport SOC 2 Type II annuel partagé. Audit sur site une fois par an, préavis de 30 jours, limité aux systèmes traitant des données du Client, aux frais du Client sauf en cas de constat qui déclenche un motif.",
    severity: "high",
  },
  {
    id: "R11",
    clauseRef: "6 Data Location",
    title: "Data residency",
    initechAsk: "Ontario only; no cross-border without consent.",
    dunderCounterEn:
      "Production data stored in Canada (currently Ontario). Cross-border processing limited to incidental support requests with Client notification; no analytics/subprocessor flow outside Canada without prior written consent.",
    dunderCounterFr:
      "Les données de production sont stockées au Canada (actuellement en Ontario). Le traitement transfrontalier se limite aux demandes de support incidentes avec notification au Client ; aucun flux analytique ou sous-traitant hors Canada sans consentement écrit préalable.",
    severity: "high",
  },
  {
    id: "R12",
    clauseRef: "10 Insurance",
    title: "Insurance minimums",
    initechAsk: "$5M CGL, $5M E&O, $10M cyber.",
    dunderCounterEn:
      "$2M CGL, $2M E&O, $5M cyber liability — increases conditional on contract value reaching $250K ARR. Cyber insurance certificate provided on request.",
    dunderCounterFr:
      "2 M$ RC générale, 2 M$ E&O, 5 M$ cyber — augmentations conditionnelles à un revenu contractuel atteignant 250 k$ ARR. Certificat d'assurance cyber fourni sur demande.",
    severity: "medium",
  },
  {
    id: "R13",
    clauseRef: "5.4 Step-in Rights",
    title: "Step-in rights",
    initechAsk: "Client may assume control of Services if Vendor fails to perform.",
    dunderCounterEn:
      "Removed. On uncured material Vendor breach, Vendor will provide reasonable transition assistance for 90 days at then-current professional services rates and an export of Client Data in standard formats. No operational step-in.",
    dunderCounterFr:
      "Supprimé. En cas de manquement substantiel non corrigé du Fournisseur, le Fournisseur fournit une assistance raisonnable à la transition pendant 90 jours aux tarifs de services professionnels en vigueur et une exportation des données du Client en formats standards. Aucune prise de contrôle opérationnelle.",
    severity: "existential",
  },
] as const;

export const NDA_COUNTER_PROPOSALS: readonly CounterProposal[] = [
  {
    id: "N01",
    clauseRef: "1 Mutuality",
    title: "Mutuality",
    initechAsk: "One-way (Vendor only as recipient).",
    dunderCounterEn:
      "Mutual NDA. Both parties exchange roadmap, customer data, and pricing during diligence; symmetry is reasonable.",
    dunderCounterFr:
      "Accord de confidentialité mutuel. Les deux parties échangent feuille de route, données clients et tarifs durant la diligence ; la symétrie est raisonnable.",
    severity: "medium",
  },
  {
    id: "N02",
    clauseRef: "2 Definition of Confidential Information",
    title: "Scope of confidential information",
    initechAsk: "Everything, including verbal and unmarked.",
    dunderCounterEn:
      "Information that a reasonable person would understand to be confidential, OR is marked or identified as confidential within 30 days of disclosure.",
    dunderCounterFr:
      "Information qu'une personne raisonnable considérerait comme confidentielle, OU identifiée ou marquée comme telle dans les 30 jours suivant sa divulgation.",
    severity: "medium",
  },
  {
    id: "N03",
    clauseRef: "5 Injunctive Relief",
    title: "Injunctive relief / bond",
    initechAsk: "No bond required for Initech.",
    dunderCounterEn:
      "Either party may seek injunctive relief without bond ONLY upon showing prima facie irreparable harm; otherwise standard bond rules apply.",
    dunderCounterFr:
      "Chaque partie peut demander une injonction sans cautionnement UNIQUEMENT après démonstration prima facie d'un préjudice irréparable ; sinon les règles standard de cautionnement s'appliquent.",
    severity: "medium",
  },
  {
    id: "N04",
    clauseRef: "6 Term & Survival",
    title: "Term + survival",
    initechAsk: "3 years term + 5 year survival.",
    dunderCounterEn:
      "2 year term + 3 year survival for non-trade-secret information; trade secrets survive indefinitely while they remain trade secrets.",
    dunderCounterFr:
      "Terme de 2 ans + survie de 3 ans pour les informations non secrètes ; les secrets commerciaux survivent indéfiniment tant qu'ils restent secrets.",
    severity: "low",
  },
  {
    id: "N05",
    clauseRef: "7 Return / Destruction",
    title: "Return or destruction",
    initechAsk: "No archival copy without consent; written certification.",
    dunderCounterEn:
      "Backup/archival copies retained per Vendor's standard retention schedule remain confidential under this Agreement; certification of destruction provided for live operational copies.",
    dunderCounterFr:
      "Les copies de sauvegarde/archives conservées selon le calendrier de rétention standard du Fournisseur demeurent confidentielles aux termes du présent Accord ; certification de destruction pour les copies opérationnelles vives.",
    severity: "low",
  },
] as const;

export function counterProposalsFor(focus: "nda" | "msa"): readonly CounterProposal[] {
  return focus === "nda" ? NDA_COUNTER_PROPOSALS : MSA_COUNTER_PROPOSALS;
}
