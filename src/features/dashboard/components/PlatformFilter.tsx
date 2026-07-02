// ─── PlatformFilter ──────────────────────────────────────────────────────────
// Platform tab selector + neo-brutalist search input.
// Styled as interactive brutalist model-selector buttons with bubbles and slide-up texts.

import { memo, useId } from "react";
import { Search, X } from "lucide-react";
import { clsx } from "clsx";
import type { Platform } from "@/types";
import { PLATFORMS } from "@/types";
import { PLATFORM_CONFIG } from "@/constants/platform";
import { PlatformIcon } from "@/components/ui/PlatformIcon";

interface PlatformFilterProps {
  selected: Platform;
  onChange: (platform: Platform) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const playHapticSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch {
    // blocked context
  }
};

export const PlatformFilter = memo(function PlatformFilter({
  selected,
  onChange,
  searchQuery,
  onSearchChange,
}: PlatformFilterProps) {
  const searchId = useId();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 mb-8 rise-5">
      {/* Platform Selector Buttons (Brutalist style) */}
      <div className="flex gap-4 justify-center" role="tablist" aria-label="Select platform">
        {PLATFORMS.map((p) => {
          const isActive = selected === p;
          const config = PLATFORM_CONFIG[p];

          return (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="profile-results"
              onClick={() => {
                playHapticSound();
                onChange(p);
              }}
              className={clsx(
                "brutalist-platform-btn",
                p,
                isActive && "brutalist-platform-btn-active"
              )}
              title={`Switch to ${config.label}`}
            >
              {/* Logo Wrapper */}
              <div className="platform-logo-wrapper">
                <PlatformIcon
                  platform={p}
                  className="w-8 h-8"
                  colored={!isActive}
                />
              </div>

              {/* Slide-Up Text */}
              <div className="platform-btn-text">
                <span>Explore</span>
                <span>{config.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Brutalist Search Input */}
      <div className="relative w-full group">
        <label htmlFor={searchId} className="sr-only">
          Search influencers by username or full name
        </label>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-txt-muted transition-colors group-focus-within:text-brand-primary">
          <Search className="w-5 h-5" aria-hidden="true" />
        </div>
        <input
          id={searchId}
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by username or full name..."
          autoComplete="off"
          className="w-full pl-11 pr-11 py-3 bg-card border-1.5 border-border-custom rounded-lg text-txt-primary placeholder-txt-muted focus:outline-none focus:shadow-hard-sm transition-all text-sm hover:bg-card-hover"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-txt-muted hover:text-brand-primary transition-colors cursor-pointer"
            aria-label="Clear search"
            type="button"
          >
            <X className="w-4.5 h-4.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
});
