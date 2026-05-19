interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

export default function Error({ message, onRetry }: ErrorProps) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm flex items-center gap-3">
      <span>⚠️</span>
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="text-red-400 underline text-xs">
          Retry
        </button>
      )}
    </div>
  );
}