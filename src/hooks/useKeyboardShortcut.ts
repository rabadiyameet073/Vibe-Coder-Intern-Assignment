// ─── useKeyboardShortcut Hook ────────────────────────────────────────────────
// Registers a global keyboard shortcut with proper cleanup.

import { useEffect, useCallback } from "react";

interface ShortcutOptions {
  /** The key to listen for (e.g., "k", "Escape") */
  key: string;
  /** Whether Ctrl/Cmd must be held */
  ctrlOrMeta?: boolean;
  /** Callback to invoke when the shortcut fires */
  handler: () => void;
  /** Whether the shortcut is currently active (default: true) */
  enabled?: boolean;
}

/**
 * Registers a global keyboard shortcut.
 * Automatically handles Ctrl (Windows/Linux) and Cmd (Mac).
 *
 * @example
 * useKeyboardShortcut({ key: "k", ctrlOrMeta: true, handler: openSidebar });
 */
export function useKeyboardShortcut({
  key,
  ctrlOrMeta = false,
  handler,
  enabled = true,
}: ShortcutOptions): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger when user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow Escape to always work
        if (key !== "Escape") return;
      }

      const modifierMatch = ctrlOrMeta
        ? event.ctrlKey || event.metaKey
        : !event.ctrlKey && !event.metaKey;

      if (modifierMatch && event.key === key) {
        event.preventDefault();
        handler();
      }
    },
    [key, ctrlOrMeta, handler, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}
