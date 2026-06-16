import axios from "axios";

const Common = {
  API_URL: process.env.REACT_APP_API_URL || "",
  TOSS_CLIENT_KEY: process.env.REACT_APP_TOSS_CLIENT_KEY || "",

  getAccessToken: () => localStorage.getItem("accessToken"),
  setAccessToken: (token) => localStorage.setItem("accessToken", token),

  getRefreshToken: () => localStorage.getItem("refreshToken"),
  setRefreshToken: (token) => localStorage.setItem("refreshToken", token),

  getNickname: () => localStorage.getItem("nickname"),
  setNickname: (nickname) => localStorage.setItem("nickname", nickname),
  getRole: () => localStorage.getItem("role"),
  setRole: (role) => localStorage.setItem("role", role),

  clearStorage: () => localStorage.clear(),

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
