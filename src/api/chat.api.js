import AxiosInstance from "./AxiosInstance";

// ── 채팅 API ──────────────────────────────────
// 채팅 실시간 통신은 hooks/useWebSocket.js (STOMP) 사용
// 이 파일은 채팅방 생성/조회 + 거래(결제/인수) REST API를 담당
const ChatApi = {
  // POST /api/items/:itemId/inquiry — 문의 채팅방 생성 (채팅으로 거래하기 클릭 시)
  // 명세서 기준 경로로 변경: 기존 방이 있으면 isNew:false 로 기존 방을 그대로 반환함
  createChatRoom: (itemId) => AxiosInstance.post("/api/chat/rooms", { itemId }),

  // GET /api/chat/rooms — 내 채팅방 목록 조회
  getChatRooms: (params) =>
    // params: { page, size }
    AxiosInstance.get("/api/chat/rooms", { params }),

  // GET /api/chat/rooms/:chatRoomId/messages — 채팅 메시지 내역 조회
  getChatMessages: (chatRoomId, params) =>
    // params: { page, size }
    AxiosInstance.get(`/api/chat/rooms/${chatRoomId}/messages`, { params }),

  // PATCH /api/chat/rooms/:chatRoomId/read — 메시지 읽음 처리
  readMessages: (chatRoomId) =>
    AxiosInstance.patch(`/api/chat/rooms/${chatRoomId}/read`),

  // POST /api/chat/rooms/:chatRoomId/pay — 결제하기 (마일리지 차감 + Trade 생성)
  payForRoom: (chatRoomId, method) =>
    // method: "mileage" (카드 결제는 추후 연동)
    AxiosInstance.post(`/api/chat/rooms/${chatRoomId}/pay`, { method }),

  // POST /api/chat/rooms/:chatRoomId/complete — 인수하기 (거래 확정 + 판매자 마일리지 이관)
  completeRoom: (chatRoomId) =>
    AxiosInstance.post(`/api/chat/rooms/${chatRoomId}/complete`),
};

export default ChatApi;
