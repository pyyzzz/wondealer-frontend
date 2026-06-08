import axios from "axios";
import AxiosInstance from "./AxiosInstance";
import Common from "../utils/Common";

const publicApi = axios.create({ baseURL: Common.API_URL });

// ── 게임/카테고리/상품 API ────────────────────
const ItemApi = {

  // GET /api/games — 게임 목록 조회
  getGames: () =>
    // TODO: 프론트A 구현
    publicApi.get("/api/games"),

  // GET /api/games/:gameId/servers — 게임 서버 목록
  getGameServers: (gameId) =>
    // TODO: 프론트A 구현
    publicApi.get(`/api/games/${gameId}/servers`),

  // GET /api/games/:gameId/categories — 게임 카테고리 목록
  getCategories: (gameId) =>
    // TODO: 프론트A 구현
    publicApi.get(`/api/games/${gameId}/categories`),

  // GET /api/items — 상품 목록 조회 (필터/검색/페이지네이션)
  getItems: (params) =>
    // TODO: 프론트A 구현
    // params: { gameId, categoryId, serverId, keyword, page, size }
    publicApi.get("/api/items", { params }),

  // GET /api/items/:itemId — 상품 상세 조회
  getItem: (itemId) =>
    // TODO: 프론트A 구현
    publicApi.get(`/api/items/${itemId}`),

  // POST /api/items — 일반 판매 등록
  createItem: (data) =>
    // TODO: 프론트A 구현
    // data: FormData (이미지 포함)
    AxiosInstance.post("/api/items", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // PATCH /api/items/:itemId — 상품 수정
  updateItem: (itemId, data) =>
    // TODO: 프론트A 구현
    AxiosInstance.patch(`/api/items/${itemId}`, data),

  // DELETE /api/items/:itemId — 상품 삭제
  deleteItem: (itemId) =>
    // TODO: 프론트A 구현
    AxiosInstance.delete(`/api/items/${itemId}`),
};

export default ItemApi;
