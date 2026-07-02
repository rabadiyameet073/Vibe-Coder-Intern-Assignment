// ─── Theme Store ─────────────────────────────────────────────────────────────
// Manages light/dark mode theme state, persists choice to local storage, and handles system settings.

import { create } from "zustand";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
}

interface ThemeActions {
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

type ThemeStore = ThemeState & ThemeActions;

// Helper to check system preference
const getSystemTheme = (): Theme => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark"; // default fallback
};

// Helper to get initial theme from localStorage or system preference
const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return getSystemTheme();
};

export const useThemeStore = create<ThemeStore>()((set) => ({
  theme: getInitialTheme(),

  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", nextTheme);
      
      // Update document root class
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { theme: nextTheme };
    }),

  setTheme: (theme) =>
    set(() => {
      localStorage.setItem("theme", theme);
      
      // Update document root class
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { theme };
    }),
}));

export const useTheme = () => useThemeStore((s) => s.theme);

export const useThemeActions = () => {
  return {
    toggleTheme: () => useThemeStore.getState().toggleTheme(),
    setTheme: (theme: Theme) => useThemeStore.getState().setTheme(theme),
  };
};
