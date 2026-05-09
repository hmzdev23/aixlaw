/**
 * Supervisor PDF — Legal mode. Uses defined contract terms ("uncapped breach
 * exposure", "convenience termination", "step-in rights") without softening.
 *
 * Rendered server-side via @react-pdf/renderer. Two pages max (the demo cuts
 * after page 1 in most rehearsals; page 2 is the clause appendix).
 */

import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { DecisionWithLocale as Decision, Locale } from "@/lib/contracts";
import {
  counterProposalsFor,
  type CounterProposal,
} from "@/lib/workproduct/counterProposals";
import { styles } from "@/lib/workproduct/supervisorPdfStyles";

export interface SupervisorLegalPdfProps {
  decision: Decision;
  documentFocus: "nda" | "msa";
}

export function SupervisorLegalPdf({
  decision,
  documentFocus,
}: SupervisorLegalPdfProps) {
  const locale: Locale = decision.locale ?? "en";
  const proposals = counterProposalsFor(documentFocus);
  const date = new Date().toISOString().slice(0, 10);
  const docKind = documentFocus === "nda" ? "NDA" : "MSA";
  const tt = (en: string, fr: string): string => (locale === "fr" ? fr : en);

  return (
    <Document
      title={tt(
        "Supervisor Report — Legal Mode",
        "Rapport superviseur — Mode juridique",
      )}
      author="Gambit"
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.brandBar} />
        <Text style={styles.h1}>
          {tt(
            `Supervisor Report — ${docKind} (Legal Mode)`,
            `Rapport superviseur — ${docKind} (mode juridique)`,
          )}
        </Text>
        <Text style={styles.meta}>
          {tt("Generated", "Généré")}: {date} · {tt("Deal", "Affaire")}:{" "}
          {decision.dealId} · {tt("Move", "Coup")}: {decision.chosenMoveId} ·{" "}
          {tt("Reviewer", "Réviseur")}: Marc Tremblay (GC, fractional)
        </Text>

        <Text style={styles.h2}>{tt("1. Move", "1. Coup")}</Text>
        <Text style={styles.paragraph}>{decision.summaryLegal}</Text>

        <Text style={styles.h2}>
          {tt("2. Existential exposures", "2. Risques existentiels")}
        </Text>
        {proposals
          .filter((p) => p.severity === "existential")
          .slice(0, 3)
          .map((p) => (
            <ExistentialRow key={p.id} proposal={p} locale={locale} />
          ))}

        <Text style={styles.h2}>
          {tt("3. Financial recap", "3. Récapitulatif financier")}
        </Text>
        <FinancialTable decision={decision} locale={locale} />

        <Text style={styles.h2}>
          {tt("4. Compliance flags", "4. Indicateurs de conformité")}
        </Text>
        <Text style={styles.paragraph}>
          {decision.complianceFlags.length > 0
            ? decision.complianceFlags.join(" · ")
            : tt(
                "No compliance flags raised.",
                "Aucun indicateur de conformité.",
              )}
        </Text>

        <View style={styles.footer} fixed>
          <Text>Gambit · {decision.dealId}</Text>
          <Text>
            {tt(
              "Confidential — for GC review only",
              "Confidentiel — réservé au CJ",
            )}
          </Text>
        </View>
      </Page>

      <Page size="LETTER" style={styles.page}>
        <Text style={styles.h2}>
          {tt(
            "5. Clause-by-clause counter (selected)",
            "5. Contre-propositions par clause (sélection)",
          )}
        </Text>
        {proposals.slice(0, 8).map((p) => (
          <ClauseRow key={p.id} proposal={p} locale={locale} />
        ))}
        <View style={styles.footer} fixed>
          <Text>Gambit · {decision.dealId}</Text>
          <Text>{tt("Page 2 of 2", "Page 2 sur 2")}</Text>
        </View>
      </Page>
    </Document>
  );
}

function FinancialTable({
  decision,
  locale,
}: {
  decision: Decision;
  locale: Locale;
}) {
  const f = decision.financials;
  const total =
    f.totalContractCad ?? f.monthlyAmount * Math.max(f.months, 1);
  const fmt = new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    style: "currency",
    currency: f.currency,
    maximumFractionDigits: 0,
  });
  const rows: { label: string; value: string }[] = [
    { label: t("Currency", "Devise", locale), value: f.currency },
    {
      label: t("Monthly", "Mensuel", locale),
      value: fmt.format(f.monthlyAmount),
    },
    { label: t("Months", "Mois", locale), value: String(f.months) },
    { label: t("Net days", "Net jours", locale), value: String(f.netDays) },
    { label: t("Tier", "Niveau", locale), value: f.tier },
    { label: t("Seats", "Postes", locale), value: String(f.seats) },
    {
      label: t("Total contract", "Valeur totale", locale),
      value: fmt.format(total),
    },
  ];
  return (
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <Text style={styles.tableHeaderCell}>
          {t("Field", "Champ", locale)}
        </Text>
        <Text style={styles.tableHeaderCell}>
          {t("Value", "Valeur", locale)}
        </Text>
      </View>
      {rows.map((r, idx) => (
        <View
          key={r.label}
          style={idx === rows.length - 1 ? styles.tableRowLast : styles.tableRow}
        >
          <Text style={styles.tableCellLabel}>{r.label}</Text>
          <Text style={styles.tableCellValue}>{r.value}</Text>
        </View>
      ))}
    </View>
  );
}

function ExistentialRow({
  proposal,
  locale,
}: {
  proposal: CounterProposal;
  locale: Locale;
}) {
  return (
    <View style={styles.callout}>
      <Text style={styles.calloutLabel}>
        {proposal.id} · {proposal.clauseRef}
      </Text>
      <Text style={styles.calloutBody}>{proposal.title}</Text>
      <Text style={styles.clauseAsk}>
        {t("Initech ask:", "Demande Initech :", locale)} {proposal.initechAsk}
      </Text>
      <Text style={styles.clauseCounter}>
        {t("Dunder counter:", "Contre Dunder :", locale)}{" "}
        {locale === "fr" ? proposal.dunderCounterFr : proposal.dunderCounterEn}
      </Text>
    </View>
  );
}

function ClauseRow({
  proposal,
  locale,
}: {
  proposal: CounterProposal;
  locale: Locale;
}) {
  const pillStyle =
    proposal.severity === "existential"
      ? styles.pillExistential
      : proposal.severity === "high"
        ? styles.pillHigh
        : styles.clauseAsk;
  return (
    <View style={styles.clauseRow}>
      <Text style={styles.clauseTitle}>
        {proposal.id} · {proposal.clauseRef} — {proposal.title}{" "}
        <Text style={pillStyle}>[{proposal.severity.toUpperCase()}]</Text>
      </Text>
      <Text style={styles.clauseAsk}>
        {t("Initech:", "Initech :", locale)} {proposal.initechAsk}
      </Text>
      <Text style={styles.clauseCounter}>
        {t("Dunder:", "Dunder :", locale)}{" "}
        {locale === "fr" ? proposal.dunderCounterFr : proposal.dunderCounterEn}
      </Text>
    </View>
  );
}

function t(en: string, fr: string, locale: Locale): string {
  return locale === "fr" ? fr : en;
}
