import AxiosInstance from "./AxiosInstance";

const TradeApi = {
  // 직거래 생성
  createDirectTrade: (data) => AxiosInstance.post("/api/trades", data),

  // 원페이 결제 거래 생성
  createWonPayTrade: (itemId) =>
    AxiosInstance.post("/api/trades", {
      itemId,
      paymentMethod: "WONPAY",
    }),

  // 포트원 외부 결제 거래 생성
  createPortOneTrade: (itemId, paymentId) =>
    AxiosInstance.post("/api/trades", {
      itemId,
      paymentMethod: "PORTONE",
      paymentId,
    }),

  // 구매 확정 / 거래 완료
  confirmTrade: (tradeId) =>
    AxiosInstance.post(`/api/trades/${tradeId}/confirm`),
};

export default TradeApi;
