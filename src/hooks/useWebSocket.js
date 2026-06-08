import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Common from "../utils/Common";

/**
 * STOMP WebSocket 커스텀 훅
 *
 * 사용 예시:
 *   경매: useWebSocket("/topic/auction/7", "/app/auction/7/bid", onMessage)
 *   채팅: useWebSocket("/topic/chat/3", "/app/chat/3", onMessage)
 *
 * @param {string} subscribeTopic  - 구독할 토픽 경로
 * @param {string} sendDestination - 메시지 전송 경로
 * @param {function} onMessage     - 메시지 수신 시 콜백
 */
const useWebSocket = (subscribeTopic, sendDestination, onMessage) => {
  const clientRef = useRef(null);

  useEffect(() => {
    // TODO: 프론트B 구현
    // 1. STOMP 클라이언트 생성
    // 2. SockJS로 /ws 연결
    // 3. subscribeTopic 구독
    // 4. 메시지 수신 시 onMessage 콜백 호출
    // 5. 컴포넌트 언마운트 시 연결 해제

  }, [subscribeTopic]);

  // 메시지 전송 함수 반환
  const sendMessage = (body) => {
    // TODO: 프론트B 구현
    // clientRef.current.publish({ destination: sendDestination, body: JSON.stringify(body) })
  };

  return { sendMessage };
};

export default useWebSocket;
