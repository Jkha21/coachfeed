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
      reconnection:        true,
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
  onNewFeedItem: (item: FeedItem) => void;
}

export function useSocket({ onNewFeedItem }: UseSocketOptions): SocketStatus {
  const [status, setStatus] = useState<SocketStatus>("connecting");

  const callbackRef = useRef(onNewFeedItem);
  useEffect(() => { callbackRef.current = onNewFeedItem; }, [onNewFeedItem]);

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

    const onNewFeedItemEvent = (item: FeedItem) => {
      if (!item?._id) return;
      if (seenIds.current.has(item._id)) {
        console.warn(`[Socket] Duplicate event ignored — id: ${item._id}`);
        return;
      }
      seenIds.current.add(item._id);
      callbackRef.current(item);
    };

    socket.on("connect",          onConnect);
    socket.on("disconnect",       onDisconnect);
    socket.on("reconnecting",     onReconnecting);
    socket.on("reconnect",        onReconnected);
    socket.on("joined",           onJoined);
    socket.on("new_feed_item",    onNewFeedItemEvent);

    if (socket.connected) setStatus("connected");

    return () => {
      socket.off("connect",       onConnect);
      socket.off("disconnect",    onDisconnect);
      socket.off("reconnecting",  onReconnecting);
      socket.off("reconnect",     onReconnected);
      socket.off("joined",        onJoined);
      socket.off("new_feed_item", onNewFeedItemEvent);
    };
  }, []);

  return status;
}