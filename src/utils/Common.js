import axios from "axios";

const Common = {
  // CRA 환경변수: REACT_APP_ 접두사 사용
  // 개발 환경: package.json의 "proxy" 설정으로 백엔드 프록시
  // 프로덕션: REACT_APP_API_URL 환경변수로 백엔드 URL 지정
  API_URL: process.env.REACT_APP_API_URL || "",

  // 토스페이먼츠 클라이언트 키
  TOSS_CLIENT_KEY: process.env.REACT_APP_TOSS_CLIENT_KEY || "",

  // Access Token 관리
  getAccessToken: () => localStorage.getItem("accessToken"),
  setAccessToken: (token) => localStorage.setItem("accessToken", token),

  // Refresh Token 관리
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  setRefreshToken: (token) => localStorage.setItem("refreshToken", token),

  // 유저 정보 관리
  getNickname: () => localStorage.getItem("nickname"),
  setNickname: (nickname) => localStorage.setItem("nickname", nickname),
  getRole: () => localStorage.getItem("role"),
  setRole: (role) => localStorage.setItem("role", role),

  // 로컬스토리지 전체 초기화 (로그아웃 시 호출)
  clearStorage: () => localStorage.clear(),

  // 401 에러 시 Access Token 자동 재발급
  handleUnauthorized: async () => {
    try {
      const res = await axios.post(`${Common.API_URL}/auth/reissue`, {
        accessToken: Common.getAccessToken(),
        refreshToken: Common.getRefreshToken(),
      });
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
