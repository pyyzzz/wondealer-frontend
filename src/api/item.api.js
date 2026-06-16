import axios from "axios";
import AxiosInstance from "./AxiosInstance";
import Common from "../utils/Common";

// 인증 불필요한 공개 API용
const publicApi = axios.create({ baseURL: Common.API_URL });

const ItemApi = {
  getGames: () => AxiosInstance.get("/api/games"),

  getGameServers: (gameId) => AxiosInstance.get(`/api/games/${gameId}/servers`),

  getCategories: (gameId) =>
    AxiosInstance.get(`/api/games/${gameId}/categories`),

  getItem: (itemId) => AxiosInstance.get(`/api/items/${itemId}`),

  createDirectItem: (data) => AxiosInstance.post("/api/items/direct", data),

  updateItem: (itemId, data) =>
    AxiosInstance.patch(`/api/items/${itemId}`, data),

  deleteItem: (itemId) => AxiosInstance.delete(`/api/items/${itemId}`),
};

export default ItemApi;
