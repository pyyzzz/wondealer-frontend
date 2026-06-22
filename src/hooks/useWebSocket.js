import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Common from "../utils/Common";

const useWebSocket = (subscribeTopic, sendDestination, onMessage) => {
  const clientRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const pendingQueueRef = useRef([]);
  const tokenRef = useRef(null);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!subscribeTopic) return;

    const token = Common.getAccessToken();
    if (!token) return;
    tokenRef.current = token;

    const BACKEND_URL = "http://localhost:8111"; // 백엔드 포트로 직접 지정
    const socketUrl = `${BACKEND_URL}/ws`;

    const flushQueue = (client) => {
      if (pendingQueueRef.current.length === 0 || !sendDestination) return;
      const queued = pendingQueueRef.current;
      pendingQueueRef.current = [];
      queued.forEach((body) => {
        client.publish({
          destination: sendDestination,
          body: JSON.stringify(body),
          headers: { Authorization: `Bearer ${tokenRef.current}` },
        });
      });
    };

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

        flushQueue(client);
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
      pendingQueueRef.current = [];
    };
  }, [subscribeTopic, sendDestination]);

  const sendMessage = useCallback(
    (body) => {
      if (!sendDestination) return;

      if (clientRef.current?.connected && tokenRef.current) {
        clientRef.current.publish({
          destination: sendDestination,
          body: JSON.stringify(body),
          headers: { Authorization: `Bearer ${tokenRef.current}` },
        });
      } else {
        console.warn("WebSocket 미연결 상태 — 연결 후 자동 전송됩니다.");
        pendingQueueRef.current.push(body);
      }
    },
    [sendDestination],
  );

  return { sendMessage };
};

export default useWebSocket;
