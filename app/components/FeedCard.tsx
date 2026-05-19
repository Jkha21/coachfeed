import { timeAgo, initials, avatarColor } from "@/utils/helpers";
import type { FeedItem } from "@/types/feed";

interface FeedCardProps {
  item: FeedItem;
  isNew?: boolean;
}

export default function FeedCard({ item, isNew }: FeedCardProps) {
  return (
    <div className={`bg-surface border ${isNew ? "border-accent animate-slide-in" : "border-border"} rounded-xl p-5 transition-all hover:border-border-accent relative overflow-hidden`}>
      {isNew && <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent" />}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
          style={{ background: avatarColor(item.author) }}
        >
          {initials(item.author)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-text font-semibold text-sm">{item.author}</div>
          <div className="text-text-muted text-2xs font-mono mt-0.5">{timeAgo(item.createdAt)}</div>
        </div>
        {isNew && (
          <span className="text-2xs font-bold tracking-wide uppercase bg-accent-dim text-accent px-2 py-0.5 rounded">
            Live
          </span>
        )}
      </div>
      <div className="text-text font-bold text-base mb-1.5 tracking-tight">{item.title}</div>
      <div className="text-text-dim text-sm leading-relaxed">{item.content}</div> {/* Changed from body to content */}
    </div>
  );
}