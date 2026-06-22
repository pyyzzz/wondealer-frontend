import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import ItemApi from "../../api/item.api";
import ChatApi from "../../api/chat.api";
import { isDeletedItem } from "../../utils/adminLocalState";

const DUMMY_ITEM = {
  id: 1,
  title: "고대 드래곤 플레이트 아머",
  description:
    "드래곤 슬레이어의 비크라프라에서 전설적인 강함으로, 수천 년 된 드래곤 금속이 녹아내려 나오는 능력 스탯이 높아지며 날아오릅니다.",
  gameName: "LOST ARK",
  serverName: "VALHALLA-01",
  grade: "전설",
  category: "장비",
  price: 2450000,
  basePrice: 2450000,
  status: "SELLING",
  seller: "프리미엄 프레이더",
  sellerNickname: "프리미엄 프레이더",
  sellerRating: 4.9,
  sellerTrades: 1240,
  stats: [],
  images: [],
};

export default function ItemDetailPage() {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const { isLoggedIn, user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    ItemApi.getItem(itemId)
      .then((r) => {
        const d = r.data?.data ?? r.data ?? {};
        console.log("[item detail raw]", JSON.stringify(d));
        setItem(Object.keys(d).length > 0 && !isDeletedItem(d) ? d : null);
      })
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [itemId]);

  const handleChat = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      return navigate("/login");
    }
    if (isMine) {
      alert("본인이 등록한 물품입니다.");
      return;
    }
    setChatLoading(true);
    setError("");
    try {
      const res = await ChatApi.createChatRoom(Number(itemId));
      const roomId = res.data?.data?.chatRoomId;
      if (roomId) {
        navigate(`/chat?roomId=${roomId}`);
      } else {
        setError("채팅방 생성에 성공했지만 방 정보를 불러오지 못했습니다.");
      }
    } catch (err) {
      const message = err.response?.data?.message;
      setError(
        message || "채팅방 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setChatLoading(false);
    }
  };

  const fmt = (n) => Number(n || 0).toLocaleString("ko-KR");

  if (loading)
    return (
      <PageWrap>
        <CenterMsg>로딩 중...</CenterMsg>
      </PageWrap>
    );
  if (!item)
    return (
      <PageWrap>
        <CenterMsg>아이템을 찾을 수 없습니다.</CenterMsg>
      </PageWrap>
    );

  const price = item.price ?? item.basePrice ?? 0;
  const images = item.images ?? item.imageUrls ?? [];
  const stats = item.stats ?? [];
  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;
  const showPrevImage = () => {
    if (!hasMultipleImages) return;
    setCurrentImg((prev) => (prev - 1 + images.length) % images.length);
  };
  const showNextImage = () => {
    if (!hasMultipleImages) return;
    setCurrentImg((prev) => (prev + 1) % images.length);
  };
  const myNickname = user?.nickname ?? "";
  const sellerNickname = item.sellerNickname ?? item.seller ?? "";
  const isMine =
    !!myNickname && !!sellerNickname && myNickname === sellerNickname;

  return (
    <PageWrap>
      <Breadcrumb onClick={() => navigate("/items")}>
        MARKET &gt; ITEM DETAIL
      </Breadcrumb>
      <DetailGrid>
        <MediaSection>
          <MainImageBox>
            {hasImages ? (
              <img
                src={images[currentImg]}
                alt={item.title}
                onClick={() => setShowImageModal(true)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 12,
                  cursor: "zoom-in",
                }}
              />
            ) : (
              <ImgPlaceholder>📦</ImgPlaceholder>
            )}
            {hasMultipleImages && (
              <>
                <ImageArrowButton
                  type="button"
                  $side="left"
                  onClick={showPrevImage}
                  aria-label="이전 이미지"
                >
                  ‹
                </ImageArrowButton>
                <ImageArrowButton
                  type="button"
                  $side="right"
                  onClick={showNextImage}
                  aria-label="다음 이미지"
                >
                  ›
                </ImageArrowButton>
              </>
            )}
            <GradeBadge>{item.grade ?? "일반"}</GradeBadge>
          </MainImageBox>
          {hasMultipleImages && (
            <DotRow>
              {images.map((_, i) => (
                <Dot
                  key={i}
                  $active={i === currentImg}
                  onClick={() => setCurrentImg(i)}
                />
              ))}
            </DotRow>
          )}
          {stats.length > 0 && (
            <StatBar>
              {stats.map((s, i) => (
                <StatItem key={i}>
                  <StatLabel>{s.label}</StatLabel>
                  <StatVal>{s.value}</StatVal>
                </StatItem>
              ))}
            </StatBar>
          )}
        </MediaSection>

        <InfoSection>
          <ItemTitle>{item.title}</ItemTitle>
          <MetaGrid>
            <MetaItem>
              <MetaLabel>서버</MetaLabel>
              <MetaVal>{item.serverName || "전체"}</MetaVal>
            </MetaItem>
            <MetaItem>
              <MetaLabel>카테고리</MetaLabel>
              <MetaVal>{item.categoryName || item.category}</MetaVal>
            </MetaItem>
            <MetaItem>
              <MetaLabel>등급</MetaLabel>
              <MetaVal $grade>{item.grade ?? "일반"}</MetaVal>
            </MetaItem>
            <MetaItem>
              <MetaLabel>상태</MetaLabel>
              <MetaVal>
                {item.status === "SELLING" ? "판매중" : item.status}
              </MetaVal>
            </MetaItem>
          </MetaGrid>
          <Description>
            {item.description ?? item.details ?? "상세 설명이 없습니다."}
          </Description>

          <SellerBox>
            <SellerIcon>🛡</SellerIcon>
            <SellerInfo>
              <SellerName>{sellerNickname || "판매자"}</SellerName>
              <SellerMeta>
                ⭐ {item.sellerRating ?? "4.9"} · 거래{" "}
                {fmt(item.sellerTrades ?? 0)}건
              </SellerMeta>
            </SellerInfo>
          </SellerBox>

          <PriceSection>
            <PriceLabel>판매 금액</PriceLabel>
            <PriceMain>
              {Number(price).toLocaleString()}{" "}
              <PriceCurrency>KRW</PriceCurrency>
            </PriceMain>
          </PriceSection>

          {error && <ErrorBox>{error}</ErrorBox>}

          {isMine ? (
            <MyItemNotice>본인이 등록한 물품입니다.</MyItemNotice>
          ) : (
            <ChatOnlyBtn onClick={handleChat} disabled={chatLoading}>
              {chatLoading ? "채팅방 연결 중..." : "💬 채팅으로 거래하기"}
            </ChatOnlyBtn>
          )}

          <EscrowBanner>
            🔒 WONDEALER 에스크로 안전 거래 — 채팅방에서 결제 및 거래 진행
          </EscrowBanner>
        </InfoSection>
      </DetailGrid>

      {showImageModal && hasImages && (
        <ImageModalOverlay onClick={() => setShowImageModal(false)}>
          <ImageModalBox onClick={(e) => e.stopPropagation()}>
            <ImageModalClose
              type="button"
              onClick={() => setShowImageModal(false)}
              aria-label="이미지 닫기"
            >
              ×
            </ImageModalClose>
            {hasMultipleImages && (
              <ImageModalArrow
                type="button"
                $side="left"
                onClick={showPrevImage}
                aria-label="이전 이미지"
              >
                ‹
              </ImageModalArrow>
            )}
            <ImageModalImg src={images[currentImg]} alt={item.title} />
            {hasMultipleImages && (
              <ImageModalArrow
                type="button"
                $side="right"
                onClick={showNextImage}
                aria-label="다음 이미지"
              >
                ›
              </ImageModalArrow>
            )}
            <ImageModalCount>
              {currentImg + 1} / {images.length}
            </ImageModalCount>
          </ImageModalBox>
        </ImageModalOverlay>
      )}
    </PageWrap>
  );
}

// --- 스타일 컴포넌트 정의 시작 ---
export const PageWrap = styled.div`
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  padding: 40px 8%;
  box-sizing: border-box;
  @media (max-width: 1024px) {
    padding: 30px 5%;
  }
  @media (max-width: 768px) {
    padding: 20px 4%;
  }
`;

export const CenterMsg = styled.div`
  text-align: center;
  padding: 80px;
  color: var(--text-secondary);
`;

export const Breadcrumb = styled.p`
  font-size: 11px;
  color: var(--color-primary);
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 24px;
  cursor: pointer;
  display: inline-block;
  &:hover {
    opacity: 0.8;
  }
`;

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

export const MediaSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const MainImageBox = styled.div`
  position: relative;
  background: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  @media (max-width: 480px) {
    height: 240px;
  }
`;

export const ImgPlaceholder = styled.div`
  font-size: 80px;
`;

export const GradeBadge = styled.div`
  position: absolute;
  top: 14px;
  left: 14px;
  background: linear-gradient(
    135deg,
    var(--color-accent),
    var(--color-primary)
  );
  color: var(--text-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  z-index: 2;
`;

export const DotRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`;

export const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(p) =>
    p.$active ? "var(--color-primary)" : "var(--border-color)"};
  cursor: pointer;
`;

export const ImageArrowButton = styled.button`
  position: absolute;
  top: 50%;
  ${(p) => (p.$side === "left" ? "left: 12px;" : "right: 12px;")}
  transform: translateY(-50%);
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s,
    transform 0.15s;
  &:hover {
    background: rgba(0, 0, 0, 0.65);
    transform: translateY(-50%) scale(1.04);
  }
`;

export const ImageModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.78);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

export const ImageModalBox = styled.div`
  position: relative;
  width: min(92vw, 920px);
  height: min(84vh, 720px);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ImageModalImg = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 10px;
  background: #000;
`;

export const ImageModalClose = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  font-size: 26px;
  cursor: pointer;
  z-index: 4;
`;

export const ImageModalArrow = styled(ImageArrowButton)`
  ${(p) => (p.$side === "left" ? "left: 18px;" : "right: 18px;")}
`;

export const ImageModalCount = styled.div`
  position: absolute;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
`;

export const StatBar = styled.div`
  background: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 14px 20px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const StatLabel = styled.span`
  font-size: 10px;
  color: var(--text-secondary);
`;

export const StatVal = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
`;

export const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ItemTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  background: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 16px;
`;

export const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const MetaLabel = styled.span`
  font-size: 10px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const MetaVal = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => (p.$grade ? "var(--color-accent)" : "var(--text-primary)")};
`;

export const Description = styled.p`
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
  background: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 16px;
`;

export const SellerBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 14px 16px;
`;

export const SellerIcon = styled.div`
  font-size: 24px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SellerInfo = styled.div`
  flex: 1;
`;

export const SellerName = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

export const SellerMeta = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
`;

export const PriceSection = styled.div`
  background: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 20px;
`;

export const PriceLabel = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 8px;
`;

export const PriceMain = styled.div`
  font-size: 28px;
  font-weight: 800;
  @media (max-width: 480px) {
    font-size: 22px;
  }
`;

export const PriceCurrency = styled.span`
  font-size: 14px;
  color: var(--text-secondary);
`;

export const ErrorBox = styled.div`
  padding: 12px 16px;
  background: rgba(var(--rgb-danger), 0.08);
  border: 1px solid rgba(var(--rgb-danger), 0.2);
  border-radius: 8px;
  font-size: 13px;
  color: var(--color-danger);
`;

export const MyItemNotice = styled.div`
  padding: 14px 16px;
  background: rgba(var(--rgb-primary), 0.08);
  border: 1px dashed var(--color-primary);
  border-radius: 8px;
  font-size: 13px;
  color: var(--color-primary);
  text-align: center;
`;

export const ChatOnlyBtn = styled.button`
  width: 100%;
  padding: 18px;
  background: var(--color-primary);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  opacity: ${(p) => (p.disabled ? 0.6 : 1)};
  transition: opacity 0.2s;
  &:hover:not(:disabled) {
    opacity: 0.85;
  }
`;

export const EscrowBanner = styled.div`
  background: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 12px;
  color: var(--color-success);
  line-height: 1.5;
`;
