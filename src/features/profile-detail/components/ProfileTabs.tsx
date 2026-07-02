// ─── ProfileTabs ────────────────────────────────────────────────────────────
// Tab navigation bar for the profile detail page.
// Uses proper ARIA tablist/tab semantics.

import { memo } from "react";
import { clsx } from "clsx";
import { LayoutGrid, Calendar, Globe, Tag } from "lucide-react";
import type { ProfileTab } from "@/types";

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

const TABS: readonly { id: ProfileTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "overview", label: "Stats & Insights", icon: LayoutGrid },
  { id: "growth", label: "Audience Growth", icon: Calendar },
  { id: "audience", label: "Reach & Details", icon: Globe },
  { id: "tags", label: "Tags & Discovery", icon: Tag },
] as const;

export const ProfileTabs = memo(function ProfileTabs({
  activeTab,
  onTabChange,
}: ProfileTabsProps) {
  return (
    <div className="flex gap-2.5 flex-wrap border-b-1.5 border-border-custom pb-3.5" role="tablist" aria-label="Profile sections">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider border-1.5 border-border-custom rounded-lg transition-all cursor-pointer focus:outline-none",
              isActive
                ? "bg-brand-primary text-app shadow-[0_2px_0_0_var(--border-color)] translate-y-0.5"
                : "bg-card text-txt-secondary hover:text-txt-primary shadow-[0_4px_0_0_var(--border-color)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_var(--color-primary)] active:translate-y-1 active:shadow-none"
            )}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
});
