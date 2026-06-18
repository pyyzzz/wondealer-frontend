import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import ItemApi from "../../api/item.api";
import ChatApi from "../../api/chat.api";

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
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    ItemApi.getItem(itemId)
      .then((r) => {
        const d = r.data?.data ?? r.data ?? {};
        console.log("[item detail raw]", JSON.stringify(d));
        setItem(Object.keys(d).length > 0 ? d : DUMMY_ITEM);
      })
      .catch(() => setItem(DUMMY_ITEM))
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
            {images.length > 0 ? (
              <img
                src={images[currentImg]}
                alt={item.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 12,
                }}
              />
            ) : (
              <ImgPlaceholder>📦</ImgPlaceholder>
            )}
            <GradeBadge>{item.grade ?? "일반"}</GradeBadge>
          </MainImageBox>
          {images.length > 1 && (
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
    </PageWrap>
  );
}

const PageWrap = styled.div`
  background: #0b0c10;
  color: #fff;
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
const CenterMsg = styled.div`
  text-align: center;
  padding: 80px;
  color: #888da8;
`;
const Breadcrumb = styled.p`
  font-size: 11px;
  color: #6c5ce7;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 24px;
  cursor: pointer;
  display: inline-block;
  &:hover {
    opacity: 0.8;
  }
`;
const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;
const MediaSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const MainImageBox = styled.div`
  position: relative;
  background: #12131a;
  border: 1px solid #1f2029;
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
const ImgPlaceholder = styled.div`
  font-size: 80px;
`;
const GradeBadge = styled.div`
  position: absolute;
  top: 14px;
  left: 14px;
  background: linear-gradient(135deg, #f72585, #7209b7);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
`;
const DotRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`;
const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(p) => (p.$active ? "#6c5ce7" : "#2d2f3e")};
  cursor: pointer;
`;
const StatBar = styled.div`
  background: #12131a;
  border: 1px solid #1f2029;
  border-radius: 10px;
  padding: 14px 20px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
`;
const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;
const StatLabel = styled.span`
  font-size: 10px;
  color: #888da8;
`;
const StatVal = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #c0c1ff;
`;
const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const ItemTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;
const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  background: #12131a;
  border: 1px solid #1f2029;
  border-radius: 10px;
  padding: 16px;
`;
const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const MetaLabel = styled.span`
  font-size: 10px;
  color: #888da8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;
const MetaVal = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => (p.$grade ? "#f72585" : "#fff")};
`;
const Description = styled.p`
  font-size: 13px;
  color: #888da8;
  line-height: 1.7;
  background: #12131a;
  border: 1px solid #1f2029;
  border-radius: 10px;
  padding: 16px;
`;
const SellerBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #12131a;
  border: 1px solid #1f2029;
  border-radius: 10px;
  padding: 14px 16px;
`;
const SellerIcon = styled.div`
  font-size: 24px;
  background: #1f2029;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const SellerInfo = styled.div`
  flex: 1;
`;
const SellerName = styled.div`
  font-size: 14px;
  font-weight: 600;
`;
const SellerMeta = styled.div`
  font-size: 11px;
  color: #888da8;
  margin-top: 2px;
`;
const PriceSection = styled.div`
  background: #12131a;
  border: 1px solid #1f2029;
  border-radius: 10px;
  padding: 20px;
`;
const PriceLabel = styled.div`
  font-size: 11px;
  color: #888da8;
  margin-bottom: 8px;
`;
const PriceMain = styled.div`
  font-size: 28px;
  font-weight: 800;
  @media (max-width: 480px) {
    font-size: 22px;
  }
`;
const PriceCurrency = styled.span`
  font-size: 14px;
  color: #888da8;
`;
const ErrorBox = styled.div`
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  font-size: 13px;
  color: #ef4444;
`;
const MyItemNotice = styled.div`
  padding: 14px 16px;
  background: rgba(108, 92, 231, 0.08);
  border: 1px dashed #6c5ce7;
  border-radius: 8px;
  font-size: 13px;
  color: #8083ff;
  text-align: center;
`;
const ChatOnlyBtn = styled.button`
  width: 100%;
  padding: 18px;
  background: #6c5ce7;
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
const EscrowBanner = styled.div`
  background: #12131a;
  border: 1px solid #1f2029;
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 12px;
  color: #10b981;
  line-height: 1.5;
`;
