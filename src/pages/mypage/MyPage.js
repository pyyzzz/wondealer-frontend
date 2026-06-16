import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import WalletApi from "../../api/wallet.api";
import headsetImg from "../../img/headset.JPG";
import "./MyPage.css";

// ── 아이콘 ──────────────────────────────────────────────────────
const Icon = {
  Coins: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  Activity: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Package: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  ),
  Headphones: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  ),
  User: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Upload: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  CreditCard: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  Shield: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  ShieldSm: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  AlertCircle: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  X: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ChevronRight: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevronDown: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevronUp: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  ),
  ArrowUpRight: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  ),
  ArrowDownLeft: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="17" y1="7" x2="7" y2="17" />
      <polyline points="17 17 7 17 7 7" />
    </svg>
  ),
  Edit2: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  ),
  Trash2: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  ),
  Megaphone: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 11l19-9-9 19-2-8-8-2z" />
    </svg>
  ),
  HelpCircle: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  MessageCircle: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Search: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Calendar: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Plus: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Wallet: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      <path d="M16 3l-4 4-4-4" />
    </svg>
  ),
  ArrowRight: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Check: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Info: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="8" />
      <line x1="12" y1="12" x2="12" y2="16" />
    </svg>
  ),
};

// ── 유틸 ────────────────────────────────────────────────────────
const fmt = (n) => Number(n ?? 0).toLocaleString("ko-KR");
const token = () => localStorage.getItem("accessToken");

function Badge({ children, color = "zinc" }) {
  return <span className={`mp-badge ${color}`}>{children}</span>;
}

// ── 마일리지 충전 프리셋 ─────────────────────────────────────────
const CHARGE_PRESETS = [
  { m: 10000, krw: 11000 },
  { m: 30000, krw: 33000 },
  { m: 50000, krw: 55000 },
  { m: 100000, krw: 110000 },
  { m: 500000, krw: 550000 },
];

// ── 마일리지 충전 탭 콘텐츠 (★포트원 연동 완료★) ─────────────────────────────────────
function ChargeTab({ balance, onSuccess, onBack }) {
  const [selected, setSelected] = useState(0);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mileage =
    selected !== null
      ? CHARGE_PRESETS[selected].m
      : Number(custom.replace(/\D/g, "") || 0);
  const krw = selected !== null ? CHARGE_PRESETS[selected].krw : mileage;

  const handleChargeLegacy = () => {
    if (mileage < 10000) {
      setError("최소 충전 금액은 10,000M 입니다.");
      return;
    }
    setError("");
    setLoading(true);

    // 1. 포트원 객체(IMP) 초기화 및 예외 체크
    const { IMP } = window;
    if (!IMP) {
      setError("결제 모듈을 로드할 수 없습니다. 페이지를 새로고침 해주세요.");
      setLoading(false);
      return;
    }

    // 본인의 포트원 가맹점 식별코드를 입력하세요 (예: impXXXXXXXX)
    IMP.init("개인가맹점_식별코드_입력");

    // 상점 고유 주문번호 생성 (중복 차단을 위해 유니크하게 설정)
    const merchantUid = `order_mileage_${new Date().getTime()}`;

    // 2. 포트원 결제창 파라미터 세팅
    const paymentData = {
      pg: "html5_inicis", // 포트원 콘솔에서 설정한 PG사 식별코드
      pay_method: "card", // 결제수단 (card, trans, vbank 등)
      merchant_uid: merchantUid, // 주문번호
      name: `WONDEALER 마일리지 ${fmt(mileage)}M 충전`, // 내역 표시 이름
      amount: krw, // 결제 금액 (실제 출금될 원화 KRW)
    };

    // 3. 결제창 요청 실행
    IMP.request_pay(paymentData, async (response) => {
      if (response.success) {
        // [성공] 백엔드 서버 검증 및 최종 마일리지 적립 처리 요청
        try {
          const res = await fetch("/api/mileage/charge", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token()}`,
            },
            body: JSON.stringify({
              amount: mileage, // 지급할 마일리지
              imp_uid: response.imp_uid, // 포트원 고유 거래 번호
              merchant_uid: response.merchant_uid, // 상점 고유 주문 번호
              paid_amount: response.paid_amount, // 클라이언트 실 결제액 (위변조 방지 교차체크용)
            }),
          });

          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j.message || "서버 결제 검증에 실패했습니다.");
          }

          // 마일리지 저장 및 화면 리로드 반영 호출
          onSuccess(mileage);
        } catch (err) {
          setError(`결제는 성공했으나 서버 반영 실패: ${err.message}`);
        } finally {
          setLoading(false);
        }
      } else {
        // [실패 또는 도중 취소]
        setError(`결제가 취소되었거나 실패했습니다: ${response.error_msg}`);
        setLoading(false);
      }
    });
  };

  const handleCharge = async () => {
    if (mileage < 10000) {
      setError("최소 충전 금액은 10,000M 입니다.");
      return;
    }

    if (!window.PortOne) {
      setError("포트원 결제 모듈이 로드되지 않았습니다. 페이지를 새로고침 해주세요.");
      return;
    }

    const storeId = process.env.REACT_APP_PORTONE_STORE_ID;
    const channelKey = process.env.REACT_APP_PORTONE_CHANNEL_KEY;

    if (!storeId || !channelKey) {
      setError("포트원 storeId 또는 channelKey가 설정되어 있지 않습니다.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const readyResponse = await WalletApi.prepareCharge({ amount: mileage });
      const ready = readyResponse.data?.data;

      if (!ready?.paymentId) {
        throw new Error("충전 준비 응답에서 paymentId를 찾을 수 없습니다.");
      }

      const paymentResponse = await window.PortOne.requestPayment({
        storeId,
        channelKey,
        paymentId: ready.paymentId,
        orderName: ready.orderName || `WonPay ${fmt(mileage)}M 충전`,
        totalAmount: ready.amount,
        currency: ready.currency || "CURRENCY_KRW",
        payMethod: "CARD",
      });

      if (paymentResponse?.code) {
        throw new Error(paymentResponse.message || "결제가 취소되었거나 실패했습니다.");
      }

      const completeResponse = await WalletApi.completeCharge({
        paymentId: ready.paymentId,
      });
      const chargedAmount = completeResponse.data?.data?.chargedAmount ?? mileage;

      onSuccess(chargedAmount);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "충전 처리 중 오류가 발생했습니다.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 뒤로가기 */}
      <div className="mp-support-back" onClick={onBack}>
        <Icon.ChevronLeft /> 마일리지 조회로 돌아가기
      </div>

      <div className="mp-section-title">마일리지 충전</div>
      <div className="mp-section-sub">
        보유하신 마일리지를 안전하게 충전하고 특별한 아이템들을 만나보세요.
      </div>

      {/* 현재 보유 마일리지 */}
      <div className="mp-card mp-charge-balance-card">
        <div className="mp-mileage-label">현재 보유 마일리지</div>
        <div className="mp-charge-balance-amount">
          {fmt(balance)} <span>M</span>
        </div>
      </div>

      {/* 2단 그리드 */}
      <div className="mp-charge-grid">
        {/* 왼쪽: 프리셋 */}
        <div className="mp-card">
          <div className="mp-card-title" style={{ marginBottom: 16 }}>
            충전 금액 선택
          </div>
          <div className="mp-charge-preset-grid">
            {CHARGE_PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                className={`mp-charge-preset-btn${selected === i ? " active" : ""}`}
                onClick={() => {
                  setSelected(i);
                  setCustom("");
                }}
              >
                <span className="mp-charge-preset-m">{fmt(p.m)}M</span>
                <span className="mp-charge-preset-krw">{fmt(p.krw)} KRW</span>
              </button>
            ))}
            {/* 직접 입력 */}
            <div
              className={`mp-charge-preset-btn mp-charge-custom${selected === null ? " active" : ""}`}
            >
              <input
                value={custom}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  setCustom(v);
                  setSelected(null);
                }}
                placeholder="직접 입력"
                className="mp-charge-custom-input"
              />
              <span className="mp-charge-preset-krw">M</span>
            </div>
          </div>
        </div>

        {/* 오른쪽: 요약 */}
        <div className="mp-card mp-charge-summary">
          <div className="mp-card-title" style={{ marginBottom: 20 }}>
            충전 요약
          </div>
          <div className="mp-charge-summary-rows">
            <div className="mp-charge-summary-row">
              <span>충전 마일리지</span>
              <span className="mp-charge-summary-val">{fmt(mileage)} M</span>
            </div>
            <div className="mp-charge-summary-row">
              <span>수수료 (0%)</span>
              <span>0 KRW</span>
            </div>
            <div className="mp-charge-summary-divider" />
            <div className="mp-charge-summary-row mp-charge-summary-total">
              <span>최종 결제 금액</span>
              <span className="mp-charge-summary-total-val">
                {fmt(krw)} KRW
              </span>
            </div>
          </div>

          {error && <div className="mp-charge-error">{error}</div>}

          <div className="mp-charge-terms">
            본인은 WONDEALER 마일리지 충전 약관에 동의하며, 법적 고지 사항을
            확인했습니다.
          </div>

          <div className="mp-modal-footer" style={{ marginTop: 0 }}>
            <button type="button" className="cancel" onClick={onBack}>
              취소
            </button>
            <button
              type="button"
              onClick={handleCharge}
              disabled={loading || mileage < 10000}
              style={{
                flex: 2,
                padding: "14px",
                borderRadius: 8,
                border: "none",
                color: "#ffffff",
                background: "#7c3aed",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading || mileage < 10000 ? "not-allowed" : "pointer",
                opacity: mileage < 10000 ? 0.5 : 1,
              }}
            >
              {loading ? "처리중..." : "충전하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 마일리지 출금 탭 콘텐츠 ─────────────────────────────────────
function WithdrawTab({
  balance,
  bankName,
  accountNumber,
  accountHolder,
  onSuccess,
  onBack,
}) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requested = Number(amount.replace(/\D/g, "") || 0);
  const feeRate = 0.02;
  const fee = Math.floor(requested * feeRate);
  const MIN = 10000;
  const withdrawable = Math.max(0, balance);
  const net = requested - fee;

  const handleWithdraw = async () => {
    if (requested < MIN) {
      setError(`최소 출금 금액은 ${fmt(MIN)}M 입니다.`);
      return;
    }
    if (requested > balance) {
      setError("보유 마일리지가 부족합니다.");
      return;
    }
    if (!accountNumber) {
      setError(
        "출금 계좌가 등록되어 있지 않습니다. 회원정보 수정에서 계좌를 등록해주세요.",
      );
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/mileage/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ amount: requested }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "출금 신청에 실패했습니다.");
      }
      onSuccess(requested);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 뒤로가기 */}
      <div className="mp-support-back" onClick={onBack}>
        <Icon.ChevronLeft /> 마일리지 조회로 돌아가기
      </div>

      <div className="mp-section-title">마일리지 출금 신청</div>
      <div className="mp-section-sub">
        보유하신 마일리지를 등록된 계좌로 안전하게 출금 신청하실 수 있습니다.
      </div>

      {/* 잔액 2열 카드 */}
      <div className="mp-withdraw-balance-row">
        <div className="mp-card mp-withdraw-balance-card">
          <div className="mp-mileage-label">전체 보유 마일리지</div>
          <div className="mp-withdraw-bal">
            {fmt(balance)} <span>M</span>
          </div>
        </div>
        <div className="mp-card mp-withdraw-balance-card mp-withdraw-balance-green">
          <div className="mp-mileage-label" style={{ color: "#10b981" }}>
            최대 출금 가능 마일리지
          </div>
          <div className="mp-withdraw-bal mp-withdraw-bal-green">
            {fmt(withdrawable)} <span>M</span>
          </div>
        </div>
      </div>

      {/* 하단 2단 */}
      <div className="mp-withdraw-grid">
        {/* 왼쪽: 입력 폼 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* 출금 금액 */}
          <div className="mp-card">
            <label
              className="mp-form-label"
              style={{ marginBottom: 10, display: "block" }}
            >
              출금 신청금액
            </label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div className="mp-withdraw-input-wrap">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                  placeholder="최소 10,000M 이상 입력"
                  className="mp-withdraw-input"
                />
              </div>
              <button
                type="button"
                className="mp-btn-secondary"
                onClick={() => setAmount(String(withdrawable))}
                style={{ whiteSpace: "nowrap", padding: "10px 16px" }}
              >
                전액출금
              </button>
            </div>
          </div>

          {/* 계좌 정보 */}
          <div className="mp-card">
            <label
              className="mp-form-label"
              style={{ marginBottom: 10, display: "block" }}
            >
              입금계좌 정보
            </label>
            <div className="mp-withdraw-account-box">
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div className="mp-withdraw-bank-icon">🏦</div>
                <div>
                  <div className="mp-withdraw-bank-name">
                    {bankName || "등록된 계좌 없음"}
                  </div>
                  <div className="mp-withdraw-bank-sub">
                    {accountNumber
                      ? `${accountNumber} (예금주: ${accountHolder})`
                      : "회원정보 수정에서 계좌를 등록해주세요"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 영수증 */}
          <div className="mp-card mp-withdraw-receipt">
            <div className="mp-charge-summary-row">
              <span>예상 수수료 (2%)</span>
              <span style={{ color: "#f87171" }}>- {fmt(fee)} KRW</span>
            </div>
            <div className="mp-charge-summary-divider" />
            <div className="mp-charge-summary-row mp-charge-summary-total">
              <span>최종 출금 금액</span>
              <span className="mp-charge-summary-total-val">
                {fmt(Math.max(0, net))} KRW
              </span>
            </div>
          </div>
        </div>

        {/* 오른쪽: 주의사항 + 버튼 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="mp-card mp-withdraw-notice">
            <div className="mp-card-title" style={{ marginBottom: 14 }}>
              <Icon.AlertCircle /> 출금 시 주의사항
            </div>
            <ul className="mp-withdraw-notice-list">
              <li>출금 신청은 1일 1회만 가능합니다.</li>
              <li>
                출금 신청 후 처리 완료까지 영업일 기준 최소 1~3일 정도 소요될 수
                있습니다.
              </li>
              <li>
                잘못 입력된 계좌정보는 이체 실패의 원인이 되며 자동 취소
                처리됩니다.
              </li>
            </ul>
          </div>

          {error && <div className="mp-charge-error">{error}</div>}

          <div className="mp-modal-footer" style={{ marginTop: 0 }}>
            <button type="button" className="cancel" onClick={onBack}>
              취소
            </button>
            <button
              type="button"
              onClick={handleWithdraw}
              disabled={loading || requested < MIN}
              style={{
                flex: 2,
                padding: "16px",
                borderRadius: 8,
                border: "none",
                color: "#ffffff",
                background: "#7c3aed",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading || requested < MIN ? "not-allowed" : "pointer",
                opacity: requested < MIN ? 0.5 : 1,
              }}
            >
              {loading ? "처리중..." : "출금 신청하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 탈퇴 모달 ──────────────────────────────────────────────────
function DeleteAccountModal({ onConfirm, onClose }) {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const KEYWORD = "탈퇴합니다";

  const warnings = [
    "모든 마일리지 잔액이 즉시 소멸됩니다.",
    "등록된 판매 물품이 전부 삭제됩니다.",
    "구매/판매/경매 내역 복구가 불가능합니다.",
    "동일 아이디로 재가입이 30일간 제한됩니다.",
  ];

  const handleNext = () => {
    if (confirmText !== KEYWORD) {
      setError(`"${KEYWORD}"를 정확히 입력해주세요.`);
      return;
    }
    setError("");
    setStep(2);
  };

  const handleDelete = async () => {
    if (!password.trim()) {
      setError("비밀번호를 입력해주세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/members/me", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "탈퇴 처리에 실패했습니다.");
      }
      onConfirm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mp-modal-backdrop">
      <div className="mp-modal">
        <div className="mp-modal-header">
          <div className="mp-modal-title">
            <Icon.AlertTriangle /> 계정 탈퇴
          </div>
          <button className="mp-modal-close" onClick={onClose} type="button">
            <Icon.X />
          </button>
        </div>
        <div className="mp-modal-body">
          {step === 1 ? (
            <>
              <div className="mp-warn-box">
                <div className="mp-warn-title">탈퇴 전 반드시 확인하세요</div>
                {warnings.map((w, i) => (
                  <div key={i} className="mp-warn-item">
                    <Icon.AlertCircle />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
              <div className="mp-form-group">
                <label className="mp-modal-label">
                  계속하려면 아래에 <b>"{KEYWORD}"</b>를 입력하세요
                </label>
                <input
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                    setError("");
                  }}
                  placeholder={KEYWORD}
                  className="mp-modal-input"
                />
                {error && <div className="mp-modal-error">{error}</div>}
              </div>
              <div className="mp-modal-footer">
                <button className="cancel" type="button" onClick={onClose}>
                  취소
                </button>
                <button className="confirm" type="button" onClick={handleNext}>
                  다음 단계
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mp-modal-center">
                <div className="mp-modal-shield">
                  <Icon.Shield />
                </div>
                <div className="mp-modal-center-title">본인 확인</div>
                <div className="mp-modal-center-sub">
                  계정 보호를 위해 현재 비밀번호를
                  <br />한 번 더 입력해주세요.
                </div>
              </div>
              <div className="mp-form-group">
                <label className="mp-modal-label">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="현재 비밀번호 입력"
                  className="mp-modal-input"
                  onKeyDown={(e) => e.key === "Enter" && handleDelete()}
                />
                {error && <div className="mp-modal-error">{error}</div>}
              </div>
              <div className="mp-modal-footer">
                <button
                  className="cancel"
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError("");
                    setPassword("");
                  }}
                >
                  이전
                </button>
                <button
                  className="confirm"
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? "처리중..." : "탈퇴 확정"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 마일리지 탭 ────────────────────────────────────────────────
function MileageTab({ onGoCharge, onGoWithdraw }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    items: 0,
    gameMoney: 0,
    accounts: 0,
    auctions: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const tk = token();
    try {
      const [balRes, txRes, statRes, actRes] = await Promise.allSettled([
        fetch("/api/wallet", {
          headers: { Authorization: `Bearer ${tk}` },
        }),
        fetch("/api/members/me/mileage/transactions?size=3", {
          headers: { Authorization: `Bearer ${tk}` },
        }),
        fetch("/api/members/me/stats", {
          headers: { Authorization: `Bearer ${tk}` },
        }),
        fetch("/api/members/me/activities?size=3", {
          headers: { Authorization: `Bearer ${tk}` },
        }),
      ]);

      if (balRes.status === "fulfilled" && balRes.value.ok) {
        const d = await balRes.value.json();
        setBalance(d?.data?.balance ?? d?.balance ?? 0);
      }
      if (txRes.status === "fulfilled" && txRes.value.ok) {
        const d = await txRes.value.json();
        const list = d?.data?.content ?? d?.content ?? d?.data ?? [];
        setTransactions(Array.isArray(list) ? list.slice(0, 3) : []);
      }
      if (statRes.status === "fulfilled" && statRes.value.ok) {
        const d = await statRes.value.json();
        const s = d?.data ?? d;
        setStats({
          items: s?.sellingItems ?? 0,
          gameMoney: s?.gameMoney ?? 0,
          accounts: s?.accounts ?? 0,
          auctions: s?.auctions ?? 0,
        });
      }
      if (actRes.status === "fulfilled" && actRes.value.ok) {
        const d = await actRes.value.json();
        const list = d?.data?.content ?? d?.content ?? d?.data ?? [];
        setRecentActivity(Array.isArray(list) ? list.slice(0, 3) : []);
      }
    } catch (e) {
      console.error("마일리지 탭 로드 오류:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const STAT_ITEMS = [
    {
      type: "등록 아이템",
      count: stats.items,
      status: "판매중",
      color: "violet",
    },
    {
      type: "게임머니",
      count: stats.gameMoney,
      status: "검토중",
      color: "amber",
    },
    {
      type: "등록 계정",
      count: stats.accounts,
      status: "판매중",
      color: "violet",
    },
    {
      type: "경매 아이템",
      count: stats.auctions,
      status: "경매진행",
      color: "green",
    },
  ];

  if (loading) return <div className="mp-empty">불러오는 중...</div>;

  return (
    <div>
      {/* 잔액 + 최근 거래 */}
      <div className="mp-mileage-top">
        <div className="mp-card mp-mileage-balance">
          <div className="mp-mileage-label">보유 마일리지</div>
          <div className="mp-mileage-amount">
            {fmt(balance)} <span>KRW 마일리지</span>
          </div>
          <div className="mp-btn-row">
            <button
              className="mp-btn-primary"
              type="button"
              onClick={onGoCharge}
            >
              마일리지 충전
            </button>
            <button
              className="mp-btn-secondary"
              type="button"
              onClick={onGoWithdraw}
            >
              출금 신청
            </button>
          </div>
        </div>

        <div className="mp-card mp-tx-panel">
          <div className="mp-tx-header">
            <span className="mp-tx-title">최근 거래 내역</span>
            <button className="mp-tx-link" type="button">
              전체보기
            </button>
          </div>
          {transactions.length === 0 ? (
            <div className="mp-empty" style={{ padding: "20px 0" }}>
              거래 내역이 없습니다.
            </div>
          ) : (
            transactions.map((tx, i) => {
              const amount = tx.amount ?? tx.mileage ?? 0;
              const label = tx.label ?? tx.type ?? tx.description ?? "거래";
              const date = tx.date ?? tx.createdAt ?? tx.transactionDate ?? "";
              return (
                <div key={tx.id ?? i} className="mp-tx-item">
                  <div className="mp-tx-info">
                    {amount > 0 ? (
                      <Icon.ArrowUpRight />
                    ) : (
                      <Icon.ArrowDownLeft />
                    )}
                    <div>
                      <div className="mp-tx-name">{label}</div>
                      <div className="mp-tx-date">{date}</div>
                    </div>
                  </div>
                  <span
                    className={`mp-tx-amount ${amount > 0 ? "plus" : "minus"}`}
                  >
                    {amount > 0 ? "+" : ""}
                    {fmt(amount)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 통계 */}
      <div className="mp-stats-grid">
        {STAT_ITEMS.map((s) => (
          <div key={s.type} className="mp-stat-card">
            <div className="mp-stat-label">{s.type}</div>
            <div className="mp-stat-value">{s.count}건</div>
            <Badge color={s.color}>{s.status}</Badge>
          </div>
        ))}
      </div>

      {/* 최근 활동 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: "#e4e4e7" }}>
          최근 활동 내역
        </span>
        <button className="mp-tx-link" type="button">
          전체보기
        </button>
      </div>

      <div className="mp-activity-list">
        {recentActivity.length === 0 ? (
          <div className="mp-empty">활동 내역이 없습니다.</div>
        ) : (
          recentActivity.map((a, i) => {
            const tag = a.tag ?? a.status ?? a.type ?? "";
            const tagColor =
              a.tagColor ??
              (tag === "구매완료"
                ? "violet"
                : tag === "판매완료"
                  ? "green"
                  : "amber");
            const title = a.title ?? a.itemName ?? a.name ?? "";
            const sub = a.sub ?? a.description ?? "";
            const time = a.time ?? a.createdAt ?? "";
            const img = a.img ?? a.emoji ?? "📦";
            return (
              <div key={a.id ?? i} className="mp-activity-item">
                <div className="mp-activity-img">{img}</div>
                <div className="mp-activity-body">
                  <Badge color={tagColor}>{tag}</Badge>
                  <div className="mp-activity-title">{title}</div>
                  <div className="mp-activity-sub">{sub}</div>
                </div>
                <span className="mp-activity-time">{time}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── 프로필 탭 ──────────────────────────────────────────────────
const BANKS = ["신한은행", "국민은행", "하나은행", "우리은행", "카카오뱅크"];

function ProfileTab({
  user,
  onDeleteAccount,
  onNicknameSaved,
  onProfileImgSaved,
}) {
  const { updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [profileImg, setProfileImg] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPwConfirm, setNewPwConfirm] = useState("");
  const [bank, setBank] = useState("신한은행");
  const [account, setAccount] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/members/me", {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("인증 실패");
        return res.json();
      })
      .then((json) => {
        if (!mounted) return;
        const d = json.data ?? json;
        setUsername(d.username ?? d.loginId ?? "");
        setNickname(d.nickname ?? "");
        setName(d.name ?? "");
        setEmail(d.email ?? "");
        setPhone(d.phone ?? "");
        setBank(d.bankName ?? "신한은행");
        setAccount(d.accountNumber ?? "");
        setAccountHolder(d.accountHolder ?? "");
        if (d.profileImg) {
          setProfileImg(d.profileImg);
          onProfileImgSaved(d.profileImg);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setNickname(user?.nickname ?? "");
        setUsername(user?.username ?? "");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleImgChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    const url = URL.createObjectURL(file);
    setProfileImg(url);
    onProfileImgSaved(url);
  };

  const handlePhoneChange = (e) => {
    const d = e.target.value.replace(/\D/g, "").slice(0, 11);
    let f = d;
    if (d.length > 7) f = `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
    else if (d.length > 3) f = `${d.slice(0, 3)}-${d.slice(3)}`;
    setPhone(f);
  };

  const handleSave = async () => {
    setError("");
    const wantsPwChange = currentPw || newPw || newPwConfirm;
    if (wantsPwChange) {
      if (!currentPw) {
        setError("현재 비밀번호를 입력해주세요.");
        return;
      }
      if (newPw.length < 8) {
        setError("새 비밀번호는 8자 이상이어야 합니다.");
        return;
      }
      if (newPw !== newPwConfirm) {
        setError("새 비밀번호가 일치하지 않습니다.");
        return;
      }
    }
    setSaving(true);
    try {
      const tk = token();
      if (profileFile) {
        const fd = new FormData();
        fd.append("image", profileFile);
        const imgRes = await fetch("/api/members/me/profile-image", {
          method: "POST",
          headers: { Authorization: `Bearer ${tk}` },
          body: fd,
        });
        if (!imgRes.ok) throw new Error("이미지 업로드 실패");
        const imgData = await imgRes.json();
        const uploaded = imgData?.data?.profileImg || null;
        if (uploaded) {
          setProfileImg(uploaded);
          onProfileImgSaved(uploaded);
        }
      }

      const infoRes = await fetch("/api/members/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tk}`,
        },
        body: JSON.stringify({ nickname, name, phone }),
      });
      if (!infoRes.ok) {
        const j = await infoRes.json().catch(() => ({}));
        throw new Error(j.message || "정보 수정 실패");
      }

      if (wantsPwChange) {
        const pwRes = await fetch("/api/members/me/password", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tk}`,
          },
          body: JSON.stringify({
            currentPassword: currentPw,
            newPassword: newPw,
          }),
        });
        if (!pwRes.ok) {
          const j = await pwRes.json().catch(() => ({}));
          throw new Error(j.message || "비밀번호 변경 실패");
        }
      }

      const bankRes = await fetch("/api/members/me/bank", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tk}`,
        },
        body: JSON.stringify({
          bankName: bank,
          accountNumber: account,
          accountHolder,
        }),
      });
      if (!bankRes.ok) {
        const j = await bankRes.json().catch(() => ({}));
        throw new Error(j.message || "계좌 수정 실패");
      }

      updateUser({ nickname });
      onNicknameSaved(nickname);
      setCurrentPw("");
      setNewPw("");
      setNewPwConfirm("");
      setProfileFile(null);
      alert("저장되었습니다.");
    } catch (err) {
      setError(err.message || "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="mp-empty">프로필 불러오는 중...</div>;

  const avatarLetter = (nickname || user?.nickname || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <>
      {showModal && (
        <DeleteAccountModal
          onConfirm={() => {
            setShowModal(false);
            onDeleteAccount?.();
          }}
          onClose={() => setShowModal(false)}
        />
      )}
      <div className="mp-section-title">회원정보 수정</div>
      <div className="mp-section-sub">
        귀하의 계정 정보와 출금 수단을 안전하게 관리하세요.
      </div>

      <div className="mp-profile-grid">
        {/* 아바타 카드 */}
        <div className="mp-card mp-avatar-card">
          <div
            className="mp-avatar-lg"
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: "pointer" }}
          >
            {profileImg ? (
              <img
                src={profileImg}
                alt="프로필"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            ) : (
              avatarLetter
            )}
            <button
              className="mp-avatar-edit-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Icon.Upload />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImgChange}
          />
          <div className="mp-avatar-name">{nickname || user?.nickname}</div>
          <div className="mp-badge-row">
            <Badge color="violet">VERIFIED</Badge>
            <Badge color="amber">TOP TRADER</Badge>
          </div>
        </div>

        <div className="mp-profile-fields">
          {/* 기본 정보 */}
          <div className="mp-card">
            <div className="mp-card-title">
              <Icon.User /> 기본 정보
            </div>
            <div className="mp-form-row">
              <div className="mp-form-group">
                <label className="mp-form-label">아이디</label>
                <input
                  value={username}
                  disabled
                  className="mp-form-input disabled"
                />
              </div>
              <div className="mp-form-group">
                <label className="mp-form-label">닉네임</label>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="mp-form-input"
                />
              </div>
            </div>
            <div className="mp-form-row">
              <div className="mp-form-group">
                <label className="mp-form-label">이름</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mp-form-input"
                />
              </div>
              <div className="mp-form-group">
                <label className="mp-form-label">이메일</label>
                <input
                  value={email}
                  disabled
                  className="mp-form-input disabled"
                />
              </div>
            </div>
            <div className="mp-form-group">
              <label className="mp-form-label">휴대폰 번호</label>
              <input
                value={phone}
                onChange={handlePhoneChange}
                placeholder="010-0000-0000"
                className="mp-form-input"
              />
            </div>
          </div>

          {/* 비밀번호 변경 */}
          <div className="mp-card">
            <div className="mp-card-title">
              <Icon.ShieldSm /> 비밀번호 변경
            </div>
            <div className="mp-form-group">
              <label className="mp-form-label">현재 비밀번호</label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="현재 비밀번호 입력"
                className="mp-form-input"
              />
            </div>
            <div className="mp-form-row">
              <div className="mp-form-group">
                <label className="mp-form-label">새 비밀번호</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="8자 이상 입력"
                  className="mp-form-input"
                />
              </div>
              <div className="mp-form-group">
                <label className="mp-form-label">새 비밀번호 확인</label>
                <input
                  type="password"
                  value={newPwConfirm}
                  onChange={(e) => setNewPwConfirm(e.target.value)}
                  placeholder="다시 입력"
                  className="mp-form-input"
                />
              </div>
            </div>
          </div>

          {/* 출금 계좌 관리 */}
          <div className="mp-card">
            <div className="mp-card-title">
              <Icon.CreditCard /> 출금 계좌 관리
            </div>
            <div className="mp-form-row">
              <div className="mp-form-group">
                <label className="mp-form-label">은행 선택</label>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="mp-form-select"
                >
                  {BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mp-form-group" style={{ flex: 2 }}>
                <label className="mp-form-label">계좌 번호</label>
                <input
                  value={account}
                  onChange={(e) =>
                    setAccount(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="하이픈(-) 없이 입력"
                  className="mp-form-input"
                />
              </div>
            </div>
            <div className="mp-form-group">
              <label className="mp-form-label">예금주</label>
              <input
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="실명 입력"
                className="mp-form-input"
              />
            </div>
          </div>

          {error && <div className="mp-charge-error">{error}</div>}

          {/* 저장 및 탈퇴 버튼 */}
          <div className="mp-action-row">
            <button
              type="button"
              className="mp-btn-danger-text"
              onClick={() => setShowModal(true)}
            >
              회원 탈퇴하기
            </button>
            <button
              type="button"
              className="mp-btn-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "저장 중..." : "변경사항 저장"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── 고객센터 탭 ────────────────────────────────────────────────
function SupportTab() {
  const faqList = [
    {
      q: "마일리지 충전은 어떻게 하나요?",
      a: "마일리지 조회 화면에서 충전하기 버튼을 누른 후, 원하시는 금액과 결제 수단을 선택하여 신용카드나 카카오페이 등으로 안전하게 충전하실 수 있습니다.",
    },
    {
      q: "출금 신청 후 입금까지 얼마나 걸리나요?",
      a: "영업일 기준 평균 1~3일 정도 소요됩니다. 주말 및 공휴일 신청 건은 다음 영업일부터 순차적으로 처리됩니다.",
    },
    {
      q: "비밀번호를 분기별로 변경해야 하나요?",
      a: "회원님의 자산 유실 방지와 보안 강화를 위해 최소 3개월 주기로 비밀번호를 변경하시는 것을 강력히 권장합니다.",
    },
  ];

  return (
    <div>
      <div className="mp-section-title">고객센터 및 도움말</div>
      <div className="mp-section-sub">
        서비스 이용 중 궁금한 점이 있으시다면 FAQ를 확인하시거나 고객센터로
        문의해 주세요.
      </div>

      <div className="mp-support-grid">
        {/* 자주 묻는 질문 */}
        <div className="mp-card" style={{ flex: 1.5 }}>
          <div className="mp-card-title" style={{ marginBottom: 16 }}>
            <Icon.HelpCircle /> 자주 묻는 질문 (FAQ)
          </div>
          <div className="mp-faq-list">
            {faqList.map((f, i) => (
              <div key={i} className="mp-faq-item">
                <div className="mp-faq-q">Q. {f.q}</div>
                <div className="mp-faq-a">{f.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 고객센터 안내 카드 */}
        <div className="mp-card mp-support-contact-card">
          <img
            src={headsetImg}
            alt="고객센터 안내"
            className="mp-support-banner"
          />
          <div className="mp-support-contact-body">
            <div className="mp-support-contact-title">원딜러 고객센터</div>
            <div className="mp-support-time">
              평일 10:00 ~ 18:00 (주말/공휴일 휴무)
            </div>
            <div className="mp-support-desc">
              1:1 실시간 문의 또는 이메일을 통해 접수해 주시면 담당자가 신속히
              답변해 드리겠습니다.
            </div>
            <button
              type="button"
              className="mp-btn-primary"
              style={{ width: "100%", marginTop: 12 }}
            >
              1:1 문의하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 사이드바 정보 ──────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { key: "mileage", label: "마일리지 조회", Icon: Icon.Coins },
  { key: "profile", label: "회원정보 수정", Icon: Icon.User },
  { key: "support", label: "고객센터", Icon: Icon.Headphones },
];

// ── 메인 컴포넌트 ──────────────────────────────────────────────
export default function MyPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("mileage"); // 'mileage' | 'profile' | 'support' | 'charge' | 'withdraw'
  const [userBalance, setUserBalance] = useState(0);
  const [userBankName, setUserBankName] = useState("");
  const [userAccountNumber, setUserAccountNumber] = useState("");
  const [userAccountHolder, setUserAccountHolder] = useState("");

  const [sidebarNickname, setSidebarNickname] = useState("");
  const [sidebarProfileImg, setSidebarProfileImg] = useState(null);

  // 컴포넌트 마운트 시 잔액 및 사이드바 기본정보 캐싱
  useEffect(() => {
    fetch("/api/members/me", {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then((res) => res.json())
      .then((json) => {
        const d = json.data ?? json;
        setSidebarNickname(d.nickname || user?.nickname || "사용자");
        setSidebarProfileImg(d.profileImg || null);
        setUserBankName(d.bankName || "");
        setUserAccountNumber(d.accountNumber || "");
        setUserAccountHolder(d.accountHolder || "");
      })
      .catch(() => {
        setSidebarNickname(user?.nickname || "사용자");
      });

    fetch("/api/wallet", {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then((res) => res.json())
      .then((json) => {
        setUserBalance(json?.data?.balance ?? json?.balance ?? 0);
      })
      .catch((e) => console.error(e));
  }, [user]);

  // 탈퇴 성공 콜백
  const handleDeleteAccountConfirm = () => {
    logout();
    alert("그동안 이용해 주셔서 감사합니다. 계정이 삭제되었습니다.");
    navigate("/");
  };

  // 충전 성공 콜백
  const handleChargeSuccess = (amount) => {
    setUserBalance((prev) => prev + amount);
    alert(`${amount.toLocaleString()}M 마일리지가 정상 충전되었습니다.`);
    setActiveTab("mileage");
  };

  // 출금 신청 성공 콜백
  const handleWithdrawSuccess = (amount) => {
    setUserBalance((prev) => prev - amount);
    alert(`${amount.toLocaleString()}M 출금 신청이 완료되었습니다.`);
    setActiveTab("mileage");
  };

  // 탭 렌더링 스위칭 함수
  const renderMain = () => {
    switch (activeTab) {
      case "mileage":
        return (
          <MileageTab
            onGoCharge={() => setActiveTab("charge")}
            onGoWithdraw={() => setActiveTab("withdraw")}
          />
        );
      case "charge":
        return (
          <ChargeTab
            balance={userBalance}
            onSuccess={handleChargeSuccess}
            onBack={() => setActiveTab("mileage")}
          />
        );
      case "withdraw":
        return (
          <WithdrawTab
            balance={userBalance}
            bankName={userBankName}
            accountNumber={userAccountNumber}
            accountHolder={userAccountHolder}
            onSuccess={handleWithdrawSuccess}
            onBack={() => setActiveTab("mileage")}
          />
        );
      case "profile":
        return (
          <ProfileTab
            user={user}
            onNicknameSaved={(nick) => setSidebarNickname(nick)}
            onProfileImgSaved={(img) => setSidebarProfileImg(img)}
            onDeleteAccount={handleDeleteAccountConfirm}
          />
        );
      case "support":
        return <SupportTab />;
      default:
        return null;
    }
  };

  const activeSidebarKey = ["charge", "withdraw"].includes(activeTab)
    ? "mileage"
    : activeTab;

  return (
    <div className="mp-root">
      <div className="mp-container">
        <aside className="mp-sidebar">
          <div className="mp-profile-card">
            <div className="mp-avatar">
              {sidebarProfileImg ? (
                <img
                  src={sidebarProfileImg}
                  alt="프로필"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                sidebarNickname.charAt(0).toUpperCase()
              )}
            </div>
            <div className="mp-profile-name">{sidebarNickname}</div>
            <div className="mp-profile-role">Premium Trader</div>
          </div>
          <nav className="mp-nav">
            <div className="mp-nav-header">내 계정</div>
            {SIDEBAR_ITEMS.map(({ key, label, Icon: Ic }) => (
              <button
                key={key}
                type="button"
                className={`mp-nav-btn${activeSidebarKey === key ? " active" : ""}`}
                onClick={() => setActiveTab(key)}
              >
                <Ic />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="mp-main">{renderMain()}</main>
      </div>
    </div>
  );
}
