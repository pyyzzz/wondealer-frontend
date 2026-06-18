import React, { useState, useEffect } from "react";
import WalletApi from "../../api/wallet.api";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const fmt = (n) => Number(n ?? 0).toLocaleString("ko-KR");

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

  const productPrice = product?.price ?? 0;
  const serviceFee = Math.floor(productPrice * 0.05);
  const totalAmount = productPrice + serviceFee;

  // 필수 약관 동의 여부 체크 변수
  const isAllRequiredTermsChecked = terms.service && terms.privacy;

  useEffect(() => {
    if (isOpen) {
      const fetchWalletBalance = async () => {
        try {
          const response = await WalletApi.getWallet();
          const bal =
            response.data?.data?.balance ?? response.data?.balance ?? 0;
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
      if (paymentMethod === "WONPAY") {
        if (balance < totalAmount) {
          alert("마일리지가 부족합니다. 마일리지를 충전하세요.");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/payments/wonpay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            productId: product.id,
            amount: totalAmount,
          }),
        });

        if (!response.ok) {
          throw new Error("마일리지 결제 처리 중 오류가 발생했습니다.");
        }

        // 백엔드 응답에서 남은 잔액 계산 혹은 수신 데이터가 있다면 파싱
        const resData = await response.json();
        const newBalance =
          resData?.data?.balance ?? resData?.balance ?? balance - totalAmount;

        alert("WonPay 마일리지 결제가 완료되었습니다!");
        if (onPaymentSuccess) onPaymentSuccess(newBalance);
        onClose();
      } else {
        const readyResponse = await WalletApi.prepareCharge({
          amount: totalAmount,
        });
        const readyData = readyResponse.data?.data ?? readyResponse.data;
        const { paymentId, amount, orderName, currency } = readyData;

        const portOneCurrency = currency === "CURRENCY_KRW" ? "KRW" : currency;

        const portoneRes = await window.PortOne.requestPayment({
          storeId: process.env.REACT_APP_PORTONE_STORE_ID,
          channelKey: process.env.REACT_APP_PORTONE_CHANNEL_KEY,
          paymentId: paymentId,
          orderName: orderName || product.name,
          totalAmount: amount,
          currency: portOneCurrency,
          payMethod: "CARD",
        });

        if (portoneRes.code !== undefined) {
          alert(`카드 결제 실패/취소: ${portoneRes.message}`);
          setLoading(false);
          return;
        }

        const completeResponse = await WalletApi.completeCharge({
          paymentId: paymentId,
        });
        const completeData =
          completeResponse.data?.data ?? completeResponse.data;

        alert(
          `카드 결제 및 검증이 완료되었습니다!\n현재 충전 잔액: ${fmt(completeData.balance)} 원`,
        );

        if (onPaymentSuccess) onPaymentSuccess(completeData.balance);
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
                  <b style={{ color: "#9ca3af", fontWeight: "600" }}>(필수)</b>{" "}
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
                  <b style={{ color: "#9ca3af", fontWeight: "600" }}>(필수)</b>{" "}
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
                  <b style={{ color: "#9ca3af", fontWeight: "600" }}>(선택)</b>{" "}
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
            disabled={loading || !isAllRequiredTermsChecked}
            isLoading={loading}
          >
            {loading ? "결제 처리 중..." : "결제하기"}
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
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 560px;
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
  border-bottom: 1px solid var(--border-color);
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
  color: var(--text-secondary);
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
  display: flex;
  flex-direction: column;
  gap: 24px;

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
  background: var(--bg-container-low);
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
  border: 1px solid var(--border-color);
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
  background: var(--bg-container-low);

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
    border-top: 1px solid #222226;
    padding-top: 8px;
  }
`;

const ItemPrice = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
`;

const ItemQuantity = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
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

  background: ${(props) => (props.$isActive ? "var(--color-primary-container)" : "var(--bg-container)")};
  border: 2px solid ${(props) => (props.$isActive ? "var(--color-primary)" : "var(--border-color)")};
  color: ${(props) => (props.$isActive ? "var(--text-primary)" : "var(--text-secondary)")};

  &:hover {
    border-color: ${(props) => (props.$isActive ? "var(--color-primary)" : "var(--border-color)")};
    background-color: var(--bg-container-high);
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
  color: var(--text-secondary);
  margin-top: 4px;
`;

const ReceiptCard = styled.div`
  background: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;

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
  background-color: var(--border-color);
  margin: 8px 0;
`;

const TotalVal = styled.span`
  color: var(--color-primary);
  font-size: 20px;
`;

const TermsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
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
    color: var(--color-error);
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
  border-top: 1px solid var(--border-color);
  display: flex;
  background-color: var(--bg-container);

  @media (max-width: 576px) {
    padding: 12px 16px;
  }
`;

const ConfirmButton = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  border: none;
  color: #ffffff;
  transition: all 0.2s;

  background: var(--color-primary);
  cursor: ${(props) => (props.isLoading ? "not-allowed" : "pointer")};

  &:hover:not(:disabled) {
    filter: brightness(1.1);
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
