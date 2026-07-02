// ─── Profile Detail Page ────────────────────────────────────────────────────
// Refactored from a 488-line monolith into a thin orchestration component.
// Delegates to: ProfileHeader, ProfileTabs, and individual panel components.

import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import type { ProfileDetailResponse, ProfileTab, Platform } from "@/types";
import { isPlatform } from "@/types";
import { loadProfileByUsername } from "@/services/profileService";
import { useSelectionActions } from "@/store/useSelectionStore";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileTabs } from "./components/ProfileTabs";
import {
  OverviewPanel,
  GrowthPanel,
  AudiencePanel,
  TagsPanel,
} from "./components/ProfilePanels";

export function ProfileDetailPage() {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const rawPlatform = searchParams.get("platform") ?? "instagram";
  const platform: Platform = isPlatform(rawPlatform) ? rawPlatform : "instagram";

  const [profileData, setProfileData] = useState<ProfileDetailResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [prevUsername, setPrevUsername] = useState<string | undefined>(undefined);

  // Synchronously reset loading state during render when username parameter changes
  if (username !== prevUsername) {
    setPrevUsername(username);
    setProfileData(null);
    setIsLoading(true);
    setLoadError(false);
  }

  const { incrementProfileView } = useSelectionActions();

  useEffect(() => {
    if (!username) return;

    let cancelled = false;

    loadProfileByUsername(username)
      .then((data) => {
        if (cancelled) return;
        setProfileData(data);
        if (data?.data.success) {
          incrementProfileView(username);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username, incrementProfileView]);

  const handleTabChange = useCallback((tab: ProfileTab) => {
    setActiveTab(tab);
  }, []);

  // ─── Invalid Username ───────────────────────────────────────────────────
  if (!username) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-500 font-semibold">Invalid profile path</p>
          <Link
            to="/"
            className="mt-4 text-brand-primary hover:text-brand-primary-hover hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Search
          </Link>
        </div>
      </Layout>
    );
  }

  // ─── Loading State (Skeleton) ───────────────────────────────────────────
  if (isLoading) {
    return (
      <Layout>
        <div
          className="max-w-4xl mx-auto space-y-6 animate-pulse text-left"
          role="status"
          aria-label="Loading profile"
        >
          <div className="h-44 rounded-3xl bg-card" />
          <div className="flex gap-4 items-end -mt-10 px-6">
            <div className="w-24 h-24 rounded-full bg-card-hover border-4 border-card" />
            <div className="space-y-2 flex-1 pb-2">
              <div className="h-6 w-48 bg-card-hover rounded" />
              <div className="h-4 w-32 bg-card-hover rounded" />
            </div>
          </div>
          <div className="h-10 w-full bg-card rounded-xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-card rounded-2xl" />
            ))}
          </div>
          <span className="sr-only">Loading profile data...</span>
        </div>
      </Layout>
    );
  }

  // ─── Error / Not Found State ────────────────────────────────────────────
  if (loadError || !profileData) {
    return (
      <Layout>
        <div className="text-center py-12 max-w-md mx-auto space-y-4">
          <div className="text-red-500 font-semibold text-lg">
            Could not load profile details for @{username}
          </div>
          <p className="text-txt-secondary text-sm">
            {loadError
              ? "An error occurred while loading the profile. Please try again."
              : "The profile configuration may be missing or failed to resolve."}
          </p>
          <Link
            to="/"
            className="mt-4 px-4 py-2.5 bg-card border-1.5 border-border-custom rounded-lg hover:bg-card-hover text-txt-primary hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--border-color)] active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0_0_var(--border-color)] inline-flex items-center gap-1.5 transition-all cursor-pointer focus:outline-none"
          >
            <ArrowLeft className="w-4.5 h-4.5" aria-hidden="true" />
            Back to search
          </Link>
        </div>
      </Layout>
    );
  }

  // ─── Success State ──────────────────────────────────────────────────────
  const user = profileData.data.user_profile;

  return (
    <Layout>
      <div className="max-w-4xl w-full mx-auto text-left space-y-6">
        <ProfileHeader user={user} platform={platform} />

        <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Tab Panels */}
        <div
          className="pt-2"
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === "overview" && <OverviewPanel user={user} />}
          {activeTab === "growth" && (
            <GrowthPanel statHistory={user.stat_history} />
          )}
          {activeTab === "audience" && <AudiencePanel user={user} />}
          {activeTab === "tags" && <TagsPanel user={user} />}
        </div>
      </div>
    </Layout>
  );
}
