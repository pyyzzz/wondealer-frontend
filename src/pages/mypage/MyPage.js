import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import WalletApi from "../../api/wallet.api";
import Common from "../../utils/Common";
import { uploadImageFiles } from "../../utils/firebaseUpload";
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
const BANK_STORAGE_KEY = "wondealerBankInfo";
const WITHDRAW_ADJUSTMENT_KEY = "wondealerWithdrawAdjustment";
const PROFILE_IMAGE_STORAGE_KEY = "wondealerProfileImage";

const toAmount = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  return Number(String(value).replace(/[^\d.-]/g, "")) || 0;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const saveProfileImage = (url) => {
  if (!url) return;
  localStorage.setItem(PROFILE_IMAGE_STORAGE_KEY, url);
};

const getSavedProfileImage = () =>
  localStorage.getItem(PROFILE_IMAGE_STORAGE_KEY) || "";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ko-KR");
};

const getTradeAmount = (trade) =>
  toAmount(
    trade?.tradePrice ??
      trade?.totalAmount ??
      trade?.paymentAmount ??
      trade?.paidAmount ??
      trade?.settlementAmount ??
      trade?.finalPrice ??
      trade?.currentPrice ??
      trade?.winningBid ??
      trade?.basePrice ??
      trade?.price ??
      trade?.amount ??
      trade?.itemPrice ??
      trade?.item?.itemPrice ??
      trade?.item?.basePrice ??
      trade?.item?.price ??
      trade?.item?.finalPrice ??
      trade?.product?.basePrice ??
      trade?.product?.itemPrice ??
      trade?.product?.price,
  );

const normalizeBankInfo = (data = {}) => ({
  bankName: data.bankName ?? "",
  accountNumber: data.accountNumber ?? "",
  accountHolder: data.accountHolder ?? "",
});

const getSavedBankInfo = () => {
  try {
    return normalizeBankInfo(
      JSON.parse(localStorage.getItem(BANK_STORAGE_KEY) || "{}"),
    );
  } catch {
    return normalizeBankInfo();
  }
};

const saveBankInfo = (bankInfo) => {
  const next = normalizeBankInfo(bankInfo);
  localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(next));
  return next;
};

const mergeBankInfo = (serverBank = {}, savedBank = getSavedBankInfo()) => ({
  bankName: serverBank.bankName || savedBank.bankName || "",
  accountNumber: serverBank.accountNumber || savedBank.accountNumber || "",
  accountHolder: serverBank.accountHolder || savedBank.accountHolder || "",
});

const getWithdrawAdjustment = () =>
  Number(localStorage.getItem(WITHDRAW_ADJUSTMENT_KEY) || 0);

const addWithdrawAdjustment = (amount) => {
  const next = getWithdrawAdjustment() + Number(amount || 0);
  localStorage.setItem(WITHDRAW_ADJUSTMENT_KEY, String(next));
  return next;
};

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

// 충전 수수료율 (프리셋의 M→KRW 환산 마진과 동일하게 10%로 고정)
const CHARGE_FEE_RATE = 0.1;

// ── 마일리지 충전 탭 (포트원 V2 연동) ────────────────────────────
function ChargeTab({ balance, onSuccess, onBack }) {
  const [selected, setSelected] = useState(0);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mileage =
    selected !== null
      ? CHARGE_PRESETS[selected].m
      : Number(custom.replace(/\D/g, "") || 0);
  const fee = Math.round(mileage * CHARGE_FEE_RATE);
  const krw = mileage + fee;

  const handleCharge = async () => {
    if (mileage < 10000) {
      setError("최소 충전 금액은 10,000M 입니다.");
      return;
    }

    // window.PortOne 직접 확인 (대기 로직 없이 즉시 확인)
    const portOne = window.PortOne;

    if (!portOne) {
      setError(
        "결제 모듈이 아직 로드되지 않았습니다. 잠시 후 다시 시도하거나 광고 차단 프로그램을 꺼주세요.",
      );
      // 만약 로드가 안되었다면 수동으로 스크립트 다시 한번 주입 시도
      if (!document.querySelector('script[src*="portone.io"]')) {
        const s = document.createElement("script");
        s.src = "https://cdn.portone.io/v2/browser-sdk.js";
        document.head.appendChild(s);
      }
      return;
    }

    const storeId = process.env.REACT_APP_PORTONE_STORE_ID;
    const channelKey = process.env.REACT_APP_PORTONE_CHANNEL_KEY;

    if (!storeId || !channelKey) {
      setError(".env 파일에 storeId 또는 channelKey 설정이 누락되었습니다.");
      console.error("Store ID:", storeId, "Channel Key:", channelKey);
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

      const paymentResponse = await PortOne.requestPayment({
        storeId,
        channelKey,
        paymentId: ready.paymentId,
        orderName: ready.orderName || `WONDEALER ${fmt(mileage)}M 충전`,
        totalAmount: ready.amount,
        currency: "CURRENCY_KRW",
        payMethod: "CARD",
      });

      // 결제창이 닫혔을 때 오류가 있는지 확인
      if (paymentResponse?.code != null) {
        // 결제 실패/취소 시 code값이 돌아옵니다.
        throw new Error(paymentResponse.message || "결제가 취소되었습니다.");
      }

      // 서버에 결제 완료 검증 요청
      const completeResponse = await WalletApi.completeCharge({
        paymentId: ready.paymentId,
      });

      const chargedAmount =
        completeResponse.data?.data?.chargedAmount ?? mileage;
      onSuccess(chargedAmount);
    } catch (err) {
      console.error("결제 오류 발생:", err);
      setError(err.message || "결제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mp-support-back" onClick={onBack}>
        <Icon.ChevronLeft /> 마일리지 조회로 돌아가기
      </div>

      <div className="mp-section-title">마일리지 충전</div>
      <div className="mp-section-sub">
        보유하신 마일리지를 안전하게 충전하고 특별한 아이템들을 만나보세요.
      </div>

      <div className="mp-card mp-charge-balance-card">
        <div className="mp-mileage-label">현재 보유 마일리지</div>
        <div className="mp-charge-balance-amount">
          {fmt(balance)} <span>M</span>
        </div>
      </div>

      <div className="mp-charge-grid">
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
              <span>수수료 ({Math.round(CHARGE_FEE_RATE * 100)}%)</span>
              <span>{fmt(fee)} KRW</span>
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

// ── 마일리지 출금 탭 ─────────────────────────────────────────────
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
  const feeRate = 0.1;
  const fee = Math.floor(requested * feeRate);
  const MIN = 10000;
  const withdrawable = Math.max(0, balance);
  const expectedBalance = balance - requested;
  const net = requested - fee;

  const handleWithdraw = async () => {
    if (requested < MIN) {
      setError(`최소 출금 금액은 ${fmt(MIN)}M 입니다.`);
      return;
    }
    setError("");
    setLoading(true);
    try {
      await Promise.resolve();
      onSuccess(requested);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mp-support-back" onClick={onBack}>
        <Icon.ChevronLeft /> 마일리지 조회로 돌아가기
      </div>

      <div className="mp-section-title">마일리지 출금 신청</div>
      <div className="mp-section-sub">
        보유하신 마일리지를 등록된 계좌로 안전하게 출금 신청하실 수 있습니다.
      </div>

      <div className="mp-withdraw-balance-row">
        <div className="mp-card mp-withdraw-balance-card">
          <div className="mp-mileage-label">전체 보유 마일리지</div>
          <div className="mp-withdraw-bal">
            {fmt(balance)} <span>M</span>
          </div>
        </div>
        <div className="mp-card mp-withdraw-balance-card mp-withdraw-balance-green">
          <div className="mp-mileage-label" style={{ color: "#10b981" }}>
            출금 후 예상 마일리지
          </div>
          <div className="mp-withdraw-bal mp-withdraw-bal-green">
            {fmt(expectedBalance)} <span>M</span>
          </div>
        </div>
      </div>

      <div className="mp-withdraw-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                    {bankName || "은행 정보 없음"}
                  </div>
                  <div className="mp-withdraw-bank-sub">
                    {accountNumber
                      ? `${accountNumber} (예금주: ${accountHolder || "-"})`
                      : "회원정보에 등록된 계좌번호가 없습니다"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mp-card mp-withdraw-receipt">
            <div className="mp-charge-summary-row">
              <span>예상 수수료 (10%)</span>
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
      const res = await fetch(`${Common.API_URL}/api/members/me`, {
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

// ── 마일리지 탭 (balance를 prop으로 받음, 자체 잔액 fetch 제거) ──────
function MileageTab({ balance, onGoCharge, onGoWithdraw, navigate }) {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    items: 0,
    gameMoney: 0,
    accounts: 0,
    auctions: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);

  const fetchData = useCallback(async () => {
    const tk = token();
    try {
      const [buyRes, sellRes, bidRes, itemsRes] = await Promise.allSettled([
        fetch(
          `${Common.API_URL}/api/members/me/trades?type=BUY&page=0&size=100`,
          {
            headers: { Authorization: `Bearer ${tk}` },
            cache: "no-store",
          },
        ),
        fetch(
          `${Common.API_URL}/api/members/me/trades?type=SELL&page=0&size=100`,
          {
            headers: { Authorization: `Bearer ${tk}` },
            cache: "no-store",
          },
        ),
        fetch(`${Common.API_URL}/api/members/me/bids?page=0&size=100`, {
          headers: { Authorization: `Bearer ${tk}` },
          cache: "no-store",
        }),
        fetch(`${Common.API_URL}/api/members/me/items?page=0&size=100`, {
          headers: { Authorization: `Bearer ${tk}` },
          cache: "no-store",
        }),
      ]);

      // ── 최근 거래내역 ──────────────────────────────────────────
      const buyList =
        buyRes.status === "fulfilled" && buyRes.value.ok
          ? await buyRes.value
              .json()
              .then((d) => d?.data?.content ?? d?.content ?? [])
          : [];
      const sellList =
        sellRes.status === "fulfilled" && sellRes.value.ok
          ? await sellRes.value
              .json()
              .then((d) => d?.data?.content ?? d?.content ?? [])
          : [];

      const txList = [
        ...buyList.map((t) => ({
          id: t.tradeId ?? t.orderId ?? t.itemId ?? t.id,
          itemId: t.itemId ?? t.item?.itemId ?? t.item?.id ?? null,
          type: "구매",
          amount: getTradeAmount(t) ? -getTradeAmount(t) : 0,
          label:
            t.itemName ??
            t.title ??
            t.item?.title ??
            t.item?.itemName ??
            "구매",
          date: t.completedAt ?? t.paidAt ?? t.createdAt ?? t.date ?? "",
        })),
        ...sellList.map((t) => ({
          id: t.tradeId ?? t.orderId ?? t.itemId ?? t.id,
          itemId: t.itemId ?? t.item?.itemId ?? t.item?.id ?? null,
          type: "판매",
          amount: getTradeAmount(t),
          label:
            t.itemName ??
            t.title ??
            t.item?.title ??
            t.item?.itemName ??
            "판매",
          date: t.completedAt ?? t.paidAt ?? t.createdAt ?? t.date ?? "",
        })),
      ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      setTransactions(txList);

      // ── items 목록 파싱 (bidList보다 먼저 선언) ─────────────────
      const itemList =
        itemsRes.status === "fulfilled" && itemsRes.value.ok
          ? await itemsRes.value.json().then((d) => {
              const list =
                d?.data?.content ??
                d?.data?.items ??
                d?.data?.list ??
                d?.content ??
                d?.items ??
                d?.list ??
                (Array.isArray(d?.data) ? d.data : null) ??
                (Array.isArray(d) ? d : []);
              return Array.isArray(list) ? list : [];
            })
          : [];

      // ── 경매 입찰 목록 (itemList 다음에 선언) ──────────────────
      const bidList =
        bidRes.status === "fulfilled" && bidRes.value.ok
          ? await bidRes.value
              .json()
              .then((d) => d?.data?.content ?? d?.content ?? [])
          : [];

      // ── 통계 (itemList, bidList 모두 선언된 후) ────────────────
      setStats({
        items: itemList.filter(
          (i) => i.tradeType === "DIRECT" && i.status === "SELLING",
        ).length,
        gameMoney: itemList.filter(
          (i) =>
            i.categoryName?.includes("게임머니") ||
            i.categoryType === "GAME_MONEY",
        ).length,
        accounts: itemList.filter(
          (i) =>
            i.categoryName?.includes("계정") ||
            i.categoryName?.includes("아이디") ||
            i.categoryType === "ACCOUNT",
        ).length,
        auctions:
          bidList.length > 0
            ? bidList.length
            : itemList.filter((i) => i.tradeType === "AUCTION").length,
      });

      // ── 최근 활동내역 ──────────────────────────────────────────
      const recentItems = [...itemList]
        .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
        .map((i) => ({
          id: i.itemId ?? i.id,
          tag:
            i.status === "COMPLETED"
              ? "판매완료"
              : i.tradeType === "AUCTION"
                ? "경매진행"
                : "판매중",
          tagColor:
            i.status === "COMPLETED"
              ? "green"
              : i.tradeType === "AUCTION"
                ? "amber"
                : "violet",
          title: i.title ?? i.itemName ?? "",
          sub: i.gameName ?? i.serverName ?? "",
          time: i.createdAt
            ? new Date(i.createdAt).toLocaleDateString("ko-KR")
            : "",
          price:
            i.basePrice ??
            i.price ??
            i.itemPrice ??
            i.tradePrice ??
            i.currentPrice ??
            i.finalPrice ??
            i.winningBid ??
            0,
          img: i.thumbnailImg ? null : "📦",
          thumbnailImg: i.thumbnailImg ?? null,
        }));
      setRecentActivity(recentItems);
    } catch (e) {
      console.error("마일리지 탭 로드 오류:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderTransaction = (tx, i) => {
    const rawAmount = tx.amount ?? tx.mileage ?? 0;
    const amount = Object.is(rawAmount, -0) ? 0 : rawAmount;
    const label = tx.label ?? tx.type ?? tx.description ?? "거래";
    const date = formatDate(
      tx.date ?? tx.createdAt ?? tx.transactionDate ?? "",
    );
    const openItem = () => {
      if (tx.itemId) navigate(`/items/${tx.itemId}`);
    };

    return (
      <div
        key={tx.id ?? i}
        className="mp-tx-item"
        onClick={openItem}
        role={tx.itemId ? "button" : undefined}
        tabIndex={tx.itemId ? 0 : undefined}
        style={tx.itemId ? { cursor: "pointer" } : undefined}
        onKeyDown={(e) => {
          if (tx.itemId && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            openItem();
          }
        }}
      >
        <div className="mp-tx-info">
          {amount > 0 ? <Icon.ArrowUpRight /> : <Icon.ArrowDownLeft />}
          <div>
            <div className="mp-tx-name">
              {tx.type && label !== tx.type ? `${tx.type} · ${label}` : label}
            </div>
            <div className="mp-tx-date">{date}</div>
          </div>
        </div>
        <span className={`mp-tx-amount ${amount > 0 ? "plus" : "minus"}`}>
          {amount > 0 ? "+" : ""}
          {fmt(amount)} M
        </span>
      </div>
    );
  };

  const renderActivity = (a, i) => {
    const tag = a.tag ?? a.status ?? a.type ?? "";
    const tagColor =
      a.tagColor ??
      (tag === "구매완료" ? "violet" : tag === "판매완료" ? "green" : "amber");
    const title = a.title ?? a.itemName ?? a.name ?? "";
    const sub = a.sub ?? a.description ?? "";
    const time = formatDate(a.time ?? a.createdAt ?? "");
    const price = toAmount(
      a.price ??
        a.basePrice ??
        a.itemPrice ??
        a.tradePrice ??
        a.currentPrice ??
        a.finalPrice ??
        a.winningBid,
    );
    const img = a.img ?? a.emoji ?? "📦";
    const itemId = a.itemId ?? a.id;
    const openItem = () => {
      if (itemId) navigate(`/items/${itemId}`);
    };

    return (
      <div
        key={a.id ?? i}
        className="mp-activity-item"
        onClick={openItem}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && itemId) {
            e.preventDefault();
            openItem();
          }
        }}
        role={itemId ? "button" : undefined}
        tabIndex={itemId ? 0 : undefined}
        style={itemId ? { cursor: "pointer" } : undefined}
      >
        <div className="mp-activity-img">
          {a.thumbnailImg ? (
            <img
              src={a.thumbnailImg}
              alt={a.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          ) : (
            img
          )}
        </div>
        <div className="mp-activity-body">
          <Badge color={tagColor}>{tag}</Badge>
          <div className="mp-activity-title">{title}</div>
          <div className="mp-activity-sub">{sub}</div>
        </div>
        <div className="mp-activity-meta">
          <span className="mp-activity-price">
            {price ? `${fmt(price)} M` : "-"}
          </span>
          <span className="mp-activity-time">{time}</span>
        </div>
      </div>
    );
  };

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
            <button
              className="mp-tx-link"
              type="button"
              onClick={() => setShowAllTransactions(true)}
            >
              전체보기
            </button>
          </div>
          {transactions.length === 0 ? (
            <div className="mp-empty" style={{ padding: "20px 0" }}>
              거래 내역이 없습니다.
            </div>
          ) : (
            transactions.slice(0, 3).map(renderTransaction)
          )}
        </div>
      </div>

      <div className="mp-stats-grid">
        {STAT_ITEMS.map((s) => (
          <div key={s.type} className="mp-stat-card">
            <div className="mp-stat-label">{s.type}</div>
            <div className="mp-stat-value">{s.count}건</div>
            <Badge color={s.color}>{s.status}</Badge>
          </div>
        ))}
      </div>

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
        <button
          className="mp-tx-link"
          type="button"
          onClick={() => setShowAllActivity(true)}
        >
          전체보기
        </button>
      </div>

      <div className="mp-activity-list">
        {recentActivity.length === 0 ? (
          <div className="mp-empty">활동 내역이 없습니다.</div>
        ) : (
          recentActivity.slice(0, 3).map(renderActivity)
        )}
      </div>
      {showAllTransactions && (
        <div
          className="mp-modal-backdrop"
          onClick={() => setShowAllTransactions(false)}
        >
          <div
            className="mp-modal mp-list-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mp-modal-header">
              <div className="mp-modal-title">전체 거래 내역</div>
              <button
                className="mp-modal-close"
                type="button"
                onClick={() => setShowAllTransactions(false)}
              >
                ×
              </button>
            </div>
            <div className="mp-modal-body mp-list-modal-body">
              {transactions.length === 0 ? (
                <div className="mp-empty">거래 내역이 없습니다.</div>
              ) : (
                transactions.map(renderTransaction)
              )}
            </div>
          </div>
        </div>
      )}
      {showAllActivity && (
        <div
          className="mp-modal-backdrop"
          onClick={() => setShowAllActivity(false)}
        >
          <div
            className="mp-modal mp-list-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mp-modal-header">
              <div className="mp-modal-title">전체 활동 내역</div>
              <button
                className="mp-modal-close"
                type="button"
                onClick={() => setShowAllActivity(false)}
              >
                ×
              </button>
            </div>
            <div className="mp-modal-body mp-list-modal-body">
              {recentActivity.length === 0 ? (
                <div className="mp-empty">활동 내역이 없습니다.</div>
              ) : (
                recentActivity.map(renderActivity)
              )}
            </div>
          </div>
        </div>
      )}
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
  onBankSaved,
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
    fetch(`${Common.API_URL}/api/members/me`, {
      headers: { Authorization: `Bearer ${token()}` },
      cache: "no-store",
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
        const serverBank = d.bankInfo ?? d.bank ?? d.withdrawAccount ?? d;
        const savedBank = mergeBankInfo(serverBank);
        setBank(savedBank.bankName || "신한은행");
        setAccount(savedBank.accountNumber);
        setAccountHolder(savedBank.accountHolder);
        const savedProfileImg = getSavedProfileImage();
        const nextProfileImg =
          d.profileImg ??
          d.profileImage ??
          d.profileImageUrl ??
          savedProfileImg;
        if (nextProfileImg) {
          setProfileImg(nextProfileImg);
          onProfileImgSaved(nextProfileImg);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setNickname(user?.nickname ?? "");
        setUsername(user?.username ?? "");
        const savedProfileImg = getSavedProfileImage();
        if (savedProfileImg) {
          setProfileImg(savedProfileImg);
          onProfileImgSaved(savedProfileImg);
        }
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
        const localProfileImg = await readFileAsDataUrl(profileFile);
        let uploaded = "";
        try {
          const firebaseUrls = await uploadImageFiles(
            [profileFile],
            "profiles",
          );
          uploaded = firebaseUrls[0] || "";
        } catch (firebaseError) {
          console.warn("Firebase 프로필 이미지 업로드 실패:", firebaseError);
        }
        try {
          const fd = new FormData();
          fd.append("image", profileFile);
          const imgRes = await fetch(
            `${Common.API_URL}/api/members/me/profile-image`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${tk}` },
              body: fd,
            },
          );
          if (imgRes.ok) {
            const imgData = await imgRes.json().catch(() => ({}));
            const serverProfileImg =
              imgData?.data?.profileImg ??
              imgData?.data?.profileImage ??
              imgData?.data?.profileImageUrl ??
              imgData?.profileImg ??
              imgData?.profileImageUrl ??
              "";
            uploaded = uploaded || serverProfileImg;
          }
        } catch (uploadError) {
          console.warn(
            "프로필 이미지 서버 업로드 실패, 로컬 저장 사용:",
            uploadError,
          );
        }
        const nextProfileImg = uploaded || localProfileImg;
        saveProfileImage(nextProfileImg);
        setProfileImg(nextProfileImg);
        onProfileImgSaved(nextProfileImg);
      }

      const infoRes = await fetch(`${Common.API_URL}/api/members/me`, {
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
        const pwRes = await fetch(`${Common.API_URL}/api/members/me/password`, {
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

      const bankRes = await fetch(`${Common.API_URL}/api/members/me/bank`, {
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
      // 저장 API는 메시지만 반환하므로 방금 저장한 값을 즉시 상위 상태에 반영한다.
      const nextBankInfo = saveBankInfo({
        bankName: bank,
        accountNumber: account,
        accountHolder,
      });
      onBankSaved?.(nextBankInfo);

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
                  className="mp-form-input mp-form-input-disabled"
                />
              </div>
              <div className="mp-form-group">
                <label className="mp-form-label">성함</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="mp-form-input"
                />
              </div>
            </div>
            <div className="mp-form-group">
              <label className="mp-form-label">이메일 주소</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 입력"
                className="mp-form-input"
              />
            </div>
            <div className="mp-form-row">
              <div className="mp-form-group">
                <label className="mp-form-label">닉네임</label>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임 입력"
                  className="mp-form-input"
                />
              </div>
              <div className="mp-form-group">
                <label className="mp-form-label">전화번호</label>
                <input
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="010-0000-0000"
                  className="mp-form-input"
                />
              </div>
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
                placeholder="●●●●●●●●"
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
                  placeholder="최소 8자 이상"
                  className="mp-form-input"
                />
              </div>
              <div className="mp-form-group">
                <label className="mp-form-label">새 비밀번호 확인</label>
                <input
                  type="password"
                  value={newPwConfirm}
                  onChange={(e) => setNewPwConfirm(e.target.value)}
                  placeholder="비밀번호 재입력"
                  className="mp-form-input"
                />
              </div>
            </div>
            {newPw && newPwConfirm && (
              <div style={{ fontSize: 10, marginTop: -8, marginBottom: 4 }}>
                {newPw === newPwConfirm ? (
                  <span style={{ color: "#4ade80" }}>
                    ✓ 비밀번호가 일치합니다.
                  </span>
                ) : (
                  <span style={{ color: "#f87171" }}>
                    ✗ 비밀번호가 일치하지 않습니다.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 출금 계좌 */}
          <div className="mp-card">
            <div className="mp-card-title">
              <Icon.CreditCard /> 출금 계좌 관리
            </div>
            <div className="mp-form-row">
              <div className="mp-form-group">
                <label className="mp-form-label">은행명</label>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="mp-form-select"
                >
                  {BANKS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="mp-form-group">
                <label className="mp-form-label">계좌번호 (-제외)</label>
                <input
                  value={account}
                  onChange={(e) =>
                    setAccount(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  placeholder="숫자만 입력"
                  className="mp-form-input"
                />
              </div>
            </div>
            <div className="mp-form-group">
              <label className="mp-form-label">예금주 성명</label>
              <input
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="mp-form-input"
              />
            </div>
            <div className="mp-info-box">
              <Icon.AlertCircle /> 출금 계좌 정보는 본인 명의의 계좌만 등록
              가능하며, 승인 후 변경 시 추가 인증이 필요할 수 있습니다.
            </div>
          </div>

          {error && (
            <div className="mp-modal-error" style={{ marginBottom: 12 }}>
              {error}
            </div>
          )}

          <div className="mp-action-row" style={{ marginBottom: 20 }}>
            <button
              className="mp-btn-secondary"
              type="button"
              onClick={() => window.location.reload()}
            >
              취소
            </button>
            <button
              className="mp-btn-primary"
              type="button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </div>
      </div>

      <div className="mp-danger-zone">
        <div className="mp-danger-row">
          <div>
            <div className="mp-danger-title">
              <Icon.AlertTriangle /> 계정 탈퇴
            </div>
            <div className="mp-danger-desc">
              탈퇴 시 보유 마일리지, 등록 물품, 거래 내역 등 모든 데이터가 영구
              삭제되며 복구되지 않습니다.
            </div>
          </div>
          <button
            className="mp-btn-danger"
            type="button"
            onClick={() => setShowModal(true)}
          >
            탈퇴하기
          </button>
        </div>
      </div>
    </>
  );
}

// ── 활동 기록 탭 ───────────────────────────────────────────────
function ActivityTab({ navigate }) {
  const [activeSubTab, setActiveSubTab] = useState("구매 내역");
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("전체");
  const PERIODS = ["전체", "1개월", "3개월", "6개월"];
  const PAGE_SIZE_ACTIVITY = 10;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setData([]);
    setPage(1);

    const tk = token();
    const path =
      activeSubTab === "경매 내역"
        ? `/api/members/me/bids?page=0&size=${PAGE_SIZE_ACTIVITY}`
        : `/api/members/me/trades?type=${activeSubTab === "구매 내역" ? "BUY" : "SELL"}&page=0&size=${PAGE_SIZE_ACTIVITY}`;

    fetch(`${Common.API_URL}${path}`, {
      headers: { Authorization: `Bearer ${tk}` },
      cache: "no-store",
    })
      .then((res) => {
        // 501(미구현) 또는 기타 오류 → 빈 배열 처리
        if (!res.ok) return null;
        return res.json();
      })
      .then((json) => {
        if (!mounted || !json) return;
        const content =
          json?.data?.content ?? json?.content ?? json?.data ?? [];
        setData(Array.isArray(content) ? content : []);
      })
      .catch(() => {
        if (mounted) setData([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeSubTab]);

  // 클라이언트 페이지네이션 (서버 페이징 구현 전까지)
  const pageData = data.slice(
    (page - 1) * PAGE_SIZE_ACTIVITY,
    page * PAGE_SIZE_ACTIVITY,
  );
  const clientTotalPages = Math.max(
    1,
    Math.ceil(data.length / PAGE_SIZE_ACTIVITY),
  );

  const mapItem = (item, i) => {
    const id = item.itemId ?? item.id ?? item.orderId ?? i;
    const itemId =
      item.itemId ??
      item.item?.itemId ??
      item.item?.id ??
      item.productId ??
      item.product?.id ??
      (activeSubTab === "구매 내역" || activeSubTab === "판매 내역"
        ? (item.id ?? null)
        : null);
    const auctionId =
      item.auctionId ??
      item.auction?.auctionId ??
      item.auction?.id ??
      item.bidAuctionId ??
      null;
    const rawTag = item.tag ?? item.tradeType ?? item.type ?? "";
    const rawStatus = item.status ?? item.itemStatus ?? "";

    const TAG_KO = {
      DIRECT: "직거래",
      AUCTION: "경매",
      BUY: "구매",
      SELL: "판매",
    };
    const STATUS_KO = {
      SELLING: "판매중",
      RESERVED: "예약중",
      COMPLETED: "완료",
      DELETED: "삭제됨",
    };
    const TAG_COLOR = {
      DIRECT: "violet",
      AUCTION: "amber",
      BUY: "violet",
      SELL: "green",
    };
    const STATUS_COLOR = {
      SELLING: "green",
      RESERVED: "amber",
      COMPLETED: "zinc",
      DELETED: "zinc",
    };

    return {
      id,
      itemId,
      auctionId,
      tag: TAG_KO[rawTag] ?? rawTag,
      tagColor: item.tagColor ?? TAG_COLOR[rawTag] ?? "zinc",
      status: STATUS_KO[rawStatus] ?? rawStatus,
      statusColor: item.statusColor ?? STATUS_COLOR[rawStatus] ?? "zinc",
      title: item.title ?? item.itemName ?? item.name ?? "",
      sub: item.createdAt
        ? new Date(item.createdAt).toLocaleDateString("ko-KR")
        : (item.sub ?? item.date ?? ""),
      seller: item.sellerNickname ?? item.seller ?? item.counterpart ?? "",
      price: getTradeAmount(item),
      img: item.thumbnailImg ? null : (item.img ?? item.emoji ?? "📦"),
      thumbnailImg: item.thumbnailImg ?? null,
      gameName: item.gameName ?? "",
      serverName: item.serverName ?? "",
      targetPath: auctionId
        ? `/auctions/${auctionId}`
        : itemId
          ? `/items/${itemId}`
          : "",
    };
  };

  return (
    <div>
      <div className="mp-section-title">활동 기록</div>
      <div className="mp-section-sub">
        최근 구매/판매/경매 기록을 확인하실 수 있습니다.
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <div
          className="mp-subtab-bar"
          style={{ marginBottom: 0, border: "none" }}
        >
          {["구매 내역", "판매 내역", "경매 내역"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`mp-subtab-btn${activeSubTab === tab ? " active" : ""}`}
              onClick={() => {
                setActiveSubTab(tab);
                setPage(1);
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              style={{
                padding: "5px 10px",
                borderRadius: 6,
                border: `1px solid ${period === p ? "#7c3aed" : "#27272a"}`,
                background:
                  period === p ? "rgba(124,58,237,0.1)" : "transparent",
                color: period === p ? "#a78bfa" : "#71717a",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            style={{
              padding: "5px 10px",
              borderRadius: 6,
              border: "1px solid #27272a",
              background: "transparent",
              color: "#71717a",
              fontSize: 11,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Icon.Calendar /> 직접 설정
          </button>
        </div>
      </div>
      <div style={{ borderBottom: "1px solid #27272a", marginBottom: 20 }} />

      {loading ? (
        <div className="mp-empty">불러오는 중...</div>
      ) : pageData.length === 0 ? (
        <div className="mp-empty">{activeSubTab} 내역이 없습니다.</div>
      ) : (
        <div className="mp-activity-list">
          {pageData.map((raw, i) => {
            const item = mapItem(raw, i);
            return (
              <div
                key={item.id}
                className="mp-activity-item"
                onClick={() => item.targetPath && navigate(item.targetPath)}
                role={item.targetPath ? "button" : undefined}
                tabIndex={item.targetPath ? 0 : undefined}
                onKeyDown={(e) => {
                  if (item.targetPath && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    navigate(item.targetPath);
                  }
                }}
                style={{
                  alignItems: "center",
                  cursor: item.targetPath ? "pointer" : "default",
                }}
              >
                <div
                  className="mp-activity-img"
                  style={{
                    width: 48,
                    height: 48,
                    fontSize: 22,
                    overflow: "hidden",
                  }}
                >
                  {item.thumbnailImg ? (
                    <img
                      src={item.thumbnailImg}
                      alt={item.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    item.img
                  )}
                </div>
                <div className="mp-activity-body">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <Badge color={item.tagColor}>{item.tag}</Badge>
                    {item.gameName && (
                      <span style={{ fontSize: 10, color: "#52525b" }}>
                        {item.gameName}
                        {item.serverName ? ` · ${item.serverName}` : ""}
                      </span>
                    )}
                    <span style={{ fontSize: 10, color: "#52525b" }}>
                      #{item.id}
                    </span>
                  </div>
                  <div className="mp-activity-title">{item.title}</div>
                  <div className="mp-activity-sub">{item.sub}</div>
                  {item.seller && (
                    <div className="mp-activity-sub">{item.seller}</div>
                  )}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 900,
                      fontFamily: "monospace",
                      color: "#fff",
                      marginBottom: 6,
                    }}
                  >
                    ₩{fmt(item.price)}
                  </div>
                  <Badge color={item.statusColor}>{item.status}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {clientTotalPages > 1 && (
        <div className="mp-pagination">
          <button
            type="button"
            className="mp-page-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            style={{ opacity: page === 1 ? 0.4 : 1 }}
          >
            &lt;
          </button>
          {Array.from({ length: clientTotalPages }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                type="button"
                className={`mp-page-btn${p === page ? " active" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            className="mp-page-btn"
            disabled={page === clientTotalPages}
            onClick={() => setPage((p) => p + 1)}
            style={{ opacity: page === clientTotalPages ? 0.4 : 1 }}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}

// ── 등록 물품 탭 ───────────────────────────────────────────────
function ItemsTab({ navigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(null);
  const [activeItemTab, setActiveItemTab] = useState("전체");
  const ITEM_TABS = ["전체", "직거래", "경매"];

  const STATUS_KO = {
    SELLING: "판매중",
    RESERVED: "예약중",
    COMPLETED: "완료",
    DELETED: "삭제됨",
  };
  const STATUS_COLOR = {
    SELLING: "green",
    RESERVED: "amber",
    COMPLETED: "zinc",
    DELETED: "zinc",
  };
  const HIDDEN_ITEM_STATUSES = [
    "DELETED",
    "COMPLETED",
    "COMPLETE",
    "SOLD",
    "FINISHED",
    "SETTLED",
    "SUCCESSFUL_BID",
  ];

  const normalizeRegisteredItem = (raw) => {
    const item = raw?.item ?? raw?.auctionItem ?? raw?.product ?? raw ?? {};
    const itemId =
      raw?.itemId ??
      raw?.id ??
      item?.itemId ??
      item?.id ??
      raw?.auctionId ??
      null;
    const tradeType = String(
      raw?.tradeType ??
        raw?.type ??
        raw?.itemType ??
        (raw?.auctionId || raw?.auction ? "AUCTION" : "DIRECT"),
    ).toUpperCase();
    const itemIdForStatus =
      raw?.itemId ??
      raw?.id ??
      item?.itemId ??
      item?.id ??
      raw?.auctionId ??
      null;
    const auctionIdForStatus =
      raw?.auctionId ??
      raw?.auction?.auctionId ??
      raw?.auction?.id ??
      item?.auctionId ??
      item?.auction?.auctionId ??
      item?.auction?.id ??
      null;
    const isLocallySettled =
      auctionIdForStatus &&
      localStorage.getItem(`wondealerSettledAuction:${auctionIdForStatus}`) ===
        "true";
    const status = isLocallySettled
      ? "COMPLETED"
      : String(
          raw?.status ??
            raw?.itemStatus ??
            raw?.tradeStatus ??
            item?.status ??
            "SELLING",
        ).toUpperCase();
    const thumbnailImg =
      raw?.thumbnailImg ??
      raw?.imageUrl ??
      raw?.images?.[0] ??
      raw?.imageUrls?.[0] ??
      item?.thumbnailImg ??
      item?.imageUrl ??
      item?.images?.[0] ??
      item?.imageUrls?.[0] ??
      "";

    return {
      ...raw,
      ...item,
      itemId: itemId ?? itemIdForStatus,
      tradeType,
      status,
      title:
        raw?.title ??
        raw?.itemName ??
        raw?.itemTitle ??
        item?.title ??
        item?.itemName ??
        "",
      description: raw?.description ?? item?.description ?? "",
      basePrice: toAmount(
        raw?.basePrice ??
          raw?.price ??
          raw?.itemPrice ??
          raw?.startPrice ??
          raw?.currentPrice ??
          item?.basePrice ??
          item?.price ??
          item?.itemPrice,
      ),
      categoryId: raw?.categoryId ?? item?.categoryId,
      categoryName: raw?.categoryName ?? item?.categoryName ?? "",
      serverId: raw?.serverId ?? item?.serverId,
      serverName: raw?.serverName ?? item?.serverName ?? "",
      gameName: raw?.gameName ?? item?.gameName ?? "",
      createdAt: raw?.createdAt ?? item?.createdAt ?? "",
      thumbnailImg,
    };
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${Common.API_URL}/api/members/me/items?page=0&size=100`,
        {
          headers: { Authorization: `Bearer ${token()}` },
          cache: "no-store",
        },
      );
      if (!res.ok) throw new Error();
      const json = await res.json();
      const list =
        json?.data?.content ??
        json?.data?.items ??
        json?.data?.list ??
        json?.content ??
        json?.items ??
        json?.list ??
        (Array.isArray(json?.data) ? json.data : null) ??
        (Array.isArray(json) ? json : []);
      setItems(Array.isArray(list) ? list.map(normalizeRegisteredItem) : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (itemId) => {
    if (!window.confirm("이 물품을 삭제하시겠습니까?")) return;
    setDeleting(itemId);
    try {
      const res = await fetch(`${Common.API_URL}/api/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "삭제에 실패했습니다.");
      }
      setItems((prev) => prev.filter((item) => item.itemId !== itemId));
    } catch (err) {
      alert(err.message || "삭제에 실패했습니다.");
    } finally {
      setDeleting(null);
    }
  };

  const handleEditSave = async (itemId) => {
    const priceValue = Number(editPrice);
    if (!priceValue || priceValue <= 0) {
      alert("올바른 가격을 입력해주세요.");
      return;
    }

    const currentItem = items.find((item) => item.itemId === itemId);
    if (!currentItem) return;

    setSaving(itemId);
    try {
      const res = await fetch(`${Common.API_URL}/api/items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          title: currentItem.title,
          description:
            currentItem.description ||
            currentItem.details ||
            currentItem.title ||
            "상세 설명 없음",
          basePrice: priceValue,
          categoryId: currentItem.categoryId,
          serverId: currentItem.serverId,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "수정에 실패했습니다.");
      }

      setItems((prev) =>
        prev.map((item) =>
          item.itemId === itemId ? { ...item, basePrice: priceValue } : item,
        ),
      );
      setEditingId(null);
      alert("가격이 수정되었습니다.");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(null);
    }
  };

  const filtered = items.filter((item) => {
    if (HIDDEN_ITEM_STATUSES.includes(item.status)) return false;
    if (activeItemTab === "전체") return true;
    if (activeItemTab === "직거래") return item.tradeType === "DIRECT";
    if (activeItemTab === "경매") return item.tradeType.includes("AUCTION");
    return true;
  });

  const visibleItems = items.filter(
    (item) => !HIDDEN_ITEM_STATUSES.includes(item.status),
  );
  const sellingCount = visibleItems.filter(
    (i) => i.status === "SELLING",
  ).length;
  const reservedCount = visibleItems.filter(
    (i) => i.status === "RESERVED",
  ).length;
  const totalPrice = items
    .filter((i) => i.status === "COMPLETED")
    .reduce((s, i) => s + (i.basePrice ?? 0), 0);

  if (loading) return <div className="mp-empty">불러오는 중...</div>;

  return (
    <div>
      <div className="mp-items-header">
        <div>
          <div className="mp-section-title">등록 물품 관리</div>
          <div className="mp-section-sub" style={{ marginBottom: 0 }}>
            마켓플레이스에 등록된 거래를 관리합니다.
          </div>
        </div>
        <button
          className="mp-btn-primary"
          type="button"
          onClick={() => navigate("/items/new")}
        >
          + 새 물품 등록
        </button>
      </div>

      <div className="mp-items-stats">
        {[
          { label: "현재 판매중인 물품", value: sellingCount, cls: "violet" },
          { label: "예약중인 물품", value: reservedCount, cls: "amber" },
          {
            label: "누적 완료 판매 금액",
            value: `₩${fmt(totalPrice)}`,
            cls: "green",
          },
        ].map((s) => (
          <div key={s.label} className="mp-items-stat">
            <div className="mp-items-stat-top">
              <span className="mp-items-stat-label">{s.label}</span>
            </div>
            <div className={`mp-items-stat-value ${s.cls}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mp-subtab-bar" style={{ marginBottom: 16 }}>
        {ITEM_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`mp-subtab-btn${activeItemTab === tab ? " active" : ""}`}
            onClick={() => setActiveItemTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="mp-table">
          <thead>
            <tr>
              <th>아이템 정보</th>
              <th>게임 / 서버</th>
              <th>카테고리</th>
              <th>가격</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="mp-empty">
                  등록된 물품이 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const id = item.itemId ?? item.id;
                const statusLabel = STATUS_KO[item.status] ?? item.status ?? "";
                const statusColor = STATUS_COLOR[item.status] ?? "zinc";
                const tradeLabel = item.tradeType.includes("AUCTION")
                  ? "경매"
                  : "직거래";
                const tradeColor = item.tradeType.includes("AUCTION")
                  ? "amber"
                  : "violet";
                const createdDate = item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString("ko-KR")
                  : "";
                const isAuctionItem = item.tradeType.includes("AUCTION");
                const canEdit = item.status === "SELLING" && !isAuctionItem;

                return (
                  <tr key={id}>
                    <td>
                      <div className="mp-item-cell">
                        <div
                          className="mp-item-icon"
                          style={{ overflow: "hidden" }}
                        >
                          {item.thumbnailImg ? (
                            <img
                              src={item.thumbnailImg}
                              alt={item.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            "📦"
                          )}
                        </div>
                        <div>
                          <div className="mp-item-name">{item.title}</div>
                          <div className="mp-item-date">{createdDate}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "#a1a1aa", fontSize: 11 }}>
                      {item.gameName ?? ""}
                      {item.serverName ? ` · ${item.serverName}` : ""}
                    </td>
                    <td>
                      <Badge color={tradeColor}>{tradeLabel}</Badge>
                      {item.categoryName && (
                        <div
                          style={{
                            fontSize: 10,
                            color: "#71717a",
                            marginTop: 4,
                          }}
                        >
                          {item.categoryName}
                        </div>
                      )}
                    </td>
                    <td
                      style={{
                        fontWeight: 700,
                        fontFamily: "monospace",
                        color: "#fff",
                      }}
                    >
                      {editingId === id ? (
                        <input
                          value={editPrice}
                          onChange={(e) =>
                            setEditPrice(e.target.value.replace(/\D/g, ""))
                          }
                          className="mp-form-input"
                          style={{
                            width: 120,
                            padding: "4px 8px",
                            fontSize: 12,
                          }}
                          autoFocus
                        />
                      ) : (
                        `₩${fmt(item.basePrice ?? 0)}`
                      )}
                    </td>
                    <td>
                      <Badge color={statusColor}>{statusLabel}</Badge>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        {editingId === id ? (
                          <>
                            <button
                              className="mp-icon-btn"
                              type="button"
                              onClick={() => handleEditSave(id)}
                              disabled={saving === id}
                              style={{ color: "#4ade80" }}
                              title="저장"
                            >
                              {saving === id ? "..." : "✓"}
                            </button>
                            <button
                              className="mp-icon-btn"
                              type="button"
                              onClick={() => setEditingId(null)}
                              title="취소"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="mp-icon-btn"
                              type="button"
                              disabled={!canEdit}
                              style={{ opacity: canEdit ? 1 : 0.3 }}
                              onClick={() => {
                                if (!canEdit) return;
                                setEditingId(id);
                                setEditPrice(String(item.basePrice ?? 0));
                              }}
                              title={
                                canEdit
                                  ? "가격 수정"
                                  : isAuctionItem
                                    ? "경매 물품은 가격 수정 불가"
                                    : "판매중 상태에서만 수정 가능"
                              }
                            >
                              <Icon.Edit2 />
                            </button>
                            <button
                              className="mp-icon-btn danger"
                              type="button"
                              onClick={() => handleDelete(id)}
                              disabled={deleting === id}
                              title="삭제"
                            >
                              {deleting === id ? "..." : <Icon.Trash2 />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 고객센터 ──────────────────────────────────────────────────
const NOTICE_CATEGORIES = ["전체", "시스템", "이벤트", "점검안내"];
const FAQ_CATEGORIES = [
  "전체",
  "마일리지/환전",
  "거래/보안",
  "계정 관리",
  "수수료 정책",
];
const PAGE_SIZE = 5;

const MOCK_NOTICES = [
  {
    id: 1,
    category: "이벤트",
    title: "신규 가입 유저를 위한 포인트 환급 이벤트 (5월)",
    date: "2024.05.20",
    content:
      "5월 한 달간 신규 가입 유저를 대상으로 최대 10,000P를 환급해드립니다.\n\n자세한 참여 방법은 이벤트 페이지를 참고해주세요.",
  },
  {
    id: 2,
    category: "시스템",
    title: "입출금 수수료 개편 및 네트워크 최적화 안내",
    date: "2024.05.18",
    content:
      "입출금 수수료 정책이 일부 변경됩니다.\n\n- 일반 회원: 3%\n- Pro Member: 2.5%",
  },
  {
    id: 3,
    category: "점검안내",
    title: "5월 24일 정기 서버 점검 안내 (오전 02:00 ~ 06:00)",
    date: "2024.05.15",
    content:
      "안정적인 서비스 운영을 위해 정기 점검이 진행됩니다.\n\n점검 시간 동안 서비스 이용이 제한됩니다.",
  },
  {
    id: 4,
    category: "이벤트",
    title: "희귀 아이템 경매 입찰 성공 인증하고 포인트 받자!",
    date: "2024.05.12",
    content: "경매 낙찰 인증샷을 커뮤니티에 업로드하면 포인트를 지급합니다.",
  },
  {
    id: 5,
    category: "시스템",
    title: "개인정보 처리방침 및 이용약관 개정 안내",
    date: "2024.05.10",
    content: "개인정보 처리방침 및 이용약관이 일부 개정되었습니다.",
  },
];

const MOCK_FAQS = [
  {
    id: 1,
    category: "마일리지/환전",
    question: "마일리지 환전은 어떻게 신청하나요?",
    answer:
      "마일리지 환전은 다음과 같은 절차로 신청할 수 있습니다.\n\n1. 보유 마일리지 확인 후 환전 신청 클릭\n2. 환전 신청 시 본인 명의 계좌로 신청\n3. 2차 인증(OTP) 또는 비밀번호 인증 완료\n\n신청 완료 후 영업일 기준 최대 24시간 이내에 처리됩니다.",
  },
  {
    id: 2,
    category: "거래/보안",
    question: "아이템 거래 사기를 당했을 때 어떻게 하나요?",
    answer:
      "즉시 고객센터에 신고해주세요. 에스크로 시스템으로 보호된 거래는 전액 보상됩니다.",
  },
  {
    id: 3,
    category: "계정 관리",
    question: "계정 인증 수단을 변경하고 싶습니다.",
    answer:
      "마이페이지 > 회원정보 수정에서 이메일 및 전화번호를 변경할 수 있습니다.",
  },
  {
    id: 4,
    category: "수수료 정책",
    question: "거래 수수료 정책이 궁금해요.",
    answer: "일반 회원은 3%, Pro Member는 2.5%의 수수료가 적용됩니다.",
  },
];

const SUPPORT_VIEWS = {
  HOME: "home",
  NOTICE_LIST: "notice_list",
  NOTICE_DETAIL: "notice_detail",
  FAQ_LIST: "faq_list",
  FAQ_DETAIL: "faq_detail",
};

function NoticeListView({ onSelect, onBack }) {
  const [category, setCategory] = useState("전체");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  const filtered = MOCK_NOTICES.filter((n) => {
    const matchCat = category === "전체" || n.category === category;
    return (
      matchCat && n.title.toLowerCase().includes(keyword.trim().toLowerCase())
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="mp-support-back" onClick={onBack}>
        <Icon.ChevronLeft /> 고객센터로 돌아가기
      </div>
      <div className="mp-section-title">공지사항</div>
      <div className="mp-section-sub">
        WONDEALER의 최신 소식과 시스템 안내를 확인하세요.
      </div>
      <div className="mp-notice-toolbar">
        <div className="mp-category-tabs">
          {NOTICE_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`mp-category-tab${category === c ? " active" : ""}`}
              onClick={() => {
                setCategory(c);
                setPage(1);
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mp-search-box">
          <Icon.Search />
          <input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            placeholder="공지사항 제목 또는 내용 검색"
          />
        </div>
      </div>
      <div className="mp-card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="mp-table mp-notice-table">
          <thead>
            <tr>
              <th style={{ width: 110 }}>CATEGORY</th>
              <th>TITLE</th>
              <th style={{ width: 110 }}>DATE</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={3} className="mp-empty">
                  등록된 공지사항이 없습니다.
                </td>
              </tr>
            ) : (
              pageItems.map((n) => (
                <tr
                  key={n.id}
                  className="mp-notice-row"
                  onClick={() => onSelect(n.id)}
                >
                  <td>
                    <Badge
                      color={
                        n.category === "이벤트"
                          ? "amber"
                          : n.category === "점검안내"
                            ? "violet"
                            : "zinc"
                      }
                    >
                      {n.category}
                    </Badge>
                  </td>
                  <td className="mp-notice-row-title">{n.title}</td>
                  <td style={{ color: "#71717a", fontSize: 12 }}>{n.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mp-pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              className={`mp-page-btn${p === page ? " active" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NoticeDetailView({ noticeId, onBack }) {
  const notice = MOCK_NOTICES.find((n) => n.id === noticeId);
  if (!notice)
    return (
      <div>
        <div className="mp-support-back" onClick={onBack}>
          <Icon.ChevronLeft /> 목록으로 돌아가기
        </div>
        <div className="mp-empty">존재하지 않는 공지사항입니다.</div>
      </div>
    );
  return (
    <div>
      <div className="mp-support-back" onClick={onBack}>
        <Icon.ChevronLeft /> 목록으로 돌아가기
      </div>
      <div className="mp-card mp-notice-detail">
        <Badge
          color={
            notice.category === "이벤트"
              ? "amber"
              : notice.category === "점검안내"
                ? "violet"
                : "zinc"
          }
        >
          {notice.category}
        </Badge>
        <h2 className="mp-notice-detail-title">{notice.title}</h2>
        <div className="mp-notice-detail-meta">
          <span>
            <Icon.Calendar /> {notice.date}
          </span>
        </div>
        <div className="mp-notice-detail-body">
          {notice.content
            .split("\n")
            .map((line, i) =>
              line.trim() === "" ? <br key={i} /> : <p key={i}>{line}</p>,
            )}
        </div>
      </div>
    </div>
  );
}

function FaqListView({ onSelect, onBack }) {
  const [category, setCategory] = useState("전체");
  const [keyword, setKeyword] = useState("");
  const [openId, setOpenId] = useState(null);

  const filtered = MOCK_FAQS.filter((f) => {
    const matchCat = category === "전체" || f.category === category;
    return (
      matchCat &&
      f.question.toLowerCase().includes(keyword.trim().toLowerCase())
    );
  });

  return (
    <div>
      <div className="mp-support-back" onClick={onBack}>
        <Icon.ChevronLeft /> 고객센터로 돌아가기
      </div>
      <div className="mp-section-title">자주 묻는 질문</div>
      <div className="mp-section-sub">
        WONDEALER 서비스 이용 중 궁금하신 점을 빠르게 확인하세요.
      </div>
      <div className="mp-notice-toolbar">
        <div className="mp-category-tabs">
          {FAQ_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`mp-category-tab${category === c ? " active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mp-search-box">
          <Icon.Search />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="키워드로 검색"
          />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="mp-empty">등록된 질문이 없습니다.</div>
      ) : (
        <div className="mp-faq-list">
          {filtered.map((faq) => (
            <div key={faq.id} className="mp-faq-item">
              <button
                type="button"
                className="mp-faq-btn"
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              >
                <span className="mp-faq-question">
                  <Badge color="zinc">{faq.category}</Badge>
                  {faq.question}
                </span>
                {openId === faq.id ? <Icon.ChevronUp /> : <Icon.ChevronDown />}
              </button>
              {openId === faq.id && (
                <div className="mp-faq-answer">
                  {faq.answer.split("\n").map((line, i) =>
                    line.trim() === "" ? (
                      <br key={i} />
                    ) : (
                      <p key={i} style={{ margin: "4px 0" }}>
                        {line}
                      </p>
                    ),
                  )}
                  <button
                    type="button"
                    className="mp-faq-detail-link"
                    onClick={() => onSelect(faq.id)}
                  >
                    상세보기 <Icon.ChevronRight />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mp-support-cta">
        <div className="mp-support-cta-card">
          <div className="mp-support-cta-title">찾으시는 질문이 없나요?</div>
          <div className="mp-support-cta-desc">
            고객센터 상담원이 1:1로 신속하게 답변해드립니다.
          </div>
          <button
            type="button"
            className="mp-btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Icon.MessageCircle /> 1:1 문의하기
          </button>
        </div>
        <div className="mp-support-cta-card highlight">
          <div className="mp-support-cta-title">
            <Icon.AlertCircle /> 안전 거래 공지
          </div>
          <div className="mp-support-cta-desc">
            WONDEALER는 24시간 실시간 모니터링을 통해 안전한 거래 환경을
            제공합니다.
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqDetailView({ faqId, onBack }) {
  const faq = MOCK_FAQS.find((f) => f.id === faqId);
  if (!faq)
    return (
      <div>
        <div className="mp-support-back" onClick={onBack}>
          <Icon.ChevronLeft /> 목록으로 돌아가기
        </div>
        <div className="mp-empty">존재하지 않는 질문입니다.</div>
      </div>
    );
  return (
    <div>
      <div className="mp-support-back" onClick={onBack}>
        <Icon.ChevronLeft /> 목록으로 돌아가기
      </div>
      <div className="mp-card mp-notice-detail">
        <Badge color="zinc">{faq.category}</Badge>
        <h2 className="mp-notice-detail-title">{faq.question}</h2>
        <div className="mp-notice-detail-body">
          {faq.answer
            .split("\n")
            .map((line, i) =>
              line.trim() === "" ? <br key={i} /> : <p key={i}>{line}</p>,
            )}
        </div>
      </div>
      <div className="mp-support-cta" style={{ marginTop: 16 }}>
        <div className="mp-support-cta-card highlight" style={{ flex: 1 }}>
          <div className="mp-support-cta-title">
            <Icon.AlertCircle /> 안내사항
          </div>
          <div className="mp-support-cta-desc">
            상기 안내에도 문제가 해결되지 않을 경우 1:1 문의를 통해 추가 도움을
            받아보실 수 있습니다.
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportHomeView({
  onGoNoticeList,
  onGoFaqList,
  onSelectNotice,
  onSelectFaq,
}) {
  const [openId, setOpenId] = useState(null);
  return (
    <div>
      <div className="mp-support-header">
        <div>
          <div className="mp-section-title">고객 센터</div>
          <div className="mp-section-sub" style={{ marginBottom: 0 }}>
            WONDEALER는 빠르고 정확한 고객 지원을 약속드립니다.
          </div>
        </div>
        <button
          type="button"
          className="mp-btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <Icon.MessageCircle /> 1:1 문의하기
        </button>
      </div>
      <div className="mp-support-grid">
        <div>
          <div className="mp-support-subtitle-row">
            <div className="mp-support-subtitle">
              <Icon.Megaphone /> 공지사항
            </div>
            <button
              type="button"
              className="mp-tx-link"
              onClick={onGoNoticeList}
            >
              전체보기
            </button>
          </div>
          {MOCK_NOTICES.slice(0, 3).map((n) => (
            <div
              key={n.id}
              className="mp-notice-item"
              onClick={() => onSelectNotice(n.id)}
              style={{ cursor: "pointer" }}
            >
              <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                <div className="mp-notice-title">{n.title}</div>
                <div className="mp-notice-date">{n.date}</div>
              </div>
              <Icon.ChevronRight />
            </div>
          ))}
          <div className="mp-support-headset-banner">
            <img
              src={headsetImg}
              alt="고객센터"
              className="mp-support-headset-img"
            />
            <div className="mp-support-headset-text">
              <div className="mp-support-headset-title">
                24시간 전담 고객지원
              </div>
              <div className="mp-support-headset-desc">
                언제든지 문의주시면
                <br />
                전문 상담원이 신속하게
                <br />
                도와드리겠습니다.
              </div>
              <button
                type="button"
                className="mp-btn-primary mp-support-headset-btn"
              >
                <Icon.MessageCircle /> 상담 시작하기
              </button>
            </div>
          </div>
        </div>
        <div>
          <div className="mp-support-subtitle-row">
            <div className="mp-support-subtitle">
              <Icon.HelpCircle /> 자주 묻는 질문
            </div>
            <button type="button" className="mp-tx-link" onClick={onGoFaqList}>
              전체보기
            </button>
          </div>
          {MOCK_FAQS.slice(0, 3).map((faq) => (
            <div key={faq.id} className="mp-faq-item">
              <button
                type="button"
                className="mp-faq-btn"
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              >
                <span>{faq.question}</span>
                {openId === faq.id ? <Icon.ChevronUp /> : <Icon.ChevronDown />}
              </button>
              {openId === faq.id && (
                <div className="mp-faq-answer">
                  {faq.answer
                    .split("\n")
                    .slice(0, 2)
                    .map((line, i) =>
                      line.trim() === "" ? (
                        <br key={i} />
                      ) : (
                        <p key={i} style={{ margin: "4px 0" }}>
                          {line}
                        </p>
                      ),
                    )}
                  <button
                    type="button"
                    className="mp-faq-detail-link"
                    onClick={() => onSelectFaq(faq.id)}
                  >
                    상세보기 <Icon.ChevronRight />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SupportTab() {
  const [view, setView] = useState(SUPPORT_VIEWS.HOME);
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);
  const [selectedFaqId, setSelectedFaqId] = useState(null);

  const goHome = () => setView(SUPPORT_VIEWS.HOME);
  const selectNotice = (id) => {
    setSelectedNoticeId(id);
    setView(SUPPORT_VIEWS.NOTICE_DETAIL);
  };
  const selectFaq = (id) => {
    setSelectedFaqId(id);
    setView(SUPPORT_VIEWS.FAQ_DETAIL);
  };

  switch (view) {
    case SUPPORT_VIEWS.NOTICE_LIST:
      return <NoticeListView onSelect={selectNotice} onBack={goHome} />;
    case SUPPORT_VIEWS.NOTICE_DETAIL:
      return (
        <NoticeDetailView
          noticeId={selectedNoticeId}
          onBack={() => setView(SUPPORT_VIEWS.NOTICE_LIST)}
        />
      );
    case SUPPORT_VIEWS.FAQ_LIST:
      return <FaqListView onSelect={selectFaq} onBack={goHome} />;
    case SUPPORT_VIEWS.FAQ_DETAIL:
      return (
        <FaqDetailView
          faqId={selectedFaqId}
          onBack={() => setView(SUPPORT_VIEWS.FAQ_LIST)}
        />
      );
    default:
      return (
        <SupportHomeView
          onGoNoticeList={() => setView(SUPPORT_VIEWS.NOTICE_LIST)}
          onGoFaqList={() => setView(SUPPORT_VIEWS.FAQ_LIST)}
          onSelectNotice={selectNotice}
          onSelectFaq={selectFaq}
        />
      );
  }
}

// ── 사이드바 ──────────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { key: "mileage", label: "마일리지 조회", Icon: Icon.Coins },
  { key: "profile", label: "회원정보 수정", Icon: Icon.User },
  { key: "activity", label: "활동 기록", Icon: Icon.Activity },
  { key: "items", label: "등록 물품 관리", Icon: Icon.Package },
  { key: "support", label: "고객센터", Icon: Icon.Headphones },
];

const TAB_TO_SIDEBAR_KEY = { charge: "mileage", withdraw: "mileage" };

// ── 메인 ──────────────────────────────────────────────────────
export default function MyPage({ tab: defaultTab }) {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab || "mileage");
  const [sidebarNickname, setSidebarNickname] = useState(
    user?.nickname || "사용자",
  );
  const [sidebarProfileImg, setSidebarProfileImg] = useState(() =>
    getSavedProfileImage(),
  );

  const [sharedBalance, setSharedBalance] = useState(0);
  const [bankInfo, setBankInfo] = useState(() => getSavedBankInfo());

  // 잔액은 이 함수가 유일한 출처. 충전/출금 직후에도, 페이지 재진입 시에도 항상 이걸로 서버와 재동기화한다.
  const fetchBalance = useCallback(async () => {
    try {
      const res = await WalletApi.getWallet();
      const d = res.data?.data ?? res.data;
      const serverBalance = d?.balance ?? d?.mileage ?? d?.mileageBalance ?? 0;
      setSharedBalance(serverBalance - getWithdrawAdjustment());
    } catch (e) {
      console.error("잔액 조회 오류:", e);
    }
  }, []);

  // 계좌 정보도 잔액과 동일하게 단일 출처(fetchBankInfo)로만 관리한다.
  // ProfileTab에서 계좌 저장이 끝나면 이 함수를 다시 호출해 즉시 동기화하므로,
  // 출금 신청 탭은 항상 최신 계좌 정보를 받는다.
  const fetchBankInfo = useCallback(async () => {
    try {
      const res = await fetch(`${Common.API_URL}/api/members/me`, {
        headers: { Authorization: `Bearer ${token()}` },
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = await res.json();
      // ProfileTab과 동일한 파싱 방식 사용
      const d = json.data ?? json;
      const bank = d.bankInfo ?? d.bank ?? d.withdrawAccount ?? d;
      const nextBankInfo = mergeBankInfo(bank);
      setBankInfo(nextBankInfo);
      if (nextBankInfo.accountNumber) saveBankInfo(nextBankInfo);
      const nextProfileImg =
        d.profileImg ?? d.profileImage ?? d.profileImageUrl ?? "";
      if (nextProfileImg) {
        saveProfileImage(nextProfileImg);
        setSidebarProfileImg(nextProfileImg);
      } else {
        const savedProfileImg = getSavedProfileImage();
        if (savedProfileImg) setSidebarProfileImg(savedProfileImg);
      }
    } catch (e) {
      console.error("계좌 정보 조회 오류:", e);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchBankInfo();
  }, [fetchBalance, fetchBankInfo]);

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  const handleDeleteAccount = () => {
    logout();
    navigate("/");
  };

  const activeSidebarKey = TAB_TO_SIDEBAR_KEY[activeTab] ?? activeTab;

  const renderMain = () => {
    switch (activeTab) {
      case "mileage":
        return (
          <MileageTab
            balance={sharedBalance}
            onGoCharge={() => setActiveTab("charge")}
            onGoWithdraw={() => setActiveTab("withdraw")}
            navigate={navigate}
          />
        );
      case "charge":
        return (
          <ChargeTab
            balance={sharedBalance}
            onBack={() => setActiveTab("mileage")}
            onSuccess={(amt) => {
              setSharedBalance((prev) => prev + amt); // 낙관적 업데이트로 즉시 반영
              setActiveTab("mileage");
              alert(`${fmt(amt)}M 충전이 완료되었습니다.`);
              fetchBalance(); // 서버 기준 값으로 재확인
            }}
          />
        );
      case "withdraw":
        return (
          <WithdrawTab
            balance={sharedBalance}
            bankName={bankInfo.bankName}
            accountNumber={bankInfo.accountNumber}
            accountHolder={bankInfo.accountHolder}
            onBack={() => setActiveTab("mileage")}
            onSuccess={(amt) => {
              addWithdrawAdjustment(amt);
              setSharedBalance((prev) => prev - amt);
              setActiveTab("mileage");
              alert(`${fmt(amt)}M 출금 신청이 완료되었습니다.`);
            }}
          />
        );
      case "profile":
        return (
          <ProfileTab
            user={user}
            onDeleteAccount={handleDeleteAccount}
            onNicknameSaved={setSidebarNickname}
            onProfileImgSaved={setSidebarProfileImg}
            onBankSaved={(nextBankInfo) => {
              setBankInfo(saveBankInfo(nextBankInfo));
              fetchBankInfo();
            }}
          />
        );
      case "activity":
        return <ActivityTab navigate={navigate} />;
      case "items":
        return <ItemsTab navigate={navigate} />;
      case "support":
        return <SupportTab />;
      default:
        return null;
    }
  };

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
