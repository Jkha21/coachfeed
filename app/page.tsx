"use client";

import { useState, useEffect, useCallback } from "react";
import FeedCard from "@/components/FeedCard";
import SkeletonCard from "@/components/SkeletonCard";
import ErrorMessage from "@/components/ErrorMessage";
import { useSocket, type SocketStatus } from "@/hooks/useSocket";
import type { FeedItem, ApiFeedResponse } from "@/types/feed";


const STATUS_STYLES: Record<SocketStatus, { dot: string; label: string }> = {
  connected:    { dot: "bg-green-400 shadow-[0_0_6px_#4ade80]", label: "Live"          },
  connecting:   { dot: "bg-amber-400",                           label: "Connecting…"   },
  disconnected: { dot: "bg-red-400",                             label: "Disconnected"  },
};

function SocketStatusPill({ status }: { status: SocketStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-2xs font-mono text-text-muted">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot} ${status === "connected" ? "animate-pulse" : ""}`} />
      {s.label}
    </div>
  );
}


export default function HomePage() {
  const [feeds,   setFeeds]   = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [newIds,  setNewIds]  = useState<Set<string>>(new Set());

  const fetchFeeds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/feed");
      const data: ApiFeedResponse = await res.json();
      if (!data.success) throw new Error(data.error ?? "Failed to fetch feeds");
      setFeeds(Array.isArray(data.data) ? data.data : []);
    } catch (err: unknown) {

      const message = err instanceof Error ? err.message : "Failed to load feeds";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeeds(); }, [fetchFeeds]);

  const handleNewFeedItem = useCallback((item: FeedItem) => {
    setFeeds((prev) => [item, ...prev]);
    setNewIds((prev) => new Set([...prev, item._id]));

    setTimeout(() => {
      setNewIds((prev) => {
        const next = new Set(prev);
        next.delete(item._id);
        return next;
      });
    }, 8_000);
  }, []);

  const socketStatus = useSocket({ onNewFeedItem: handleNewFeedItem });

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 sm:mb-9">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
          Coaching <span className="text-accent">Feed</span>
        </h1>
        {/* FIX 5: live socket status */}
        <SocketStatusPill status={socketStatus} />
      </div>

      {error && (
        <ErrorMessage message={error} onRetry={fetchFeeds} />
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <span className="text-text-muted text-2xs font-mono">
          <strong className="text-text">{feeds.length}</strong> items
        </span>
        {/* FIX 1: Refresh reuses fetchFeeds — no duplicated fetch block */}
        <button
          onClick={fetchFeeds}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-surface text-text-muted text-2xs font-medium hover:border-border-accent hover:text-text transition disabled:opacity-50 w-full sm:w-auto justify-center"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Feed list */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : feeds.length === 0 ? (
          <div className="text-center py-12 sm:py-16 border border-dashed border-border rounded-xl">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-text font-semibold">No feed items yet</div>
            <div className="text-text-muted text-sm">
              Go to Admin to post the first update.
            </div>
          </div>
        ) : (
          feeds.map((item) => (
            <FeedCard key={item._id} item={item} isNew={newIds.has(item._id)} />
          ))
        )}
      </div>
    </main>
  );
}