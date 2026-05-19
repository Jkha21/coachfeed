// app/admin/loading.tsx
export default function AdminLoading() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-9">
        <div className="h-10 w-48 bg-surface2 rounded animate-shimmer" />
        <div className="h-4 w-64 bg-surface2 rounded mt-2 animate-shimmer" />
      </div>
      <div className="bg-surface border border-border rounded-2xl p-8 space-y-6">
        <div className="space-y-2">
          <div className="h-3 w-16 bg-surface2 rounded animate-shimmer" />
          <div className="h-12 w-full bg-surface2 rounded animate-shimmer" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-16 bg-surface2 rounded animate-shimmer" />
          <div className="h-32 w-full bg-surface2 rounded animate-shimmer" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-16 bg-surface2 rounded animate-shimmer" />
          <div className="h-12 w-full bg-surface2 rounded animate-shimmer" />
        </div>
        <div className="h-12 w-full bg-surface2 rounded animate-shimmer" />
      </div>
    </div>
  );
}