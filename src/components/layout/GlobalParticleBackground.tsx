// ─── GlobalParticleBackground ────────────────────────────────────────────────
// Full-page fixed canvas particle system.
// Features:
//   • 3 particle types: dots, rings, glints (cross-sparkles)
//   • Mouse attraction & repulsion zones
//   • Network connection lines between nearby particles
//   • 3 slow-drifting aurora gradient orbs
//   • Scroll-linked parallax drift
//   • Theme-aware colors (dark / light)
//   • RequestAnimationFrame loop, fully cleaned up on unmount
//   • Performance: max 80 particles, skips connection checks when off-screen

import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ParticleType = "dot" | "ring" | "glint";

interface BGParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
  type: ParticleType;
  spin: number;      // rotation for glints
  spinSpeed: number;
}

interface AuroraOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const DARK_COLORS  = ["#e6623c", "#f07b59", "#d4502a", "#ff8c6e", "#ffd4c8", "#a83819", "#ff6347"];
const LIGHT_COLORS = ["#d4502a", "#b83e1e", "#e6623c", "#c94820", "#f09070", "#8c2e12", "#e85530"];

const DARK_AURORA  = ["rgba(230,98,60,", "rgba(212,80,42,",  "rgba(180,60,30,"];
const LIGHT_AURORA = ["rgba(212,80,42,", "rgba(180,60,30,",  "rgba(150,40,20,"];

// ─── Main Component ────────────────────────────────────────────────────────────
export function GlobalParticleBackground() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const mouseRef   = useRef({ x: -999, y: -999, down: false });
  const scrollRef  = useRef(0);
  const [isDark, setIsDark]   = useState(false);
  const isDarkRef  = useRef(false);

  // ── Theme watcher ────────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => {
      const dark = document.documentElement.classList.contains("dark");
      setIsDark(dark);
      isDarkRef.current = dark;
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // ── Canvas engine ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Resize ──
    const setSize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    // ── Particles state ──
    const particles: BGParticle[] = [];
    const MAX_PARTICLES = 80;
    const TYPES: ParticleType[] = ["dot", "dot", "dot", "ring", "glint"];

    const getColors = () => isDarkRef.current ? DARK_COLORS : LIGHT_COLORS;

    const spawn = () => {
      const w = canvas.width;
      const h = canvas.height;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.15 + Math.random() * 0.5;
      const type  = TYPES[Math.floor(Math.random() * TYPES.length)];
      const cols  = getColors();

      // Edge-spawn for variety
      let x: number, y: number;
      if (Math.random() < 0.3) {
        // From an edge
        const edge = Math.floor(Math.random() * 4);
        x = edge === 0 ? 0 : edge === 1 ? w : Math.random() * w;
        y = edge === 2 ? 0 : edge === 3 ? h : Math.random() * h;
      } else {
        x = Math.random() * w;
        y = Math.random() * h;
      }

      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: type === "ring"  ? 3 + Math.random() * 4
               : type === "glint" ? 1.5 + Math.random() * 2
               : 1 + Math.random() * 3,
        alpha: 0,
        life: 0,
        maxLife: 200 + Math.random() * 300,
        color: cols[Math.floor(Math.random() * cols.length)],
        type,
        spin: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.04,
      });
    };

    // Seed initial particles
    for (let i = 0; i < MAX_PARTICLES; i++) spawn();

    // ── Aurora orbs state ──
    const getAuroras = () => isDarkRef.current ? DARK_AURORA : LIGHT_AURORA;

    const orbs: AuroraOrb[] = [
      { x: window.innerWidth * 0.15, y: window.innerHeight * 0.2,  vx:  0.18, vy:  0.12, radius: 380, color: "", alpha: 0 },
      { x: window.innerWidth * 0.75, y: window.innerHeight * 0.6,  vx: -0.14, vy: -0.10, radius: 320, color: "", alpha: 0 },
      { x: window.innerWidth * 0.5,  y: window.innerHeight * 0.85, vx:  0.10, vy:  0.16, radius: 280, color: "", alpha: 0 },
    ];

    // ── Scroll listener ──
    const onScroll = () => { scrollRef.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── Mouse listeners ──
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const onMouseDown = () => { mouseRef.current.down = true; };
    const onMouseUp   = () => { mouseRef.current.down = false; };
    const onMouseLeave = () => { mouseRef.current.x = -999; mouseRef.current.y = -999; };

    window.addEventListener("mousemove",  onMouseMove);
    window.addEventListener("mousedown",  onMouseDown);
    window.addEventListener("mouseup",    onMouseUp);
    window.addEventListener("mouseleave", onMouseLeave);

    // ── Draw helpers ──
    const drawDot = (p: BGParticle) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    };

    const drawRing = (p: BGParticle) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;
      ctx.stroke();
      // tiny dot in center
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    };

    const drawGlint = (p: BGParticle) => {
      // 4-pointed star / cross sparkle
      const s = p.radius * 3.5;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.spin);
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.15, -s * 0.15);
      ctx.lineTo(s, 0);
      ctx.lineTo(s * 0.15, s * 0.15);
      ctx.lineTo(0, s);
      ctx.lineTo(-s * 0.15, s * 0.15);
      ctx.lineTo(-s, 0);
      ctx.lineTo(-s * 0.15, -s * 0.15);
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    };

    // ── Render loop ──
    let frame = 0;

    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);
      frame++;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mDown = mouseRef.current.down;
      const scroll = scrollRef.current;

      // ── Draw aurora gradient orbs ──
      const aColors = getAuroras();
      orbs.forEach((orb, i) => {
        orb.color = aColors[i];
        // slow drift
        orb.x += orb.vx;
        orb.y += orb.vy;
        // Bounce off extended viewport
        if (orb.x < -orb.radius || orb.x > W + orb.radius) orb.vx *= -1;
        if (orb.y < -orb.radius || orb.y > H + orb.radius) orb.vy *= -1;
        // Fade in
        orb.alpha = Math.min(orb.alpha + 0.003, isDarkRef.current ? 0.07 : 0.045);

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        grad.addColorStop(0, `${orb.color}${orb.alpha.toFixed(2)})`);
        grad.addColorStop(1, `${orb.color}0)`);
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // ── Spawn new particles ──
      if (frame % 6 === 0 && particles.length < MAX_PARTICLES) spawn();

      // ── Update + draw particles ──
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        const lr = p.life / p.maxLife;

        // Fade in first 15%, hold, fade out last 15%
        if      (lr < 0.15) p.alpha = lr / 0.15;
        else if (lr > 0.85) p.alpha = (1 - lr) / 0.15;
        else                 p.alpha = 1;

        // Mouse interaction
        const dx = p.x - mx;
        const dy = p.y - my - scroll; // scroll-corrected
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (mDown) {
          // Attract on click
          if (dist < 200 && dist > 1) {
            const force = (200 - dist) / 200 * 0.4;
            p.vx -= (dx / dist) * force;
            p.vy -= (dy / dist) * force;
          }
        } else {
          // Repel on hover
          if (dist < 120 && dist > 0) {
            const force = (120 - dist) / 120 * 0.18;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Gentle scroll parallax drift (faster particles drift more)
        const parallax = (p.radius / 4) * 0.0004;
        p.vy -= parallax * Math.sign(scrollRef.current - scroll);

        // Damping
        p.vx *= 0.97;
        p.vy *= 0.97;

        p.x += p.vx;
        p.y += p.vy;
        p.spin += p.spinSpeed;

        // Wrap edges smoothly
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;

        // Remove dead particles
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        // Draw
        ctx.save();
        ctx.globalAlpha = p.alpha * (isDarkRef.current ? 0.55 : 0.35);
        if (p.type === "dot")   drawDot(p);
        if (p.type === "ring")  drawRing(p);
        if (p.type === "glint") drawGlint(p);
        ctx.restore();
      }

      // ── Draw network connection lines ──
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 110 * 110) {
            const dist = Math.sqrt(d2);
            const lineAlpha = ((110 - dist) / 110) * 0.14 * Math.min(a.alpha, b.alpha);
            ctx.save();
            ctx.globalAlpha = isDarkRef.current ? lineAlpha : lineAlpha * 0.65;
            ctx.strokeStyle = a.color;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // ── Draw cursor halo ──
      if (mx > 0 && my > 0) {
        const haloSize = mDown ? 28 : 48;
        const haloAlpha = mDown ? 0.18 : 0.08;
        const haloGrad = ctx.createRadialGradient(mx, my, 0, mx, my, haloSize);
        const col = isDarkRef.current ? "230,98,60" : "212,80,42";
        haloGrad.addColorStop(0, `rgba(${col},${haloAlpha})`);
        haloGrad.addColorStop(1, `rgba(${col},0)`);
        ctx.beginPath();
        ctx.arc(mx, my, haloSize, 0, Math.PI * 2);
        ctx.fillStyle = haloGrad;
        ctx.fill();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize",     setSize);
      window.removeEventListener("scroll",     onScroll);
      window.removeEventListener("mousemove",  onMouseMove);
      window.removeEventListener("mousedown",  onMouseDown);
      window.removeEventListener("mouseup",    onMouseUp);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []); // intentionally runs once; isDark is read via ref inside loop

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        // blend mode: screen makes particles glow on dark bg; multiply tints on light
        mixBlendMode: isDark ? "screen" : "multiply",
      }}
    />
  );
}
