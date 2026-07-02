// ─── Preloader ───────────────────────────────────────────────────────────────
// Full-screen black intro: logo fades in at centre, progress bar fills,
// then the entire overlay scales/fades away so the logo can "fly" via
// Framer Motion layoutId="app-logo" into the navbar.
//
// Animation sequence
//   0.0s  — overlay visible, logo fades + scales in
//   0.5s  — tagline appears
//   0.6s  — progress bar fills over ~1.2s
//   1.8s  — progress reaches 100 %, brief pause
//   2.1s  — overlay exit: scale down + fade; logo stays in DOM briefly
//           then layoutId transition carries it to the navbar icon
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "@/assets/logo.png";

interface PreloaderProps {
  onComplete: () => void;
}

// ── Easing helpers ────────────────────────────────────────────────────────────
const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

export function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const hasExited = useRef(false);

  // ── Organic progress fill ──────────────────────────────────────────────────
  useEffect(() => {
    const totalMs = 1_400;
    const tick = 20;
    let elapsed = 0;

    const id = setInterval(() => {
      elapsed += tick;
      // ease-in-out curve so bar slows near the end
      const t = Math.min(elapsed / totalMs, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setProgress(Math.round(eased * 100));

      if (t >= 1) clearInterval(id);
    }, tick);

    return () => clearInterval(id);
  }, []);

  // ── Trigger exit when progress hits 100 ───────────────────────────────────
  useEffect(() => {
    if (progress >= 100 && !hasExited.current) {
      hasExited.current = true;
      // Small pause so the user sees 100 %
      const t = setTimeout(() => setExiting(true), 350);
      return () => clearTimeout(t);
    }
  }, [progress]);

  // ── After exit animation finishes, unmount & hand off ─────────────────────
  const handleExitComplete = () => {
    onComplete();
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {!exiting && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.06,
            transition: { duration: 0.55, ease: EXPO_OUT },
          }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black select-none overflow-hidden"
          aria-label="Loading VibeSearch"
          role="status"
        >
          {/* ── Subtle radial glow behind logo ── */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute pointer-events-none"
            style={{
              width: 480,
              height: 480,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(201,169,110,0.18) 0%, transparent 70%)",
            }}
          />

          {/* ── Centred logo (layoutId lets FM animate it to the navbar) ── */}
          <motion.div
            layoutId="app-logo"
            initial={{ opacity: 0, scale: 0.72, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EXPO_OUT }}
            className="relative z-10 flex items-center justify-center"
            style={{ width: 160, height: 160 }}
          >
            <img
              src={logoImg}
              alt="VibeSearch logo"
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter:
                  "brightness(1.15) drop-shadow(0 0 40px rgba(201,169,110,0.45))",
              }}
            />
          </motion.div>

          {/* ── Brand name ── */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.55, ease: EXPO_OUT }}
            className="relative z-10 mt-6 font-serif text-3xl font-normal tracking-tight text-white select-none"
          >
            VibeSearch
          </motion.h1>

          {/* ── Tagline ── */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.5, y: 0 }}
            transition={{ delay: 0.52, duration: 0.5, ease: "easeOut" }}
            className="relative z-10 mt-2 font-mono text-[9px] font-bold uppercase tracking-[0.38em] text-[#c9a96e] select-none"
          >
            Next-Gen Creator Discovery
          </motion.p>

          {/* ── Progress bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.45, ease: "easeOut" }}
            className="relative z-10 mt-10 flex flex-col items-center gap-2"
          >
            {/* Thin, luxury-style bar */}
            <div
              className="overflow-hidden"
              style={{
                width: 160,
                height: 1,
                background: "rgba(255,255,255,0.12)",
              }}
            >
              <motion.div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #c9a96e, #d4ba85)",
                  originX: 0,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress / 100 }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>

            {/* Percentage counter */}
            <span className="font-mono text-[9px] font-bold tracking-widest text-white/30 select-none tabular-nums">
              {String(progress).padStart(3, "\u2007")}%
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
