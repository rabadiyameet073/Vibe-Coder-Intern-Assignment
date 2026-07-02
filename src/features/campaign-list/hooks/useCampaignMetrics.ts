// ─── useCampaignMetrics ──────────────────────────────────────────────────────
// Custom hook that computes aggregate campaign metrics from selected profiles.
// Memoized to avoid recalculation on every render.

import { useMemo } from "react";
import { useSelectedProfiles } from "@/store/useSelectionStore";

export function useCampaignMetrics() {
  const selectedProfiles = useSelectedProfiles();

  const metrics = useMemo(() => {
    const totalFollowers = selectedProfiles.reduce(
      (acc, p) => acc + p.followers,
      0
    );

    const avgEngagementRate =
      selectedProfiles.length > 0
        ? selectedProfiles.reduce(
            (acc, p) => acc + (p.engagement_rate ?? 0),
            0
          ) / selectedProfiles.length
        : 0;

    return { totalFollowers, avgEngagementRate };
  }, [selectedProfiles]);

  return {
    selectedProfiles,
    ...metrics,
  } as const;
}
