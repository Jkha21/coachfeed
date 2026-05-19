// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-text-muted mb-6">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <Link
        href="/"
        className="inline-block px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90 transition"
      >
        Go back home
      </Link>
    </div>
  );
}