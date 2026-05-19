import Link from "next/link";

export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="text-2xl font-bold mb-2">Page not found</h2>
      <p className="text-text-muted mb-6">
        The page you're looking for doesn't exist.
      </p>
      <Link href="/" className="inline-block px-4 py-2 bg-accent text-white rounded-lg text-sm">
        Go back home
      </Link>
    </main>
  );
}