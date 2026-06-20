import React, { useState, useEffect } from "react";
import WalletApi from "../../api/wallet.api";
import TradeApi from "../../api/trade.api";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const fmt = (n) => Number(n ?? 0).toLocaleString("ko-KR");
const toNumber = (value) =>
  Number(String(value ?? 0).replace(/[^\d.-]/g, "")) || 0;

const loadPortOneSdk = () =>
  new Promise((resolve, reject) => {
    if (window.PortOne) {
      resolve(window.PortOne);
      return;
    }

    const existingScript = document.querySelector('script[src*="portone.io"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.PortOne), {
        once: true,
      });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.portone.io/v2/browser-sdk.js";
    script.async = true;
    script.onload = () => resolve(window.PortOne);
    script.onerror = reject;
    document.body.appendChild(script);
  });

const Icon = {
  X: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Wallet: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      <path d="M16 3l-4 4-4-4" />
    </svg>
  ),
  CreditCard: () => (
    <svg
      width="16"
      height="16"
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
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ marginRight: "3px" }}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

const PaymentPage = ({
  isOpen,
  onClose,
  product = {
    id: 1,
    name: "Neon Reaper v.4.0",
    price: 145000,
    imageUrl: "",
    tag: "LEGENDARY ITEM",
    server: "아시아 1",
    seller: "CyberGhost_99",
    quantity: 1,
  },
  onPaymentSuccess,
}) => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("WONPAY");
  const [loading, setLoading] = useState(false);

  const [terms, setTerms] = useState({
    service: false,
    privacy: false,
    thirdParty: false,
  });

  const productPrice = toNumber(
    product?.price ??
      product?.basePrice ??
      product?.itemPrice ??
      product?.tradePrice ??
      0,
  );
  const serviceFee = 0;
  const totalAmount = productPrice + serviceFee;

  // 필수 약관 동의 여부 체크 변수
  const isAllRequiredTermsChecked = terms.service && terms.privacy;

  useEffect(() => {
    if (isOpen) {
      const fetchWalletBalance = async () => {
        try {
          const response = await WalletApi.getWallet();
          const bal = toNumber(
            response.data?.data?.balance ??
              response.data?.balance ??
              response.data?.data?.wallet?.balance ??
              response.data?.wallet?.balance,
          );
          setBalance(bal);
        } catch (error) {
          console.error("지갑 잔액 조회 실패:", error);
        }
      };
      fetchWalletBalance();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTermChange = (e) => {
    const { name, checked } = e.target;
    setTerms((prev) => ({ ...prev, [name]: checked }));
  };

  const handleProcessPayment = async () => {
    if (!isAllRequiredTermsChecked) {
      alert("결제를 진행하시려면 모든 (필수) 약관에 동의하셔야 합니다.");
      return;
    }

    setLoading(true);

    try {
      const itemId = product?.id ?? product?.itemId ?? product?.productId;
      if (!itemId) {
        throw new Error("상품 정보를 찾을 수 없어 결제를 진행할 수 없습니다.");
      }
      if (!productPrice) {
        throw new Error(
          "상품 금액 정보를 찾을 수 없어 결제를 진행할 수 없습니다.",
        );
      }

      if (paymentMethod === "WONPAY") {
        if (balance < totalAmount) {
          alert("마일리지가 부족합니다. 마일리지를 충전해 주세요.");
          return;
        }

        await TradeApi.createWonPayTrade(itemId); // trade.api.js 호출

        if (onPaymentSuccess) onPaymentSuccess(balance - totalAmount);
        onClose();
      } else {
        const PortOne = await loadPortOneSdk();
        if (!PortOne) {
          throw new Error(
            "결제 모듈이 아직 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.",
          );
        }

        const paymentId = `trade-${itemId}-${Date.now()}`;
        const portoneRes = await PortOne.requestPayment({
          storeId: process.env.REACT_APP_PORTONE_STORE_ID,
          channelKey: process.env.REACT_APP_PORTONE_CHANNEL_KEY,
          paymentId,
          orderName: product.name,
          totalAmount: productPrice,
          currency: "KRW",
          payMethod: "CARD",
        });

        if (portoneRes?.code != null) {
          throw new Error(portoneRes.message || "카드 결제가 취소되었습니다.");
        }

        const completeResponse = await TradeApi.createPortOneTrade(
          // itemId와 paymentId 넘겨줌
          itemId,
          paymentId,
        ); // 결과 데이터를 completeResponse에 담는다
        const completeData =
          completeResponse.data?.data ?? completeResponse.data;

        if (onPaymentSuccess)
          onPaymentSuccess(completeData?.balance ?? balance);
        onClose();
      }
    } catch (error) {
      console.error("결제 프로세스 에러:", error);
      alert(error.message || "결제 진행 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <ModalBackdrop>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>주문 / 결제하기</ModalTitle>
          <CloseButton onClick={onClose} type="button">
            <Icon.X />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <SectionBlock>
            <SectionHeaderRow>
              <SectionLabel>구매 아이템 정보</SectionLabel>
              <EscrowBadge>
                <Icon.Shield /> ESCROW PROTECTED
              </EscrowBadge>
            </SectionHeaderRow>

            <SummaryCard>
              <ItemImage
                src={product.imageUrl || "https://via.placeholder.com/64"}
                alt={product.name}
              />
              <ItemDetails>
                {product.tag && <ItemTag>{product.tag}</ItemTag>}
                <ItemName>{product.name}</ItemName>
                <ItemMeta>
                  서버: {product.server} | 판매자: {product.seller}
                </ItemMeta>
              </ItemDetails>
              <ItemPriceBlock>
                <ItemPrice>₩{fmt(productPrice)}</ItemPrice>
                <ItemQuantity>수량: {product.quantity ?? 1}개</ItemQuantity>
              </ItemPriceBlock>
            </SummaryCard>
          </SectionBlock>

          <div>
            <SectionLabel>결제 수단 선택</SectionLabel>
            <MethodGroup>
              <PresetButton
                type="button"
                $isActive={paymentMethod === "WONPAY"}
                onClick={() => setPaymentMethod("WONPAY")}
              >
                <ButtonTitle>
                  <Icon.Wallet /> WonPay
                </ButtonTitle>
                <ButtonSubText>잔액: ₩{fmt(balance)}</ButtonSubText>
              </PresetButton>

              <PresetButton
                type="button"
                $isActive={paymentMethod === "CARD"}
                onClick={() => setPaymentMethod("CARD")}
              >
                <ButtonTitle>
                  <Icon.CreditCard /> 신용/체크카드
                </ButtonTitle>
                <ButtonSubText>간편결제 지원</ButtonSubText>
              </PresetButton>
            </MethodGroup>
          </div>

          <ReceiptCard>
            <ReceiptTitle>최종 주문 정보</ReceiptTitle>
            <ReceiptRows>
              <ReceiptRow>
                <span>상품 금액</span>
                <ReceiptVal>₩{fmt(productPrice)}</ReceiptVal>
              </ReceiptRow>
              <ReceiptRow>
                <span>서비스 수수료</span>
                <ReceiptVal>₩{fmt(serviceFee)}</ReceiptVal>
              </ReceiptRow>
              <ReceiptDivider />
              <ReceiptRow className="total">
                <span>최종 결제 금액</span>
                <TotalVal>₩{fmt(totalAmount)}</TotalVal>
              </ReceiptRow>
            </ReceiptRows>

            <TermsList>
              <TermsLabel>
                <Checkbox
                  type="checkbox"
                  name="service"
                  checked={terms.service}
                  onChange={handleTermChange}
                />
                <TermsText>
                  <b
                    style={{
                      color: "var(--text-secondary)",
                      fontWeight: "600",
                    }}
                  >
                    (필수)
                  </b>{" "}
                  <b className="underline">주문 정보 확인</b> 및 결제 서비스
                  이용약관에 동의합니다.
                </TermsText>
              </TermsLabel>
              <TermsLabel>
                <Checkbox
                  type="checkbox"
                  name="privacy"
                  checked={terms.privacy}
                  onChange={handleTermChange}
                />
                <TermsText>
                  <b
                    style={{
                      color: "var(--text-secondary)",
                      fontWeight: "600",
                    }}
                  >
                    (필수)
                  </b>{" "}
                  디지털 자산 거래의 특성상 결제 후{" "}
                  <b className="highlight">청약철회가 제한</b>될 수 있음에
                  동의합니다.
                </TermsText>
              </TermsLabel>
              <TermsLabel>
                <Checkbox
                  type="checkbox"
                  name="thirdParty"
                  checked={terms.thirdParty}
                  onChange={handleTermChange}
                />
                <TermsText>
                  <b
                    style={{
                      color: "var(--text-secondary)",
                      fontWeight: "600",
                    }}
                  >
                    (선택)
                  </b>{" "}
                  이벤트 및 혜택 알림 수신 동의
                </TermsText>
              </TermsLabel>
            </TermsList>
          </ReceiptCard>
        </ModalBody>

        <ModalFooter>
          <ConfirmButton
            type="button"
            onClick={handleProcessPayment}
            disabled={loading}
            isLoading={loading}
          >
            {loading
              ? "결제 처리 중..."
              : paymentMethod === "WONPAY"
                ? "마일리지로 결제"
                : "카드로 결제"}
          </ConfirmButton>
        </ModalFooter>
      </ModalContainer>
    </ModalBackdrop>
  );
};

// ── Styled Components 스타일 정의 (반응형 코드 복구 및 보완) ───────────────────────────────

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  padding: 16px;
  box-sizing: border-box;
`;

const ModalContainer = styled.div`
  background: var(--bg-container-low);
  color: var(--text-primary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.28);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1120px;
  animation: modalFadeIn 0.2s ease-out;

  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 576px) {
    border-radius: 12px;
  }
`;

const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid var(--outline-variant);
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 576px) {
    padding: 16px;
  }
`;

const ModalTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);

  @media (max-width: 576px) {
    font-size: 16px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-faint);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: var(--text-primary);
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 576px) {
    padding: 16px;
    gap: 16px;
  }
`;

const SectionBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EscrowBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background: var(--bg-container-high);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  letter-spacing: 0.5px;
`;

const SummaryCard = styled.div`
  background: var(--bg-container);
  border: 1px solid var(--outline-variant);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const ItemImage = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  background: var(--bg-container-high);

  @media (max-width: 576px) {
    width: 48px;
    height: 48px;
  }
`;

const ItemDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ItemTag = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  padding: 2px 4px;
  border-radius: 4px;
  width: fit-content;
`;

const ItemName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);

  @media (max-width: 576px) {
    font-size: 14px;
  }
`;

const ItemMeta = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const ItemPriceBlock = styled.div`
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media (max-width: 576px) {
    text-align: left;
    flex-direction: row;
    align-items: baseline;
    gap: 8px;
    width: 100%;
    justify-content: space-between;
    border-top: 1px solid var(--outline-variant);
    padding-top: 8px;
  }
`;

const ItemPrice = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: var(--color-success);
`;

const ItemQuantity = styled.div`
  font-size: 11px;
  color: var(--text-faint);
`;

const SectionLabel = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
`;

const MethodGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 10px;

  @media (max-width: 576px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const PresetButton = styled.button`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  background: ${(props) =>
    props.$isActive
      ? "color-mix(in srgb, var(--color-primary) 14%, var(--bg-container))"
      : "var(--bg-container)"};
  border: 2px solid
    ${(props) =>
      props.$isActive ? "var(--color-primary)" : "var(--outline-variant)"};
  color: ${(props) =>
    props.$isActive ? "var(--text-primary)" : "var(--text-secondary)"};

  &:hover {
    border-color: ${(props) =>
      props.$isActive ? "var(--color-primary)" : "var(--border-color)"};
    background-color: ${(props) =>
      props.$isActive
        ? "color-mix(in srgb, var(--color-primary) 18%, var(--bg-container))"
        : "var(--bg-container-high)"};
  }

  @media (max-width: 576px) {
    padding: 12px;
  }
`;

const ButtonTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
`;

const ButtonSubText = styled.div`
  font-size: 11px;
  color: var(--text-faint);
  margin-top: 4px;
`;

const ReceiptCard = styled.div`
  background: var(--bg-container);
  border: 1px solid var(--outline-variant);
  border-radius: 12px;
  padding: 20px;
  grid-column: 2;
  grid-row: 1 / span 2;

  @media (max-width: 900px) {
    grid-column: auto;
    grid-row: auto;
  }

  @media (max-width: 576px) {
    padding: 16px;
  }
`;

const ReceiptTitle = styled.div`
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
  font-size: 15px;
`;

const ReceiptRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ReceiptRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text-secondary);

  &.total {
    font-weight: 700;
    color: var(--text-primary);
    margin-top: 4px;
  }
`;

const ReceiptVal = styled.span`
  font-weight: 500;
  color: var(--text-primary);
`;

const ReceiptDivider = styled.div`
  height: 1px;
  background-color: var(--outline-variant);
  margin: 8px 0;
`;

const TotalVal = styled.span`
  color: var(--color-success);
  font-size: 20px;
`;

const TermsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--outline-variant);
`;

const TermsLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  color: var(--text-secondary);
`;

const TermsText = styled.span`
  line-height: 1.5;

  .underline {
    text-decoration: underline;
  }
  .highlight {
    color: var(--color-danger);
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
  cursor: pointer;
  margin-top: 1px;
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid var(--outline-variant);
  display: flex;
  justify-content: flex-end;
  background-color: var(--bg-container-low);

  @media (max-width: 576px) {
    padding: 12px 16px;
  }
`;

const ConfirmButton = styled.button`
  width: min(100%, 392px);
  padding: 14px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  border: none;
  color: var(--on-primary);
  transition: all 0.2s;

  background: ${(props) =>
    props.isLoading ? "var(--border-focus)" : "var(--color-primary-container)"};
  cursor: ${(props) => (props.isLoading ? "not-allowed" : "pointer")};

  &:hover:not(:disabled) {
    background: var(--color-primary);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 576px) {
    padding: 12px;
    font-size: 14px;
  }
`;

export default PaymentPage;
