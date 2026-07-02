// ─── ProfileCard ────────────────────────────────────────────────────────────
// Individual influencer card in the discovery grid.
// Memoized to prevent re-renders when sibling cards update.
// Implements a premium 3D opening folder/book aesthetic with custom background images.

import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Plus } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";
import type { Platform, UserProfileSummary } from "@/types";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { useIsProfileSelected, useSelectionActions } from "@/store/useSelectionStore";
import { formatFollowers } from "@/utils/formatters";

interface ProfileCardProps {
  profile: UserProfileSummary;
  platform: Platform;
  onProfileClick?: (username: string) => void;
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
    // blocked
  }
};

// Background images — keyed by username.toLowerCase() exactly as it appears in JSON.
// All images use Unsplash (reliable hotlinking). Wikipedia blocks external hotlinks.
const CREATOR_BACKGROUNDS: Record<string, string> = {
  // ── Instagram ──────────────────────────────────────────────────────────────
  instagram:          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=85&fit=crop",
  cristiano:          "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=85&fit=crop",   // football stadium
  leomessi:           "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=85&fit=crop",   // football pitch
  selenagomez:        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=85&fit=crop",  // concert stage
  kyliejenner:        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85&fit=crop",  // fashion glamour
  therock:            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=85&fit=crop",  // gym weights
  arianagrande:       "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=85&fit=crop",  // concert neon
  kimkardashian:      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=85&fit=crop",  // fashion runway
  beyonce:            "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=85&fit=crop",  // stage performance
  khloekardashian:    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=85&fit=crop",  // fashion editorial

  // ── YouTube ────────────────────────────────────────────────────────────────
  mrbeast6000:        "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=85&fit=crop",  // creator studio
  mrbeast:            "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=85&fit=crop",
  tseries:            "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=85&fit=crop",  // bollywood stage
  checkgate:          "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=85&fit=crop",  // colorful kids
  cocomelon:          "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=85&fit=crop",  // kids
  setindia:           "https://images.unsplash.com/photo-1598257006458-087169a1f08d?w=800&q=85&fit=crop",  // indian tv
  vladandniki:        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=85&fit=crop",  // kids play
  kidsdianashow:      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=85&fit=crop",
  likenastya:         "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=85&fit=crop",
  zeemusiccompany:    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=85&fit=crop",  // music notes
  pewdiepie:          "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=85&fit=crop",  // gaming setup
  wwefannation:       "https://images.unsplash.com/photo-1549442084-5f532a688b14?w=800&q=85&fit=crop",  // wrestling arena
  wwe:                "https://images.unsplash.com/photo-1549442084-5f532a688b14?w=800&q=85&fit=crop",

  // ── TikTok ─────────────────────────────────────────────────────────────────
  "khaby.lame":       "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=800&q=85&fit=crop",  // reaction laugh
  charlidamelio:      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=85&fit=crop",  // dance stage
  willsmith:          "https://images.unsplash.com/photo-1598387993441-a364f854cfbd?w=800&q=85&fit=crop",  // actor dramatic
  bellapoarch:        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=85&fit=crop",  // pop neon stage
  addisonre:          "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&q=85&fit=crop",  // dance performance
  "kimberly.loaiza":  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=85&fit=crop",
  tiktok:             "https://images.unsplash.com/photo-1598257006626-48b0c252070d?w=800&q=85&fit=crop",
  zachking:           "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=85&fit=crop",  // cinematic magic
  domelipa:           "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=85&fit=crop",
};

export const ProfileCard = memo(function ProfileCard({
  profile,
  platform,
  onProfileClick,
}: ProfileCardProps) {
  const navigate = useNavigate();
  const isAdded = useIsProfileSelected(profile.user_id);
  const { addProfile, removeProfile } = useSelectionActions();

  const handleClick = useCallback(() => {
    onProfileClick?.(profile.username);
    navigate(`/profile/${profile.username}?platform=${platform}`);
  }, [navigate, profile.username, platform, onProfileClick]);

  const handleListToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      playHapticSound();
      if (isAdded) {
        removeProfile(profile.user_id);
        toast.success(`Removed @${profile.username} from campaign`, {
          className: "sonner-toast-brutalist",
        });
      } else {
        addProfile(profile, platform);
        toast.success(`Added @${profile.username} to campaign`, {
          className: "sonner-toast-brutalist",
        });
      }
    },
    [isAdded, profile, platform, addProfile, removeProfile]
  );

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      e.currentTarget.src = FALLBACK_AVATAR(profile.username);
    },
    [profile.username]
  );

  // Resolve background image: check username, then handle, then fullname slug, then fallback.
  // YouTube channels often have no username — fall through to handle or fullname.
  const usernameLower = (profile.username || "").toLowerCase().replace(/\s+/g, "");
  const handleLower  = (profile.handle  || "").toLowerCase().replace(/\s+/g, "");
  const fullnameLower = (profile.fullname || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const bgImage =
    CREATOR_BACKGROUNDS[usernameLower] ||
    CREATOR_BACKGROUNDS[handleLower]   ||
    CREATOR_BACKGROUNDS[fullnameLower] ||
    // Generic per-category Unsplash fallback so card always has something vivid
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=85&fit=crop";

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View profile of ${profile.fullname} (@${profile.username ?? profile.handle ?? profile.fullname})`}
      className="book-card-container select-none focus-visible:outline-none"
    >
      {/* 1. Inside Metrics Page (Revealed on hover) */}
      <div className="book-card-inside overflow-hidden relative">
        {/* Full vivid background image — fills the whole card box, not the page */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Dark gradient from top-clear to bottom-dark — image is vivid on top, text readable at bottom */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.85) 100%)",
          }}
        />

        <div className="flex items-start justify-between relative z-10">
          <div className="text-left min-w-0">
            <span className="font-bold text-white truncate text-sm sm:text-base tracking-tight font-sans block drop-shadow-md">
              @{profile.username ?? profile.handle ?? profile.fullname}
            </span>
            <div className="text-[10px] text-white/70 truncate font-medium max-w-[120px] drop-shadow-sm">
              {profile.fullname}
            </div>
          </div>
          <VerifiedBadge verified={profile.is_verified} />
        </div>

        <div className="flex justify-between items-end relative z-10">
          <div className="text-left">
            <div className="text-[9px] text-white/60 font-mono font-semibold uppercase tracking-wider mb-1">
              Followers
            </div>
            <div className="font-serif text-lg font-normal text-white leading-none drop-shadow-md">
              {formatFollowers(profile.followers)}
            </div>
          </div>

          <button
            onClick={handleListToggle}
            className={clsx(
              "slide-reveal-btn",
              isAdded ? "slide-reveal-btn-added" : "slide-reveal-btn-add"
            )}
            aria-label={isAdded ? "Remove from campaign" : "Add to campaign"}
          >
            {/* Div 1 (Visible normally) */}
            <div className="slide-reveal-div-1">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                {isAdded ? (
                  <>
                    <Check className="w-3 h-3 text-brand-primary animate-pulse" aria-hidden="true" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" aria-hidden="true" />
                    <span>Add</span>
                  </>
                )}
              </span>
            </div>
            
            {/* Div 2 (Revealed on hover) */}
            <div className="slide-reveal-div-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                {isAdded ? (
                  <span>Remove</span>
                ) : (
                  <span>Confirm</span>
                )}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Front Cover Page (Swings open 3D) */}
      <div className="book-card-cover overflow-hidden">
        {/* Creator background image — top strip behind the avatar */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Strong gradient: image visible at top, fades to card color at bottom */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.38) 40%, var(--bg-card) 72%)",
          }}
        />

        {/* All content sits above the background */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-2">
            <img
              src={profile.picture}
              alt=""
              className="w-14 h-14 rounded-full object-cover border-2 border-white/80 shadow-lg bg-card-hover"
              onError={handleImageError}
              loading="lazy"
            />
            <div className="absolute -bottom-1 -right-1 bg-card p-0.5 rounded-full border border-border-custom shadow-sm flex items-center justify-center">
              <PlatformIcon platform={platform} className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="font-bold text-txt-primary text-sm sm:text-base tracking-tight font-sans">
              @{profile.username}
            </span>
            <VerifiedBadge verified={profile.is_verified} />
          </div>
          <div className="text-[11px] text-txt-muted truncate max-w-[160px] font-medium mb-3">
            {profile.fullname}
          </div>

          <span className="text-[8.5px] font-mono font-bold tracking-widest text-brand-primary bg-brand-primary-light border border-brand-primary/20 px-2.5 py-1 rounded uppercase">
            Stats Inside ✦
          </span>
        </div>
      </div>
    </div>
  );
});
