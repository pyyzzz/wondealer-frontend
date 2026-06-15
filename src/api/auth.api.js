import axios from "axios";
import Common from "../utils/Common";
import AxiosInstance from "./AxiosInstance";

// ────────────────────────────────────────────────────────
// 1. AuthApi (인증 관련 API)
// ────────────────────────────────────────────────────────
export const AuthApi = {
  login: (data) => axios.post(`${Common.API_URL}/auth/login`, data),
  signup: (data) => axios.post(`${Common.API_URL}/auth/signup`, data),
  reissue: (accessToken, refreshToken) =>
    axios.post(`${Common.API_URL}/auth/reissue`, { accessToken, refreshToken }),
  logout: () => axios.post(`${Common.API_URL}/auth/logout`),

  googleLoginWithCode: (code) => {
    return axios.get(`${Common.API_URL}/auth/google?code=${code}`);
  },

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
  // ── 경매 목록 조회
  getAuctions: (params) => AxiosInstance.get("/auctions", { params }),

  // ── 경매 단건 조회
  getAuction: (id) => AxiosInstance.get(`/auctions/${id}`),

  // ── 경매 등록 (FormData 전송을 위해 headers 추가 설정)
  createAuction: (formData) =>
    AxiosInstance.post("/auctions", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // ── 경매 수정
  updateAuction: (id, data) => AxiosInstance.put(`/auctions/${id}`, data),

  // ── 경매 삭제
  deleteAuction: (id) => AxiosInstance.delete(`/auctions/${id}`),

  // ── 입찰 내역 조회
  getAuctionBids: (id, params) =>
    AxiosInstance.get(`/auctions/${id}/bids`, { params }),

  // ── 입찰하기
  placeBid: (id, data) => AxiosInstance.post(`/auctions/${id}/bids`, data),

  // ── 즉시 낙찰
  buyNow: (id) => AxiosInstance.post(`/auctions/${id}/buy-now`),

  // ── 내 경매 목록 (마이페이지)
  getMyAuctions: (params) => AxiosInstance.get("/auctions/my", { params }),

  // ── 내가 입찰한 경매 목록 (마이페이지)
  getMyBids: (params) => AxiosInstance.get("/auctions/my-bids", { params }),

  // ── 경매 조기 종료 (판매자)
  closeAuction: (id) => AxiosInstance.post(`/auctions/${id}/close`),
};

// ────────────────────────────────────────────────────────
// 3. Default Export (기본 내보내기 설정)
// ────────────────────────────────────────────────────────
// 프론트엔드 컴포넌트에서 import AuctionApi from "..."; 로 가져올 때
// AuctionApi 내부의 함수(createAuction 등)와 AuthApi를 모두 곧바로 사용할 수 있도록
// 평탄화(Flatten)해서 내보냅니다.
export default {
  ...AuctionApi,
  ...AuthApi,
  AuctionApi, // 구조 분해 할당(Destructuring) 대비용
  AuthApi, // 구조 분해 할당 대비용
};
