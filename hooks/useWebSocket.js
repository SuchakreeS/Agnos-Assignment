"use client";

// Custom hook: connect, send (throttled), receive, auto-reconnect, cleanup.
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_WS_URL = "ws://localhost:4001";
const RECONNECT_DELAY_MS = 2000;
const SEND_THROTTLE_MS = 300;

export function useWebSocket(role) {
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [lastMessage, setLastMessage] = useState(null);

  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const throttleTimerRef = useRef(null);
  const pendingSendRef = useRef(null);
  const isUnmountedRef = useRef(false);

  const connect = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || DEFAULT_WS_URL;
    const url = `${baseUrl}?role=${role}`;

    setConnectionStatus("connecting");
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      if (isUnmountedRef.current) return;
      setConnectionStatus("open");
    };

    socket.onmessage = (event) => {
      if (isUnmountedRef.current) return;
      try {
        setLastMessage(JSON.parse(event.data));
      } catch {
        // Ignore malformed payloads rather than crashing the UI.
      }
    };

    socket.onerror = () => {
      if (isUnmountedRef.current) return;
      setConnectionStatus("error");
    };

    socket.onclose = () => {
      if (isUnmountedRef.current) return;
      setConnectionStatus("closed");
      reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
    };
  }, [role]);

  useEffect(() => {
    isUnmountedRef.current = false;
    connect();

    return () => {
      isUnmountedRef.current = true;
      clearTimeout(reconnectTimerRef.current);
      clearTimeout(throttleTimerRef.current);
      socketRef.current?.close();
    };
  }, [connect]);

  const sendRaw = useCallback((message) => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }, []);

  // Throttled so every keystroke doesn't spam the server — sends at most
  // once per SEND_THROTTLE_MS, always flushing the most recent value.
  const sendUpdate = useCallback(
    (data) => {
      pendingSendRef.current = { type: "update", data };
      if (throttleTimerRef.current) return;

      throttleTimerRef.current = setTimeout(() => {
        throttleTimerRef.current = null;
        if (pendingSendRef.current) {
          sendRaw(pendingSendRef.current);
          pendingSendRef.current = null;
        }
      }, SEND_THROTTLE_MS);
    },
    [sendRaw]
  );

  // Submissions are infrequent and important — send immediately, no throttle.
  const sendSubmit = useCallback(
    (data) => {
      clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = null;
      pendingSendRef.current = null;
      sendRaw({ type: "submit", data });
    },
    [sendRaw]
  );

  return { connectionStatus, lastMessage, sendUpdate, sendSubmit };
}
