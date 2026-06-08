import axios from "axios";

const Common = {
  // ── 백엔드 주소 ────────────────────────────────────────────
  API_URL: "http://localhost:8111",

  // ── 토스페이먼츠 클라이언트 키 ─────────────────────────────
  TOSS_CLIENT_KEY: process.env.REACT_APP_TOSS_CLIENT_KEY,

  // ── Access Token 관리 (localStorage) ──────────────────────
  getAccessToken: () => localStorage.getItem("accessToken"),
  setAccessToken: (token) => localStorage.setItem("accessToken", token),

  // ── Refresh Token 관리 (localStorage) ─────────────────────
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  setRefreshToken: (token) => localStorage.setItem("refreshToken", token),

  // ── 유저 정보 관리 ─────────────────────────────────────────
  getNickname: () => localStorage.getItem("nickname"),
  setNickname: (nickname) => localStorage.setItem("nickname", nickname),

  // ── 로컬스토리지 전체 초기화 (로그아웃 시 호출) ────────────
  clearStorage: () => localStorage.clear(),

  // ── 401 에러 시 Access Token 자동 재발급 ───────────────────
  // AxiosInstance 응답 인터셉터에서 401 발생 시 호출
  // 성공: 새 토큰 저장 후 true 반환 → 원본 요청 재시도
  // 실패: localStorage 초기화 후 false 반환 → 로그인 페이지 이동
  handleUnauthorized: async () => {
    try {
      const res = await axios.post(`${Common.API_URL}/auth/reissue`, {
        accessToken: Common.getAccessToken(),
        refreshToken: Common.getRefreshToken(),
      });
      // 백엔드 응답 구조: { success, message, data: { accessToken, refreshToken } }
      Common.setAccessToken(res.data.data.accessToken);
      Common.setRefreshToken(res.data.data.refreshToken);
      return true;
    } catch (err) {
      console.error("Refresh Token 만료. 재로그인 필요.");
      Common.clearStorage();
      return false;
    }
  },
};

export default Common;
