import SkeletonCard  from "@/components/SkeletonCard";

export default function Loading() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </main>
  );
}