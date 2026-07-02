import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFilteredProfiles } from "../useFilteredProfiles";
import { useSearchStore } from "@/store/useSearchStore";
import { useSelectionStore } from "@/store/useSelectionStore";

import type { UserProfileSummary } from "@/types";

// Mock the search service to decouple tests from mock JSON files
vi.mock("@/services/searchService", () => ({
  extractProfiles: vi.fn((platform) => {
    if (platform === "instagram") {
      return [
        { user_id: "inst1", username: "cristiano", fullname: "Cristiano Ronaldo" },
        { user_id: "inst2", username: "leomessi", fullname: "Lionel Messi" },
      ] as unknown as UserProfileSummary[];
    }
    return [
      { user_id: "yt1", username: "mrbeast", fullname: "MrBeast" },
    ] as unknown as UserProfileSummary[];
  }),
  filterProfiles: vi.fn((profiles: UserProfileSummary[], query) => {
    if (!query) return profiles;
    return profiles.filter((p) =>
      p.username.toLowerCase().includes(query.toLowerCase()) ||
      p.fullname.toLowerCase().includes(query.toLowerCase())
    );
  }),
}));

describe("useFilteredProfiles hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useSearchStore.setState({
      platform: "instagram",
      searchQuery: "",
    });
    useSelectionStore.setState({
      selectedProfiles: [],
      profileViews: {},
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return profiles for default platform (instagram)", () => {
    const { result } = renderHook(() => useFilteredProfiles());

    expect(result.current.platform).toBe("instagram");
    expect(result.current.allProfiles).toHaveLength(2);
    expect(result.current.filteredProfiles).toHaveLength(2);
    expect(result.current.totalViews).toBe(0);
  });

  it("should update profiles when platform changes", () => {
    const { result } = renderHook(() => useFilteredProfiles());

    act(() => {
      useSearchStore.getState().setPlatform("youtube");
    });

    expect(result.current.platform).toBe("youtube");
    expect(result.current.allProfiles).toHaveLength(1);
    expect(result.current.allProfiles[0].username).toBe("mrbeast");
  });

  it("should filter profiles with debounce delay when searchQuery changes", () => {
    const { result } = renderHook(() => useFilteredProfiles());

    act(() => {
      useSearchStore.getState().setSearchQuery("messi");
    });

    // Before timer advances: filteredProfiles should still be all profiles (query not debounced yet)
    expect(result.current.filteredProfiles).toHaveLength(2);

    // Advance timers by 250ms
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current.filteredProfiles).toHaveLength(1);
    expect(result.current.filteredProfiles[0].username).toBe("leomessi");
  });

  it("should calculate total views correctly from profileViews map", () => {
    useSelectionStore.setState({
      profileViews: {
        cristiano: 3,
        leomessi: 5,
      },
    });

    const { result } = renderHook(() => useFilteredProfiles());
    expect(result.current.totalViews).toBe(8);
  });
});
