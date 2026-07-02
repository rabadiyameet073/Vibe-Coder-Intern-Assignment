// ─── App ────────────────────────────────────────────────────────────────────
// Root application component.
// Sets up routing with lazy-loaded page components and global providers.

import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/app/ErrorBoundary";
import { useTheme } from "@/store/useThemeStore";

// Lazy-load page components for code splitting
const SearchPage = lazy(() =>
  import("@/features/dashboard/SearchPage").then((m) => ({
    default: m.SearchPage,
  }))
);

const ProfileDetailPage = lazy(() =>
  import("@/features/profile-detail/ProfileDetailPage").then((m) => ({
    default: m.ProfileDetailPage,
  }))
);

/**
 * Minimal loading fallback for Suspense boundaries.
 * Keeps the shell visible while page chunks load.
 */
function PageLoadingFallback() {
  return null;
}

function App() {
  const theme = useTheme();

  // Apply store theme to root element
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route
              path="/profile/:username"
              element={<ProfileDetailPage />}
            />
            {/* Catch-all 404 route */}
            <Route path="*" element={<RouteRedirect to="/" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>

      {/* Global toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className:
            "!bg-card !border !border-border-custom !text-txt-primary !shadow-xl transition-all duration-200",
          duration: 2500,
        }}
        theme={theme}
      />
    </ErrorBoundary>
  );
}

// Helper redirect component for clean navigation fallbacks
import { useNavigate } from "react-router-dom";
function RouteRedirect({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace: true });
  }, [navigate, to]);
  return <PageLoadingFallback />;
}

export default App;
