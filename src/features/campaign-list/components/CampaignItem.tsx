// ─── CampaignItem ───────────────────────────────────────────────────────────
// Individual profile card inside the campaign sidebar list.
// Extracted from CampaignSidebar for cleaner list rendering.

import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { CandidateProfile } from "@/types";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { useSelectionActions } from "@/store/useSelectionStore";
import { formatFollowers, formatEngagementRate } from "@/utils/formatters";

interface CampaignItemProps {
  profile: CandidateProfile;
}

export const CampaignItem = memo(function CampaignItem({
  profile,
}: CampaignItemProps) {
  const { removeProfile } = useSelectionActions();

  const handleRemove = useCallback(() => {
    removeProfile(profile.user_id);
    toast.success(`Removed @${profile.username} from campaign`, {
      className: "sonner-toast-brutalist",
    });
  }, [removeProfile, profile.user_id, profile.username]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
      className="bg-card border-1.5 border-border-custom p-3.5 rounded-lg flex items-center gap-3 group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--border-color)] shadow-[2px_2px_0_0_var(--border-color)]"
    >
      <img
        src={profile.picture}
        alt=""
        className="w-10 h-10 rounded-full object-cover border border-border-custom shrink-0 bg-card-hover"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm truncate text-txt-primary">
            @{profile.username}
          </span>
          <PlatformIcon
            platform={profile.platform}
            className="w-3.5 h-3.5 shrink-0"
          />
        </div>
        <div className="text-xs text-txt-secondary truncate">{profile.fullname}</div>
        <div className="flex gap-2.5 mt-1.5 text-[10px] text-txt-muted font-mono font-semibold uppercase tracking-wider">
          <span>{formatFollowers(profile.followers)} followers</span>
          <span aria-hidden="true">•</span>
          <span>ER: {formatEngagementRate(profile.engagement_rate)}</span>
        </div>
      </div>
      <button
        onClick={handleRemove}
        className="p-2 text-txt-muted hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-border-custom rounded-md transition-all cursor-pointer focus:outline-none"
        aria-label={`Remove @${profile.username} from campaign list`}
        title="Remove from list"
      >
        <Trash2 className="w-4 h-4" aria-hidden="true" />
      </button>
    </motion.div>
  );
});
