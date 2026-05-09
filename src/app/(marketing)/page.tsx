"use client";

import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import { ArrowRight, Shield, GitBranch, Users, Clock } from "lucide-react";

const HERO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_101331_74f9b798-3f00-4e86-8a01-377aa16ffeaa.mp4";

const FEATURES = [
  {
    icon: GitBranch,
    title: "Ghost + Game Tree",
    desc: "Model your counterparty's ELO, fighting style, and likely replies. Bloom three branches — brilliant to blunder.",
  },
  {
    icon: Shield,
    title: "Multi-Regime Compliance",
    desc: "OSFI B-13, PIPEDA, and Law 25 — auto-flagged with bilingual PIA generation when triggered.",
  },
  {
    icon: Users,
    title: "Multi-Agent Council",
    desc: "Counsel, Closer, Counterpart, Compliance, and Crown deliberate. 4–0 synthesis drives Play Best Line.",
  },
  {
    icon: Clock,
    title: "Full Execution Arc",
    desc: "Stripe CAD invoicing, seat provisioning, notary queue, Gmail draft, and Slack approval — all from one decision.",
  },
];

export default function MarketingPage() {
  const { t } = useLocale();

  return (
    <>
      {/* Hero */}
      <section
        className="relative px-6 pt-20 pb-24 overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #FFFFFF 0%, #FFF5F0 60%, #FFEAE0 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
            style={{ background: "var(--color-brand-muted)", color: "var(--color-brand)", border: "1px solid rgba(255,75,0,0.15)" }}>
            {t.hero.badge}
          </div>

          {/* Headline */}
          <h1
            className="mb-6 font-bold"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              color: "var(--color-gray-900)",
            }}
          >
            {t.hero.headline}
          </h1>

          {/* Sub-headline */}
          <p
            className="max-w-2xl mx-auto mb-10 text-lg"
            style={{ color: "var(--color-gray-600)", lineHeight: 1.6, letterSpacing: "-0.01em" }}
          >
            {t.hero.subhead}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/cockpit"
              className="flex items-center gap-2 px-7 py-4 rounded-full font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #FF4B00, #FF7A40)",
                boxShadow: "0 4px 16px rgba(255,75,0,0.3)",
                fontSize: "1rem",
                letterSpacing: "-0.01em",
              }}
            >
              {t.hero.cta1}
              <ArrowRight size={16} />
            </Link>
            <a
              href="#video"
              className="flex items-center gap-2 px-7 py-4 rounded-full font-medium transition-all"
              style={{
                border: "1.5px solid rgba(0,0,0,0.15)",
                color: "var(--color-gray-900)",
                fontSize: "1rem",
              }}
            >
              {t.hero.cta2}
            </a>
          </div>
        </div>

        {/* Decorative gradient blob */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,75,0,0.08) 0%, transparent 70%)" }}
          aria-hidden="true"
        />
      </section>

      {/* Hero video */}
      <section id="video" className="px-6 py-16 max-w-5xl mx-auto">
        <div
          className="rounded-3xl overflow-hidden border shadow-2xl"
          style={{ borderColor: "var(--color-gray-200)", boxShadow: "0 24px 80px rgba(0,0,0,0.12)" }}
        >
          <video
            src={HERO_VIDEO_URL}
            controls
            muted
            playsInline
            className="w-full aspect-video object-cover"
            aria-label="Gambit product demo — Dunder AI negotiating Initech MSA"
          />
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16" style={{ background: "var(--color-gray-50)" }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-center mb-12 font-semibold"
            style={{ fontSize: "2rem", letterSpacing: "-0.025em", color: "var(--color-gray-900)" }}
          >
            Everything in one arc
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-8 rounded-2xl border transition-all hover:-translate-y-0.5"
                style={{
                  background: "white",
                  borderColor: "rgba(0,0,0,0.08)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "var(--color-brand-muted)" }}
                >
                  <Icon size={20} style={{ color: "var(--color-brand)" }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ fontSize: "1.1rem", color: "var(--color-gray-900)" }}>
                  {title}
                </h3>
                <p style={{ color: "var(--color-gray-600)", lineHeight: 1.6, fontSize: "0.9375rem" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scenario callout */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div
          className="rounded-3xl p-12 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)" }}
        >
          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-brand)" }}>
              Demo Scenario — Spellbook Fixture
            </p>
            <h2
              className="font-bold mb-4 text-white"
              style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", letterSpacing: "-0.03em" }}
            >
              Dunder AI vs Initech Financial Group
            </h2>
            <p className="max-w-xl mx-auto mb-8 text-base" style={{ color: "#A0A0A0", lineHeight: 1.6 }}>
              First enterprise MSA. $180K CAD over 2 years. Initech&apos;s redlines: uncapped breach, 24/7 ops, Ontario-only residency, step-in.
              Board readout at 6 PM. You have 1h 47m.
            </p>
            <Link
              href="/cockpit"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #FF4B00, #FF7A40)",
                boxShadow: "0 4px 24px rgba(255,75,0,0.4)",
              }}
            >
              Enter Cockpit
              <ArrowRight size={16} />
            </Link>
          </div>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,75,0,0.12) 0%, transparent 60%)" }}
            aria-hidden="true"
          />
        </div>
      </section>
    </>
  );
}
