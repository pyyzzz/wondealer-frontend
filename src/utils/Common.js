import axios from "axios";
import { ADMIN_LOCAL_KEYS } from "./adminLocalState";

const Common = {
  API_URL: "http://localhost:8111",
  TOSS_CLIENT_KEY: process.env.REACT_APP_TOSS_CLIENT_KEY || "",

  getAccessToken: () => localStorage.getItem("accessToken"),
  setAccessToken: (token) => localStorage.setItem("accessToken", token),

  getRefreshToken: () => localStorage.getItem("refreshToken"),
  setRefreshToken: (token) => localStorage.setItem("refreshToken", token),

  getNickname: () => localStorage.getItem("nickname"),
  setNickname: (nickname) => localStorage.setItem("nickname", nickname),
  getRole: () => localStorage.getItem("role"),
  setRole: (role) => localStorage.setItem("role", role),

  clearStorage: () => {
    const PRESERVED_LOCAL_KEYS = [
      ...ADMIN_LOCAL_KEYS,
      "wondealerBankInfo",
      "wondealerProfileImage",
    ];
    const PRESERVED_PREFIXES = [
      "wondealerSettledAuction:",
      "wondealerAuctionBids:",
      "wondealerCompletedChatRoom:",
    ];
    const preserved = [
      ...PRESERVED_LOCAL_KEYS.map((key) => [
        key,
        localStorage.getItem(key),
      ]),
      ...Object.keys(localStorage)
        .filter((key) =>
          PRESERVED_PREFIXES.some((prefix) => key.startsWith(prefix)),
        )
        .map((key) => [key, localStorage.getItem(key)]),
    ].filter(([, value]) => value !== null);
    localStorage.clear();
    preserved.forEach(([key, value]) => localStorage.setItem(key, value));
  },

  handleUnauthorized: async () => {
    try {
      const res = await axios.post("/auth/reissue", {
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
