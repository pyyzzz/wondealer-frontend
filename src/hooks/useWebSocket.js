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
    if (!token) return;

    // ⭐ .env가 안 먹힐 때를 대비해 하드코딩으로 백엔드 주소 확인
    const BACKEND_URL = "http://localhost:8111"; // 백엔드 포트로 직접 지정
    const socketUrl = `${BACKEND_URL}/ws`;

    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("WebSocket 연결 성공:", subscribeTopic); // 디버깅용
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
        console.error("STOMP error:", frame);
      },
      onWebSocketError: (event) => {
        console.warn("WebSocket 연결 실패 — 서버 주소 확인:", socketUrl);
      },
      onDisconnect: () => {
        console.warn("WebSocket 연결 종료");
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
      clientRef.current = null;
    };
  }, [subscribeTopic]);

  const sendMessage = useCallback(
    (body) => {
      if (clientRef.current?.connected && sendDestination) {
        const token = Common.getAccessToken();
        clientRef.current.publish({
          destination: sendDestination,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: JSON.stringify(body),
        });
      }
    },
    [sendDestination],
  );

  return { sendMessage };
};

export default useWebSocket;