// ─── Search Service ─────────────────────────────────────────────────────────
// Data access layer for search-related operations.
// Encapsulates JSON imports and filtering logic away from components.

import instagramData from "@/assets/data/search/instagram.json";
import youtubeData from "@/assets/data/search/youtube.json";
import tiktokData from "@/assets/data/search/tiktok.json";
import type { Platform, SearchData, UserProfileSummary } from "@/types";

const platformDataMap: Record<Platform, SearchData> = {
  instagram: instagramData as SearchData,
  youtube: youtubeData as SearchData,
  tiktok: tiktokData as SearchData,
};

/**
 * Returns the raw search data for a given platform.
 */
export function getSearchData(platform: Platform): SearchData {
  return platformDataMap[platform];
}

const extractedProfilesCache: Partial<Record<Platform, UserProfileSummary[]>> = {};

/**
 * Extracts flat profile summaries from nested search data.
 * Result is cached per platform for performance and reference-stability.
 */
export function extractProfiles(platform: Platform): UserProfileSummary[] {
  let cached = extractedProfilesCache[platform];
  if (!cached) {
    const data = getSearchData(platform);
    cached = data.accounts.map((item) => item.account.user_profile);
    extractedProfilesCache[platform] = cached;
  }
  return cached;
}

/**
 * Filters profiles by username or full name.
 * Normalizes the query once rather than per-iteration for performance.
 */
export function filterProfiles(
  profiles: readonly UserProfileSummary[],
  query: string
): UserProfileSummary[] {
  if (!query.trim()) return profiles as UserProfileSummary[];

  const normalizedQuery = query.toLowerCase().trim();

  return profiles.filter((p) => {
    const matchUsername = p.username ? p.username.toLowerCase().includes(normalizedQuery) : false;
    const matchFullname = p.fullname ? p.fullname.toLowerCase().includes(normalizedQuery) : false;
    return matchUsername || matchFullname;
  });
}
