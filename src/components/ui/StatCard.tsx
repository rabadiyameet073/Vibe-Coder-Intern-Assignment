// ─── StatCard ───────────────────────────────────────────────────────────────
// Reusable stat display card. Eliminates massive JSX duplication in
// ProfileDetailPage where 8+ stat cards had nearly identical markup.

import { memo, type ReactNode } from "react";

interface StatCardProps {
  /** Label displayed above the value */
  label: string;
  /** The formatted value to display */
  value: string | number;
  /** Optional icon rendered next to the label */
  icon?: ReactNode;
}

/**
 * Renders a stat metric card with consistent styling.
 * Used in profile overview panels and campaign metrics.
 */
export const StatCard = memo(function StatCard({
  label,
  value,
  icon,
}: StatCardProps) {
  return (
    <div className="bg-card border-1.5 border-border-custom p-4 rounded-lg flex flex-col justify-between shadow-[3px_3px_0_0_var(--border-color)] hover:-translate-y-0.5 hover:shadow-hard-sm transition-all duration-200">
      <div className="flex items-center gap-1.5 text-txt-muted text-[10px] font-mono font-semibold uppercase tracking-wider mb-2">
        {icon}
        {label}
      </div>
      <div className="text-xl sm:text-2xl font-serif font-normal text-txt-primary">
        {value}
      </div>
    </div>
  );
});
