// ─── Search Page ────────────────────────────────────────────────────────────
// Main dashboard page for influencer discovery.

import { useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { HeroBanner } from "./components/HeroBanner";
import { StatsPanel } from "./components/StatsPanel";
import { PlatformFilter } from "./components/PlatformFilter";
import { ProfileGrid } from "./components/ProfileGrid";
import { useSearchActions } from "@/store/useSearchStore";
import { useSelectionActions } from "@/store/useSelectionStore";
import { useFilteredProfiles } from "./hooks/useFilteredProfiles";

export function SearchPage() {
  const {
    platform,
    searchQuery,
    allProfiles,
    filteredProfiles,
    totalViews,
  } = useFilteredProfiles();

  const { setPlatform, setSearchQuery } = useSearchActions();
  const { incrementProfileView } = useSelectionActions();

  const handleProfileClick = useCallback(
    (username: string) => {
      incrementProfileView(username);
    },
    [incrementProfileView]
  );

  return (
    <Layout>
      {/* ═══════════════════════════════════════════════════════
          HERO SECTION — true 100vw × 100dvh full-page
          Breaks out of Layout's max-w-6xl main container.
      ═══════════════════════════════════════════════════════ */}
      <div
        className="hero-fullpage-wrapper"
        style={{
          /* Escape the parent's max-w-6xl + px-4 constraints */
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
          width: "100vw",
          /* Exactly viewport height minus the sticky header height */
          height: "100dvh",
          minHeight: "100dvh",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Inner padding so content doesn't touch screen edges */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 clamp(1.5rem, 5vw, 5rem)",
            position: "relative",
            zIndex: 10,
          }}
        >
          <HeroBanner />

          {/* Stats panel */}
          <div style={{ marginTop: "2rem", width: "100%", maxWidth: "64rem", marginInline: "auto" }}>
            <StatsPanel totalViews={totalViews} totalProfiles={allProfiles.length} />
          </div>
        </div>

        {/* Bouncing scroll cue — pinned to bottom */}
        <motion.button
          onClick={() =>
            document.getElementById("discovery-section")?.scrollIntoView({ behavior: "smooth" })
          }
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1.5 cursor-pointer text-txt-muted hover:text-brand-primary group focus:outline-none z-10 pb-8 mx-auto"
          aria-label="Scroll to Discovery Section"
        >
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest select-none">
            Explore Discovery
          </span>
          <ChevronDown
            className="w-5 h-5 group-hover:scale-110 transition-transform text-brand-primary"
            aria-hidden="true"
          />
        </motion.button>

        {/* Bottom border divider */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "var(--border-color)",
            opacity: 0.2,
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════
          DISCOVERY SECTION — below the fold
      ═══════════════════════════════════════════════════════ */}
      <div id="discovery-section" className="pt-16 sm:pt-20 space-y-12 scroll-mt-6">
        <PlatformFilter
          selected={platform}
          onChange={setPlatform}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Results header */}
        <div className="flex items-center justify-between border-b-1.5 border-border-custom pb-3 max-w-5xl mx-auto w-full">
          <h2 className="text-xs font-mono font-bold tracking-wider text-txt-primary uppercase">
            Discovery Results
          </h2>
          <span className="text-xs text-txt-muted font-mono font-semibold uppercase tracking-wider" aria-live="polite">
            Showing {filteredProfiles.length} of {allProfiles.length} on{" "}
            <span className="text-brand-primary font-bold">{platform}</span>
          </span>
        </div>

        {/* Profile grid */}
        <div className="max-w-5xl w-full mx-auto pb-20">
          <ProfileGrid
            profiles={filteredProfiles}
            platform={platform}
            onProfileClick={handleProfileClick}
          />
        </div>
      </div>
    </Layout>
  );
}
