// ─── Platform Types ─────────────────────────────────────────────────────────
// Single source of truth for supported social media platforms.
// Using a const assertion + union derivation pattern instead of an enum
// because it's tree-shakeable and works seamlessly with JSON data.

export const PLATFORMS = ["instagram", "youtube", "tiktok"] as const;

export type Platform = (typeof PLATFORMS)[number];

/**
 * Type guard to validate unknown strings as Platform values.
 * Useful when parsing URL params or external data.
 */
export function isPlatform(value: unknown): value is Platform {
  return typeof value === "string" && PLATFORMS.includes(value as Platform);
}
