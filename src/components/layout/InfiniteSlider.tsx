import { memo } from "react";
import { Sparkle } from "lucide-react";

export const InfiniteSlider = memo(function InfiniteSlider() {
  // Repeating list of values for the infinite scroll ticker effect
  const items = [
    "Next-Gen Creator Discovery",
    "100% Verified Influencer Base",
    "Instagram Campaign Planner",
    "YouTube Engagement Analytics",
    "TikTok Reach Calculator",
    "Real-time Audience Metrics",
    "Curated Campaign Builder",
  ];

  // Double the items array to ensure a seamless infinite scrolling loop
  const displayItems = [...items, ...items, ...items];

  return (
    <div className="infinite-slider-section" role="marquee" aria-label="Creator Discovery Ticker">
      <div className="infinite-slider-block">
        {displayItems.map((text, idx) => (
          <div key={idx} className="banner-item">
            <span className="banner-icon">
              <Sparkle className="w-3.5 h-3.5 fill-current" />
            </span>
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
