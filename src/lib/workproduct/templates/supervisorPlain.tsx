/**
 * Supervisor PDF — Plain-English mode. Uses business phrasing, not contract
 * terms. The hero line per docs/tasks/08:
 *
 *   "Uncapped breach liability as drafted could end the company."
 *
 * This template is what Sarah hands her exec / board: short, sharp, no jargon.
 * One page is the goal; we render a second page only if there's still content
 * to show. We pre-write all phrasings here and pull from Decision/proposals.
 */

import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { DecisionWithLocale as Decision, Locale } from "@/lib/contracts";
import {
  counterProposalsFor,
  type CounterProposal,
} from "@/lib/workproduct/counterProposals";
import { styles } from "@/lib/workproduct/supervisorPdfStyles";

export interface SupervisorPlainPdfProps {
  decision: Decision;
  documentFocus: "nda" | "msa";
}

const PLAIN_HERO_LINES_EN: Record<string, string> = {
  R03: "If we accept uncapped breach liability as written, one incident could end the company.",
  R09: "A convenience-termination right means Initech can walk anytime without penalty — that breaks our forecast.",
  R05: "Giving away IP on custom work would gut our roadmap; we'd be rebuilding for every client.",
  R02: "We do not have 24/7 support staffed; promising it without uplift will cost us more than the contract earns.",
  R10: "Bank-style audit cadence twice a year is operational tax we can absorb only at this size deal.",
  R13: "Step-in rights would let Initech take operational control of our platform — we cannot give that.",
};

const PLAIN_HERO_LINES_FR: Record<string, string> = {
  R03: "Accepter une responsabilité non plafonnée pour atteinte aux données telle que rédigée pourrait couler la société.",
  R09: "Une résiliation pour convenance signifie qu'Initech peut partir à tout moment sans pénalité — cela casse nos prévisions.",
  R05: "Céder la propriété intellectuelle sur les développements sur mesure éviderait notre feuille de route ; il faudrait recommencer pour chaque client.",
  R02: "Nous n'avons pas d'équipe de support 24/7 ; le promettre sans hausse tarifaire coûterait plus que le contrat ne rapporte.",
  R10: "La cadence d'audit bancaire (deux fois par an) est une charge opérationnelle absorbable uniquement à ce niveau d'affaire.",
  R13: "Les droits de prise en main donneraient à Initech le contrôle opérationnel de notre plateforme — c'est inacceptable.",
};

export function SupervisorPlainPdf({
  decision,
  documentFocus,
}: SupervisorPlainPdfProps) {
  const locale: Locale = decision.locale ?? "en";
  const proposals = counterProposalsFor(documentFocus);
  const headlines = locale === "fr" ? PLAIN_HERO_LINES_FR : PLAIN_HERO_LINES_EN;
  const date = new Date().toISOString().slice(0, 10);
  const docKind = documentFocus === "nda" ? "NDA" : "MSA";

  const existential = proposals.filter((p) => p.severity === "existential");

  return (
    <Document
      title={t(
        "Supervisor Report — Plain English",
        "Rapport superviseur — Langage clair",
        locale,
      )}
      author="Gambit"
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.brandBar} />
        <Text style={styles.h1}>
          {t(
            `What this means — ${docKind}`,
            `Ce que cela signifie — ${docKind}`,
            locale,
          )}
        </Text>
        <Text style={styles.meta}>
          {t("Plain English summary", "Résumé en langage clair", locale)} ·{" "}
          {date} · {decision.dealId}
        </Text>

        <Text style={styles.h2}>
          {t("The headline risk", "Le risque principal", locale)}
        </Text>
        <View style={styles.callout}>
          <Text style={styles.calloutLabel}>
            {t("BOTTOM LINE", "EN BREF", locale)}
          </Text>
          <Text style={styles.calloutBody}>{decision.summaryPlain}</Text>
        </View>

        <Text style={styles.h2}>
          {t("Why these specific clauses matter", "Pourquoi ces clauses comptent", locale)}
        </Text>
        {existential.slice(0, 3).map((p) => (
          <PlainHero
            key={p.id}
            proposal={p}
            line={headlines[p.id]}
            locale={locale}
          />
        ))}

        <Text style={styles.h2}>
          {t(
            "What we are sending back",
            "Ce que nous renvoyons",
            locale,
          )}
        </Text>
        <Text style={styles.paragraph}>
          {locale === "fr"
            ? "Le coup recommandé est résumé ci-dessus. Le document de contre-rougeline accompagne ce rapport et reprend chaque clause point par point."
            : "The recommended move is summarized above. The counter-redline document attached to this report addresses each clause point by point."}
        </Text>

        <View style={styles.footer} fixed>
          <Text>Gambit · {decision.dealId}</Text>
          <Text>
            {t(
              "For executive review — not legal advice",
              "Revue exécutive — pas un avis juridique",
              locale,
            )}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

function PlainHero({
  proposal,
  line,
  locale,
}: {
  proposal: CounterProposal;
  line: string | undefined;
  locale: Locale;
}) {
  const fallback =
    locale === "fr" ? proposal.dunderCounterFr : proposal.dunderCounterEn;
  return (
    <View style={styles.clauseRow}>
      <Text style={styles.clauseTitle}>{proposal.title}</Text>
      <Text style={styles.calloutBody}>{line ?? fallback}</Text>
    </View>
  );
}

function t(en: string, fr: string, locale: Locale): string {
  return locale === "fr" ? fr : en;
}
