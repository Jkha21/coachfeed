"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import FeedCard from "@/components/FeedCard";
import SkeletonCard from "@/components/SkeletonCard";
import ErrorMessage from "@/components/ErrorMessage";
import { useSocket, type SocketStatus } from "@/hooks/useSocket";
import type { FeedItem, ApiFeedResponse } from "@/types/feed";

// ── Socket status pill ────────────────────────────────────────────────────────

const STATUS_MAP: Record<SocketStatus, { dot: string; label: string }> = {
  connected:    { dot: "bg-green-400 shadow-[0_0_6px_theme(colors.green.400)] animate-pulse", label: "Live"         },
  connecting:   { dot: "bg-amber-400",                                                        label: "Connecting…"  },
  disconnected: { dot: "bg-red-400",                                                          label: "Disconnected" },
};

function SocketStatusPill({ status }: { status: SocketStatus }) {
  const s = STATUS_MAP[status];
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-[11px] font-mono text-text-muted select-none">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {s.label}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [feeds,   setFeeds]   = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [newIds,  setNewIds]  = useState<Set<string>>(new Set());

  // IDs already present from the HTTP fetch — never badged as "Live"
  const loadedIds = useRef<Set<string>>(new Set());

  // ── Fetch — error handling via route.ts response shape ───────────────────
  // route.ts wraps every outcome (backend error, network failure, bad status)
  // into { success, data, error } — so we only need to check data.success.
  // No try/catch required here.
  const fetchFeeds = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res  = await fetch("/api/feed");
    const data: ApiFeedResponse = await res.json();

    if (!data.success) {
      setError(data.error ?? "Failed to fetch feeds");
      setLoading(false);
      return;
    }

    const items = Array.isArray(data.data) ? data.data : [];
    loadedIds.current = new Set(items.map((f) => f._id));
    setFeeds(items);
    setLoading(false);
  }, []);

  useEffect(() => { fetchFeeds(); }, [fetchFeeds]);

  // ── Socket handlers ───────────────────────────────────────────────────────

  const handleFeedCreated = useCallback((item: FeedItem) => {
    setFeeds((prev) => {
      if (prev.some((f) => f._id === item._id)) return prev;
      return [item, ...prev];
    });

    if (!loadedIds.current.has(item._id)) {
      setNewIds((prev) => new Set([...prev, item._id]));
      setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          next.delete(item._id);
          return next;
        });
      }, 8_000);
    }
  }, []);

  const handleFeedUpdated = useCallback((updatedItem: FeedItem) => {
    setFeeds((prev) =>
      prev.map((item) => (item._id === updatedItem._id ? updatedItem : item))
    );
  }, []);

  const handleFeedDeleted = useCallback(({ _id }: { _id: string }) => {
    setFeeds((prev) => prev.filter((item) => item._id !== _id));
    setNewIds((prev) => {
      const next = new Set(prev);
      next.delete(_id);
      return next;
    });
  }, []);

  const socketStatus = useSocket({
    onFeedCreated: handleFeedCreated,
    onFeedUpdated: handleFeedUpdated,
    onFeedDeleted: handleFeedDeleted,
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 sm:mb-9">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Coaching <span className="text-accent">Feed</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Real-time updates from your team.
          </p>
        </div>
        <SocketStatusPill status={socketStatus} />
      </div>

      {/* Error — message comes directly from route.ts */}
      {error && (
        <ErrorMessage message={error} onRetry={fetchFeeds} />
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <span className="text-text-muted text-[11px] font-mono">
          <strong className="text-text">{feeds.length}</strong> items
        </span>
        <button
          onClick={fetchFeeds}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-surface text-text-muted text-xs font-medium hover:border-border-accent hover:text-text transition-colors disabled:opacity-50 w-full sm:w-auto justify-center"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Feed list */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : feeds.length === 0 ? (
          <div className="text-center py-14 border border-dashed border-border rounded-xl">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-text font-semibold">No feed items yet</p>
            <p className="text-text-muted text-sm mt-1">
              Go to Admin to post the first update.
            </p>
          </div>
        ) : (
          feeds.map((item) => (
            <FeedCard
              key={item._id}
              item={item}
              isNew={newIds.has(item._id)}
            />
          ))
        )}
      </div>
    </main>
  );
}