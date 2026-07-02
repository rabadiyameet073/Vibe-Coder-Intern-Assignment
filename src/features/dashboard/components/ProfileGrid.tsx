// ─── ProfileGrid ────────────────────────────────────────────────────────────
// Animated grid of profile cards with empty state.
// Renamed from ProfileList to ProfileGrid for clarity (it renders a grid, not a list).

import { memo } from "react";
import { motion, type Variants } from "framer-motion";
import { Search } from "lucide-react";
import type { Platform, UserProfileSummary } from "@/types";
import { ProfileCard } from "./ProfileCard";

interface ProfileGridProps {
  profiles: readonly UserProfileSummary[];
  platform: Platform;
  onProfileClick: (username: string) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export const ProfileGrid = memo(function ProfileGrid({
  profiles,
  platform,
  onProfileClick,
}: ProfileGridProps) {
  if (profiles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
        className="flex flex-col items-center justify-center p-10 bg-card border-1.5 border-border-custom rounded-lg max-w-md mx-auto text-txt-muted text-center shadow-hard-sm"
        role="status"
        aria-live="polite"
      >
        <div className="w-12 h-12 rounded-md bg-card-hover border-1.5 border-border-custom flex items-center justify-center mb-4">
          <Search className="w-5 h-5 text-txt-primary" aria-hidden="true" />
        </div>
        <p className="text-base font-serif text-txt-primary">No influencers match your query</p>
        <p className="text-xs text-txt-muted mt-2 max-w-[280px]">
          Try adjusting your filters or typing different search keywords
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      id="profile-results"
      role="tabpanel"
      aria-label="Search results"
    >
      {profiles.map((profile, index) => (
        <motion.div
          key={profile.user_id}
          variants={{
            hidden: { 
              opacity: 0, 
              scale: 0.5, 
              rotate: index % 2 === 0 ? -4 : 4, 
              y: 50 
            },
            show: { 
              opacity: 1, 
              scale: 1, 
              rotate: 0, 
              y: 0,
              transition: { 
                type: "spring", 
                stiffness: 110, 
                damping: 12 
              } 
            }
          }}
        >
          <ProfileCard
            profile={profile}
            platform={platform}
            onProfileClick={onProfileClick}
          />
        </motion.div>
      ))}
    </motion.div>
  );
});
