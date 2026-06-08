import axios from "axios";
import AxiosInstance from "./AxiosInstance";
import Common from "../utils/Common";

const publicApi = axios.create({ baseURL: Common.API_URL });

// ── 경매 API ──────────────────────────────────
const AuctionApi = {

  // GET /api/auctions — 경매 목록 조회
  getAuctions: (params) =>
    // TODO: 프론트B 구현
    // params: { gameId, categoryId, status, page, size }
    publicApi.get("/api/auctions", { params }),

  // GET /api/auctions/:auctionId — 경매 상세 조회
  getAuction: (auctionId) =>
    // TODO: 프론트B 구현
    publicApi.get(`/api/auctions/${auctionId}`),

  // POST /api/items/auction — 경매 등록
  createAuction: (data) =>
    // TODO: 프론트B 구현
    // data: FormData (이미지 포함 + 경매 설정)
    AxiosInstance.post("/api/items/auction", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // DELETE /api/auctions/:auctionId — 경매 취소 (입찰자 없을 때만)
  cancelAuction: (auctionId) =>
    // TODO: 프론트B 구현
    AxiosInstance.delete(`/api/auctions/${auctionId}`),

  // GET /api/auctions/:auctionId/bids — 입찰 내역 조회
  getBids: (auctionId) =>
    // TODO: 프론트B 구현
    publicApi.get(`/api/auctions/${auctionId}/bids`),

  // POST /api/auctions/:auctionId/instant-buy — 즉시 낙찰
  instantBuy: (auctionId) =>
    // TODO: 프론트B 구현
    AxiosInstance.post(`/api/auctions/${auctionId}/instant-buy`),
};

export default AuctionApi;
