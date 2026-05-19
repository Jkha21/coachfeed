"use client";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold mb-2">Admin Panel Error</h2>
      <p className="text-text-muted mb-6">
        Something went wrong while trying to load the admin interface.
      </p>
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
        <p className="text-red-400 text-sm font-mono break-all">{error.message}</p>
        {error.digest && (
          <p className="text-text-muted text-2xs font-mono mt-2">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90 transition"
        >
          Try again
        </button>
        <a
          href="/admin"
          className="px-4 py-2 border border-border text-text-muted rounded-lg text-sm hover:bg-surface2 transition"
        >
          Refresh page
        </a>
      </div>
    </div>
  );
}