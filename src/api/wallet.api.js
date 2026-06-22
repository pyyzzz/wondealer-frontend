import AxiosInstance from "./AxiosInstance";

// ── WonPay API ────────────────────────────────
const WalletApi = {
  // GET /api/wallet — 내 WonPay 잔액 조회
  getWallet: () =>
    // TODO: 프론트B 구현
    AxiosInstance.get("/api/wallet"),

  // GET /api/wallet/history — 거래 내역 조회
  getWalletHistory: (params) =>
    // params: { page, size }
    AxiosInstance.get("/api/wallet/history", { params }),

  // POST /api/wallet/charges/ready — WonPay 충전 준비(포트원 결제창 호출 전 백엔드 고유 ID 생성)
  prepareCharge: (data) =>
    // data: { amount }
    AxiosInstance.post("/api/wallet/charges/ready", data),

  // POST /api/wallet/charges/complete — WonPay 충전 완료 검증 (포트원 결제 성공 후 최종 잔액 반영)
  completeCharge: (data) =>
    // data: { paymentId }
    AxiosInstance.post("/api/wallet/charges/complete", data),

  // POST /api/wallet/withdraw — 출금 신청
  withdrawWallet: (data) =>
    // data: { amount }
    AxiosInstance.post("/api/wallet/withdraw", data),

  // 마일리지 결제용 API 추가
  payWithWonpay: (data) =>
    // data : { productId, amount }
    AxiosInstance.post("/api/payments/wonpay", data),

  // POST /api/payments/request — 토스 결제 요청 (일반 거래 - 필요시 유지)
  requestPayment: (data) =>
    // data: { itemId, paymentMethod }
    AxiosInstance.post("/api/payments/request", data),

  // POST /api/payments/confirm — 토스 결제 승인 (일반 거래 - 필요시 유지)
  confirmPayment: (data) =>
    // data: { paymentKey, orderId, amount }
    AxiosInstance.post("/api/payments/confirm", data),
};

export default WalletApi;
