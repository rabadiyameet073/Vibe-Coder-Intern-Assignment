import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Platform, UserProfileSummary, CandidateProfile } from "@/types";

interface SelectionState {
  /** Profiles added to the campaign list */
  selectedProfiles: CandidateProfile[];
  /** Tracks how many times each profile has been viewed (keyed by username) */
  profileViews: Record<string, number>;
}

interface SelectionActions {
  addProfile: (profile: UserProfileSummary, platform: Platform) => void;
  removeProfile: (userId: string) => void;
  clearList: () => void;
  incrementProfileView: (username: string) => void;
}

type SelectionStore = SelectionState & SelectionActions;

export const useSelectionStore = create<SelectionStore>()(
  persist(
    (set, get) => ({
      selectedProfiles: [],
      profileViews: {},

      addProfile: (profile, platform) => {
        const state = get();
        // Fast lookup using Set would be ideal at scale,
        // but for campaign lists (typically <100 items), linear scan is fine
        if (state.selectedProfiles.some((p) => p.user_id === profile.user_id)) {
          return; // Prevent duplicates — no state update needed
        }
        set({
          selectedProfiles: [
            ...state.selectedProfiles,
            { ...profile, platform },
          ],
        });
      },

      removeProfile: (userId) =>
        set((state) => ({
          selectedProfiles: state.selectedProfiles.filter(
            (p) => p.user_id !== userId
          ),
        })),

      clearList: () => set({ selectedProfiles: [] }),

      incrementProfileView: (username) =>
        set((state) => ({
          profileViews: {
            ...state.profileViews,
            [username]: (state.profileViews[username] || 0) + 1,
          },
        })),
    }),
    {
      name: "influencer-campaign-storage",
      // Only persist selection data, not transient UI state
      partialize: (state) => ({
        selectedProfiles: state.selectedProfiles,
        profileViews: state.profileViews,
      }),
    }
  )
);

// ─── Typed Selectors ────────────────────────────────────────────────────────

export const useSelectedProfiles = () =>
  useSelectionStore((s) => s.selectedProfiles);

export const useSelectedCount = () =>
  useSelectionStore((s) => s.selectedProfiles.length);

export const useProfileViews = () =>
  useSelectionStore((s) => s.profileViews);

export const useIsProfileSelected = (userId: string) =>
  useSelectionStore((s) => s.selectedProfiles.some((p) => p.user_id === userId));

export const useSelectionActions = () => {
  return useMemo(
    () => ({
      addProfile: (profile: UserProfileSummary, platform: Platform) =>
        useSelectionStore.getState().addProfile(profile, platform),
      removeProfile: (userId: string) =>
        useSelectionStore.getState().removeProfile(userId),
      clearList: () => useSelectionStore.getState().clearList(),
      incrementProfileView: (username: string) =>
        useSelectionStore.getState().incrementProfileView(username),
    }),
    []
  );
};
