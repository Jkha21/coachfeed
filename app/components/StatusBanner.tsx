type SocketStatus = "connected" | "connecting" | "disconnected";

interface StatusBannerProps {
  status: SocketStatus;
}

export default function StatusBanner({ status }: StatusBannerProps) {
  const label: Record<SocketStatus, string> = {
    connected: "Socket connected",
    connecting: "Reconnecting…",
    disconnected: "Disconnected",
  };
  const dotColor: Record<SocketStatus, string> = {
    connected: "bg-green shadow-[0_0_6px_#1D9E75]",
    connecting: "bg-amber-500 shadow-[0_0_6px_#f59e0b]",
    disconnected: "bg-accent shadow-[0_0_6px_#e8593c]",
  };
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${dotColor[status]} ${status === "connected" ? "animate-pulse" : ""}`} />
      <span className="text-text-muted text-2xs font-mono font-medium">{label[status]}</span>
    </div>
  );
}