import AxiosInstance from "./AxiosInstance";

export const AuctionApi = {
  getAuctions: (params) => AxiosInstance.get("/auctions", { params }),
  getAuction: (id) => AxiosInstance.get(`/auctions/${id}`),

  createAuction: (payload, imageFiles = []) => {
    const fd = new FormData();
    fd.append(
      "request",
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );
    imageFiles.forEach((f) => fd.append("images", f));
    return AxiosInstance.post("/auctions", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateAuction: (id, payload, imageFiles = []) => {
    const fd = new FormData();
    fd.append(
      "request",
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );
    imageFiles.forEach((f) => fd.append("images", f));
    return AxiosInstance.put(`/auctions/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteAuction: (id) => AxiosInstance.delete(`/auctions/${id}`),
  getAuctionBids: (id, params) =>
    AxiosInstance.get(`/auctions/${id}/bids`, { params }),
  placeBid: (id, data) => AxiosInstance.post(`/auctions/${id}/bids`, data),
  buyNow: (id) => AxiosInstance.post(`/auctions/${id}/buy-now`),
  instantBuy: (id) => AxiosInstance.post(`/auctions/${id}/buy-now`),
  getBids: (id) => AxiosInstance.get(`/auctions/${id}/bids`),
  getMyAuctions: (params) => AxiosInstance.get("/auctions/my", { params }),
  getMyBids: (params) => AxiosInstance.get("/auctions/my-bids", { params }),
  closeAuction: (id) => AxiosInstance.post(`/auctions/${id}/close`),
};

export default AuctionApi;
