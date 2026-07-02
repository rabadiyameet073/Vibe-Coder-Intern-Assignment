// ─── Footer ──────────────────────────────────────────────────────────────────
// Jitter-style garage-door reveal: every section panel rises from behind a
// hard clip-path mask, exactly like jitter.video's footer entrance.
// clipPath: inset(100% 0% 0% 0%) → inset(0% 0% 0% 0%) — mask lifts upward.
// Each column/block triggers independently via useInView so they fire as the
// user scrolls into them, with a staggered delay between siblings.

import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Sparkles, Zap, Star } from "lucide-react";
import logoImg from "@/assets/logo.png";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Particle {
  x: number; y: number; vx: number; vy: number;
  radius: number; alpha: number; color: string;
  life: number; maxLife: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Discover", href: "/" },
  { label: "Profiles", href: "/" },
  { label: "Campaigns", href: "/" },
  { label: "Analytics", href: "/" },
  { label: "Pricing", href: "/" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/" },
  { label: "Terms of Service", href: "/" },
  { label: "Cookie Policy", href: "/" },
];

const IconInstagram = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
  </svg>
);

const IconYoutube = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="black" />
  </svg>
);

const IconTikTok = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.82a8.18 8.18 0 0 0 4.77 1.52V6.9a4.85 4.85 0 0 1-1-.21z" />
  </svg>
);

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: IconInstagram,
    hoverBg: "#d62976",
    glow: "rgba(214,41,118,0.55)",
    gradient: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: IconYoutube,
    hoverBg: "#ff0000",
    glow: "rgba(255,0,0,0.5)",
    gradient: "linear-gradient(135deg,#ff0000,#cc0000)",
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
    icon: IconTikTok,
    hoverBg: "#010101",
    glow: "rgba(105,201,208,0.55)",
    gradient: "linear-gradient(135deg,#010101,#69c9d0,#ee1d52,#010101)",
  },
];

const MARQUEE_ITEMS = [
  "Motion Design", "Creative Campaigns", "Influencer Discovery", "Vibe Search",
  "Creator Economy", "Brand Partnerships", "Social Media", "Content Strategy",
];

// ─── Garage Door Reveal ───────────────────────────────────────────────────────
// The signature jitter.video effect: content is clipped behind its own top edge
// (inset 100% from top) then the clip mask "lifts" to inset(0%) — like a
// shutter or garage door opening upward, revealing the panel below.
interface GarageDoorProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

function GarageDoor({ children, delay = 0, className = "" }: GarageDoorProps) {
  const ref = useRef<HTMLDivElement>(null);
  // margin: "-60px" means the animation fires 60px before the element enters viewport
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ clipPath: "inset(100% 0% 0% 0%)", y: 24 }}
        animate={
          isInView
            ? { clipPath: "inset(0% 0% 0% 0%)", y: 0 }
            : { clipPath: "inset(100% 0% 0% 0%)", y: 24 }
        }
        transition={{
          clipPath: { duration: 0.78, delay, ease: [0.16, 1, 0.3, 1] },
          y:        { duration: 0.78, delay, ease: [0.16, 1, 0.3, 1] },
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ─── Particle Canvas ──────────────────────────────────────────────────────────
function ParticleCanvas({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = isDark
      ? ["#e6623c", "#f07b59", "#d4502a", "#ff8c6e", "#ffd4c8"]
      : ["#d4502a", "#b83e1e", "#e6623c", "#f3d9cd", "#ff8c6e"];

    const spawn = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.2 + Math.random() * 0.6;
      particlesRef.current.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        radius: 1 + Math.random() * 2.5, alpha: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0, maxLife: 120 + Math.random() * 180,
      });
    };

    for (let i = 0; i < 35; i++) spawn();
    let frame = 0;

    const render = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      frame++;
      if (frame % 8 === 0 && particlesRef.current.length < 50) spawn();
      const mx = mouseRef.current.x, my = mouseRef.current.y;

      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++;
        const r = p.life / p.maxLife;
        p.alpha = r < 0.2 ? r / 0.2 : r > 0.8 ? (1 - r) / 0.2 : 1;
        const dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 80 && d > 0) {
          const f = (80 - d) / 80;
          p.vx += (dx / d) * f * 0.15; p.vy += (dy / d) * f * 0.15;
        }
        p.vx *= 0.98; p.vy *= 0.98; p.x += p.vx; p.y += p.vy;
        ctx.save(); ctx.globalAlpha = p.alpha * 0.6;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill(); ctx.restore();
        return p.life < p.maxLife && p.x > -10 && p.x < w + 10 && p.y > -10 && p.y < h + 10;
      });

      animFrameRef.current = requestAnimationFrame(render);
    };
    render();

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener("mousemove", onMouse);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouse);
    };
  }, [isDark]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: isDark ? "screen" : "multiply" }} />
  );
}

// ─── Magnetic Link ────────────────────────────────────────────────────────────
function MagneticLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) * 0.3}px, ${(e.clientY - rect.top - rect.height / 2) * 0.3}px)`;
  }, []);

  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  }, []);

  return (
    <Link ref={ref} to={href} className={`inline-block transition-transform duration-300 ease-out ${className}`}
      onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </Link>
  );
}

// ─── Animated Marquee ─────────────────────────────────────────────────────────
function FooterMarquee() {
  return (
    <div className="overflow-hidden whitespace-nowrap py-4 border-t border-b border-[var(--border-color)] opacity-40">
      <div className="footer-marquee-inner inline-flex gap-12">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="text-sm font-mono font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)] flex items-center gap-4">
            {item}
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] inline-block" />
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Typewriter CTA ───────────────────────────────────────────────────────────
function TypewriterText() {
  const phrases = ["motion design.", "brand campaigns.", "creator discovery.", "vibe matching.", "social growth."];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIndex];
    let timeout: ReturnType<typeof setTimeout>;
    if (!isDeleting && displayText === phrase) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false); setPhraseIndex((i) => (i + 1) % phrases.length);
    } else {
      timeout = setTimeout(() => {
        setDisplayText(isDeleting ? phrase.slice(0, displayText.length - 1) : phrase.slice(0, displayText.length + 1));
      }, isDeleting ? 40 : 70);
    }
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, phraseIndex, phrases]);

  return <span className="text-[var(--color-primary)]">{displayText}<span className="animate-pulse">|</span></span>;
}

// ─── Stat Counter ─────────────────────────────────────────────────────────────
function StatCounter({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800, start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - t, 3)) * value));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl font-black font-serif tracking-tight text-[var(--text-primary)]">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs font-mono uppercase tracking-[0.15em] text-[var(--text-muted)] mt-1">{label}</div>
    </div>
  );
}

// ─── Premium Social Button ────────────────────────────────────────────────────
// Features:
//  • Staggered mount slide-up via motion `custom` + `variants`
//  • Liquid fill: a pseudo-layer scales from 0→1 on hover (clipPath circle expand)
//  • Icon slide-in-top on hover entry, slide-out-bottom on leave
//  • Glowing ring that pulses on hover
//  • Click ripple burst (3 expanding rings)
//  • Tooltip label above on hover
//  • Magnetic cursor micro-pull

interface SocialBtnProps {
  social: typeof SOCIAL_LINKS[number];
  index: number;
}

const rippleVariants = {
  initial: { scale: 0, opacity: 0.6 },
  animate: { scale: 3.5, opacity: 0, transition: { duration: 0.55, ease: [0, 0, 0.2, 1] as const } },
};

function SocialButton({ social, index }: SocialBtnProps) {
  const [hovered, setHovered] = useState(false);
  const [ripples, setRipples] = useState<number[]>([]);
  const btnRef = useRef<HTMLAnchorElement>(null);
  const Icon = social.icon;

  // Magnetic pull
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = btnRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
    const dy = (e.clientY - (r.top  + r.height / 2)) * 0.22;
    el.style.transform = `translate(${dx}px,${dy}px)`;
  }, []);

  const onLeave = useCallback(() => {
    if (btnRef.current) btnRef.current.style.transform = "translate(0,0)";
    setHovered(false);
  }, []);

  const fireRipple = () => {
    const id = Date.now();
    setRipples((r) => [...r, id]);
    setTimeout(() => setRipples((r) => r.filter((x) => x !== id)), 600);
  };

  return (
    <motion.div
      className="relative"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, delay: 0.12 * index, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            key="tip"
            initial={{ opacity: 0, y: 6, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.88 }}
            transition={{ duration: 0.18 }}
            className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold font-mono uppercase tracking-widest text-white px-2.5 py-1 rounded-md pointer-events-none z-20"
            style={{ background: social.hoverBg, boxShadow: `0 2px 12px ${social.glow}` }}
          >
            {social.label}
            {/* arrow */}
            <span className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-0 h-0"
              style={{ borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderTop:`5px solid ${social.hoverBg}` }} />
          </motion.span>
        )}
      </AnimatePresence>

      <motion.a
        ref={btnRef}
        href={social.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={social.label}
        onMouseEnter={() => setHovered(true)}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={fireRipple}
        whileTap={{ scale: 0.88 }}
        className="relative w-[52px] h-[52px] flex items-center justify-center overflow-hidden cursor-pointer select-none"
        style={{
          backgroundColor: "rgb(44,44,44)",
          transition: "transform 0.25s cubic-bezier(.16,1,.3,1)",
          // glowing border ring
          boxShadow: hovered
            ? `0 0 0 2px ${social.hoverBg}, 0 0 22px 4px ${social.glow}, 0 8px 24px rgba(0,0,0,0.35)`
            : "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {/* Liquid fill layer — scales up as a circle from centre */}
        <motion.span
          className="absolute inset-0 rounded-none pointer-events-none"
          initial={false}
          animate={hovered
            ? { clipPath: "circle(120% at 50% 50%)", opacity: 1 }
            : { clipPath: "circle(0% at 50% 50%)", opacity: 1 }
          }
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: social.gradient }}
        />

        {/* Pulsing glow ring behind icon */}
        <AnimatePresence>
          {hovered && (
            <motion.span
              key="ring"
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.45, 0], scale: [0.7, 1.35, 1.35] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{ borderRadius: 0, background: `radial-gradient(circle, ${social.glow} 0%, transparent 70%)` }}
            />
          )}
        </AnimatePresence>

        {/* Ripple bursts on click */}
        {ripples.map((id) => (
          <motion.span
            key={id}
            className="absolute inset-0 pointer-events-none"
            variants={rippleVariants}
            initial="initial"
            animate="animate"
            style={{ borderRadius: "50%", border: `2px solid ${social.hoverBg}`, margin: "auto", width: "52px", height: "52px" }}
          />
        ))}

        {/* Icon — slide-in-top on hover, slide-out-bottom on leave */}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={hovered ? "hover-icon" : "idle-icon"}
            initial={{ y: hovered ? -28 : 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: hovered ? 28 : -28, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex items-center justify-center text-white"
          >
            <Icon />
          </motion.span>
        </AnimatePresence>
      </motion.a>
    </motion.div>
  );
}

// ─── Main Footer ──────────────────────────────────────────────────────────────
export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [isDark, setIsDark] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3500);
      setEmail("");
    }
  };

  return (
    <>
      {/* ── Marquee ticker ─────────────────────────────────────────────── */}
      <FooterMarquee />

      {/* ── Main Footer ────────────────────────────────────────────────── */}
      <footer
        ref={footerRef}
        className="relative w-full overflow-hidden"
        style={{ background: "var(--bg-card)", borderTop: "1.5px solid var(--border-color)" }}
        role="contentinfo"
        aria-label="VibeSearch footer"
      >
        {/* Particle canvas */}
        <div className="absolute inset-0 pointer-events-none">
          <ParticleCanvas isDark={isDark} />
        </div>
        {/* Glow orbs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.08] pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-[0.06] pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)", filter: "blur(50px)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-16">

          {/* ══ HERO CTA STRIP ══════════════════════════════════════════════
              Each line is its own GarageDoor so they open in sequence,
              exactly like Jitter's footer section headers rising up.
          ══════════════════════════════════════════════════════════════════ */}
          <div className="pt-16 pb-14 border-b border-[var(--border-color)]">

            {/* 1 — eyebrow label */}
            <GarageDoor delay={0}>
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Powered by AI · Built for creators
                </span>
              </div>
            </GarageDoor>

            {/* 2 — big headline */}
            <GarageDoor delay={0.08}>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-[var(--text-primary)] mb-6 max-w-3xl">
                Discover creators for <TypewriterText />
              </h2>
            </GarageDoor>

            {/* 3 — description */}
            <GarageDoor delay={0.16}>
              <p className="text-base md:text-lg text-[var(--text-muted)] max-w-xl leading-relaxed mb-10">
                VibeSearch connects brands with the right creators — using semantic search, AI matching, and real-time analytics to supercharge your campaigns.
              </p>
            </GarageDoor>

            {/* 4 — stats */}
            <GarageDoor delay={0.24}>
              <div className="flex flex-wrap gap-10 mb-12">
                {[
                  { value: 50000, label: "Creators Indexed", suffix: "+" },
                  { value: 2400,  label: "Active Campaigns", suffix: "+" },
                  { value: 98,    label: "Match Accuracy",   suffix: "%" },
                ].map((s) => <StatCounter key={s.label} value={s.value} label={s.label} suffix={s.suffix} />)}
              </div>
            </GarageDoor>

            {/* 5 — newsletter form */}
            <GarageDoor delay={0.32}>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg">
                <div className="relative flex-1">
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com" aria-label="Email for newsletter"
                    className="w-full h-12 px-4 text-sm font-medium bg-[var(--bg-input)] text-[var(--text-primary)] border-1.5 border-[var(--border-color)] rounded-xl outline-none placeholder-[var(--text-muted)] focus:border-[var(--color-primary)] transition-colors duration-200"
                  />
                </div>
                <AnimatePresence mode="wait">
                  {subscribed ? (
                    <motion.div key="ok" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                      className="h-12 px-5 flex items-center gap-2 bg-green-500 text-white text-sm font-bold rounded-xl">
                      <Star className="w-4 h-4" /> You're in!
                    </motion.div>
                  ) : (
                    <motion.button key="cta" type="submit" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                      whileHover={{ y: -3, boxShadow: "0 6px 0 0 var(--color-primary)" }}
                      whileTap={{ y: 2, boxShadow: "0 0px 0 0 var(--color-primary)" }}
                      className="h-12 px-6 text-sm font-bold uppercase tracking-wider bg-[var(--text-primary)] text-[var(--bg-app)] rounded-xl border-1.5 border-[var(--border-color)] shadow-[0_4px_0_0_var(--border-color)] cursor-pointer flex items-center gap-2 whitespace-nowrap transition-colors duration-200">
                      <Zap className="w-4 h-4" /> Stay Updated
                    </motion.button>
                  )}
                </AnimatePresence>
              </form>
            </GarageDoor>
          </div>

          {/* ══ NAV COLUMNS ═════════════════════════════════════════════════
              Each column is its own GarageDoor — they all fire when they
              scroll into view, staggered left-to-right like garage panels.
          ══════════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 py-14 border-b border-[var(--border-color)]">

            {/* Brand */}
            <GarageDoor delay={0} className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2.5 mb-5 group w-fit" aria-label="VibeSearch home">
                <div className="w-9 h-9 bg-[#111111] border-1.5 border-[var(--border-color)] rounded-xl flex items-center justify-center overflow-hidden p-1.5 transition-transform duration-300 group-hover:scale-110">
                  <img src={logoImg} alt="VibeSearch logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-serif text-lg font-normal tracking-tight text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors duration-200">
                  VibeSearch
                </span>
              </Link>
              <p className="text-sm leading-relaxed text-[var(--text-muted)] max-w-xs mb-6">
                AI-powered influencer discovery platform. Find creators who truly match your brand's vibe.
              </p>
              {/* Premium social icon buttons */}
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map((social, i) => (
                  <SocialButton key={social.label} social={social} index={i} />
                ))}
              </div>
            </GarageDoor>

            {/* Product */}
            <GarageDoor delay={0.1}>
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-[var(--text-muted)] mb-5">Product</h3>
              <ul className="space-y-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <MagneticLink href={link.href} className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--color-primary)] group flex items-center gap-1">
                      <span className="relative">{link.label}
                        <span className="absolute -bottom-px left-0 w-0 h-px bg-[var(--color-primary)] group-hover:w-full transition-all duration-300 ease-out" />
                      </span>
                    </MagneticLink>
                  </li>
                ))}
              </ul>
            </GarageDoor>

            {/* Company */}
            <GarageDoor delay={0.18}>
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-[var(--text-muted)] mb-5">Company</h3>
              <ul className="space-y-3">
                {["About", "Blog", "Careers", "Press Kit", "Contact"].map((label) => (
                  <li key={label}>
                    <MagneticLink href="/" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--color-primary)] group flex items-center gap-1">
                      <span className="relative">{label}
                        <span className="absolute -bottom-px left-0 w-0 h-px bg-[var(--color-primary)] group-hover:w-full transition-all duration-300 ease-out" />
                      </span>
                    </MagneticLink>
                  </li>
                ))}
              </ul>
            </GarageDoor>

            {/* Resources */}
            <GarageDoor delay={0.26}>
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-[var(--text-muted)] mb-5">Resources</h3>
              <ul className="space-y-3">
                {["Documentation", "API Reference", "Creator Guide", "Brand Playbook", "Community"].map((label) => (
                  <li key={label}>
                    <MagneticLink href="/" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--color-primary)] group flex items-center gap-1.5">
                      <span className="relative">{label}
                        <span className="absolute -bottom-px left-0 w-0 h-px bg-[var(--color-primary)] group-hover:w-full transition-all duration-300 ease-out" />
                      </span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-0.5 group-hover:-translate-y-0.5" />
                    </MagneticLink>
                  </li>
                ))}
              </ul>
            </GarageDoor>
          </div>

          {/* ══ BOTTOM BAR ═════════════════════════════════════════════════ */}
          <GarageDoor delay={0.1}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
              <p className="text-xs text-[var(--text-muted)] font-mono">
                © {new Date().getFullYear()} VibeSearch · All rights reserved
              </p>
              <div className="flex flex-wrap items-center justify-center gap-5">
                {LEGAL_LINKS.map((link) => (
                  <Link key={link.label} to={link.href}
                    className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors duration-200">
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">All systems operational</span>
              </div>
            </div>
          </GarageDoor>

        </div>
      </footer>
    </>
  );
}
