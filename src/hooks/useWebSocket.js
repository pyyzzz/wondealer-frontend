import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Common from "../utils/Common";

const useWebSocket = (subscribeTopic, sendDestination, onMessage) => {
  const clientRef = useRef(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!subscribeTopic) return;

    const token = Common.getAccessToken();
    if (!token) return; // 비로그인 시 연결 시도 안 함

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${Common.API_URL || "http://localhost:8111"}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(subscribeTopic, (message) => {
          try {
            const body = JSON.parse(message.body);
            onMessageRef.current?.(body);
          } catch {
            onMessageRef.current?.(message.body);
          }
        });
      },
      onStompError: (frame) => {
        console.warn("STOMP error:", frame);
      },
      onWebSocketError: () => {
        console.warn("WebSocket 연결 실패 — 백엔드 서버를 확인하세요.");
      },
      onDisconnect: () => {
        console.warn("WebSocket 연결 종료");
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [subscribeTopic]);

  const sendMessage = useCallback(
    (body) => {
      if (clientRef.current?.connected && sendDestination) {
        clientRef.current.publish({
          destination: sendDestination,
          body: JSON.stringify(body),
        });
      }
    },
    [sendDestination],
  );

  return { sendMessage };
};

export default useWebSocket;
