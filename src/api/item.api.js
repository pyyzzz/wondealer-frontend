import axios from "axios";
import AxiosInstance from "./AxiosInstance";
import Common from "../utils/Common";

// 인증 불필요한 공개 API용
const publicApi = axios.create({ baseURL: Common.API_URL });

const ItemApi = {
  // 공개 API — 토큰 불필요
  getGames: () => publicApi.get("/api/games"),

  getGameServers: (gameId) => publicApi.get(`/api/games/${gameId}/servers`),

  getCategories: (gameId) => publicApi.get(`/api/games/${gameId}/categories`),

  // 인증 필요 — AxiosInstance 사용
  getItems: (params) => AxiosInstance.get("/api/items", { params }),

  getItem: (itemId) => AxiosInstance.get(`/api/items/${itemId}`),

  createDirectItem: (data) => AxiosInstance.post("/api/items/direct", data),

  updateItem: (itemId, data) =>
    AxiosInstance.patch(`/api/items/${itemId}`, data),

  deleteItem: (itemId) => AxiosInstance.delete(`/api/items/${itemId}`),
};

export default ItemApi;
