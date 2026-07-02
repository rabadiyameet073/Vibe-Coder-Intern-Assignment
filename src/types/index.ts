// ─── Type Barrel Export ──────────────────────────────────────────────────────
// Re-exports all types from a single entry point for clean imports.

export { PLATFORMS, isPlatform } from "./platform";
export type { Platform } from "./platform";

export type {
  UserProfileSummary,
  SearchAccount,
  SearchData,
  StatHistoryEntry,
  ProfileContact,
  RelevantTag,
  SimilarUser,
  ProfileLanguage,
  ProfileGeo,
  FullUserProfile,
  ProfileDetailResponse,
  CandidateProfile,
  ProfileTab,
} from "./profile";
