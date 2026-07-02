// ─── ProfileHeader ──────────────────────────────────────────────────────────
// Top section of the profile detail page: banner, avatar, name, description,
// and add-to-campaign CTA. Extracted from the monolithic ProfileDetailPage.

import { memo, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, Link as LinkIcon, Heart } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";
import type { Platform, FullUserProfile } from "@/types";
import { PLATFORM_CONFIG } from "@/constants/platform";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { motion } from "framer-motion";
import { formatFollowers } from "@/utils/formatters";
import {
  useSelectionStore,
  useIsProfileSelected,
  useSelectionActions,
} from "@/store/useSelectionStore";

interface ProfileHeaderProps {
  user: FullUserProfile;
  platform: Platform;
}

const FALLBACK_AVATAR = (username: string) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${username}`;

const playHapticSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch {
    // blocked context
  }
};

// Same map as ProfileCard — background image per creator username
// Only Unsplash URLs (Wikipedia blocks hotlinking from external sites)
const CREATOR_BACKGROUNDS: Record<string, string> = {
  // Instagram
  instagram:          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=90&fit=crop",
  cristiano:          "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=90&fit=crop",
  leomessi:           "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1200&q=90&fit=crop",
  selenagomez:        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=90&fit=crop",
  kyliejenner:        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=90&fit=crop",
  therock:            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=90&fit=crop",
  arianagrande:       "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=90&fit=crop",
  kimkardashian:      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=90&fit=crop",
  beyonce:            "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=90&fit=crop",
  khloekardashian:    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=90&fit=crop",
  // YouTube
  mrbeast6000:        "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1200&q=90&fit=crop",
  mrbeast:            "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1200&q=90&fit=crop",
  tseries:            "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&q=90&fit=crop",
  checkgate:          "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=90&fit=crop",
  setindia:           "https://images.unsplash.com/photo-1598257006458-087169a1f08d?w=1200&q=90&fit=crop",
  vladandniki:        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=90&fit=crop",
  kidsdianashow:      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=90&fit=crop",
  likenastya:         "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=90&fit=crop",
  zeemusiccompany:    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=90&fit=crop",
  pewdiepie:          "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=90&fit=crop",
  wwefannation:       "https://images.unsplash.com/photo-1549442084-5f532a688b14?w=1200&q=90&fit=crop",
  wwe:                "https://images.unsplash.com/photo-1549442084-5f532a688b14?w=1200&q=90&fit=crop",
  // TikTok
  "khaby.lame":       "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=1200&q=90&fit=crop",
  charlidamelio:      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&q=90&fit=crop",
  willsmith:          "https://images.unsplash.com/photo-1598387993441-a364f854cfbd?w=1200&q=90&fit=crop",
  bellapoarch:        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=90&fit=crop",
  addisonre:          "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1200&q=90&fit=crop",
  "kimberly.loaiza":  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&q=90&fit=crop",
  tiktok:             "https://images.unsplash.com/photo-1598257006626-48b0c252070d?w=1200&q=90&fit=crop",
  zachking:           "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=90&fit=crop",
  domelipa:           "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&q=90&fit=crop",
};

function getBannerImage(username: string, fullname: string): string {
  const u = (username || "").toLowerCase().replace(/\s+/g, "");
  const f = (fullname  || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return (
    CREATOR_BACKGROUNDS[u] ||
    CREATOR_BACKGROUNDS[f] ||
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=90&fit=crop"
  );
}

export const ProfileHeader = memo(function ProfileHeader({
  user,
  platform,
  onBackClick,
}: ProfileHeaderProps & { onBackClick?: () => void }) {
  const isAdded = useIsProfileSelected(user.user_id);
  const { addProfile, removeProfile } = useSelectionActions();
  const viewsCount = useSelectionStore((s) => s.profileViews[user.username] ?? 0);
  const config = PLATFORM_CONFIG[platform];
  const bannerImage = getBannerImage(user.username, user.fullname);

  const handleToggle = useCallback(() => {
    if (isAdded) {
      removeProfile(user.user_id);
      toast.success(`Removed @${user.username} from campaign`, {
        className: "sonner-toast-brutalist",
      });
    } else {
      addProfile(user, platform);
      toast.success(`Added @${user.username} to campaign`, {
        className: "sonner-toast-brutalist",
      });
    }
  }, [isAdded, user, platform, addProfile, removeProfile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -25, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 14 }}
      className="space-y-5"
    >
      {/* Navigation + View Count */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          onClick={onBackClick}
          className="neo-ghost-btn flex items-center gap-1.5 text-sm font-semibold text-txt-secondary hover:text-txt-primary transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to discovery
        </Link>

        <div className="flex items-center gap-2 bg-card border-1.5 border-border-custom px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-txt-secondary shadow-[2px_2px_0_0_var(--border-color)]">
          <Eye className="w-4 h-4 text-brand-primary" aria-hidden="true" />
          <span>Session Views: {viewsCount}</span>
        </div>
      </div>

      {/* Profile Card Banner Block */}
      <div className="relative bg-card border-1.5 border-border-custom rounded-lg overflow-hidden shadow-hard">
        {/* Banner — creator-specific background image, only inside this card box */}
        <div
          className="h-36 sm:h-44 border-b-1.5 border-border-custom relative overflow-hidden"
          aria-hidden="true"
        >
          {/* Full vivid photo */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${bannerImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
              backgroundRepeat: "no-repeat",
            }}
          />
          {/* Subtle dark gradient at bottom so avatar stays readable */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.55) 100%)",
            }}
          />
          {/* Platform colour tint overlay — very subtle, keeps brand identity */}
          <div className={clsx("absolute inset-0 opacity-20", config.bannerGradient)} />
        </div>

        {/* Profile Info */}
        <div className="p-6 pt-0 relative flex flex-col sm:flex-row gap-5 sm:items-end -mt-12 sm:-mt-16">
          <div className="relative shrink-0">
            <img
              src={user.picture}
              alt={user.fullname}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-1.5 border-border-custom shadow-hard-sm object-cover shrink-0 bg-card-hover"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_AVATAR(user.username);
              }}
            />
            <div className="absolute -bottom-1 -right-1 bg-card p-1 rounded-full border border-border-custom">
              <PlatformIcon platform={platform} className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 space-y-1 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-txt-primary m-0 font-sans">
                @{user.username}
              </h1>
              <VerifiedBadge verified={user.is_verified} />
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-card border border-border-custom text-[10px] font-mono font-semibold uppercase tracking-wider text-txt-secondary capitalize">
                {platform}
              </div>
            </div>
            <p className="text-txt-muted font-serif text-base italic m-0">
              {user.fullname}
            </p>
            {user.description && (
              <p className="text-txt-secondary text-xs sm:text-sm mt-2 max-w-xl leading-relaxed m-0 font-sans">
                {user.description}
              </p>
            )}
          </div>

          {/* Campaign CTA */}
          <div className="shrink-0 pt-3 sm:pt-0 w-full sm:w-auto flex justify-center sm:justify-start">
            <button
              onClick={() => {
                playHapticSound();
                handleToggle();
              }}
              aria-pressed={isAdded}
              className={clsx(
                "detail-like-button focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
                isAdded && "detail-like-btn-active"
              )}
            >
              <div className="detail-like-btn-left">
                <Heart className="detail-like-btn-icon" aria-hidden="true" />
                <span>{isAdded ? "Added" : "Add"}</span>
              </div>
              <div className="detail-like-count one">
                {formatFollowers(user.followers)}
              </div>
              <div className="detail-like-count two">
                {formatFollowers(user.followers)}
              </div>
            </button>
          </div>
        </div>

        {/* Profile Link */}
        {user.url && (
          <div className="px-6 py-4 border-t border-border-custom bg-card-hover flex flex-wrap gap-4 text-xs font-mono font-semibold uppercase tracking-wider">
            <a
              href={user.url}
              target="_blank"
              rel="noreferrer"
              className="text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 hover:underline"
            >
              <LinkIcon className="w-3.5 h-3.5" aria-hidden="true" />
              View original {platform} profile
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
});
