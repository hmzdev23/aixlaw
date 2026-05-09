"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

const HERO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_101331_74f9b798-3f00-4e86-8a01-377aa16ffeaa.mp4";

const LOGOS = [
  { src: "https://svgl.app/library/procure.svg",      alt: "Procure",      from: "#3B82F6", to: "#1D4ED8" },
  { src: "https://svgl.app/library/shopify.svg",      alt: "Shopify",      from: "#F59E0B", to: "#D97706" },
  { src: "https://svgl.app/library/blender.svg",      alt: "Blender",      from: "#60A5FA", to: "#2563EB" },
  { src: "https://svgl.app/library/figma.svg",        alt: "Figma",        from: "#A78BFA", to: "#7C3AED" },
  { src: "https://svgl.app/library/spotify.svg",      alt: "Spotify",      from: "#F472B6", to: "#DB2777" },
  { src: "https://svgl.app/library/lottielab.svg",    alt: "Lottielab",    from: "#FBBF24", to: "#65A30D" },
  { src: "https://svgl.app/library/google-cloud.svg", alt: "Google Cloud", from: "#7DD3FC", to: "#38BDF8" },
  { src: "https://svgl.app/library/bing.svg",         alt: "Bing",         from: "#22D3EE", to: "#0D9488" },
];

function MarqueeScroller() {
  const doubled = [...LOGOS, ...LOGOS];

  return (
    <div className="mt-10 overflow-hidden" style={{
      maskImage: "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
      WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
    }}>
      <div className="flex gap-4 animate-marquee w-max">
        {doubled.map((logo, i) => (
          <div
            key={i}
            className="group relative h-24 w-40 shrink-0 flex items-center justify-center rounded-full bg-white border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all overflow-hidden"
          >
            {/* Gradient reveal on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-150 group-hover:scale-100"
              style={{ background: `linear-gradient(135deg, ${logo.from}, ${logo.to})` }}
              aria-hidden="true"
            />
            <img
              src={logo.src}
              alt={logo.alt}
              className="relative z-10 h-8 w-auto object-contain group-hover:brightness-0 group-hover:invert transition-all duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MarketingPage() {
  const { t } = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="px-4 md:px-8 py-6">
      {/* ── Hero container ── */}
      <div className="relative w-full max-w-[1400px] mx-auto rounded-[48px] bg-white border border-slate-200/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.03)] overflow-hidden h-[600px] flex flex-col">

        {/* Video background layer */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
          <video
            ref={videoRef}
            src={HERO_VIDEO_URL}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-105 transition-transform duration-1000"
            aria-label="Gambit product demo — AI-powered negotiation co-pilot"
          />
        </div>

        {/* Hero text content */}
        <div className="relative z-20 flex-1 px-8 md:px-16 pt-12 md:pt-16 flex flex-col items-start">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-1.5 mb-6 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
              style={{
                background: "rgba(255,75,0,0.08)",
                color: "#FF4B00",
                border: "1px solid rgba(255,75,0,0.15)",
                backdropFilter: "blur(8px)",
              }}
            >
              Spellbook Challenge · Hackathon 2026
            </div>

            {/* Headline */}
            <h1
              className="font-display mb-4"
              style={{
                fontSize: "clamp(42px, 5vw, 56px)",
                fontWeight: 500,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "#0a1b33",
                fontFamily: "var(--font-display)",
              }}
            >
              Negotiate like you&apos;ve<br />
              been here before.
            </h1>

            {/* Subheadline */}
            <p
              className="mb-8 max-w-[480px]"
              style={{
                fontSize: "clamp(14px, 1.5vw, 15px)",
                color: "#64748b",
                lineHeight: 1.65,
                letterSpacing: "-0.01em",
              }}
            >
              Ghost opponent modelling, game-tree analysis, multi-regime compliance,
              and full execution arc — from Initech&apos;s redlines to signed in under two hours.
            </p>

            {/* CTA */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/cockpit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white"
                style={{
                  background: "#0a152d",
                  boxShadow: "0 4px 16px rgba(10,21,45,0.25)",
                }}
              >
                Enter Cockpit
                <ChevronRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Floating bottom navbar ── */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
          <motion.nav
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center bg-white/90 backdrop-blur-2xl px-1.5 py-1.5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200/40 gap-1"
          >
            {/* Logo mark */}
            <div className="w-9 h-9 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-sm font-bold" style={{ color: "#FF4B00" }}>
              ✦
            </div>

            {/* Nav links */}
            <Link
              href="/cockpit"
              className="px-4 py-2 text-[12px] font-semibold text-slate-500 hover:text-[#0a1b33] transition-colors rounded-full"
            >
              Cockpit
            </Link>
            <Link
              href="/war-room"
              className="px-4 py-2 text-[12px] font-semibold text-slate-500 hover:text-[#0a1b33] transition-colors rounded-full"
            >
              War Room
            </Link>
            <Link
              href="/architect"
              className="px-4 py-2 text-[12px] font-semibold text-slate-500 hover:text-[#0a1b33] transition-colors rounded-full"
            >
              Architect
            </Link>

            {/* CTA button */}
            <Link
              href="/cockpit"
              className="flex items-center gap-1.5 bg-white px-5 py-2 rounded-full text-[12px] font-semibold text-[#0a1b33] border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all"
            >
              Get started
              <ChevronRight size={12} />
            </Link>
          </motion.nav>
        </div>
      </div>

      {/* ── Marquee logo scroller ── */}
      <MarqueeScroller />
    </div>
  );
}
