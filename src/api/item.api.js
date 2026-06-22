import AxiosInstance from "./AxiosInstance";

const ItemApi = {
  getGames: () => AxiosInstance.get("/api/games"),
  getGameServers: (gameId) => AxiosInstance.get(`/api/games/${gameId}/servers`),
  getCategories: (gameId) =>
    AxiosInstance.get(`/api/games/${gameId}/categories`),

  getItems: (params) => AxiosInstance.get("/api/items", { params }),
  getItem: (itemId) => AxiosInstance.get(`/api/items/${itemId}`),
  createDirectItem: (data) => AxiosInstance.post("/api/items", data),
  updateItem: (itemId, data) =>
    AxiosInstance.patch(`/api/items/${itemId}`, data),
  deleteItem: (itemId) => AxiosInstance.delete(`/api/items/${itemId}`),

  purchaseItem: (itemId) => AxiosInstance.post(`/api/items/${itemId}/purchase`),
  addWishlist: (itemId) => AxiosInstance.post(`/api/items/${itemId}/wishlist`),
  removeWishlist: (itemId) =>
    AxiosInstance.delete(`/api/items/${itemId}/wishlist`),
};

export default ItemApi;
