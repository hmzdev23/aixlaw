"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import {
  ChevronRight,
  ArrowRight,
  Shield,
  Zap,
  Network,
  LayoutDashboard,
  Swords,
  Check,
  Menu,
  X,
  Clock,
  Users,
  FileText,
  GitBranch,
} from "lucide-react";

const HERO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_101331_74f9b798-3f00-4e86-8a01-377aa16ffeaa.mp4";

/* ─────────────────────────── TopNav ─────────────────────────────── */

function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on("change", (v) => setScrolled(v > 12));
  }, [scrollY]);

  const navLinks = [
    { label: "Product", href: "/#product" },
    { label: "War Room", href: "/war-room" },
    { label: "Architect", href: "/architect" },
    { label: "Pricing", href: "/#pricing" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-zinc-200 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm select-none"
            style={{ background: "#FF4B00" }}
          >
            G
          </div>
          <span className="font-semibold text-zinc-950 tracking-tight">Gambit</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-950 transition-colors rounded-full hover:bg-zinc-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/cockpit"
            className="text-sm text-zinc-500 hover:text-zinc-950 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/cockpit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
            style={{ background: "#FF4B00" }}
          >
            Enter Cockpit
            <ChevronRight size={13} />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-full text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
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
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-zinc-200"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-zinc-100 mt-2 pt-3 flex flex-col gap-2">
                <Link
                  href="/cockpit"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 text-sm text-zinc-500 hover:text-zinc-950 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/cockpit"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-white"
                  style={{ background: "#FF4B00" }}
                >
                  Enter Cockpit
                  <ChevronRight size={13} />
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

  const integrationBadges = [
    { icon: <Zap size={12} />, label: "Spellbook" },
    { icon: <Shield size={12} />, label: "OSFI" },
    { icon: <FileText size={12} />, label: "PIPEDA" },
    { icon: <GitBranch size={12} />, label: "Law 25" },
  ];

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at top, rgba(255,75,0,0.06), transparent 35%), radial-gradient(circle at 20% 30%, rgba(255,184,0,0.05), transparent 28%), #ffffff",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(24,24,27,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.03) 1px, transparent 1px)",
          backgroundSize: "4rem 4rem",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-14 lg:pt-40 lg:px-8 flex flex-col items-center text-center">
        {/* Badge pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur mb-8"
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: "#FF4B00" }}
          />
          <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Spellbook Challenge · Hackathon 2026
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-zinc-950 max-w-4xl leading-[1.08]"
        >
          The negotiation cockpit for enterprise deals
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 max-w-2xl text-lg text-zinc-500 leading-relaxed"
        >
          Ghost opponent modelling, game-tree analysis, multi-regime compliance, and full
          execution arc — from Initech&apos;s redlines to signed in under two hours.
        </motion.p>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/cockpit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all active:scale-95"
            style={{ background: "#FF4B00" }}
          >
            Enter Cockpit
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/#product"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-zinc-700 border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 hover:bg-zinc-50 transition-all"
          >
            See how it works
          </Link>
        </motion.div>

        {/* Integration badge pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2"
        >
          {integrationBadges.map((badge) => (
            <div
              key={badge.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur"
            >
              <span className="text-zinc-400">{badge.icon}</span>
              <span className="text-xs font-medium text-zinc-500">{badge.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Video card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-14 w-full max-w-6xl"
        >
          {/* Glow blob */}
          <div
            className="absolute -top-16 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(255,75,0,0.12), transparent 70%)",
              filter: "blur(40px)",
            }}
            aria-hidden="true"
          />

          {/* Outer card */}
          <div className="relative rounded-[2rem] border border-zinc-200 bg-white/95 p-3 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.15)]">
            {/* Inner card */}
            <div className="rounded-[1.5rem] border border-zinc-200 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-b border-zinc-200">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="rounded-full border border-zinc-200 bg-white px-4 py-1 text-xs text-zinc-400 font-medium select-none">
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
                className="w-full h-80 md:h-[480px] object-cover block"
                aria-label="Gambit product demo — AI-powered negotiation cockpit"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────── FeaturesSection ────────────────────── */

function FeaturesSection() {
  const features = [
    {
      id: "cockpit",
      icon: <LayoutDashboard size={20} />,
      iconBg: "bg-indigo-50 text-indigo-600",
      col: "lg:col-span-1",
      title: "Evaluate every move in real time",
      sub: "Cockpit",
      bullets: [
        { color: "text-indigo-500", label: "Chess-style eval bar" },
        { color: "text-indigo-500", label: "Ghost opponent model (ELO 2341)" },
        { color: "text-indigo-500", label: "Game tree with 3 branches" },
        { color: "text-indigo-500", label: "Walkaway line with citations" },
      ],
      href: "/cockpit",
    },
    {
      id: "warroom",
      icon: <Swords size={20} />,
      iconBg: "bg-violet-50 text-violet-600",
      col: "lg:col-span-2",
      title: "Multi-agent council. Auditable record.",
      sub: "War Room",
      bullets: [
        { color: "text-violet-500", label: "4 AI agents deliberate" },
        { color: "text-violet-500", label: "Vote tally + Crown synthesis" },
        { color: "text-violet-500", label: "AI-vs-AI preset debate" },
        { color: "text-violet-500", label: "Full transcript" },
      ],
      href: "/war-room",
    },
    {
      id: "compliance",
      icon: <Shield size={20} />,
      iconBg: "bg-emerald-50 text-emerald-600",
      col: "lg:col-span-2",
      title: "OSFI · PIPEDA · Law 25",
      sub: "Compliance",
      bullets: [
        { color: "text-emerald-500", label: "Multi-regime compliance scanner" },
        { color: "text-emerald-500", label: "Auto-generated PIA (EN/FR)" },
        { color: "text-emerald-500", label: "TrueSight citation verifier" },
        { color: "text-emerald-500", label: "CanLII validation" },
      ],
      href: "/cockpit",
    },
    {
      id: "architect",
      icon: <Network size={20} />,
      iconBg: "bg-amber-50 text-amber-600",
      col: "lg:col-span-1",
      title: "Rewire the engine",
      sub: "Architect",
      bullets: [
        { color: "text-amber-500", label: "Drag-and-drop agent canvas" },
        { color: "text-amber-500", label: "Save as Playbook" },
        { color: "text-amber-500", label: "Tune sensitivity sliders" },
        { color: "text-amber-500", label: "Export JSON" },
      ],
      href: "/architect",
    },
  ];

  return (
    <section id="product" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-4">
            Platform
          </p>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-zinc-950 mb-4">
            Three modes. One unfair advantage.
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-zinc-500 leading-relaxed">
            Cockpit is the product. War Room makes it defensible. Architect makes it yours.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`${f.col} rounded-[1.5rem] border border-zinc-200 bg-white p-6 flex flex-col gap-5 hover:shadow-md transition-shadow`}
            >
              {/* Icon + label */}
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.iconBg}`}>
                  {f.icon}
                </div>
                <span className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                  {f.sub}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold tracking-tight text-zinc-950 leading-snug">
                {f.title}
              </h3>

              {/* Bullets */}
              <ul className="flex flex-col gap-2 flex-1">
                {f.bullets.map((b) => (
                  <li key={b.label} className="flex items-center gap-2 text-sm text-zinc-600">
                    <Check size={13} className={`flex-shrink-0 ${b.color}`} />
                    {b.label}
                  </li>
                ))}
              </ul>

              {/* Link */}
              <Link
                href={f.href}
                className="inline-flex items-center gap-1 text-sm font-medium text-zinc-400 hover:text-zinc-950 transition-colors group"
              >
                Learn more
                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── WorkflowSection ────────────────────── */

function WorkflowSection() {
  const steps = [
    {
      number: "01",
      icon: <FileText size={20} className="text-zinc-400" />,
      title: "Brief lands",
      body: "MSA redlines arrive from Initech. Ghost forms instantly from precedent corpus.",
    },
    {
      number: "02",
      icon: <Swords size={20} className="text-zinc-400" />,
      title: "Best line played",
      body: "Eval bar, game tree, Council vote. One click to play the brilliant line.",
    },
    {
      number: "03",
      icon: <Clock size={20} className="text-zinc-400" />,
      title: "Deal closes",
      body: "Counter-redline DOCX, voice sign-off, Stripe CAD payment, timeline fires.",
    },
  ];

  return (
    <section id="workflow" className="py-24 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-4">
            Workflow
          </p>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-zinc-950 mb-4">
            From inbox to invoice in two hours
          </h2>
          <p className="max-w-xl mx-auto text-lg text-zinc-500 leading-relaxed">
            The complete negotiation arc — brief in, deal signed, Stripe fired.
          </p>
        </motion.div>

        {/* Step cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-[1.5rem] border border-zinc-200 bg-white p-6 flex flex-col gap-4"
            >
              {/* Step number + icon */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-widest text-zinc-300">
                  Step {step.number}
                </span>
                <div className="w-9 h-9 rounded-xl border border-zinc-100 bg-zinc-50 flex items-center justify-center">
                  {step.icon}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold tracking-tight text-zinc-950 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── StatsSection ───────────────────────── */

function StatsSection() {
  const stats = [
    { value: "$180K CAD", label: "Deal locked in the demo" },
    { value: "ELO 2341", label: "Initech Ghost model" },
    { value: "< 2 hrs", label: "Inbox to invoice arc" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-zinc-200 bg-zinc-50 px-8 py-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
            {stats.map((stat) => (
              <div
                key={stat.value}
                className="flex flex-col items-center justify-center py-8 md:py-0 md:px-12 text-center first:pt-0 last:pb-0 md:first:pl-0 md:last:pr-0"
              >
                <span
                  className="text-4xl font-semibold tracking-tight"
                  style={{ color: "#FF4B00" }}
                >
                  {stat.value}
                </span>
                <span className="mt-1.5 text-sm text-zinc-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────── DarkCTA ───────────────────────────── */

function DarkCTASection() {
  return (
    <section
      className="relative overflow-hidden py-32"
      style={{ background: "#09090b" }}
    >
      {/* Radial gradient overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 10% 40%, rgba(99,102,241,0.18), transparent), radial-gradient(ellipse 50% 50% at 90% 60%, rgba(16,185,129,0.12), transparent), radial-gradient(ellipse 40% 40% at 50% 0%, rgba(139,92,246,0.12), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 mb-8 backdrop-blur">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
          <span className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            Designed for deals that can&apos;t afford to lose
          </span>
        </div>

        <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-[1.1] mb-6">
          Run your negotiation machine without the chaos
        </h2>

        <p className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-xl">
          One cockpit. Ghost opponent. Council. Playbook. Execution.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/cockpit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-zinc-950 bg-white shadow-sm hover:shadow-md hover:bg-zinc-50 transition-all active:scale-95"
          >
            Enter Cockpit
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/#product"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-all"
          >
            Watch demo
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Footer ────────────────────────────── */

function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-200 py-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
        <span>© 2026 Gambit</span>
        <div className="flex items-center gap-6">
          <Link href="/#" className="hover:text-zinc-700 transition-colors">
            Privacy
          </Link>
          <Link href="/#" className="hover:text-zinc-700 transition-colors">
            Terms
          </Link>
          <Link href="/#" className="hover:text-zinc-700 transition-colors">
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
