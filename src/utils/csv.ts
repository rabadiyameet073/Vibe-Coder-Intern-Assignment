// ─── CSV Export Utility ──────────────────────────────────────────────────────
// Extracts CSV generation logic out of the CampaignSidebar component.
// Pure function with no DOM side effects — the download trigger is separate.

import type { CandidateProfile } from "@/types";

/**
 * Generates a CSV string from an array of candidate profiles.
 * Properly escapes values containing commas, quotes, or newlines.
 */
export function generateCampaignCSV(profiles: readonly CandidateProfile[]): string {
  const headers = [
    "Username",
    "Full Name",
    "Platform",
    "Followers",
    "Engagement Rate",
    "Profile URL",
  ];

  const rows = profiles.map((p) => [
    p.username,
    p.fullname,
    p.platform.toUpperCase(),
    p.followers.toString(),
    p.engagement_rate !== undefined
      ? `${(p.engagement_rate * 100).toFixed(2)}%`
      : "N/A",
    p.url,
  ]);

  return [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((val) => `"${val.replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");
}

/**
 * Triggers a browser file download from a CSV string.
 * Separated from generation for testability.
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the object URL to prevent memory leaks
  URL.revokeObjectURL(url);
}
