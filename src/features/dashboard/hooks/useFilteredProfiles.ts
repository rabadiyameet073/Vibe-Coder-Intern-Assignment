import { useMemo } from "react";
import { useSearchPlatform, useSearchQuery } from "@/store/useSearchStore";
import { useSelectionStore } from "@/store/useSelectionStore";
import { useDebounce } from "@/hooks/useDebounce";
import { extractProfiles, filterProfiles } from "@/services/searchService";

export function useFilteredProfiles() {
  const platform = useSearchPlatform();
  const searchQuery = useSearchQuery();

  // Aggregate total profile views for the stats panel directly in the selector
  const totalViews = useSelectionStore((s) =>
    Object.values(s.profileViews).reduce((acc, curr) => acc + curr, 0)
  );

  // Debounce the search query to avoid filtering on every keystroke
  const debouncedQuery = useDebounce(searchQuery, 250);

  // Memoize profile extraction — only recalculates when platform changes
  const allProfiles = useMemo(
    () => extractProfiles(platform),
    [platform]
  );

  // Memoize filtering — only recalculates when profiles or debounced query change
  const filteredProfiles = useMemo(
    () => filterProfiles(allProfiles, debouncedQuery),
    [allProfiles, debouncedQuery]
  );

  return {
    platform,
    searchQuery,
    allProfiles,
    filteredProfiles,
    totalViews,
  } as const;
}
