"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import FeedCard from "@/components/FeedCard";
import SkeletonCard from "@/components/SkeletonCard";
import ErrorMessage from "@/components/ErrorMessage";
import { useSocket, type SocketStatus } from "@/hooks/useSocket";
import type { FeedItem, ApiFeedResponse } from "@/types/feed";

const STATUS_MAP: Record<SocketStatus, { dot: string; label: string }> = {
  connected:    { dot: "bg-green-400 shadow-[0_0_6px_theme(colors.green.400)] animate-pulse", label: "Live" },
  connecting:   { dot: "bg-amber-400", label: "Connecting…" },
  disconnected: { dot: "bg-red-400", label: "Disconnected" },
};

function SocketStatusPill({ status }: { status: SocketStatus }) {
  const { dot, label } = STATUS_MAP[status];
  
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-[11px] font-mono text-text-muted select-none">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </div>
  );
}

export default function HomePage() {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  const loadedIds = useRef<Set<string>>(new Set());

  const fetchFeeds = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/feed");
      const data: ApiFeedResponse = await res.json();

      if (!data.success) {
        setError(data.error ?? "Failed to fetch feeds");
        setLoading(false);
        return;
      }

      const items = Array.isArray(data.data) ? data.data : [];
      loadedIds.current = new Set(items.map((f) => f._id));
      setFeeds(items);
    } catch (err) {
      setError("An unexpected network error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

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
      }, 8000);
    }
  }, []);

  const socketStatus = useSocket({
    onFeedCreated: handleFeedCreated,
  });

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 mb-6 sm:mb-9">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Coaching <span className="text-accent">Feed</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Real-time updates from your team.
          </p>
        </div>
        <SocketStatusPill status={socketStatus} />
      </header>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <span className="text-text-muted text-[11px] font-mono">
          <strong className="text-text">{error ? 0 : feeds.length}</strong> items
        </span>
        <button
          onClick={fetchFeeds}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-surface text-text-muted text-xs font-medium hover:border-border-accent hover:text-text transition-colors disabled:opacity-50 w-full sm:w-auto justify-center cursor-pointer disabled:cursor-not-allowed"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Content Area */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : error ? (
          /* Clean Centered Error Panel Layout */
          <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-red-500/10 bg-red-500/[0.02] rounded-xl">
            <div className="text-3xl mb-3">⚠️</div>
            <p className="text-text font-semibold text-red-400">Unable to load feed</p>
            <p className="text-text-muted text-sm mt-1 max-w-sm">
              {error}
            </p>
            <button
              onClick={fetchFeeds}
              className="mt-5 px-4 py-2 rounded-md border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-medium transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
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