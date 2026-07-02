import { describe, it, expect, beforeEach } from "vitest";
import { useSelectionStore } from "../useSelectionStore";
import type { UserProfileSummary } from "@/types";

const mockProfile1: UserProfileSummary = {
  user_id: "1",
  username: "mrbeast",
  url: "https://youtube.com/mrbeast",
  picture: "mrbeast.jpg",
  fullname: "MrBeast",
  is_verified: true,
  followers: 300000000,
};

const mockProfile2: UserProfileSummary = {
  user_id: "2",
  username: "cristiano",
  url: "https://instagram.com/cristiano",
  picture: "cristiano.jpg",
  fullname: "Cristiano Ronaldo",
  is_verified: true,
  followers: 600000000,
};

describe("useSelectionStore", () => {
  beforeEach(() => {
    // Reset store before each test run
    useSelectionStore.setState({
      selectedProfiles: [],
      profileViews: {},
    });
  });

  it("should have initial state", () => {
    const state = useSelectionStore.getState();
    expect(state.selectedProfiles).toEqual([]);
    expect(state.profileViews).toEqual({});
  });

  it("should add profile to campaign list and prevent duplicates", () => {
    const store = useSelectionStore.getState();
    
    // Add first profile
    store.addProfile(mockProfile1, "youtube");
    expect(useSelectionStore.getState().selectedProfiles).toHaveLength(1);
    expect(useSelectionStore.getState().selectedProfiles[0]).toEqual({
      ...mockProfile1,
      platform: "youtube",
    });

    // Try adding the same profile again (duplicate prevention)
    useSelectionStore.getState().addProfile(mockProfile1, "youtube");
    expect(useSelectionStore.getState().selectedProfiles).toHaveLength(1);

    // Add second profile
    useSelectionStore.getState().addProfile(mockProfile2, "instagram");
    expect(useSelectionStore.getState().selectedProfiles).toHaveLength(2);
  });

  it("should remove profile by user_id", () => {
    const store = useSelectionStore.getState();
    store.addProfile(mockProfile1, "youtube");
    store.addProfile(mockProfile2, "instagram");
    expect(useSelectionStore.getState().selectedProfiles).toHaveLength(2);

    useSelectionStore.getState().removeProfile("1");
    expect(useSelectionStore.getState().selectedProfiles).toHaveLength(1);
    expect(useSelectionStore.getState().selectedProfiles[0].user_id).toBe("2");
  });

  it("should clear the selection list", () => {
    const store = useSelectionStore.getState();
    store.addProfile(mockProfile1, "youtube");
    store.addProfile(mockProfile2, "instagram");
    expect(useSelectionStore.getState().selectedProfiles).toHaveLength(2);

    useSelectionStore.getState().clearList();
    expect(useSelectionStore.getState().selectedProfiles).toEqual([]);
  });

  it("should increment profile view count correctly", () => {
    const store = useSelectionStore.getState();
    expect(store.profileViews["mrbeast"]).toBeUndefined();

    store.incrementProfileView("mrbeast");
    expect(useSelectionStore.getState().profileViews["mrbeast"]).toBe(1);

    useSelectionStore.getState().incrementProfileView("mrbeast");
    expect(useSelectionStore.getState().profileViews["mrbeast"]).toBe(2);

    useSelectionStore.getState().incrementProfileView("cristiano");
    expect(useSelectionStore.getState().profileViews["cristiano"]).toBe(1);
    expect(useSelectionStore.getState().profileViews["mrbeast"]).toBe(2);
  });
});
