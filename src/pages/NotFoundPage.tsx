// ─── Not Found Page ─────────────────────────────────────────────────────────
// 404 page for invalid routes. Provides a clear path back to the main app.

import { Link } from "react-router-dom";
import { ArrowLeft, SearchX } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-6 transition-colors">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="w-20 h-20 mx-auto rounded-full bg-card border border-border-custom flex items-center justify-center shadow-sm">
          <SearchX className="w-10 h-10 text-txt-muted" />
        </div>
        <h1 className="text-3xl font-black text-txt-primary">404</h1>
        <p className="text-txt-secondary text-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discovery
        </Link>
      </div>
    </div>
  );
}
