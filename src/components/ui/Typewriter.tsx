"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lightweight, dependency-free typewriter. `cps` = characters per second.
 * Honours `startMs` so the parent can stagger multiple instances and still
 * feel sequenced. Cleans up its own timer on unmount.
 */
export function Typewriter({
  text,
  cps = 200,
  startMs = 0,
  cursor = false,
  cursorColor,
  onDone,
}: {
  text: string;
  cps?: number;
  startMs?: number;
  cursor?: boolean;
  cursorColor?: string;
  onDone?: () => void;
}) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  const raf = useRef<number | null>(null);
  const startTs = useRef<number | null>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setOut("");
    setDone(false);
    startTs.current = null;
    const total = text.length;
    if (total === 0) {
      setDone(true);
      onDoneRef.current?.();
      return;
    }
    function step(ts: number) {
      if (startTs.current == null) startTs.current = ts;
      const elapsed = ts - startTs.current - startMs;
      if (elapsed < 0) {
        raf.current = requestAnimationFrame(step);
        return;
      }
      const n = Math.min(total, Math.floor((elapsed / 1000) * cps));
      setOut(text.slice(0, n));
      if (n < total) {
        raf.current = requestAnimationFrame(step);
      } else {
        setDone(true);
        onDoneRef.current?.();
      }
    }
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [text, cps, startMs]);

  return (
    <span>
      {out}
      {cursor && !done ? <BlinkCaret color={cursorColor} /> : null}
    </span>
  );
}

function BlinkCaret({ color }: { color?: string }) {
  return (
    <span
      aria-hidden
      className="ml-[1px] inline-block align-text-bottom"
      style={{
        width: 7,
        height: "0.95em",
        background: color ?? "var(--green)",
        animation: "blinkCaret 0.9s steps(1) infinite",
        marginBottom: 1,
      }}
    />
  );
}
