import axios from "axios";
import AxiosInstance from "./AxiosInstance";
import Common from "../utils/Common";

const publicApi = axios.create({ baseURL: Common.API_URL });

const ItemApi = {
  getGames: () => publicApi.get("/api/games"),
  getGameServers: (gameId) => publicApi.get(`/api/games/${gameId}/servers`),
  getCategories: (gameId) => publicApi.get(`/api/games/${gameId}/categories`),

  getItem: (itemId) => AxiosInstance.get(`/api/items/${itemId}`),
  createDirectItem: (data) => AxiosInstance.post("/api/items/direct", data),
  updateItem: (itemId, data) =>
    AxiosInstance.patch(`/api/items/${itemId}`, data),
  deleteItem: (itemId) => AxiosInstance.delete(`/api/items/${itemId}`),
};

export default ItemApi;
