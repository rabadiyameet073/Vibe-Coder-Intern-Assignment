import { useMemo } from "react";
import { create } from "zustand";
import type { Platform } from "@/types";

interface SearchState {
  /** Currently selected platform filter */
  platform: Platform;
  /** Raw search query input value (not debounced) */
  searchQuery: string;
}

interface SearchActions {
  setPlatform: (platform: Platform) => void;
  setSearchQuery: (query: string) => void;
}

type SearchStore = SearchState & SearchActions;

export const useSearchStore = create<SearchStore>()((set) => ({
  platform: "instagram",
  searchQuery: "",

  setPlatform: (platform) => set({ platform, searchQuery: "" }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));

// ─── Typed Selectors ────────────────────────────────────────────────────────
// Granular selectors prevent unnecessary re-renders.
// Components only re-render when the specific value they consume changes.

export const useSearchPlatform = () =>
  useSearchStore((s) => s.platform);

export const useSearchQuery = () =>
  useSearchStore((s) => s.searchQuery);

export const useSearchActions = () => {
  return useMemo(
    () => ({
      setPlatform: (platform: Platform) =>
        useSearchStore.getState().setPlatform(platform),
      setSearchQuery: (query: string) =>
        useSearchStore.getState().setSearchQuery(query),
    }),
    []
  );
};
