// ─── CampaignSidebar ────────────────────────────────────────────────────────
// Slide-out drawer showing the user's campaign selection list.
// Features: metrics summary, animated list, CSV export, focus trap, keyboard dismiss.

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Sparkles, FolderHeart } from "lucide-react";
import { toast } from "sonner";
import { useSelectionActions } from "@/store/useSelectionStore";
import { useCampaignMetrics } from "../hooks/useCampaignMetrics";
import { CampaignMetrics } from "./CampaignMetrics";
import { CampaignItem } from "./CampaignItem";
import { generateCampaignCSV, downloadCSV } from "@/utils/csv";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

interface CampaignSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CampaignSidebar({ isOpen, onClose }: CampaignSidebarProps) {
  const { selectedProfiles, totalFollowers, avgEngagementRate } =
    useCampaignMetrics();
  const { clearList } = useSelectionActions();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Escape key dismisses sidebar
  useKeyboardShortcut({
    key: "Escape",
    handler: onClose,
    enabled: isOpen,
  });

  // Focus trap: focus the close button when sidebar opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to wait for animation
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  const handleExportCSV = useCallback(() => {
    if (selectedProfiles.length === 0) return;

    try {
      const csv = generateCampaignCSV(selectedProfiles);
      const filename = `campaign_influencers_${new Date().toISOString().slice(0, 10)}.csv`;
      downloadCSV(csv, filename);
      toast.success(`Exported ${selectedProfiles.length} profiles to CSV`, {
        className: "sonner-toast-brutalist",
      });
    } catch {
      toast.error("Failed to export CSV. Please try again.", {
        className: "sonner-toast-brutalist",
      });
    }
  }, [selectedProfiles]);

  const handleClearAll = useCallback(() => {
    const count = selectedProfiles.length;
    clearList();
    toast.success(`Cleared ${count} profiles from campaign`, {
      className: "sonner-toast-brutalist",
    });
  }, [clearList, selectedProfiles.length]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40"
            aria-hidden="true"
          />

          {/* Sidebar Drawer */}
          <motion.aside
            ref={sidebarRef}
            initial={{ x: "100%", opacity: 0.95 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l-2 border-border-custom shadow-2xl z-50 flex flex-col text-txt-primary"
            role="dialog"
            aria-modal="true"
            aria-label="Campaign list"
          >
            {/* Header */}
            <div className="p-5 border-b-1.5 border-border-custom flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderHeart className="w-5 h-5 text-brand-primary" aria-hidden="true" />
                <h2 className="text-xl font-serif font-normal text-txt-primary">
                  Campaign List
                </h2>
                <span className="bg-brand-primary text-app border border-border-custom text-xs font-mono font-bold px-2 py-0.5 rounded-md">
                  {selectedProfiles.length}
                </span>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="p-1.5 hover:bg-card-hover border border-transparent hover:border-border-custom rounded-md text-txt-secondary hover:text-txt-primary transition-all cursor-pointer focus:outline-none"
                aria-label="Close campaign list"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Campaign Summary Metrics */}
            {selectedProfiles.length > 0 && (
              <CampaignMetrics
                totalFollowers={totalFollowers}
                avgEngagementRate={avgEngagementRate}
              />
            )}

            {/* Influencers List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedProfiles.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-txt-muted">
                  <div className="w-16 h-16 rounded-md bg-card-hover border-1.5 border-border-custom flex items-center justify-center mb-4">
                    <Sparkles className="w-7 h-7 text-txt-primary animate-pulse" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-serif text-txt-primary">
                    Your list is empty
                  </h3>
                  <p className="text-xs text-txt-muted mt-2 max-w-[240px] leading-relaxed">
                    Browse creators and add them to your campaign list to plan reach and aggregate engagement rate.
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {selectedProfiles.map((p) => (
                    <CampaignItem key={p.user_id} profile={p} />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Actions Footer */}
            {selectedProfiles.length > 0 && (
              <div className="p-4 border-t-1.5 border-border-custom bg-app/90 space-y-3">
                <button
                  onClick={handleExportCSV}
                  className="w-full py-3 px-4 bg-brand-primary hover:bg-brand-primary-hover border-1.5 border-border-custom text-app font-bold text-sm rounded-lg flex items-center justify-center gap-2 shadow-hard-sm transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer focus:outline-none"
                >
                  <Download className="w-4.5 h-4.5" aria-hidden="true" />
                  Export List (CSV)
                </button>
                <button
                  onClick={handleClearAll}
                  className="w-full py-2 text-xs font-mono font-bold uppercase tracking-wider text-txt-muted hover:text-red-500 hover:underline transition-colors cursor-pointer focus:outline-none"
                >
                  Clear all creators
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
