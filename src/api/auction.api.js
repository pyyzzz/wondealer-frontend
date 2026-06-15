import axios from "axios";
import Common from "../utils/Common";
import AxiosInstance from "./AxiosInstance";

// 토큰이 필요 없는 퍼블릭 요청용 axios 인스턴스 생성
const publicApi = axios.create({ baseURL: Common.API_URL });

// ────────────────────────────────────────────────────────
// 1. AuthApi (인증 관련 API)
// ────────────────────────────────────────────────────────
export const AuthApi = {
  login: (data) => axios.post(`${Common.API_URL}/auth/login`, data),
  signup: (data) => axios.post(`${Common.API_URL}/auth/signup`, data),
  reissue: (accessToken, refreshToken) =>
    axios.post(`${Common.API_URL}/auth/reissue`, { accessToken, refreshToken }),
  logout: () => axios.post(`${Common.API_URL}/auth/logout`),

  // ── 구글 OAuth2 인가 코드(Code) 방식 ────────────────────────
  // 수정된 백엔드 GET /auth/google?code=... 주소로 요청을 정확히 전달합니다.
  googleLoginWithCode: (code) => {
    return axios.get(`${Common.API_URL}/auth/google?code=${code}`);
  },

  // ── 구글 OAuth2 (GSI · ID Token 방식) ────────────────────────
  initGoogleLogin: (callback) => {
    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: (response) => callback(response.credential),
    });
  },

  renderGoogleButton: (elementId, options = {}) => {
    window.google.accounts.id.renderButton(document.getElementById(elementId), {
      theme: "outline",
      size: "large",
      text: "signin_with",
      ...options,
    });
  },

  promptOneTap: () => {
    window.google.accounts.id.prompt();
  },

  googleLoginWithIdToken: (idToken) =>
    axios.post(`${Common.API_URL}/auth/oauth2/google`, { idToken }),
};

// ────────────────────────────────────────────────────────
// 2. AuctionApi (경매 관련 API)
// ────────────────────────────────────────────────────────
export const AuctionApi = {
  // ── 경매 목록 조회 (최근 매물 로드 등)
  getAuctions: (params) => publicApi.get("/api/auctions", { params }),

  // ── 경매 단건 조회
  getAuction: (auctionId) => publicApi.get(`/api/auctions/${auctionId}`),

  // ── 경매 등록 (이미지 업로드용 multipart/form-data 적용)
  createAuction: (data) =>
    AxiosInstance.post("/api/items/auction", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // ── 경매 삭제 / 취소
  cancelAuction: (auctionId) =>
    AxiosInstance.delete(`/api/auctions/${auctionId}`),

  // ── 입찰 내역 조회
  getBids: (auctionId) => publicApi.get(`/api/auctions/${auctionId}/bids`),

  // ── 입찰하기
  placeBid: (auctionId, amount) =>
    AxiosInstance.post(`/api/auctions/${auctionId}/bids`, { amount }),

  // ── 즉시 낙찰
  instantBuy: (auctionId) =>
    AxiosInstance.post(`/api/auctions/${auctionId}/instant-buy`),

  // ── [기존 기능 유지] 내 경매 목록 (마이페이지)
  getMyAuctions: (params) => AxiosInstance.get("/api/auctions/my", { params }),

  // ── [기존 기능 유지] 내가 입찰한 경매 목록 (마이페이지)
  getMyBids: (params) => AxiosInstance.get("/api/auctions/my-bids", { params }),
};

// 기본 객체로 묶어서 통합 내보내기
export default { AuthApi, AuctionApi };
