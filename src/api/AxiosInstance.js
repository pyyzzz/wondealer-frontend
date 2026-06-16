import axios from "axios";
import Common from "../utils/Common";

const AxiosInstance = axios.create({
  baseURL: "http://localhost:8111/api",
});

// 요청 인터셉터 — Access Token 자동 첨부
AxiosInstance.interceptors.request.use(
  (config) => {
    const token = Common.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 인터셉터 — 401 시 토큰 재발급 후 재시도
AxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const accessToken = Common.getAccessToken();
        const refreshToken = Common.getRefreshToken();
        if (!refreshToken) {
          Common.clearStorage();
          window.location.href = "/login";
          return Promise.reject(error);
        }
        const res = await axios.post(`${Common.API_URL}/auth/reissue`, {
          accessToken,
          refreshToken,
        });
        const newAccess = res.data?.data?.accessToken || res.data?.accessToken;
        if (newAccess) {
          Common.setAccessToken(newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return AxiosInstance(originalRequest);
        }
      } catch {
        Common.clearStorage();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default AxiosInstance;
