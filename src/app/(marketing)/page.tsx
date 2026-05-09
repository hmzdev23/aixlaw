"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import {
  Menu,
  X,
  Zap,
  Shield,
  Network,
  Swords,
  LayoutDashboard,
  Check,
} from "lucide-react";

const HERO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_101331_74f9b798-3f00-4e86-8a01-377aa16ffeaa.mp4";

const MOTION_DEFAULTS = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true as const },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
};

/* ─────────────────────────── PulseGrid logo mark ────────────────── */

function LogoMark() {
  return (
    <div className="w-7 h-7 grid grid-cols-2 gap-[2px] rounded-[4px] overflow-hidden flex-shrink-0">
      <div className="bg-[#0c0a09]" />
      <div className="bg-[#a7e5d3]" />
      <div className="bg-[#a8c8e8]" />
      <div className="bg-[#c8b8e0]" />
    </div>
  );
}

/* ─────────────────────────── TopNav ─────────────────────────────── */

function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on("change", (v) => setScrolled(v > 8));
  }, [scrollY]);

  const navLinks = [
    { label: "Cockpit", href: "/cockpit" },
    { label: "War Room", href: "/war-room" },
    { label: "Architect", href: "/architect" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-16 bg-[#f5f5f5] border-b border-[#e7e5e4] transition-shadow duration-200 ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <LogoMark />
          <span className="font-medium text-[15px] text-[#0c0a09] tracking-tight select-none">
            Gambit
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[15px] font-medium text-[#0c0a09] opacity-70 hover:opacity-100 transition-opacity"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/cockpit"
            className="text-[15px] text-[#0c0a09] opacity-60 hover:opacity-100 transition-opacity"
          >
            Log in
          </Link>
          <Link
            href="/cockpit"
            className="bg-[#0c0a09] text-white rounded-full px-5 py-2.5 text-[15px] font-medium hover:opacity-90 transition-opacity"
          >
            Enter Cockpit
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-full text-[#0c0a09] hover:bg-[#e7e5e4] transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden bg-[#f5f5f5] border-b border-[#e7e5e4]"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 text-[15px] font-medium text-[#0c0a09] hover:bg-[#e7e5e4] rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-[#e7e5e4] mt-2 pt-3 flex flex-col gap-2">
                <Link
                  href="/cockpit"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 text-[15px] text-[#0c0a09] opacity-60"
                >
                  Log in
                </Link>
                <Link
                  href="/cockpit"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center bg-[#0c0a09] text-white rounded-full px-5 py-2.5 text-[15px] font-medium"
                >
                  Enter Cockpit
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ─────────────────────────── HeroSection ────────────────────────── */

function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section className="relative overflow-hidden bg-[#f5f5f5] pt-24 pb-16 px-6">
      {/* Atmospheric orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -left-16 w-[480px] h-[480px] opacity-40 blur-3xl z-0"
        style={{
          background: "radial-gradient(circle, #a7e5d3 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -right-16 w-[400px] h-[400px] opacity-35 blur-3xl z-0"
        style={{
          background: "radial-gradient(circle, #f4c5a8 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[360px] h-[360px] opacity-30 blur-3xl z-0"
        style={{
          background: "radial-gradient(circle, #c8b8e0 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <span className="inline-block bg-[#f0efed] text-[#777169] rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-widest">
            Spellbook Challenge · Hackathon 2026
          </span>

          {/* H1 */}
          <h1
            className="font-display mt-6 text-[#0c0a09] leading-[1.05] tracking-[-0.03em]"
            style={{ fontSize: "clamp(48px, 7vw, 80px)" }}
          >
            Negotiate like you&apos;ve
            <br />
            been here before.
          </h1>

          {/* Sub */}
          <p className="text-[17px] text-[#4e4e4e] leading-relaxed max-w-xl mx-auto mt-5">
            Ghost opponent modelling, game-tree analysis, multi-regime compliance, and full
            execution arc — from Initech&apos;s redlines to signed in under two hours.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <Link
              href="/cockpit"
              className="bg-[#0c0a09] text-white rounded-full px-5 py-2.5 text-[15px] font-medium hover:opacity-90 transition-opacity"
            >
              Enter Cockpit
            </Link>
            <Link
              href="#features"
              className="border border-[#d6d3d1] bg-transparent text-[#0c0a09] rounded-full px-5 py-2.5 text-[15px] font-medium hover:bg-[#f0efed] transition-colors"
            >
              See how it works
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Video card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative mt-14 max-w-5xl mx-auto"
      >
        {/* Glow blob */}
        <div
          aria-hidden="true"
          className="absolute inset-x-20 -top-6 h-32 rounded-full blur-3xl pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(167,229,211,0.3), rgba(200,184,224,0.2), rgba(244,197,168,0.3))",
          }}
        />

        {/* Outer card */}
        <div className="relative rounded-2xl border border-[#e7e5e4] bg-white/90 p-2.5 shadow-[0_16px_60px_-12px_rgba(0,0,0,0.1)]">
          {/* Inner card */}
          <div className="rounded-xl border border-[#e7e5e4] overflow-hidden">
            {/* Chrome bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#f5f5f5] border-b border-[#e7e5e4]">
              <div className="flex items-center gap-1.5">
                <div className="w-[10px] h-[10px] rounded-full bg-rose-400" />
                <div className="w-[10px] h-[10px] rounded-full bg-amber-400" />
                <div className="w-[10px] h-[10px] rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="rounded-full border border-[#e7e5e4] bg-white px-4 py-1 text-xs text-[#777169] font-medium select-none">
                  Dunder AI / MSA Cockpit
                </div>
              </div>
            </div>

            {/* Video */}
            <video
              ref={videoRef}
              src={HERO_VIDEO_URL}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-[360px] object-cover block"
              aria-label="Gambit product demo — AI-powered negotiation cockpit"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────── Feature card illustrations ─────────── */

function CockpitIllustration() {
  const icons = [
    { Icon: LayoutDashboard, label: "Eval bar", color: "#a7e5d3" },
    { Icon: Swords, label: "Ghost", color: "#c8b8e0" },
    { Icon: Network, label: "Tree", color: "#a8c8e8" },
    { Icon: Shield, label: "Walkaway", color: "#f4c5a8" },
  ];
  return (
    <div className="h-48 rounded-xl bg-[#f5f5f5] mb-5 relative overflow-hidden">
      {/* Mint atmosphere */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{ background: "radial-gradient(circle at 30% 40%, #a7e5d3 0%, transparent 60%)" }}
      />
      <div className="relative z-10 grid grid-cols-2 gap-3 p-4 h-full">
        {icons.map(({ Icon, label, color }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-[#e7e5e4] bg-white/80"
          >
            <Icon size={20} style={{ color }} />
            <span className="text-[11px] text-[#777169] font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WarRoomIllustration() {
  const nodes = [
    { Icon: Zap, label: "File", color: "#a7e5d3" },
    { Icon: Swords, label: "Ghost", color: "#c8b8e0" },
    { Icon: Network, label: "Council", color: "#a8c8e8" },
    { Icon: Shield, label: "Crown", color: "#f4c5a8" },
    { Icon: Check, label: "Sign", color: "#a7e5d3" },
  ];
  return (
    <div className="h-48 rounded-xl bg-[#f5f5f5] mb-5 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{ background: "radial-gradient(circle at 70% 50%, #c8b8e0 0%, transparent 60%)" }}
      />
      <div className="relative z-10 flex items-center justify-center gap-1.5 h-full px-4">
        {nodes.map(({ Icon, label, color }, i) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-9 h-9 rounded-lg border border-[#e7e5e4] bg-white/90 flex items-center justify-center"
              >
                <Icon size={16} style={{ color }} />
              </div>
              <span className="text-[10px] text-[#777169]">{label}</span>
            </div>
            {i < nodes.length - 1 && (
              <div className="w-4 h-px bg-[#e7e5e4] mb-4 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ComplianceIllustration() {
  const rows = [
    { label: "OSFI", status: "pass", color: "#a7e5d3" },
    { label: "PIPEDA", status: "pass", color: "#a7e5d3" },
    { label: "Law 25", status: "warn", color: "#f4c5a8" },
  ];
  return (
    <div className="h-48 rounded-xl bg-[#f5f5f5] mb-5 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{ background: "radial-gradient(circle at 20% 60%, #a7e5d3 0%, transparent 60%)" }}
      />
      <div className="relative z-10 flex flex-col justify-center gap-3 h-full px-5">
        {rows.map(({ label, status, color }) => (
          <div
            key={label}
            className="flex items-center justify-between bg-white/90 rounded-lg border border-[#e7e5e4] px-4 py-2.5"
          >
            <span className="text-[13px] font-medium text-[#0c0a09]">{label}</span>
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: color }}
              />
              <span className="text-[11px] text-[#777169] uppercase tracking-wide font-semibold">
                {status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchitectIllustration() {
  const blocks = [
    { color: "#a7e5d3", label: "Brief" },
    { color: "#c8b8e0", label: "Ghost" },
    { color: "#a8c8e8", label: "Council" },
    { color: "#f4c5a8", label: "Exec" },
  ];
  return (
    <div className="h-48 rounded-xl bg-[#f5f5f5] mb-5 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{ background: "radial-gradient(circle at 80% 20%, #a8c8e8 0%, transparent 60%)" }}
      />
      <div className="relative z-10 grid grid-cols-2 gap-3 p-4 h-full">
        {blocks.map(({ color, label }) => (
          <div
            key={label}
            className="rounded-lg border border-[#e7e5e4] bg-white/80 flex flex-col items-center justify-center gap-1.5"
          >
            <div className="w-6 h-6 rounded-md" style={{ background: color }} />
            <span className="text-[11px] text-[#777169] font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── FeaturesSection ────────────────────── */

function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6">
      {/* Header */}
      <motion.div
        {...MOTION_DEFAULTS}
        className="text-center max-w-3xl mx-auto"
      >
        <span className="bg-[#f0efed] text-[#777169] rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-widest">
          Three modes
        </span>
        <h2
          className="font-display text-[#0c0a09] leading-[1.1] tracking-[-0.03em] mt-3"
          style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
        >
          One unfair advantage.
        </h2>
        <p className="text-[17px] text-[#4e4e4e] mt-4 max-w-2xl mx-auto">
          Cockpit is the product. War Room makes it defensible. Architect makes it yours.
        </p>
      </motion.div>

      {/* Cards grid */}
      <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {/* Card 1 — Cockpit (lg:col-span-1) */}
        <motion.div
          {...MOTION_DEFAULTS}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-1 bg-white border border-[#e7e5e4] rounded-2xl p-6"
        >
          <CockpitIllustration />
          <p className="text-[20px] font-medium text-[#0c0a09] leading-snug">
            Eval bar. Ghost card. Game tree. Walkaway line.
          </p>
          <p className="text-[15px] text-[#4e4e4e] mt-2 leading-relaxed">
            Chess-style position scoring with a counterparty model built from Initech&apos;s
            precedent corpus.
          </p>
        </motion.div>

        {/* Card 2 — War Room (lg:col-span-2) */}
        <motion.div
          {...MOTION_DEFAULTS}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-2 bg-white border border-[#e7e5e4] rounded-2xl p-6"
        >
          <WarRoomIllustration />
          <p className="text-[20px] font-medium text-[#0c0a09] leading-snug">
            Multi-agent council. Auditable record.
          </p>
          <p className="text-[15px] text-[#4e4e4e] mt-2 leading-relaxed">
            Four AI agents deliberate, vote, and synthesize. Crown produces a 4–0 recommendation
            with full transcript.
          </p>
        </motion.div>

        {/* Card 3 — Compliance (lg:col-span-2) */}
        <motion.div
          {...MOTION_DEFAULTS}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-2 bg-white border border-[#e7e5e4] rounded-2xl p-6"
        >
          <ComplianceIllustration />
          <p className="text-[20px] font-medium text-[#0c0a09] leading-snug">
            OSFI · PIPEDA · Law 25.
          </p>
          <p className="text-[15px] text-[#4e4e4e] mt-2 leading-relaxed">
            Multi-regime compliance scanner. Auto-generated PIA in EN + FR. TrueSight citation
            verifier against CanLII.
          </p>
        </motion.div>

        {/* Card 4 — Architect (lg:col-span-1) */}
        <motion.div
          {...MOTION_DEFAULTS}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-1 bg-white border border-[#e7e5e4] rounded-2xl p-6"
        >
          <ArchitectIllustration />
          <p className="text-[20px] font-medium text-[#0c0a09] leading-snug">
            Rewire the engine.
          </p>
          <p className="text-[15px] text-[#4e4e4e] mt-2 leading-relaxed">
            Drag-and-drop agent canvas. Tune sensitivity sliders. Save as Playbook. Export JSON.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────── WorkflowSection ────────────────────── */

function WorkflowSection() {
  const steps = [
    {
      number: "01",
      title: "Brief lands",
      body: "MSA redlines arrive from Initech. Ghost forms instantly from the precedent corpus.",
      miniColor: "#a7e5d3",
    },
    {
      number: "02",
      title: "Best line played",
      body: "Eval bar, game tree bloom, Council 4–0 vote. One click plays the brilliant line.",
      miniColor: "#c8b8e0",
    },
    {
      number: "03",
      title: "Deal closes",
      body: "Counter-redline DOCX, voice sign-off, Stripe CAD payment, execution timeline fires.",
      miniColor: "#a8c8e8",
    },
  ];

  return (
    <section id="workflow" className="py-24 px-6 bg-[#fafafa]">
      {/* Header */}
      <motion.div
        {...MOTION_DEFAULTS}
        className="text-center max-w-3xl mx-auto"
      >
        <h2
          className="font-display text-[#0c0a09] leading-[1.1] tracking-[-0.03em]"
          style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
        >
          From inbox to invoice in two hours.
        </h2>
        <p className="text-[17px] text-[#4e4e4e] mt-4">
          The complete negotiation arc, automated.
        </p>
      </motion.div>

      {/* Step cards */}
      <div className="mt-14 grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            {...MOTION_DEFAULTS}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-[#e7e5e4] rounded-2xl p-6"
          >
            {/* Mini illustration card */}
            <div
              className="h-24 rounded-xl mb-5 relative overflow-hidden"
              style={{ background: "#f5f5f5" }}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none opacity-50"
                style={{
                  background: `radial-gradient(circle at 40% 50%, ${step.miniColor} 0%, transparent 65%)`,
                }}
              />
              <div className="relative z-10 flex items-center justify-center h-full">
                <span
                  className="text-[32px] font-display tracking-[-0.04em] text-[#0c0a09] opacity-20"
                >
                  {step.number}
                </span>
              </div>
            </div>

            <span className="text-[12px] font-semibold tracking-widest uppercase text-[#777169]">
              {step.number}
            </span>
            <p className="text-[20px] font-medium text-[#0c0a09] mt-3 leading-snug">
              {step.title}
            </p>
            <p className="text-[15px] text-[#4e4e4e] mt-2 leading-relaxed">{step.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────── StatsSection ───────────────────────── */

function StatsSection() {
  const stats = [
    { value: "$180K CAD", label: "Deal value locked in the demo" },
    { value: "ELO 2341", label: "Initech Ghost model strength" },
    { value: "< 2 hrs", label: "Inbox to signed contract" },
  ];

  return (
    <section className="py-20 px-6">
      <motion.div
        {...MOTION_DEFAULTS}
        className="max-w-4xl mx-auto bg-white border border-[#e7e5e4] rounded-2xl p-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#e7e5e4]">
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="flex flex-col items-center justify-center py-8 md:py-0 md:px-12 text-center first:pt-0 last:pb-0 md:first:pl-0 md:last:pr-0"
            >
              <span className="font-display text-[48px] text-[#0c0a09] leading-none">
                {stat.value}
              </span>
              <span className="text-[15px] text-[#777169] mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────── DarkCTASection ─────────────────────── */

function DarkCTASection() {
  return (
    <section className="py-24 px-6">
      <motion.div
        {...MOTION_DEFAULTS}
        className="bg-[#0c0a09] rounded-2xl max-w-5xl mx-auto overflow-hidden relative py-20 px-8 text-center flex flex-col items-center"
      >
        {/* Atmospheric orbs inside dark card */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -left-20 w-[400px] h-[400px] blur-3xl"
          style={{ opacity: 0.15, background: "radial-gradient(circle, #a7e5d3 0%, transparent 70%)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -right-20 w-[360px] h-[360px] opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #c8b8e0 0%, transparent 70%)" }}
        />

        {/* Badge */}
        <span className="relative z-10 inline-block border border-white/10 bg-white/5 text-[#a8a29e] rounded-full px-3 py-1 text-xs uppercase tracking-widest font-semibold">
          For deals that can&apos;t afford to lose
        </span>

        {/* H2 */}
        <h2
          className="relative z-10 font-display text-white leading-[1.1] mt-6"
          style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
        >
          Run your negotiation machine
          <br />
          without the chaos.
        </h2>

        {/* Sub */}
        <p className="relative z-10 text-[17px] text-[#a8a29e] mt-4">
          One cockpit. Ghost opponent. Council. Playbook. Execution.
        </p>

        {/* CTAs */}
        <div className="relative z-10 mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            href="/cockpit"
            className="bg-white text-[#0c0a09] rounded-full px-6 py-3 font-medium text-[15px] hover:opacity-90 transition-opacity"
          >
            Enter Cockpit
          </Link>
          <Link
            href="#features"
            className="border border-white/15 bg-white/5 text-white rounded-full px-6 py-3 font-medium text-[15px] hover:bg-white/10 transition-colors"
          >
            Watch demo
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────── Footer ────────────────────────────── */

function Footer() {
  return (
    <footer className="bg-[#f5f5f5] border-t border-[#e7e5e4] py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-[15px] text-[#777169]">
          © 2026 Gambit. All rights reserved.
        </span>
        <div className="flex items-center gap-6">
          <Link href="#" className="text-[15px] text-[#777169] hover:text-[#0c0a09] transition-colors">
            Privacy
          </Link>
          <Link href="#" className="text-[15px] text-[#777169] hover:text-[#0c0a09] transition-colors">
            Terms
          </Link>
          <Link href="#" className="text-[15px] text-[#777169] hover:text-[#0c0a09] transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────── Page ──────────────────────────────── */

export default function MarketingPage() {
  return (
    <>
      <TopNav />
      <HeroSection />
      <FeaturesSection />
      <WorkflowSection />
      <StatsSection />
      <DarkCTASection />
      <Footer />
    </>
  );
}
