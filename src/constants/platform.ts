// ─── Platform Configuration ─────────────────────────────────────────────────
// Single source of truth for all platform-specific visual configuration.
// Adding a new platform requires only adding an entry here.

import type { Platform } from "@/types";

interface PlatformConfig {
  readonly label: string;
  readonly activeTabClass: string;
  readonly cardHoverGlow: string;
  readonly bannerGradient: string;
  readonly iconColor: string;
}

export const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  instagram: {
    label: "Instagram",
    activeTabClass:
      "bg-brand-instagram text-white shadow-sm hover:opacity-90",
    cardHoverGlow: "hover:border-brand-instagram/40",
    bannerGradient: "bg-brand-instagram",
    iconColor: "text-brand-instagram",
  },
  youtube: {
    label: "YouTube",
    activeTabClass: "bg-brand-youtube text-white shadow-sm hover:opacity-90",
    cardHoverGlow: "hover:border-brand-youtube/40",
    bannerGradient: "bg-brand-youtube",
    iconColor: "text-brand-youtube",
  },
  tiktok: {
    label: "TikTok",
    activeTabClass:
      "bg-brand-tiktok text-white dark:text-app shadow-sm hover:opacity-90 border border-border-custom",
    cardHoverGlow: "hover:border-brand-tiktok/40",
    bannerGradient: "bg-brand-tiktok",
    iconColor: "text-brand-tiktok",
  },
} as const;

export function getPlatformLabel(platform: Platform): string {
  return PLATFORM_CONFIG[platform].label;
}
