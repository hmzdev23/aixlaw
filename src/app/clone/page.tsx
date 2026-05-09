"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowRight, Check, Menu, X, Zap, Mail, FileText, Bot } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Enterprise", href: "#enterprise" },
  { label: "Education", href: "#education" },
  { label: "Pricing", href: "#pricing" },
];

const TRUSTED_LOGOS = [
  { name: "OpenAI",    letter: "O", bg: "#10a37f" },
  { name: "Figma",     letter: "F", bg: "#a259ff" },
  { name: "HubSpot",   letter: "H", bg: "#ff7a59" },
  { name: "DoorDash",  letter: "D", bg: "#eb1700" },
  { name: "Expensify", letter: "E", bg: "#0185ff" },
  { name: "GEICO",     letter: "G", bg: "#003087" },
];

const PRODUCTS = [
  {
    id: "mail",
    icon: Mail,
    label: "Superhuman Mail",
    tag: "Mail",
    headline: "Fly through your inbox.",
    sub: "Reach inbox zero in half the time. Save 4 hours every week with AI triage, split inbox, and keyboard-first speed.",
    color: "#6366f1",
    features: ["AI triage & auto-labels", "Keyboard-first navigation", "Split inbox", "Instant search"],
    accent: "from-indigo-500/20 to-purple-500/10",
    badge: "Most popular",
  },
  {
    id: "docs",
    icon: FileText,
    label: "Coda Docs",
    tag: "Docs",
    headline: "All-in-one workspace.",
    sub: "Connect 800+ tools in one doc. Replace spreadsheets, wikis, and project trackers with a single source of truth.",
    color: "#f59e0b",
    features: ["800+ integrations", "Live data tables", "AI content generation", "Team wikis"],
    accent: "from-amber-500/20 to-orange-500/10",
    badge: null,
  },
  {
    id: "go",
    icon: Bot,
    label: "Superhuman Go",
    tag: "AI",
    headline: "Your proactive AI.",
    sub: "Works across every app and tab. Surfaces what matters, drafts responses, and handles the busywork — before you ask.",
    color: "#10b981",
    features: ["Cross-app awareness", "Proactive summaries", "Draft & reply", "Context recall"],
    accent: "from-emerald-500/20 to-teal-500/10",
    badge: "New",
  },
];

const TESTIMONIALS = [
  {
    quote: "Superhuman is the best email client I've ever used. I can process email in half the time.",
    name: "Sam Altman",
    title: "CEO, OpenAI",
    avatar: "SA",
  },
  {
    quote: "I went from dreading my inbox to feeling genuinely in control. It changed how I work.",
    name: "Dylan Field",
    title: "CEO, Figma",
    avatar: "DF",
  },
  {
    quote: "The keyboard shortcuts and AI triage alone are worth every penny. My team loves it.",
    name: "Yamini Rangan",
    title: "CEO, HubSpot",
    avatar: "YR",
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on("change", (y) => setScrolled(y > 20));
  }, [scrollY]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(8,8,12,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-semibold text-white text-[15px] tracking-tight">Superhuman</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="px-4 py-2 text-[13px] font-medium text-white/60 hover:text-white/90 transition-colors rounded-lg hover:bg-white/5"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a href="#" className="text-[13px] font-medium text-white/60 hover:text-white transition-colors">
            Log in
          </a>
          <motion.a
            href="#"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            Get Superhuman
            <ChevronRight size={13} />
          </motion.a>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-white/70 hover:text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/8 overflow-hidden"
            style={{ background: "rgba(8,8,12,0.98)" }}
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <a key={l.label} href={l.href} className="py-3 text-[14px] text-white/70 hover:text-white border-b border-white/5">
                  {l.label}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                <a href="#" className="text-center py-3 text-[14px] text-white/60 border border-white/10 rounded-xl">Log in</a>
                <a href="#" className="text-center py-3 text-[14px] font-semibold text-white rounded-xl" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>Get Superhuman</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function HeroSection() {
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%), #08080c" }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
        aria-hidden
      />

      {/* Glow orb */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)", filter: "blur(40px)" }}
        aria-hidden
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-[12px] font-semibold tracking-widest uppercase"
          style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc" }}
        >
          <Zap size={11} />
          Now including AI &middot; Docs &middot; Mail
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display mb-6 text-white"
          style={{
            fontSize: "clamp(40px, 7vw, 76px)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
          }}
        >
          A suite of AI tools<br />
          <span style={{ background: "linear-gradient(135deg, #a5b4fc, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            that works wherever
          </span>{" "}
          <span className="text-white">you do.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 mx-auto max-w-[560px]"
          style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, letterSpacing: "-0.01em" }}
        >
          Mail, Docs, and AI that work in every app and tab.
          Become twice as productive, starting today.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <motion.a
            href="#"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-[14px] text-white"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 0 40px rgba(99,102,241,0.35)" }}
          >
            Get Superhuman
            <ArrowRight size={15} />
          </motion.a>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-[14px]"
            style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
          >
            Contact sales
          </a>
        </motion.div>

        {/* Social proof note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-[12px]"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Trusted by teams at OpenAI, Figma, HubSpot, DoorDash and more
        </motion.p>
      </div>

      {/* Mock email UI */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-8"
      >
        <div
          className="rounded-2xl overflow-hidden border"
          style={{ background: "#0f0f18", borderColor: "rgba(255,255,255,0.08)", boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)" }}
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0c0c15" }}>
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <div className="flex-1 mx-4">
              <div className="mx-auto w-48 h-5 rounded-md" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>
          </div>
          {/* UI body */}
          <div className="flex h-64">
            {/* Sidebar */}
            <div className="w-56 border-r flex flex-col py-4 px-3 gap-1" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {["Inbox", "Sent", "Drafts", "Done", "Remind me", "Starred"].map((item, i) => (
                <div
                  key={item}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-[12px] font-medium"
                  style={{
                    background: i === 0 ? "rgba(99,102,241,0.15)" : "transparent",
                    color: i === 0 ? "#a5b4fc" : "rgba(255,255,255,0.35)",
                  }}
                >
                  <span>{item}</span>
                  {i === 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.3)", color: "#a5b4fc" }}>12</span>}
                </div>
              ))}
            </div>
            {/* Email list */}
            <div className="flex-1 py-2">
              {[
                { from: "Sam Altman", subject: "Q3 planning — your input needed", time: "9:41 AM", unread: true },
                { from: "Dylan Field", subject: "Re: Design review tomorrow", time: "8:30 AM", unread: true },
                { from: "Stripe", subject: "Your invoice is ready", time: "Yesterday", unread: false },
                { from: "GitHub", subject: "[gambit] PR #42 merged", time: "Yesterday", unread: false },
              ].map((email, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-2.5 border-b cursor-pointer group"
                  style={{ borderColor: "rgba(255,255,255,0.04)", background: i === 0 ? "rgba(99,102,241,0.05)" : "transparent" }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ background: email.unread ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.06)", color: email.unread ? "#a5b4fc" : "rgba(255,255,255,0.3)" }}
                  >
                    {email.from[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold truncate" style={{ color: email.unread ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)" }}>
                        {email.from}
                      </span>
                      <span className="text-[10px] shrink-0 ml-2" style={{ color: "rgba(255,255,255,0.25)" }}>{email.time}</span>
                    </div>
                    <p className="text-[11px] truncate mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{email.subject}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function TrustedSection() {
  return (
    <section className="py-16 border-y" style={{ background: "#08080c", borderColor: "rgba(255,255,255,0.05)" }}>
      <div className="max-w-5xl mx-auto px-6 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-widest mb-10" style={{ color: "rgba(255,255,255,0.25)" }}>
          Trusted by the world&apos;s most innovative teams
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {TRUSTED_LOGOS.map((logo) => (
            <div key={logo.name} className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[12px] font-bold"
                style={{ background: logo.bg + "30", border: `1px solid ${logo.bg}40` }}
              >
                <span style={{ color: logo.bg }}>{logo.letter}</span>
              </div>
              <span className="text-[14px] font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, index }: { product: typeof PRODUCTS[0]; index: number }) {
  const Icon = product.icon;
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-12 items-center`}
    >
      {/* Text */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: product.color + "20", border: `1px solid ${product.color}30` }}
          >
            <Icon size={15} style={{ color: product.color }} />
          </div>
          <span className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: product.color }}>
            {product.tag}
          </span>
          {product.badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: product.color + "25", color: product.color }}>
              {product.badge}
            </span>
          )}
        </div>
        <h2
          className="font-display mb-4 text-white"
          style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15 }}
        >
          {product.headline}
        </h2>
        <p className="mb-6" style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
          {product.sub}
        </p>
        <ul className="space-y-2.5 mb-8">
          {product.features.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-[13px]" style={{ color: "rgba(255,255,255,0.65)" }}>
              <Check size={14} style={{ color: product.color }} />
              {f}
            </li>
          ))}
        </ul>
        <a
          href="#"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold"
          style={{ color: product.color }}
        >
          Learn more <ArrowRight size={13} />
        </a>
      </div>

      {/* Mock UI card */}
      <div className="flex-1 w-full">
        <div
          className="rounded-2xl p-6 h-64 flex items-center justify-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${product.color}10 0%, transparent 100%), #0f0f18`,
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${product.color}15`,
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: `radial-gradient(ellipse at 50% 0%, ${product.color}20 0%, transparent 60%)` }}
            aria-hidden
          />
          <div className="relative z-10 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: product.color + "20", border: `1px solid ${product.color}30` }}
            >
              <Icon size={28} style={{ color: product.color }} />
            </div>
            <p className="text-[13px] font-semibold text-white/70">{product.label}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProductsSection() {
  return (
    <section id="product" className="py-32" style={{ background: "#08080c" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[12px] font-semibold uppercase tracking-widest mb-4"
            style={{ color: "rgba(99,102,241,0.8)" }}
          >
            Your Superhuman suite
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-white"
            style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.1 }}
          >
            Everything you need.<br />Nothing you don&apos;t.
          </motion.h2>
        </div>
        <div className="space-y-28">
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-28 border-t" style={{ background: "#08080c", borderColor: "rgba(255,255,255,0.05)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className="font-display text-white"
            style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 600, letterSpacing: "-0.03em" }}
          >
            Becoming Superhuman.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="p-6 rounded-2xl"
              style={{ background: "#0f0f18", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <p className="text-[14px] leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{t.name}</p>
                  <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{t.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section
      className="py-32 text-center relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 70%), #08080c" }}
    >
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-2xl mx-auto px-6"
      >
        <h2
          className="font-display text-white mb-6"
          style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.05 }}
        >
          Become Superhuman.<br />
          <span style={{ background: "linear-gradient(135deg, #a5b4fc, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Starting today.
          </span>
        </h2>
        <p className="mb-10" style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>
          Join thousands of teams who reclaim hours every week with Superhuman.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <motion.a
            href="#"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-[15px] text-white"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 0 50px rgba(99,102,241,0.4)" }}
          >
            Get Superhuman
            <ArrowRight size={16} />
          </motion.a>
          <a
            href="#"
            className="px-8 py-4 rounded-full font-semibold text-[15px]"
            style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
          >
            Contact sales
          </a>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  const cols = [
    { heading: "Product", links: ["Mail", "Docs", "Go", "Pricing", "Changelog"] },
    { heading: "Company", links: ["About", "Careers", "Blog", "Partners", "Press"] },
    { heading: "Support", links: ["Help Center", "Status", "Privacy Policy", "Terms"] },
  ];

  return (
    <footer className="border-t py-16" style={{ background: "#08080c", borderColor: "rgba(255,255,255,0.05)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Brand col */}
          <div className="md:w-56 shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-semibold text-white">Superhuman</span>
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
              The fastest email experience ever made.
            </p>
          </div>

          {/* Link cols */}
          <div className="flex flex-1 gap-8 md:gap-12 flex-wrap">
            {cols.map((col) => (
              <div key={col.heading} className="min-w-28">
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {col.heading}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-[13px] hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.2)" }}>
            © 2026 Superhuman Labs, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Twitter", "LinkedIn", "GitHub"].map((s) => (
              <a key={s} href="#" className="text-[12px] hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}>
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SuperhumanClone() {
  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <TopNav />
      <HeroSection />
      <TrustedSection />
      <ProductsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
