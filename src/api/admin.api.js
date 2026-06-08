import AxiosInstance from "./AxiosInstance";

// ── 관리자 API ───────────────────────────────────
// 모든 요청에 ROLE_ADMIN 권한 필요
const AdminApi = {

  // ── 회원 관리 ──────────────────────────────────────────────
  // GET /api/admin/members — 전체 회원 목록
  getMembers: (params) =>
    AxiosInstance.get("/api/admin/members", { params }),

  // POST /api/admin/members/:memberId/ban — 회원 정지
  banMember: (memberId, data) =>
    // data: { reason }
    AxiosInstance.post(`/api/admin/members/${memberId}/ban`, data),

  // POST /api/admin/members/:memberId/unban — 정지 해제
  unbanMember: (memberId) =>
    AxiosInstance.post(`/api/admin/members/${memberId}/unban`),

  // ── 상품 관리 ──────────────────────────────────────────────
  // DELETE /api/admin/items/:itemId — 상품 강제 삭제
  deleteItem: (itemId) =>
    AxiosInstance.delete(`/api/admin/items/${itemId}`),

  // ── 게임 관리 ──────────────────────────────────────────────
  // POST /api/admin/games — 게임 추가
  createGame: (data) =>
    AxiosInstance.post("/api/admin/games", data),

  // PATCH /api/admin/games/:gameId — 게임 수정/비활성화
  updateGame: (gameId, data) =>
    AxiosInstance.patch(`/api/admin/games/${gameId}`, data),

  // ── 서버 관리 ──────────────────────────────────────────────
  // POST /api/admin/games/:gameId/servers — 서버 추가
  createServer: (gameId, data) =>
    AxiosInstance.post(`/api/admin/games/${gameId}/servers`, data),

  // PATCH /api/admin/servers/:serverId — 서버 수정/비활성화
  updateServer: (serverId, data) =>
    AxiosInstance.patch(`/api/admin/servers/${serverId}`, data),

  // ── 카테고리 관리 ──────────────────────────────────────────
  // POST /api/admin/categories — 카테고리 추가
  createCategory: (data) =>
    AxiosInstance.post("/api/admin/categories", data),

  // PATCH /api/admin/categories/:categoryId — 카테고리 수정
  updateCategory: (categoryId, data) =>
    AxiosInstance.patch(`/api/admin/categories/${categoryId}`, data),
};

export default AdminApi;
