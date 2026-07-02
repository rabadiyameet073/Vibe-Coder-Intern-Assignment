// ─── Profile Tab Panels ─────────────────────────────────────────────────────
// Individual tab panel components for the profile detail page.
// Each panel is focused on a single data domain.

import { memo } from "react";
import {
  Users,
  Flame,
  Heart,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import type { FullUserProfile } from "@/types";
import { StatCard } from "@/components/ui/StatCard";
import { formatFollowers, formatEngagementRate } from "@/utils/formatters";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { FollowerChart } from "./FollowerChart";

// ─── Overview Panel ─────────────────────────────────────────────────────────

interface OverviewPanelProps {
  user: FullUserProfile;
}

export const OverviewPanel = memo(function OverviewPanel({
  user,
}: OverviewPanelProps) {
  const cards = [
    <StatCard
      key="followers"
      label="Followers"
      value={formatFollowers(user.followers)}
      icon={<Users className="w-3.5 h-3.5 text-brand-primary" aria-hidden="true" />}
    />,
    <StatCard
      key="er"
      label="Engagement ER"
      value={formatEngagementRate(user.engagement_rate)}
      icon={<Flame className="w-3.5 h-3.5 text-brand-primary" aria-hidden="true" />}
    />,
    ...(user.avg_likes !== undefined ? [
      <StatCard
        key="likes"
        label="Avg Likes"
        value={formatFollowers(user.avg_likes)}
        icon={<Heart className="w-3.5 h-3.5 text-brand-primary" aria-hidden="true" />}
      />
    ] : []),
    ...(user.avg_comments !== undefined ? [
      <StatCard
        key="comments"
        label="Avg Comments"
        value={formatFollowers(user.avg_comments)}
        icon={
          <MessageCircle className="w-3.5 h-3.5 text-brand-primary" aria-hidden="true" />
        }
      />
    ] : []),
    ...(user.posts_count !== undefined ? [
      <StatCard key="posts" label="Total Posts" value={user.posts_count.toLocaleString()} />
    ] : []),
    ...(user.avg_views !== undefined && user.avg_views > 0 ? [
      <StatCard key="views" label="Avg Views" value={formatFollowers(user.avg_views)} />
    ] : []),
    ...(user.avg_reels_plays !== undefined && user.avg_reels_plays > 0 ? [
      <StatCard key="reels" label="Avg Reels Plays" value={formatFollowers(user.avg_reels_plays)} />
    ] : []),
    ...(user.is_business !== undefined ? [
      <StatCard key="type" label="Account Type" value={user.is_business ? "Business" : "Creator"} />
    ] : [])
  ];

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.05 }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: 0.05 }
        }
      }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left"
    >
      {cards.map((card, idx) => (
        <motion.div
          key={idx}
          variants={{
            hidden: { opacity: 0, scale: 0.65, y: 35 },
            show: { 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: { type: "spring", stiffness: 130, damping: 12 } 
            }
          }}
        >
          {card}
        </motion.div>
      ))}
    </motion.div>
  );
});

// ─── Growth Panel ───────────────────────────────────────────────────────────

interface GrowthPanelProps {
  statHistory: FullUserProfile["stat_history"];
}

export const GrowthPanel = memo(function GrowthPanel({
  statHistory,
}: GrowthPanelProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ type: "spring", stiffness: 110, damping: 14 }}
      className="space-y-4 text-left"
    >
      <FollowerChart data={statHistory ?? []} />
    </motion.div>
  );
});

// ─── Audience Panel ─────────────────────────────────────────────────────────

interface AudiencePanelProps {
  user: FullUserProfile;
}

export const AudiencePanel = memo(function AudiencePanel({
  user,
}: AudiencePanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left overflow-hidden">
      {/* Demographics Card slides in from left */}
      <motion.div
        initial={{ opacity: 0, x: -60, scale: 0.95 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ type: "spring", stiffness: 100, damping: 14 }}
        className="bg-card border-1.5 border-border-custom p-5 rounded-lg space-y-4 shadow-hard-sm"
      >
        <h3 className="text-xs font-mono font-bold tracking-wider text-txt-primary uppercase">
          Demographic Breakdown
        </h3>
        <div className="divide-y divide-border-custom text-sm">
          {user.geo?.country && (
            <div className="flex justify-between py-2.5">
              <span className="text-txt-muted font-medium">Target Location</span>
              <span className="font-semibold text-txt-primary font-sans">
                {user.geo.country.name}
              </span>
            </div>
          )}
          {user.age_group && (
            <div className="flex justify-between py-2.5">
              <span className="text-txt-muted font-medium">Primary Age Group</span>
              <span className="font-semibold text-txt-primary font-sans">
                {user.age_group}
              </span>
            </div>
          )}
          {user.gender && (
            <div className="flex justify-between py-2.5">
              <span className="text-txt-muted font-medium">Audience Gender Split</span>
              <span className="font-semibold text-txt-primary capitalize font-sans">
                {user.gender.toLowerCase()}
              </span>
            </div>
          )}
          {user.language && (
            <div className="flex justify-between py-2.5">
              <span className="text-txt-muted font-medium">Primary Language</span>
              <span className="font-semibold text-txt-primary font-sans">
                {user.language.name}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Contacts Card slides in from right */}
      <motion.div
        initial={{ opacity: 0, x: 60, scale: 0.95 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ type: "spring", stiffness: 100, damping: 14 }}
        className="bg-card border-1.5 border-border-custom p-5 rounded-lg space-y-4 shadow-hard-sm"
      >
        <h3 className="text-xs font-mono font-bold tracking-wider text-txt-primary uppercase">
          Alternative Handles & Contacts
        </h3>
        {user.contacts && user.contacts.length > 0 ? (
          <div className="space-y-3">
            {user.contacts.map((contact, idx) => (
              <div
                key={`${contact.type}-${idx}`}
                className="flex items-center justify-between p-3 bg-card-hover border-1.5 border-border-custom rounded-lg shadow-[2px_2px_0_0_var(--border-color)]"
              >
                <div className="flex items-center gap-2">
                  <PlatformIcon
                    platform={contact.type as "instagram" | "youtube" | "tiktok"}
                    className="w-4 h-4"
                  />
                  <span className="text-[10px] font-mono font-semibold text-txt-secondary uppercase tracking-wider">
                    {contact.type}
                  </span>
                </div>
                <a
                  href={contact.formatted_value ?? contact.value}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand-primary hover:text-brand-primary-hover font-semibold truncate max-w-[200px] hover:underline"
                >
                  @{contact.value}
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-txt-muted text-xs py-4 text-center">
            No alternative handles associated.
          </p>
        )}
      </motion.div>
    </div>
  );
});

// ─── Tags Panel ─────────────────────────────────────────────────────────────

interface TagsPanelProps {
  user: FullUserProfile;
}

export const TagsPanel = memo(function TagsPanel({ user }: TagsPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left overflow-hidden">
      {/* Relevant Tags Card scales in with a slight counter-clockwise rotation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.75, rotate: -3 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ type: "spring", stiffness: 120, damping: 11 }}
        className="bg-card border-1.5 border-border-custom p-5 rounded-lg space-y-4 shadow-hard-sm"
      >
        <h3 className="text-xs font-mono font-bold tracking-wider text-txt-primary uppercase">
          Content Relevant Tags
        </h3>
        {user.relevant_tags && user.relevant_tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {user.relevant_tags.map((tagData, idx) => (
              <div
                key={`${tagData.tag}-${idx}`}
                className="px-3 py-1.5 bg-brand-primary-light text-brand-primary border border-brand-primary/25 rounded-md text-xs font-mono font-semibold uppercase tracking-tight cursor-default hover:bg-brand-primary hover:text-app transition-colors"
                title={`Distance relevance: ${tagData.distance.toFixed(3)}`}
              >
                #{tagData.tag}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-txt-muted text-xs py-4 text-center">
            No relevant tags annotated.
          </p>
        )}
      </motion.div>

      {/* Similar Creators Card slides down with a clockwise rotation */}
      <motion.div
        initial={{ opacity: 0, y: 60, rotate: 3 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ type: "spring", stiffness: 110, damping: 13 }}
        className="bg-card border-1.5 border-border-custom p-5 rounded-lg space-y-4 shadow-hard-sm"
      >
        <h3 className="text-xs font-mono font-bold tracking-wider text-txt-primary uppercase">
          Similar Creators
        </h3>
        {user.similar_users && user.similar_users.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {user.similar_users.map((sim) => (
              <div
                key={sim.user_id}
                className="p-3 bg-card-hover border-1.5 border-border-custom rounded-lg text-center space-y-1 shadow-[2px_2px_0_0_var(--border-color)] hover:-translate-y-0.5 hover:shadow-hard-sm transition-all duration-200"
              >
                <div className="font-semibold text-xs text-txt-primary">
                  @{sim.username}
                </div>
                {sim.score !== undefined && (
                  <div className="text-[10px] font-mono text-txt-muted font-semibold uppercase">
                    Match: {(sim.score * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-txt-muted text-xs py-4 text-center">
            No similar creators indexed.
          </p>
        )}
      </motion.div>
    </div>
  );
});
