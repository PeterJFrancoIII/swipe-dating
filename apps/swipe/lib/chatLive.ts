import { useEffect, useRef } from "react";

import { getToken } from "@/lib/api";
import { API_URL } from "@/lib/config";

export type LiveChatMessage = {
  id?: string;
  body: string;
  sender_id: string;
};

export type LiveChatEvent =
  | { type: "typing"; account_id?: string }
  | {
      type: "message";
      account_id?: string;
      message?: LiveChatMessage;
      match?: {
        status?: string;
        message_count?: number;
        message_limit?: number;
        extension_used?: boolean;
        remaining_ms?: number;
        urgency?: string;
      };
    }
  | { type: "closed"; reason?: string }
  | { type: "ping" };

type Handlers = {
  onTyping: () => void;
  onMessage: (event: Extract<LiveChatEvent, { type: "message" }>) => void;
  onClosed: () => void;
  onReconnect?: () => void;
};

export function liveChatUrl(matchId: string): string {
  const root = API_URL.replace(/^http/i, "ws");
  const token = encodeURIComponent(getToken());
  const release = __DEV__ ? "" : "&release=store";
  return `${root}/api/matches/${encodeURIComponent(matchId)}/live?token=${token}${release}`;
}

export function useLiveChat(matchId: string, enabled: boolean, handlers: Handlers): { sendTyping: () => void } {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const socketRef = useRef<WebSocket | null>(null);
  const lastTypingAt = useRef(0);

  useEffect(() => {
    if (!enabled || !matchId || !getToken()) {
      return;
    }
    let closed = false;
    let retry = 0;
    let seenOpen = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let socket: WebSocket | null = null;

    const connect = () => {
      if (closed) {
        return;
      }
      socket = new WebSocket(liveChatUrl(matchId));
      socketRef.current = socket;
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(String(event.data)) as LiveChatEvent;
          if (payload.type === "typing") {
            handlersRef.current.onTyping();
          } else if (payload.type === "message") {
            handlersRef.current.onMessage(payload);
          } else if (payload.type === "closed") {
            handlersRef.current.onClosed();
          }
        } catch {
          return;
        }
      };
      socket.onopen = () => {
        retry = 0;
        if (seenOpen) {
          handlersRef.current.onReconnect?.();
        }
        seenOpen = true;
      };
      socket.onclose = () => {
        socketRef.current = null;
        if (closed) {
          return;
        }
        retry = Math.min(retry + 1, 4);
        timer = setTimeout(connect, 1000 * retry);
      };
    };
    connect();
    return () => {
      closed = true;
      if (timer) {
        clearTimeout(timer);
      }
      socket?.close();
      socketRef.current = null;
    };
  }, [enabled, matchId]);

  return {
    sendTyping() {
      const now = Date.now();
      if (now - lastTypingAt.current < 700) {
        return;
      }
      lastTypingAt.current = now;
      const socket = socketRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "typing" }));
      }
    },
  };
}
