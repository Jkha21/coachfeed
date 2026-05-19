"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-text-muted mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-accent text-white rounded-lg text-sm"
      >
        Try again
      </button>
    </div>
  );
}