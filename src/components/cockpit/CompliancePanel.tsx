"use client";

import { useState } from "react";
import type { ComplianceReport } from "@/lib/contracts/models";
import { useLocale } from "@/contexts/LocaleContext";
import { Shield, AlertTriangle, Globe, FileText } from "lucide-react";

interface CompliancePanelProps {
  report: ComplianceReport;
}

type Tab = "osfi" | "pipeda" | "law25";

export function CompliancePanel({ report }: CompliancePanelProps) {
  const [tab, setTab] = useState<Tab>("osfi");
  const [piaLang, setPiaLang] = useState<"en" | "fr">("en");
  const { locale } = useLocale();

  const TABS = [
    { id: "osfi" as Tab, label: "OSFI B-13", icon: Shield, triggered: report.osfi.triggered },
    { id: "pipeda" as Tab, label: locale === "fr" ? "LPRPDE" : "PIPEDA", icon: Globe, triggered: report.pipeda.triggered },
    { id: "law25" as Tab, label: "Law 25", icon: AlertTriangle, triggered: report.law25.triggered },
  ];

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--color-gray-200)", background: "white" }}>
      {/* Tab header */}
      <div className="flex" style={{ borderBottom: "1px solid var(--color-gray-200)" }}>
        {TABS.map(({ id, label, icon: Icon, triggered }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors relative"
            style={{
              color: tab === id ? "var(--color-brand)" : "var(--color-gray-600)",
              background: tab === id ? "var(--color-brand-muted)" : "transparent",
            }}
            role="tab"
            aria-selected={tab === id}
          >
            <Icon size={12} />
            {label}
            {triggered && (
              <span
                className="w-1.5 h-1.5 rounded-full absolute top-2 right-2"
                style={{ background: "var(--color-error)" }}
                aria-label="triggered"
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {tab === "osfi" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: report.osfi.triggered ? "rgba(255,59,48,0.08)" : "rgba(0,196,140,0.08)",
                  color: report.osfi.triggered ? "var(--color-error)" : "var(--color-success)",
                }}
              >
                {report.osfi.triggered ? "Triggered" : "Clear"}
              </span>
              <p className="text-xs font-semibold" style={{ color: "var(--color-gray-900)" }}>
                Guideline B-13 — Third-Party Risk
              </p>
            </div>
            <ul className="space-y-2">
              {report.osfi.triggers.map((t, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: "var(--color-gray-600)" }}>
                  <span style={{ color: "var(--color-error)", flexShrink: 0 }}>▸</span>
                  {t}
                </li>
              ))}
            </ul>
            {report.osfi.notes?.map((n, i) => (
              <p key={i} className="mt-3 text-xs italic" style={{ color: "var(--color-gray-400)" }}>{n}</p>
            ))}
          </div>
        )}

        {tab === "pipeda" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: report.pipeda.triggered ? "rgba(255,59,48,0.08)" : "rgba(0,196,140,0.08)",
                  color: report.pipeda.triggered ? "var(--color-error)" : "var(--color-success)",
                }}
              >
                {report.pipeda.triggered ? "Triggered" : "Clear"}
              </span>
              <p className="text-xs font-semibold" style={{ color: "var(--color-gray-900)" }}>
                {locale === "fr" ? "Loi sur la protection des renseignements personnels" : "Personal Information Protection"}
              </p>
            </div>
            <ul className="space-y-2">
              {report.pipeda.triggers.map((t, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: "var(--color-gray-600)" }}>
                  <span style={{ color: "var(--color-warning)", flexShrink: 0 }}>▸</span>
                  {t}
                </li>
              ))}
            </ul>
            {report.pipeda.notes?.map((n, i) => (
              <p key={i} className="mt-3 text-xs italic" style={{ color: "var(--color-gray-400)" }}>{n}</p>
            ))}
          </div>
        )}

        {tab === "law25" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: report.law25.triggered ? "rgba(255,59,48,0.08)" : "rgba(0,196,140,0.08)",
                  color: report.law25.triggered ? "var(--color-error)" : "var(--color-success)",
                }}
              >
                {report.law25.triggered ? "Triggered" : "Clear"}
              </span>
              <p className="text-xs font-semibold" style={{ color: "var(--color-gray-900)" }}>
                Loi 25 — Québec Privacy
              </p>
            </div>
            <ul className="space-y-2 mb-4">
              {report.law25.triggers.map((t, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: "var(--color-gray-600)" }}>
                  <span style={{ color: "var(--color-error)", flexShrink: 0 }}>▸</span>
                  {t}
                </li>
              ))}
            </ul>

            {report.law25.pia && (
              <div className="rounded-xl border p-3" style={{ borderColor: "rgba(255,75,0,0.2)", background: "var(--color-brand-muted)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <FileText size={12} style={{ color: "var(--color-brand)" }} />
                    <p className="text-xs font-semibold" style={{ color: "var(--color-brand)" }}>
                      Privacy Impact Assessment
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {(["en", "fr"] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setPiaLang(l)}
                        className="text-xs px-2 py-0.5 rounded-full font-medium transition-colors"
                        style={{
                          background: piaLang === l ? "var(--color-brand)" : "transparent",
                          color: piaLang === l ? "white" : "var(--color-brand)",
                          border: "1px solid var(--color-brand)",
                        }}
                      >
                        {l.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  {Object.entries(
                    piaLang === "en" ? report.law25.pia.sectionsEn : report.law25.pia.sectionsFr
                  ).map(([section, content]) => (
                    <div key={section}>
                      <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-gray-900)" }}>
                        {section}
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--color-gray-600)" }}>
                        {content}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs italic" style={{ color: "var(--color-gray-400)" }}>
                  Labeled hypo extension for demo — Law 25 PIA requirement triggered by US subprocessor + Quebec customer data.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
