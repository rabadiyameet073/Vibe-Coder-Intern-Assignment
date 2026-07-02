// ─── Profile Types ──────────────────────────────────────────────────────────
// Strongly typed interfaces for all profile-related data shapes.
// These replace the `as any` casts scattered throughout the codebase.

import type { Platform } from "./platform";

// ─── Search API Types ───────────────────────────────────────────────────────

export interface UserProfileSummary {
  readonly user_id: string;
  readonly username?: string;
  readonly url: string;
  readonly picture: string;
  readonly fullname: string;
  readonly is_verified: boolean;
  readonly followers: number;
  readonly engagements?: number;
  readonly engagement_rate?: number;
  readonly handle?: string;
  readonly avg_views?: number;
  readonly custom_name?: string;
}

export interface SearchAccount {
  readonly account: {
    readonly user_profile: UserProfileSummary;
    readonly audience_source: string;
  };
}

export interface SearchData {
  readonly total: number;
  readonly accounts: readonly SearchAccount[];
}

// ─── Profile Detail Types ───────────────────────────────────────────────────

export interface StatHistoryEntry {
  readonly month: string;
  readonly followers: number;
  readonly following?: number;
  readonly avg_likes?: number;
}

export interface ProfileContact {
  readonly type: string;
  readonly value: string;
  readonly formatted_value?: string;
}

export interface RelevantTag {
  readonly tag: string;
  readonly distance: number;
  readonly freq?: number;
}

export interface SimilarUser {
  readonly user_id: string;
  readonly username: string;
  readonly picture: string;
  readonly followers: number;
  readonly fullname: string;
  readonly url: string;
  readonly is_verified: boolean;
  readonly engagements?: number;
  readonly score?: number;
}

export interface ProfileLanguage {
  readonly code: string;
  readonly name: string;
}

export interface ProfileGeo {
  readonly country?: {
    readonly name: string;
    readonly code?: string;
  };
}

export interface FullUserProfile extends UserProfileSummary {
  readonly type?: string;
  readonly description?: string;
  readonly is_business?: boolean;
  readonly posts_count?: number;
  readonly avg_likes?: number;
  readonly avg_comments?: number;
  readonly avg_reels_plays?: number;
  readonly gender?: string;
  readonly age_group?: string;
  readonly language?: ProfileLanguage;
  readonly geo?: ProfileGeo;
  readonly stat_history?: readonly StatHistoryEntry[];
  readonly contacts?: readonly ProfileContact[];
  readonly relevant_tags?: readonly RelevantTag[];
  readonly similar_users?: readonly SimilarUser[];
  readonly top_hashtags?: readonly { readonly tag: string; readonly weight: number }[];
}

export interface ProfileDetailResponse {
  readonly cached?: boolean;
  readonly data: {
    readonly success: boolean;
    readonly user_profile: FullUserProfile;
  };
}

// ─── Store Types ────────────────────────────────────────────────────────────

/** Profile enriched with platform context, used in the campaign selection list */
export interface CandidateProfile extends UserProfileSummary {
  readonly platform: Platform;
}

/** Tab IDs for the profile detail page */
export type ProfileTab = "overview" | "growth" | "audience" | "tags";
