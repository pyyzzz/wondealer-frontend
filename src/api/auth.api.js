import axios from "axios";
import AxiosInstance from "./AxiosInstance";
import Common from "../utils/Common";

// 인증이 필요 없는 공개 API 전용 인스턴스
const publicApi = axios.create({ baseURL: Common.API_URL });

// ── 인증 API ──────────────────────────────────
const AuthApi = {

  // POST /auth/signup — 회원가입
  signup: (data) =>
    // TODO: 백엔드A 구현
    // data: { username, name, nickname, email, password }
    publicApi.post("/auth/signup", data),

  // POST /auth/login — 로그인 (identifier: username 또는 email)
  login: (identifier, password) =>
    // TODO: 백엔드A 구현
    publicApi.post("/auth/login", { identifier, password }),

  // POST /auth/reissue — Access Token 재발급
  reissue: (accessToken, refreshToken) =>
    publicApi.post("/auth/reissue", { accessToken, refreshToken }),

  // POST /auth/logout — 로그아웃
  logout: () =>
    // TODO: 백엔드A 구현
    AxiosInstance.post("/auth/logout"),

  // POST /auth/find-username — 아이디 찾기
  findUsername: (name, email) =>
    // TODO: 백엔드A 구현
    publicApi.post("/auth/find-username", { name, email }),

  // POST /auth/reset-password — 임시 비밀번호 발급
  resetPassword: (email) =>
    // TODO: 백엔드A 구현
    publicApi.post("/auth/reset-password", { email }),

  // POST /auth/email/send — 이메일 인증 발송
  sendEmailVerification: (email) =>
    // TODO: 백엔드A 구현
    publicApi.post("/auth/email/send", null, { params: { email } }),

  // GET /auth/email/verify — 이메일 인증 확인
  verifyEmail: (token) =>
    // TODO: 백엔드A 구현
    publicApi.get("/auth/email/verify", { params: { token } }),
};

export default AuthApi;
