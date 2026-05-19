export default function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex gap-3 mb-3.5">
        <div className="w-8 h-8 rounded-lg bg-surface2 animate-shimmer" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-2/5 bg-surface2 rounded animate-shimmer" />
          <div className="h-2 w-1/5 bg-surface2 rounded animate-shimmer" />
        </div>
      </div>
      <div className="h-3 w-3/5 bg-surface2 rounded mb-2 animate-shimmer" />
      <div className="h-3 w-full bg-surface2 rounded mb-1.5 animate-shimmer" />
      <div className="h-3 w-3/4 bg-surface2 rounded animate-shimmer" />
    </div>
  );
}