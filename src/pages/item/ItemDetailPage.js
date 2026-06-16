import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import ItemApi from "../../api/item.api";

const DUMMY_ITEM = {
  id: 1,
  title: "고대 드래곤 플레이트 아머",
  description:
    "드래곤 슬레이어의 비크라프라에서 전설적인 강함으로, 수천 년 된 드래곤 금속이 녹아내려 나오는 능력 스탯이 높아지며 날아오릅니다.",
  game: "LOST ARK",
  gameName: "LOST ARK",
  gameServer: "VALHALLA-01",
  serverName: "VALHALLA-01",
  grade: "전설",
  category: "장비",
  price: 2450000,
  basePrice: 2450000,
  status: "판매 중",
  seller: "프리미엄 프레이더",
  sellerNickname: "프리미엄 프레이더",
  sellerRating: 4.9,
  sellerTrades: 1240,
  stats: [
    { label: "공격력", value: "+2,500" },
    { label: "방어력", value: "+1,200" },
    { label: "치명타", value: "+15%" },
    { label: "공격 속도", value: "+10%" },
  ],
  images: [],
};

export default function ItemDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isLoggedIn, user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [wishlist, setWishlist] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    ItemApi.getItem(id)
      .then((r) => {
        const d = r.data?.data ?? r.data ?? {};
        setItem(Object.keys(d).length > 0 ? d : DUMMY_ITEM);
      })
      .catch(() => setItem(DUMMY_ITEM))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBuy = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      return navigate("/login");
    }

    // ✅ item.basePrice 사용
    if (
      !window.confirm(
        `${Number(item.basePrice).toLocaleString()}원에 구매하시겠습니까?`,
      )
    )
      return;

    setBuying(true);
    try {
      // 백엔드의 구매 API 호출 (id는 useParams로 가져온 값)
      await ItemApi.purchaseItem(id);
      alert("구매가 완료되었습니다!");
      navigate("/mypage");
    } catch (err) {
      alert(err.response?.data?.message || "구매 실패");
    } finally {
      setBuying(false);
    }

    const handleWishlist = async () => {
      if (!isLoggedIn) {
        alert("로그인이 필요합니다.");
        return navigate("/login");
      }
      try {
        if (wishlist) {
          await ItemApi.removeWishlist?.(id);
        } else {
          await ItemApi.addWishlist?.(id);
        }
        setWishlist(!wishlist);
      } catch {
        setWishlist(!wishlist); // optimistic
      }
    };

    const handleEdit = () => navigate(`/items/${id}/edit`);

    const handleDelete = async () => {
      if (!window.confirm("정말 삭제하시겠습니까?")) return;
      try {
        await ItemApi.deleteItem(id);
        alert("삭제되었습니다.");
        navigate("/items");
      } catch (err) {
        alert(err.response?.data?.message ?? "삭제 중 오류가 발생했습니다.");
      }
    };

    const fmt = (n) => Number(n || 0).toLocaleString("ko-KR");
    const isMine =
      user &&
      item &&
      (user.nickname === (item.seller ?? item.sellerNickname) ||
        user.id === item.sellerId);

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
    const commission = Math.floor(price * 0.05);
    const images = item.images ?? item.imageUrls ?? [];
    const stats = item.stats ?? [];

    return (
      <PageWrap>
        <Breadcrumb onClick={() => navigate("/items")}>
          MARKET &gt; ITEM DETAIL
        </Breadcrumb>

        <DetailGrid>
          {/* 좌측: 이미지 */}
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
              <GradeBadge>{item.grade ?? item.rarity ?? "전설"}</GradeBadge>
              <WishBtn $active={wishlist} onClick={handleWishlist}>
                ♥
              </WishBtn>
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

          {/* 우측: 정보 */}
          <InfoSection>
            <ItemTitle>{item.title}</ItemTitle>

            <MetaGrid>
              <MetaItem>
                <MetaLabel>서버</MetaLabel>
                <MetaVal>{item.serverName || "전체"}</MetaVal>
              </MetaItem>
              <MetaItem>
                <MetaLabel>카테고리</MetaLabel>
                <MetaVal>{item.categoryName}</MetaVal>
              </MetaItem>
              <MetaItem>
                <MetaLabel>아이템 등급</MetaLabel>
                <MetaVal $grade>{item.grade ?? item.rarity ?? "전설"}</MetaVal>
              </MetaItem>
              <MetaItem>
                <MetaLabel>판매 상태</MetaLabel>
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
                <SellerName>{item.sellerNickname || "판매자"}</SellerName>
                <SellerMeta>
                  ⭐ {item.sellerRating ?? "4.9"} · 거래{" "}
                  {fmt(item.sellerTrades ?? 0)}건
                </SellerMeta>
              </SellerInfo>
              <ChatBtn
                onClick={() =>
                  navigate(`/chat?seller=${item.seller ?? item.sellerNickname}`)
                }
              >
                💬
              </ChatBtn>
            </SellerBox>

            <PriceSection>
              <PriceLabel>최종 판매 금액</PriceLabel>
              <PriceRow>
                <PriceMain>
                  {Number(price).toLocaleString()}{" "}
                  <PriceCurrency>KRW</PriceCurrency>
                </PriceMain>
                <PriceChange>
                  ▼ {((commission / price) * 100).toFixed(1)}%
                </PriceChange>
              </PriceRow>
            </PriceSection>

            {error && <ErrorBox>{error}</ErrorBox>}

            {isMine ? (
              <BtnGroup>
                <EditBtn onClick={handleEdit}>수정하기</EditBtn>
                <DeleteBtn onClick={handleDelete}>삭제하기</DeleteBtn>
              </BtnGroup>
            ) : (
              <BtnGroup>
                <BuyBtn disabled={buying} onClick={handleBuy}>
                  {buying ? "구매 중..." : "🛒 구매하기"}
                </BuyBtn>
                <WishlistBtn onClick={handleWishlist}>
                  {wishlist ? "♥ 찜 해제" : "🤍 찜하기"}
                </WishlistBtn>
              </BtnGroup>
            )}

            <EscrowBanner>
              🔒 WONDEALER 에스크로 안전 거래 시스템이 작동 중입니다. 구매 확정
              전까지 대금은 안전하게 보호됩니다.
            </EscrowBanner>
          </InfoSection>
        </DetailGrid>
      </PageWrap>
    );
  };

  // ── Styled Components ──────────────────────────────────────────
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
  const WishBtn = styled.button`
    position: absolute;
    top: 12px;
    right: 14px;
    background: rgba(0, 0, 0, 0.4);
    border: none;
    color: ${(p) => (p.$active ? "#f72585" : "#888da8")};
    font-size: 20px;
    cursor: pointer;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
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
  const ChatBtn = styled.button`
    background: #1f2029;
    border: none;
    color: #fff;
    font-size: 18px;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    &:hover {
      background: #6c5ce7;
    }
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
  const PriceRow = styled.div`
    display: flex;
    align-items: baseline;
    gap: 12px;
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
  const PriceChange = styled.div`
    font-size: 13px;
    color: #10b981;
  `;
  const ErrorBox = styled.div`
    padding: 12px 16px;
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 8px;
    font-size: 13px;
    color: #ef4444;
  `;
  const BtnGroup = styled.div`
    display: flex;
    gap: 12px;
    @media (max-width: 480px) {
      flex-direction: column;
    }
  `;
  const BuyBtn = styled.button`
    flex: 2;
    background: #6c5ce7;
    color: #fff;
    border: none;
    padding: 16px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    opacity: ${(p) => (p.disabled ? 0.6 : 1)};
    transition: opacity 0.2s;
    &:hover:not(:disabled) {
      opacity: 0.85;
    }
  `;
  const WishlistBtn = styled.button`
    flex: 1;
    background: #12131a;
    color: #fff;
    border: 1px solid #252631;
    padding: 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.2s;
    &:hover {
      border-color: #6c5ce7;
    }
  `;
  const EditBtn = styled.button`
    flex: 1;
    background: #6c5ce7;
    color: #fff;
    border: none;
    padding: 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  `;
  const DeleteBtn = styled.button`
    flex: 1;
    background: #12131a;
    color: #ef4444;
    border: 1px solid #ef4444;
    padding: 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    &:hover {
      background: rgba(239, 68, 68, 0.1);
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
}
