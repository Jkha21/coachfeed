"use client";

import { useState, useEffect, useRef } from "react";
import FeedCard from "@/components/FeedCard";
import SkeletonCard from "@/components/SkeletonCard";
import ErrorMessage from "@/components/ErrorMessage"; // renamed
import type { FeedItem, ApiFeedResponse } from "@/types/feed";

// Declare the global window property
declare global {
  interface Window {
    __appendToFeed?: (item: FeedItem) => void;
  }
}

export default function HomePage() {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const seenIds = useRef<Set<string>>(new Set());
  const appendToFeed = useRef<((item: FeedItem) => void) | null>(null);

  // Fetch feeds from /api/feed on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch("/api/feed");
        const data: ApiFeedResponse = await res.json();

        if (!mounted || !data.success) {
          throw new Error(data.error ?? "Failed to fetch feeds");
        }

        const items = Array.isArray(data.data) ? data.data : [];
        setFeeds(items);
        items.forEach((f) => seenIds.current.add(f._id));
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message ?? "Failed to load feeds");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Realtime append handler
  useEffect(() => {
    appendToFeed.current = (item: FeedItem) => {
      if (seenIds.current.has(item._id)) return;
      seenIds.current.add(item._id);
      setFeeds((prev) => [item, ...prev]);
      setNewIds((prev) => new Set([...prev, item._id]));
      setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          next.delete(item._id);
          return next;
        });
      }, 8000);
    };
  }, []);

  // Expose globally so Admin can call window.__appendToFeed()
  useEffect(() => {
    window.__appendToFeed = appendToFeed.current ?? undefined;
    return () => {
      if (window.__appendToFeed === appendToFeed.current) {
        window.__appendToFeed = undefined;
      }
    };
  }, []);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* header */}
      <div className="mb-6 sm:mb-9">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
          Coaching <span className="text-accent">Feed</span>
        </h1>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => window.location.reload()} />}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <span className="text-text-muted text-2xs font-mono">
          <strong className="text-text">{feeds.length}</strong> items
        </span>
        <button
          onClick={() => {
            setLoading(true);
            (async () => {
              try {
                const res = await fetch("/api/feed");
                const data: ApiFeedResponse = await res.json();

                if (!data.success) {
                  throw new Error(data.error ?? "Failed to reload feeds");
                }

                const items = Array.isArray(data.data) ? data.data : [];
                setFeeds(items);
                seenIds.current = new Set(items.map((f) => f._id));
              } catch (err: any) {
                setError(err?.message ?? "Failed to reload feeds");
              } finally {
                setLoading(false);
              }
            })();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-surface text-text-muted text-2xs font-medium hover:border-border-accent hover:text-text transition w-full sm:w-auto justify-center"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : feeds.length === 0 ? (
          <div className="text-center py-12 sm:py-16 border border-dashed border-border rounded-xl">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-text font-semibold">No feed items yet</div>
            <div className="text-text-muted text-sm">Go to Admin to post the first update.</div>
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