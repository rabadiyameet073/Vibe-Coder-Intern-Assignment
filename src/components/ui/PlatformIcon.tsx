// ─── PlatformIcon ───────────────────────────────────────────────────────────
// Renders the SVG icon for a given social media platform.
// Extracted from CampaignSidebar to its own module to eliminate circular imports.

import { memo } from "react";
import { clsx } from "clsx";
import type { Platform } from "@/types";
import { PLATFORM_CONFIG } from "@/constants/platform";

interface PlatformIconProps {
  platform: Platform;
  className?: string;
  /** When true, uses the platform's brand color. When false, inherits parent color. */
  colored?: boolean;
}

/**
 * Renders the correct SVG brand icon for each supported platform.
 * Memoized because it renders inside list items and rarely changes props.
 */
export const PlatformIcon = memo(function PlatformIcon({
  platform,
  className = "w-4 h-4",
  colored = true,
}: PlatformIconProps) {
  const colorClass = colored ? PLATFORM_CONFIG[platform].iconColor : "";

  if (platform === "instagram") {
    return (
      <svg
        className={clsx(className, colorClass, "fill-current")}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    );
  }

  if (platform === "youtube") {
    return (
      <svg
        className={clsx(className, colorClass, "fill-current")}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }

  // TikTok
  return (
    <svg
      className={clsx(className, colorClass, "fill-current")}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.51-.77-.6-1.39-1.39-1.81-2.3v7.41c.08 2.08-.63 4.22-2.12 5.67-1.74 1.73-4.5 2.27-6.8 1.4-2.27-.85-3.87-3.08-3.96-5.52-.16-2.9 2.03-5.63 4.91-6.02.66-.1 1.34-.06 2 .09v4.01c-.74-.2-1.57-.14-2.24.23-.9.48-1.43 1.51-1.34 2.53.11 1.25 1.27 2.23 2.52 2.11 1.34-.11 2.37-1.35 2.23-2.69V.02z" />
    </svg>
  );
});
