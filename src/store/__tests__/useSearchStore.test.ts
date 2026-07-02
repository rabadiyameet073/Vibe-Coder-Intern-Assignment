import { describe, it, expect, beforeEach } from "vitest";
import { useSearchStore } from "../useSearchStore";

describe("useSearchStore", () => {
  beforeEach(() => {
    // Reset state before each test
    useSearchStore.setState({
      platform: "instagram",
      searchQuery: "",
    });
  });

  it("should have initial state", () => {
    const state = useSearchStore.getState();
    expect(state.platform).toBe("instagram");
    expect(state.searchQuery).toBe("");
  });

  it("should update search query", () => {
    useSearchStore.getState().setSearchQuery("gaming");
    expect(useSearchStore.getState().searchQuery).toBe("gaming");
  });

  it("should update platform and reset search query", () => {
    useSearchStore.getState().setSearchQuery("tech");
    useSearchStore.getState().setPlatform("youtube");
    expect(useSearchStore.getState().platform).toBe("youtube");
    expect(useSearchStore.getState().searchQuery).toBe(""); // resets query on platform switch
  });
});
