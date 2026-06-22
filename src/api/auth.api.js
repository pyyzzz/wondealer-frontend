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

  // 이메일 인증 링크 발송
  sendVerifyEmail: (email) =>
    axios.post(`${Common.API_URL}/auth/email/send`, { email }),

  // 토큰으로 이메일 인증 처리
  verifyEmail: (token) =>
    axios.post(`${Common.API_URL}/auth/email/verify`, { token }),

  // 이메일 인증 완료 여부 폴링용 (SignUpPage에서 5초마다 호출)
  // 백엔드: GET /auth/email/verified?email=xxx → { verified: true/false }
  checkEmailVerified: (email) =>
    axios
      .get(`${Common.API_URL}/auth/email/verified`, {
        params: { email },
      })
      .then((r) => r.data),

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
  getAuctions: (params) => AxiosInstance.get("/api/auctions", { params }),
  getAuction: (id) => AxiosInstance.get(`/api/auctions/${id}`),
  createAuction: (payload) => AxiosInstance.post("/api/items/auction", payload),
  updateAuction: (id, data) => AxiosInstance.put(`/api/auctions/${id}`, data),
  deleteAuction: (id) => AxiosInstance.delete(`/api/auctions/${id}`),
  getAuctionBids: (id, params) =>
    AxiosInstance.get(`/api/auctions/${id}/bids`, { params }),
  placeBid: (id, data) => AxiosInstance.post(`/api/auctions/${id}/bids`, data),
  buyNow: (id, amount) =>
    AxiosInstance.post(`/api/auctions/${id}/bids`, { bidPrice: amount }),
  getMyAuctions: (params) => AxiosInstance.get("/api/auctions/my", { params }),
  getMyBids: (params) => AxiosInstance.get("/api/auctions/my-bids", { params }),
  closeAuction: (id) => AxiosInstance.post(`/api/auctions/${id}/settle`),
};

// ────────────────────────────────────────────────────────
// 3. Default Export
// ────────────────────────────────────────────────────────
export default {
  ...AuctionApi,
  ...AuthApi,
  AuctionApi,
  AuthApi,
};
