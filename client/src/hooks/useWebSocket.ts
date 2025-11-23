import { useEffect, useRef, useState, useCallback } from "react";
import type { User, Message } from "@shared/schema";

interface WSMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketProps {
  roomId?: string;
  userId?: string;
  onMessage?: (message: Message & { author: User }) => void;
  onUserJoined?: (userId: string) => void;
  onUserLeft?: (userId: string) => void;
  onError?: (error: string) => void;
}

export function useWebSocket({
  roomId,
  userId,
  onMessage,
  onUserJoined,
  onUserLeft,
  onError,
}: UseWebSocketProps) {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeout = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!userId || ws.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      
      // Join room if roomId is provided
      if (roomId && userId) {
        ws.current?.send(JSON.stringify({
          type: "join",
          roomId,
          userId,
        }));
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const data: WSMessage = JSON.parse(event.data);
        
        switch (data.type) {
          case "new_message":
            onMessage?.(data.message);
            break;
          case "user_joined":
            onUserJoined?.(data.userId);
            break;
          case "user_left":
            onUserLeft?.(data.userId);
            break;
          case "error":
            onError?.(data.message);
            break;
          case "message_blocked":
            onError?.(data.reason || "Your message was blocked");
            break;
        }
      } catch (error) {
        console.error("WebSocket message parse error:", error);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      
      // Reconnect after 3 seconds
      reconnectTimeout.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };
  }, [roomId, userId, onMessage, onUserJoined, onUserLeft, onError]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((content: string, emotionalTags: string[] = []) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN || !roomId || !userId) {
      return;
    }

    ws.current.send(JSON.stringify({
      type: "message",
      roomId,
      userId,
      content,
      emotionalTags,
    }));
  }, [roomId, userId]);

  const sendTyping = useCallback(() => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    
    ws.current.send(JSON.stringify({
      type: "typing",
    }));
  }, []);

  return {
    isConnected,
    sendMessage,
    sendTyping,
  };
}
