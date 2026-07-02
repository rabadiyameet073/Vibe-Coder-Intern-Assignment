// ─── Formatting Utilities ───────────────────────────────────────────────────
// Pure functions for formatting numbers, dates, and display values.
// No side effects, easily testable.

/**
 * Formats large numbers into human-readable abbreviated strings.
 * @example formatFollowers(1500000) → "1.5M"
 * @example formatFollowers(45000) → "45.0K"
 */
export function formatFollowers(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Formats a decimal engagement rate into a percentage string.
 * @example formatEngagementRate(0.0125) → "1.25%"
 */
export function formatEngagementRate(rate: number | undefined): string {
  if (rate === undefined || rate === null) return "N/A";
  return `${(rate * 100).toFixed(2)}%`;
}

/**
 * Formats a "YYYY-MM" date string into a short display format.
 * @example formatMonth("2023-07") → "Jul 23"
 */
export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  if (!year || !month) return monthStr;
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  const shortMonth = date.toLocaleString("default", { month: "short" });
  return `${shortMonth} ${year.slice(2)}`;
}
