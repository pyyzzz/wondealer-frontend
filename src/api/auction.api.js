import AxiosInstance from "./AxiosInstance";

const AuctionApi = {
  // 목록/단건 조회
  getAuctions: (params) => AxiosInstance.get("/api/auctions", { params }),
  getAuction: (id) => AxiosInstance.get(`/api/auctions/${id}`),

  // 경매 등록 - ItemController.createAuctionItem: POST /api/items/auction
  // @RequestBody AuctionCreateReqDto (JSON, multipart 아님!)
  createAuction: (payload) => AxiosInstance.post("/api/items/auction", payload),

  // 경매 수정 - 백엔드에 별도 PUT 엔드포인트가 없다면 추후 확인 필요
  updateAuction: (id, payload) =>
    AxiosInstance.put(`/api/auctions/${id}`, payload),

  // 경매 취소
  deleteAuction: (id) => AxiosInstance.delete(`/api/auctions/${id}`),
  cancelAuction: (id) => AxiosInstance.delete(`/api/auctions/${id}`),

  // 입찰 관련
  getAuctionBids: (id, params) =>
    AxiosInstance.get(`/api/auctions/${id}/bids`, { params }),
  getBids: (id, params) =>
    AxiosInstance.get(`/api/auctions/${id}/bids`, { params }),

  placeBid: (id, amount) =>
    AxiosInstance.post(`/api/auctions/${id}/bids`, { bidPrice: amount }),
  buyNow: (id, amount) =>
    AxiosInstance.post(`/api/auctions/${id}/bids`, { bidPrice: amount }),

  getMyAuctions: (params) => AxiosInstance.get("/api/auctions/my", { params }),
  getMyBids: (params) => AxiosInstance.get("/api/auctions/my-bids", { params }),

  settleAuction: (id) => AxiosInstance.post(`/api/auctions/${id}/settle`),
  closeAuction: (id) => AxiosInstance.post(`/api/auctions/${id}/settle`),
};

export default AuctionApi;
