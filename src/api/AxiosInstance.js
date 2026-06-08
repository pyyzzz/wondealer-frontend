import axios from "axios";
import Common from "../utils/Common";

// 인증이 필요한 API 요청에 사용하는 axios 인스턴스
// 모든 요청에 JWT Access Token 자동 첨부
const AxiosInstance = axios.create({
  baseURL: Common.API_URL,
});

// 요청 인터셉터 — 모든 요청 헤더에 Access Token 자동 첨부
AxiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = Common.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 — 401 발생 시 Access Token 재발급 후 원본 요청 재시도
AxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 재시도 방지

      const isRefreshed = await Common.handleUnauthorized();

      if (isRefreshed) {
        // 새 Access Token으로 원본 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${Common.getAccessToken()}`;
        return axios(originalRequest);
      }

      // 재발급 실패 → 로그인 페이지로 이동
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default AxiosInstance;
