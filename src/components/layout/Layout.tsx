// ─── App Layout ─────────────────────────────────────────────────────────────
// Root layout shell with animated glass navbar, sidebar trigger, keyboard shortcuts.
// On scroll: full-width bar → floating frosted-glass capsule with spring physics.
import { useState, useEffect, useCallback, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FolderHeart, Sun, Moon } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from "framer-motion";
import { useSelectedCount } from "@/store/useSelectionStore";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { CampaignSidebar } from "@/features/campaign-list/components/CampaignSidebar";
import { useTheme, useThemeActions } from "@/store/useThemeStore";
import { InfiniteSlider } from "./InfiniteSlider";
import logoImg from "@/assets/logo.png";
import { Preloader } from "./Preloader";
import { Footer } from "./Footer";
import { GlobalParticleBackground } from "./GlobalParticleBackground";

interface LayoutProps {
  children: ReactNode;
}

// Spring config — snappy but organic feel
const SPRING = { stiffness: 320, damping: 34, mass: 0.9 };

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const selectedCount = useSelectedCount();
  const theme = useTheme();
  const { toggleTheme } = useThemeActions();

  const [showPreloader, setShowPreloader] = useState(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("vibesearch-preloaded");
    }
    return true;
  });

  const handlePreloaderComplete = useCallback(() => {
    sessionStorage.setItem("vibesearch-preloaded", "true");
    setShowPreloader(false);
  }, []);

  // Safety timeout: if preloader doesn't complete within 4s, force it
  useEffect(() => {
    if (!showPreloader) return;
    const safety = setTimeout(() => {
      sessionStorage.setItem("vibesearch-preloaded", "true");
      setShowPreloader(false);
    }, 4000);
    return () => clearTimeout(safety);
  }, [showPreloader]);

  // Prevent scrolling when preloader is active
  useEffect(() => {
    if (showPreloader) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showPreloader]);

  const openSidebar  = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  useEffect(() => {
    window.addEventListener("open-campaign-sidebar", openSidebar);
    return () => window.removeEventListener("open-campaign-sidebar", openSidebar);
  }, [openSidebar]);

  // Scroll progress (0 → 1 over first 60px)
  const scrollProg = useMotionValue(0);

  useEffect(() => {
    const handleScroll = () => {
      const prog = Math.min(window.scrollY / 60, 1);
      scrollProg.set(prog);
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollProg]);

  // Spring-animated versions of every morphing value
  const springProg = useSpring(scrollProg, SPRING);

  // Width: 100% → 88vw (capped at 860px)
  const widthPct  = useTransform(springProg, [0, 1], ["100%", "88%"]);
  // Height: 72px → 52px
  const height    = useTransform(springProg, [0, 1], [72, 52]);
  // Border-radius: 0px → 999px (full pill)
  const radius    = useTransform(springProg, [0, 1], [0, 999]);
  // Top margin: 0px → 10px
  const marginTop = useTransform(springProg, [0, 1], [0, 10]);
  // Backdrop blur: 0px → 18px
  const blur      = useTransform(springProg, [0, 1], [0, 18]);
  // Background opacity: 0 → 0.72
  const bgOpacity = useTransform(springProg, [0, 1], [0, 0.72]);
  // Side padding: 32px → 20px
  const padX      = useTransform(springProg, [0, 1], [32, 20]);
  // Shadow opacity: 0 → 1
  const shadowOp  = useTransform(springProg, [0, 1], [0, 1]);
  // Border opacity: 0 → 1
  const borderOp  = useTransform(springProg, [0, 1], [0, 1]);
  // Logo text scale: 1 → 0.88
  const textScale = useTransform(springProg, [0, 1], [1, 0.88]);
  // Logo icon scale: 1 → 0.82
  const iconScale = useTransform(springProg, [0, 1], [1, 0.82]);

  useKeyboardShortcut({ key: "k", ctrlOrMeta: true, handler: openSidebar });

  const isDark = theme === "dark";

  return (
    <div className="min-h-screen flex flex-col bg-app text-txt-primary selection:bg-brand-primary-light selection:text-brand-primary transition-colors duration-250 relative">
      {!showPreloader && <GlobalParticleBackground />}
      <AnimatePresence>
        {showPreloader && <Preloader key="preloader" onComplete={handlePreloaderComplete} />}
      </AnimatePresence>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      {/* Infinite Ticker Banner */}
      <InfiniteSlider />

      {/* ── Sticky wrapper: centres the floating pill ── */}
      <div className="sticky top-0 z-30 w-full flex justify-center pointer-events-none">
        <motion.header
          role="banner"
          style={{
            width: widthPct,
            height,
            borderRadius: radius,
            marginTop,
            paddingLeft: padX,
            paddingRight: padX,
            // box-shadow driven by spring
            boxShadow: useTransform(
              shadowOp,
              (v) => `0 ${8 * v}px ${40 * v}px rgba(0,0,0,${isDark ? 0.38 * v : 0.14 * v}), 0 ${2 * v}px ${8 * v}px rgba(0,0,0,${0.08 * v})`
            ),
            // border driven by spring
            borderWidth: 1.5,
            borderStyle: "solid",
            borderColor: useTransform(
              borderOp,
              (v) => `color-mix(in srgb, var(--border-color) ${Math.round(v * 100)}%, transparent)`
            ),
            // glass background — CSS var + opacity
            backgroundColor: useTransform(
              bgOpacity,
              (v) => isDark
                ? `rgba(21, 20, 18, ${v})`
                : `rgba(255, 255, 255, ${v})`
            ),
            backdropFilter: useTransform(blur, (v) => `blur(${v}px) saturate(${1 + v * 0.06})`),
            WebkitBackdropFilter: useTransform(blur, (v) => `blur(${v}px) saturate(${1 + v * 0.06})`),
            // border-bottom only when not scrolled
            overflow: "hidden",
            maxWidth: "900px",
          }}
          className="flex items-center justify-between pointer-events-auto relative"
        >
          {/* Subtle inner sheen — visible only when glassy */}
          <motion.div
            aria-hidden
            style={{ opacity: useTransform(springProg, [0, 1], [0, 1]) }}
            className="absolute inset-x-0 top-0 h-px pointer-events-none"
            // thin top highlight line for the glass panel
          >
            <div
              className="w-full h-full"
              style={{
                background: isDark
                  ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)"
                  : "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)",
              }}
            />
          </motion.div>

          {/* Bottom border line shown only when NOT scrolled */}
          <motion.div
            aria-hidden
            style={{ opacity: useTransform(springProg, [0, 0.3], [1, 0]) }}
            className="absolute inset-x-0 bottom-0 h-[1.5px] bg-border-custom pointer-events-none"
          />

          {/* ── Brand Logo ── */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none shrink-0"
            aria-label="VibeSearch — Go to homepage"
          >
            <motion.div
              style={{ scale: iconScale }}
              className="w-10 h-10 bg-[#111111] border-1.5 border-border-custom flex items-center justify-center rounded-xl group-hover:scale-105 shrink-0 overflow-hidden relative p-1 origin-left"
            >
              {/* Always render the layoutId target so FM can animate into it.
                  When the preloader is still visible we just keep it invisible
                  so there's no flash — the FLIP flight handles the reveal. */}
              <motion.div
                layoutId="app-logo"
                className="w-full h-full flex items-center justify-center"
                transition={{ type: "spring", stiffness: 80, damping: 18 }}
              >
                <img
                  src={logoImg}
                  alt="VibeSearch logo"
                  className="w-full h-full object-contain"
                  style={showPreloader ? { opacity: 0 } : { opacity: 1 }}
                />
              </motion.div>
            </motion.div>

            <motion.span
              style={{ scale: textScale, transformOrigin: "left center" }}
              initial={{ opacity: 0, x: -10 }}
              animate={showPreloader ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="font-serif text-2xl font-normal tracking-tight text-txt-primary group-hover:text-brand-primary transition-colors ml-1 select-none shrink-0"
            >
              VibeSearch
            </motion.span>
          </Link>

          {/* ── Right Controls ── */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={showPreloader ? { opacity: 0, x: 10 } : { opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="flex items-center gap-3 shrink-0"
          >
            {/* Theme Toggle */}
            <div
              onClick={toggleTheme}
              className={clsx(
                "toggle-cont cursor-pointer shrink-0 select-none",
                theme === "dark" && "toggle-cont-active"
              )}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              role="button"
              tabIndex={0}
              aria-label="Toggle dark/light mode"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleTheme(); }
              }}
            >
              <div className="toggle-label">
                <div className="cont-icon">
                  <span className="sparkle" style={{ "--deg": "45deg",  "--duration": "2s"   } as React.CSSProperties} />
                  <span className="sparkle" style={{ "--deg": "135deg", "--duration": "3.5s" } as React.CSSProperties} />
                  <span className="sparkle" style={{ "--deg": "225deg", "--duration": "1.8s" } as React.CSSProperties} />
                  <span className="sparkle" style={{ "--deg": "315deg", "--duration": "2.6s" } as React.CSSProperties} />
                  {theme === "dark"
                    ? <Moon className="icon w-3.5 h-3.5 text-slate-200 fill-slate-200" />
                    : <Sun  className="icon w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  }
                </div>
              </div>
            </div>

            {/* Campaign Sidebar Button */}
            <motion.button
              onClick={openSidebar}
              whileHover={{ y: isScrolled ? 0 : -2 }}
              whileTap={{ scale: 0.95 }}
              className={clsx(
                "flex items-center py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer focus:outline-none shrink-0",
                isScrolled
                  ? "border-none bg-transparent hover:bg-white/10 px-2"
                  : "border-1.5 border-border-custom px-3.5 bg-card hover:bg-card-hover text-txt-primary shadow-[2px_2px_0_0_var(--border-color)] hover:shadow-[3px_3px_0_0_var(--border-color)] active:shadow-none"
              )}
              aria-label={`Open campaign list. ${selectedCount} profiles selected.`}
              title="Campaign List (Ctrl+K)"
            >
              <FolderHeart className="w-4 h-4 text-brand-primary shrink-0" aria-hidden="true" />
              <AnimatePresence mode="wait">
                {!isScrolled && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="text-xs font-bold uppercase tracking-wider ml-2 hidden sm:inline overflow-hidden whitespace-nowrap"
                  >
                    Campaign List
                  </motion.span>
                )}
              </AnimatePresence>
              {selectedCount > 0 && (
                <motion.span
                  key={selectedCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="bg-brand-primary text-app border border-border-custom text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-mono font-black shrink-0 ml-1.5"
                  aria-hidden="true"
                >
                  {selectedCount}
                </motion.span>
              )}
            </motion.button>
          </motion.div>
        </motion.header>
      </div>

      {/* Main Content */}
      <motion.main
        id="main-content"
        initial={showPreloader ? { opacity: 0, y: 15 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: showPreloader ? 0.35 : 0, duration: 0.6 }}
        className="flex-1 max-w-6xl w-full mx-auto px-4 flex flex-col relative z-10"
        role="main"
      >
        <div className="flex-1 flex flex-col">{children}</div>
      </motion.main>

      <Footer />
      <CampaignSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
    </div>
  );
}
