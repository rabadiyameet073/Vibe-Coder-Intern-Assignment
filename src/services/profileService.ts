import type { ProfileDetailResponse, UserProfileSummary, Platform } from "@/types";
import instagramSearchData from "@/assets/data/search/instagram.json";
import youtubeSearchData from "@/assets/data/search/youtube.json";
import tiktokSearchData from "@/assets/data/search/tiktok.json";

const profileModules = import.meta.glob<ProfileDetailResponse>(
  "../assets/data/profiles/*.json"
);

// Memory cache for dynamically generated fallback profiles
const fallbackCache: Record<string, ProfileDetailResponse> = {};

/**
 * Searches across search datasets to find a matching account summary by username.
 */
function findSummaryInSearchData(username: string): { summary: UserProfileSummary; platform: Platform } | null {
  const norm = username.toLowerCase();

  // Search Instagram
  const igMatch = (instagramSearchData.accounts || []).find(
    (a) => (a.account.user_profile.username || "").toLowerCase() === norm
  );
  if (igMatch) {
    return { summary: igMatch.account.user_profile, platform: "instagram" };
  }

  // Search YouTube
  const ytMatch = (youtubeSearchData.accounts || []).find(
    (a) => (a.account.user_profile.username || "").toLowerCase() === norm
  );
  if (ytMatch) {
    return { summary: ytMatch.account.user_profile, platform: "youtube" };
  }

  // Search TikTok
  const ttMatch = (tiktokSearchData.accounts || []).find(
    (a) => (a.account.user_profile.username || "").toLowerCase() === norm
  );
  if (ttMatch) {
    return { summary: ttMatch.account.user_profile, platform: "tiktok" };
  }

  return null;
}

/**
 * Generates a realistic mock ProfileDetailResponse based on the search summary and platform.
 */
function generateFallbackProfile(summary: UserProfileSummary, platform: Platform): ProfileDetailResponse {
  const followers = summary.followers || 100000;
  const isVerified = summary.is_verified ?? false;

  // Generate historical growth data
  const stat_history = [
    { month: "2023-01", followers: Math.floor(followers * 0.88), following: 120, avg_likes: Math.floor(followers * 0.03) },
    { month: "2023-02", followers: Math.floor(followers * 0.90), following: 122, avg_likes: Math.floor(followers * 0.032) },
    { month: "2023-03", followers: Math.floor(followers * 0.92), following: 118, avg_likes: Math.floor(followers * 0.031) },
    { month: "2023-04", followers: Math.floor(followers * 0.94), following: 125, avg_likes: Math.floor(followers * 0.034) },
    { month: "2023-05", followers: Math.floor(followers * 0.97), following: 124, avg_likes: Math.floor(followers * 0.033) },
    { month: "2023-06", followers: followers, following: 130, avg_likes: Math.floor(followers * 0.035) },
  ];

  // Pick similar users from search data
  const sourceAccounts =
    platform === "youtube"
      ? youtubeSearchData.accounts
      : platform === "tiktok"
      ? tiktokSearchData.accounts
      : instagramSearchData.accounts;

  const similar_users = sourceAccounts
    .filter((a) => (a.account.user_profile.username || "").toLowerCase() !== (summary.username || "").toLowerCase())
    .slice(0, 4)
    .map((a) => ({
      user_id: a.account.user_profile.user_id,
      username: a.account.user_profile.username,
      picture: a.account.user_profile.picture,
      followers: a.account.user_profile.followers,
      fullname: a.account.user_profile.fullname,
      url: a.account.user_profile.url,
      is_verified: a.account.user_profile.is_verified,
      engagements: a.account.user_profile.engagements,
      score: 90 + Math.floor(Math.random() * 10),
    }));

  return {
    cached: true,
    contact: {
      showEmail: true,
      showPhone: false,
    },
    data: {
      success: true,
      version: "2",
      report_info: {
        report_id: `fallback-${summary.user_id}`,
        created: new Date().toISOString(),
        profile_updated: new Date().toISOString(),
      },
      user_profile: {
        ...summary,
        type: platform,
        description: `Official ${platform} account of ${summary.fullname || summary.username}. Content creator, trendsetter, and digital influencer. For business inquiries, contact work@${summary.username.toLowerCase()}.com`,
        is_business: true,
        posts_count: platform === "youtube" ? 180 : 340,
        avg_likes: Math.floor(followers * 0.035),
        avg_comments: Math.floor(followers * 0.002),
        avg_reels_plays: platform === "instagram" ? Math.floor(followers * 0.15) : undefined,
        avg_views: platform === "youtube" ? Math.floor(followers * 0.25) : undefined,
        language: {
          code: "en",
          name: "English",
        },
        geo: {
          country: {
            name: "United States",
            code: "US",
          },
        },
        stat_history,
        contacts: [
          {
            type: "email",
            value: `work@${summary.username.toLowerCase()}.com`,
            formatted_value: `work@${summary.username.toLowerCase()}.com`,
          },
        ],
        relevant_tags: [
          { tag: "influencer", distance: 1.0 },
          { tag: "creative", distance: 0.9 },
          { tag: "viral", distance: 0.8 },
          { tag: "content", distance: 0.85 },
        ],
        similar_users,
        top_hashtags: [
          { tag: `${platform}life`, weight: 1.0 },
          { tag: "trending", weight: 0.8 },
          { tag: "postoftheday", weight: 0.7 },
        ],
      },
    },
  };
}

/**
 * Loads a single profile's detail data by username.
 * Uses Vite's dynamic import (code-split per profile JSON),
 * and falls back to dynamic mock generation if the detail file is missing.
 */
export async function loadProfileByUsername(
  username: string
): Promise<ProfileDetailResponse | null> {
  const norm = username.toLowerCase();

  // 1. Try to load from dynamic glob modules (Vite code splitting)
  // Check both lowercased path and case-preserved matches
  const targetKeys = Object.keys(profileModules);
  const matchedKey = targetKeys.find((key) => {
    const filename = key.split("/").pop()?.replace(".json", "") || "";
    return filename.toLowerCase() === norm;
  });

  if (matchedKey) {
    const loader = profileModules[matchedKey];
    try {
      const result = await loader();
      const data =
        (result as { default?: ProfileDetailResponse }).default ?? result;
      return data as ProfileDetailResponse;
    } catch (error) {
      console.error(`[ProfileService] Failed to load profile "${username}":`, error);
    }
  }

  // 2. Check if we already generated a fallback profile in memory cache
  if (fallbackCache[norm]) {
    return fallbackCache[norm];
  }

  // 3. Try to locate the summary and construct dynamic detailed mock data
  const summaryMatch = findSummaryInSearchData(username);
  if (summaryMatch) {
    const generated = generateFallbackProfile(summaryMatch.summary, summaryMatch.platform);
    fallbackCache[norm] = generated;
    return generated;
  }

  return null;
}
