"use client";

import FeedCard from "@/components/FeedCard";
import type { FeedItem } from "@/types/feed";

interface LivePreviewProps {
  title: string;
  content: string;
  author: string;
}

export default function LivePreview({ title, content, author }: LivePreviewProps) {
  // Only render if at least one field has input text
  const hasInput = title.trim() || content.trim() || author.trim();

  if (!hasInput) return null;

  const previewItem: FeedItem = {
    _id: "preview",
    title: title.trim() || "Untitled",
    content: content.trim() || "No content yet…",
    author: author.trim() || "Anonymous",
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <p className="text-text-muted text-[11px] font-mono font-semibold uppercase tracking-widest mb-3">
        Live Preview
      </p>
      {/* Structural layout block to completely insulate layout overflow constraints */}
      <div className="min-w-0 w-full overflow-hidden break-words pointer-events-none">
        <FeedCard item={previewItem} isNew={false} />
      </div>
    </div>
  );
}