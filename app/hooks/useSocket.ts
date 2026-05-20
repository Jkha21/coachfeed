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
  onFeedCreated: (item: FeedItem) => void;
  onFeedUpdated: (item: FeedItem) => void;
  onFeedDeleted: (payload: { _id: string }) => void;
}

export function useSocket({ onFeedCreated, onFeedUpdated, onFeedDeleted }: UseSocketOptions): SocketStatus {
  const [status, setStatus] = useState<SocketStatus>("connecting");

  // Keep references to all callbacks to avoid event listener thrashing
  const callbacksRef = useRef({ onFeedCreated, onFeedUpdated, onFeedDeleted });
  useEffect(() => { 
    callbacksRef.current = { onFeedCreated, onFeedUpdated, onFeedDeleted }; 
  }, [onFeedCreated, onFeedUpdated, onFeedDeleted]);

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

    // 1. Handle Insertion from Change Stream
    const handleFeedCreated = (item: FeedItem) => {
      if (!item?._id) return;
      if (seenIds.current.has(item._id)) {
        console.warn(`[Socket] Duplicate creation event ignored — id: ${item._id}`);
        return;
      }
      seenIds.current.add(item._id);
      callbacksRef.current.onFeedCreated(item);
    };

    // 2. Handle Modification from Change Stream
    const handleFeedUpdated = (item: FeedItem) => {
      if (!item?._id) return;
      callbacksRef.current.onFeedUpdated(item);
    };

    // 3. Handle Deletion from Change Stream
    const handleFeedDeleted = (payload: { _id: string }) => {
      if (!payload?._id) return;
      // Allow re-creation tracking if an item with the same ID gets re-inserted later
      seenIds.current.delete(payload._id); 
      callbacksRef.current.onFeedDeleted(payload);
    };

    socket.on("connect",         onConnect);
    socket.on("disconnect",       onDisconnect);
    socket.on("reconnecting",     onReconnecting);
    socket.on("reconnect",        onReconnected);
    socket.on("joined",           onJoined);
    
    // Wire up listeners matching your backend change stream events
    socket.on("feed_created",     handleFeedCreated);
    socket.on("feed_updated",     handleFeedUpdated);
    socket.on("feed_deleted",     handleFeedDeleted);

    if (socket.connected) setStatus("connected");

    return () => {
      socket.off("connect",       onConnect);
      socket.off("disconnect",    onDisconnect);
      socket.off("reconnecting",  onReconnecting);
      socket.off("reconnect",     onReconnected);
      socket.off("joined",        onJoined);
      
      socket.off("feed_created",  handleFeedCreated);
      socket.off("feed_updated",  handleFeedUpdated);
      socket.off("feed_deleted",  handleFeedDeleted);
    };
  }, []);

  return status;
}