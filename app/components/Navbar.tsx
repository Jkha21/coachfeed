"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PenSquare } from "lucide-react";
import { useState, useEffect } from "react";

type SocketStatus = "connected" | "connecting" | "disconnected";

export default function NavBar() {
  const pathname = usePathname();
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("connecting");

  useEffect(() => {
    const timer = setTimeout(() => setSocketStatus("connected"), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 h-14 border-b border-border bg-bg/85 backdrop-blur-md">
      {/* Left side: Home icon + Brand */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${
            pathname === "/"
              ? "bg-accent-dim text-accent"
              : "text-text-muted hover:text-text hover:bg-surface2 hover:scale-105"
          }`}
          aria-label="Home"
        >
          <Home size={20} />
        </Link>
        <div className="text-base sm:text-lg font-extrabold tracking-tight">
          SYNC<span className="text-accent">UP</span>
        </div>
      </div>

      {/* Right side: Post feed icon */}
      <Link
        href="/admin"  // Change this to your actual "create post" route if different
        className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${
          pathname === "/admin"
            ? "bg-accent-dim text-accent"
            : "text-text-muted hover:text-text hover:bg-surface2 hover:scale-105"
        }`}
        aria-label="Create post"
      >
        <PenSquare size={20} />
      </Link>
    </nav>
  );
}