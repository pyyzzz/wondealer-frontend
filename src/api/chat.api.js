import AxiosInstance from "./AxiosInstance";

// ── 채팅 API ──────────────────────────────────
// 채팅 실시간 통신은 hooks/useWebSocket.js (STOMP) 사용
// 이 파일은 채팅방 생성/조회 REST API만 담당
const ChatApi = {

  // POST /api/chat/rooms — 채팅방 생성 (문의하기 버튼 클릭 시)
  createChatRoom: (itemId) =>
    // TODO: 프론트B 구현
    AxiosInstance.post("/api/chat/rooms", { itemId }),

  // GET /api/chat/rooms — 내 채팅방 목록 조회
  getChatRooms: () =>
    // TODO: 프론트B 구현
    AxiosInstance.get("/api/chat/rooms"),

  // GET /api/chat/rooms/:chatRoomId/messages — 채팅 메시지 내역 조회
  getChatMessages: (chatRoomId, params) =>
    // TODO: 프론트B 구현
    // params: { page, size }
    AxiosInstance.get(`/api/chat/rooms/${chatRoomId}/messages`, { params }),

  // PATCH /api/chat/rooms/:chatRoomId/read — 메시지 읽음 처리
  readMessages: (chatRoomId) =>
    // TODO: 프론트B 구현
    AxiosInstance.patch(`/api/chat/rooms/${chatRoomId}/read`),
};

export default ChatApi;
