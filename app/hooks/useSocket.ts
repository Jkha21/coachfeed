"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { FeedItem } from "@/types/feed";

export type SocketStatus = "connecting" | "connected" | "disconnected";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

let _socket: Socket | null = null;

function getSocket(): Socket {
  if (!_socket) {
    _socket = io(SOCKET_URL, {
      reconnection:         true,
      reconnectionAttempts: 10,
      reconnectionDelay:    1_000,
      reconnectionDelayMax: 10_000,
      randomizationFactor:  0.3,
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
  }
  return _socket;
}

interface UseSocketOptions {
  onFeedCreated: (item: FeedItem) => void;
}

export function useSocket({ onFeedCreated }: UseSocketOptions): SocketStatus {
  const [status, setStatus] = useState<SocketStatus>("connecting");

  // Keep reference to the callback to avoid event listener thrashing
  const callbackRef = useRef({ onFeedCreated });
  useEffect(() => { 
    callbackRef.current = { onFeedCreated }; 
  }, [onFeedCreated]);

  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const socket = getSocket();

    const onConnect    = () => setStatus("connected");
    const onDisconnect = () => setStatus("disconnected");
    const onReconnecting = () => setStatus("connecting");
    const onReconnected  = () => setStatus("connected");

    const onJoined = ({ room }: { room: string; socketId: string }) => {
      console.log(`[Socket] Joined room: ${room}`);
      setStatus("connected");
    };

    // Handle Insertion from Change Stream
    const handleFeedCreated = (item: FeedItem) => {
      if (!item?._id) return;
      if (seenIds.current.has(item._id)) {
        console.warn(`[Socket] Duplicate creation event ignored — id: ${item._id}`);
        return;
      }
      seenIds.current.add(item._id);
      callbackRef.current.onFeedCreated(item);
    };

    socket.on("connect",         onConnect);
    socket.on("disconnect",       onDisconnect);
    socket.on("reconnecting",     onReconnecting);
    socket.on("reconnect",        onReconnected);
    socket.on("joined",           onJoined);
    
    // Wire up listener matching your backend change stream insertion event
    socket.on("feed_created",     handleFeedCreated);

    if (socket.connected) setStatus("connected");

    return () => {
      socket.off("connect",       onConnect);
      socket.off("disconnect",    onDisconnect);
      socket.off("reconnecting",  onReconnecting);
      socket.off("reconnect",     onReconnected);
      socket.off("joined",        onJoined);
      
      socket.off("feed_created",  handleFeedCreated);
    };
  }, []);

  return status;
}