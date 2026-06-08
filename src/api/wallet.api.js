import AxiosInstance from "./AxiosInstance";

// ── WonPay API ────────────────────────────────
const WalletApi = {
  // GET /api/wallet — 내 WonPay 잔액 조회
  getWallet: () =>
    // TODO: 프론트B 구현
    AxiosInstance.get("/api/wallet"),

  // GET /api/wallet/history — 거래 내역 조회
  getWalletHistory: (params) =>
    // TODO: 프론트B 구현
    // params: { page, size }
    AxiosInstance.get("/api/wallet/history", { params }),

  // POST /api/wallet/charge — WonPay 충전 (토스 결제 후 호출)
  chargeWallet: (data) =>
    // TODO: 프론트B 구현
    // data: { paymentKey, orderId, amount }
    AxiosInstance.post("/api/wallet/charge", data),

  // POST /api/wallet/withdraw — 출금 신청
  withdrawWallet: (data) =>
    // TODO: 프론트B 구현
    // data: { amount }
    AxiosInstance.post("/api/wallet/withdraw", data),

  // POST /api/payments/request — 토스 결제 요청 (일반 거래)
  requestPayment: (data) =>
    // TODO: 프론트B 구현
    // data: { itemId, paymentMethod }
    AxiosInstance.post("/api/payments/request", data),

  // POST /api/payments/confirm — 토스 결제 승인
  confirmPayment: (data) =>
    // TODO: 프론트B 구현
    // data: { paymentKey, orderId, amount }
    AxiosInstance.post("/api/payments/confirm", data),
};

export default WalletApi;
