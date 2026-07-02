// ─── CampaignMetrics ────────────────────────────────────────────────────────
// Summary metrics cards at the top of the campaign sidebar.

import { memo } from "react";
import { Users, Percent } from "lucide-react";
import { formatFollowers, formatEngagementRate } from "@/utils/formatters";

interface CampaignMetricsProps {
  totalFollowers: number;
  avgEngagementRate: number;
}

export const CampaignMetrics = memo(function CampaignMetrics({
  totalFollowers,
  avgEngagementRate,
}: CampaignMetricsProps) {
  return (
    <div className="p-4 bg-card border-b-1.5 border-border-custom grid grid-cols-2 gap-3 shadow-sm">
      <div className="bg-card-hover p-3 rounded-lg border-1.5 border-border-custom">
        <div className="flex items-center gap-1.5 text-txt-muted text-[10px] font-mono font-semibold uppercase tracking-wider mb-1">
          <Users className="w-3.5 h-3.5 text-brand-primary" aria-hidden="true" />
          Total Reach
        </div>
        <div className="text-lg font-serif font-normal text-txt-primary">
          {formatFollowers(totalFollowers)}
        </div>
      </div>
      <div className="bg-card-hover p-3 rounded-lg border-1.5 border-border-custom">
        <div className="flex items-center gap-1.5 text-txt-muted text-[10px] font-mono font-semibold uppercase tracking-wider mb-1">
          <Percent className="w-3.5 h-3.5 text-brand-primary" aria-hidden="true" />
          Avg Engagement
        </div>
        <div className="text-lg font-serif font-normal text-txt-primary">
          {formatEngagementRate(avgEngagementRate)}
        </div>
      </div>
    </div>
  );
});
