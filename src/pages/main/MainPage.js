import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import Common from "../../utils/Common";
import heroBgImage from "../../img/HeroSection.jpg";

const api = axios.create({ baseURL: Common.API_URL });

// ── Styled Components (반응형 최적화 레이아웃) ──────────────────────────────

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding-bottom: 80px;

  @media (max-width: 768px) {
    padding-bottom: 40px;
  }
`;

const HeroSection = styled.div`
  position: relative;
  width: 100%;
  height: 631px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  overflow: hidden;

  /* 태블릿 & 모바일 배너 높이 유연화 */
  @media (max-width: 768px) {
    height: 460px;
  }
  @media (max-width: 480px) {
    height: 380px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url(${heroBgImage}) no-repeat center/cover;
    filter: brightness(1.4) contrast(1.1);
    z-index: 1;
  }
`;

const HeroOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 600px;
  padding: 0 20px;
  color: #ffffff;
`;

const MainTitle = styled.h1`
  font-size: 42px;
  font-weight: 800;
  line-height: 1.3;
  margin-top: 12px;
  letter-spacing: -0.5px;
  color: #ffffff;

  span {
    color: #ffffff;
  }

  /* 모바일 해상도 타이틀 텍스트 크기 축소 */
  @media (max-width: 768px) {
    font-size: 32px;
  }
  @media (max-width: 480px) {
    font-size: 26px;
  }
`;

const Description = styled.p`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 16px;

  @media (max-width: 480px) {
    font-size: 13px;
    margin-top: 10px;
  }
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 30px;
  padding: 6px 6px 6px 24px;
  margin-top: 32px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);

  @media (max-width: 480px) {
    margin-top: 24px;
    padding: 4px 4px 4px 16px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  font-size: 16px;
  color: #121317;
  outline: none;
  &::placeholder {
    color: #9aa0a6;
  }
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const SearchButton = styled.button`
  width: 44px;
  height: 44px;
  background-color: var(--color-primary, #6339f9);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.05);
  }
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
`;

const QuickMenuSection = styled.div`
  max-width: 1080px;
  margin: -36px auto 0 auto;
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: repeat(8, 1fr); /* 데스크톱 8열 배치 */
  gap: 12px;
  padding: 0 20px;

  /* 모바일/태블릿 화면 크기 축소 시 4열 배치 전환 */
  @media (max-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    margin-top: -24px;
    gap: 16px 12px;
  }
`;

const QuickMenuCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-5px);
  }
`;

const QuickIconCircle = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: #111c2d;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);

  img {
    width: 50%;
    height: 50%;
    object-fit: contain;
  }

  @media (max-width: 480px) {
    width: 52px;
    height: 52px;
    font-size: 22px;
  }
`;

const QuickGameLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 12px;
  text-align: center;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 11px;
    margin-top: 8px;
  }
`;

const Section = styled.section`
  max-width: 1080px;
  margin: 60px auto 0 auto;
  padding: 0 20px;
  @media (max-width: 768px) {
    margin-top: 40px;
  }
`;

const RecentSection = styled(Section)`
  margin-top: 100px;
  @media (max-width: 768px) {
    margin-top: 60px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
  margin-bottom: 24px;
  @media (max-width: 768px) {
    font-size: 12px;
    margin-bottom: 16px;
  }
`;

const RankGrid = styled.div`
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 데스크톱 좌우 2열 배치 */
  grid-template-rows: repeat(5, auto);
  grid-auto-flow: column;
  gap: 16px;

  /* 태블릿 및 모바일 환경에서 직렬 1열 리스트로 재배치 */
  @media (max-width: 768px) {
    margin-top: 20px;
    grid-template-columns: 1fr;
    grid-template-rows: none;
    grid-auto-flow: row;
    gap: 10px;
  }
`;

const RankCard = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--bg-surface-lowest, black);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px 24px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--bg-container-high);
    border-color: var(--color-primary);
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
  }
`;

const RankNumber = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${(p) =>
    p.$rank <= 3 ? "var(--color-primary, #6339f9)" : "var(--text-secondary)"};
  width: 24px;

  @media (max-width: 480px) {
    font-size: 16px;
    width: 20px;
  }
`;

const GameImageWrapper = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  margin-left: 12px;
  margin-right: 16px;
  background-color: var(--bg-container-low);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  @media (max-width: 480px) {
    width: 30px;
    height: 30px;
    margin-left: 8px;
    margin-right: 12px;
  }
`;

const GameContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const GameName = styled.span`
  font-size: 15px;
  font-weight: 600;
  flex: 1;
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const LoadingText = styled.div`
  color: var(--text-secondary);
  text-align: center;
  padding: 40px;
  font-size: 15px;
`;

const EmptyBox = styled.div`
  background: var(--bg-surface-lowest, black);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 40px 16px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  grid-column: span 2;
`;

const TableWrapper = styled.div`
  background-color: var(--bg-surface-lowest, black);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;

  /* 태블릿 및 모바일에서 테이블이 찌그러지지 않도록 가로 스크롤 보장 */
  @media (max-width: 768px) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const ItemTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;

  /* 모바일 해상도 붕괴 방지용 최소 너비 고정 */
  @media (max-width: 768px) {
    min-width: 600px;
  }

  th,
  td {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border-color);
    vertical-align: middle;
  }

  th {
    background-color: var(--bg-container-low);
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 12px;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .gray-text {
    color: var(--text-secondary);
  }

  .price-text {
    font-weight: 700;
    color: var(--color-primary);
  }
`;

const ItemInfoCell = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const ItemImgPlaceholder = styled.div`
  width: 40px;
  height: 40px;
  background-color: var(--bg-container-high);
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  flex-shrink: 0;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ItemTitle = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: var(--text-primary);
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 768px) {
    max-width: 150px;
    font-size: 14px;
  }
`;

const ItemGameCategory = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
`;

const BuyButton = styled.button`
  background-color: var(--bg-surface-bright);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: var(--color-primary);
    color: var(--on-primary);
    border-color: var(--color-primary);
  }
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`;

const GAME_ICONS = {
  로스트아크: "⚔️",
  "LOST ARK": "⚔️",
  메이플스토리: "🍁",
  MapleStory: "🍁",
  던전앤파이터: "💀",
  "Dungeon & Fighter": "🗡️",
  리니지M: "👑",
  Lineage: "🏰",
  "FC 온라인": "⚽",
  "FC ONLINE": "⚽",
  배틀그라운드: "🪖",
  발로란트: "🎯",
  Valorant: "🎯",
  오버워치2: "🤖",
  "Overwatch 2": "🔫",
};

// ── Component Logic ─────────────────────────────────────────────────────────

const MainPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [popularGames, setPopularGames] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeTicker, setTimeTicker] = useState(0);

  const quickMenus = [
    { name: "로스트아크", key: "lostark" },
    { name: "메이플스토리", key: "maplestory" },
    { name: "던전앤파이터", key: "df" },
    { name: "리니지M", key: "lineagem" },
    { name: "FC 온라인", key: "fconline" },
    { name: "배틀그라운드", key: "pubg" },
    { name: "발로란트", key: "valorant" },
    { name: "오버워치2", key: "overwatch2" },
  ];

  // 등록 경과시간 포맷 헬퍼
  const formatRelativeTime = (createdAtString) => {
    if (!createdAtString) return "방금 전";
    const now = new Date();
    const createdTime = new Date(createdAtString);
    const diffInSeconds = Math.floor((now - createdTime) / 1000);

    if (diffInSeconds < 60) return "방금 전";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}일 전`;
  };

  // 실시간 등록시간 동기화 인터벌
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTicker((prev) => prev + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // [API] 비회원 인가 유연성 보장 데이터 패칭
  useEffect(() => {
    const fetchMainData = async () => {
      setIsLoading(true);
      try {
        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1. 인기 게임 랭킹 가져오기
        const rankRes = await api.get("/api/rankings", { headers });
        const rankList = rankRes.data?.data || rankRes.data || [];

        const sortedRank = rankList
          .map((r) => ({
            rank: r.gameRank,
            gameName: r.gameName,
            gameImg: r.gameImg,
          }))
          .sort((a, b) => (Number(a.rank) || 999) - (Number(b.rank) || 999));

        setPopularGames(sortedRank);

        // 2. 최근 등록 매물 가져오기
        try {
          const itemRes = await api.get("/api/items", {
            params: { page: 0, size: 5 },
            headers,
          });
          const itemList = itemRes.data?.data || itemRes.data || [];
          setRecentItems(Array.isArray(itemList) ? itemList : []);
        } catch (itemErr) {
          console.warn("최근 매물 리스트 바인딩 실패", itemErr);
          setRecentItems([]);
        }
      } catch (error) {
        console.error("메인 데이터 페칭 에러 발생", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMainData();
  }, [timeTicker]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!keyword.trim()) {
      alert("검색어를 입력하세요.");
      return;
    }
    navigate(`/items?keyword=${encodeURIComponent(keyword)}`);
  };

  const handleGameClick = (gameName) => {
    navigate(`/items?keyword=${encodeURIComponent(gameName)}`);
  };

  const handleBuyClick = (itemId) => {
    navigate(`/item/${itemId}`);
  };

  return (
    <PageContainer>
      {/* 상단 히어로 배너 */}
      <HeroSection>
        <HeroOverlay />
        <HeroContent>
          <MainTitle>
            가장 빠르고 안전한
            <br />
            <span>아이템 거래</span>의 시작
          </MainTitle>
          <Description>안전한 에스크로 결제 · 실시간 경매 · WonPay</Description>

          <SearchForm onSubmit={handleSearchSubmit}>
            <SearchInput
              placeholder="아이템명, 게임 검색..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <SearchButton type="submit">
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21l-4.35-4.35"></path>
              </svg>
            </SearchButton>
          </SearchForm>
        </HeroContent>
      </HeroSection>

      {/* 8열 퀵 게임 아이콘 메뉴 리스트 */}
      <QuickMenuSection>
        {quickMenus.map((menu, index) => (
          <QuickMenuCard key={index} onClick={() => handleGameClick(menu.name)}>
            <QuickIconCircle>
              <img
                src={`../img/${menu.key}.svg`}
                alt={menu.name}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentNode.innerText = GAME_ICONS[menu.name] || "🎮";
                }}
              />
            </QuickIconCircle>
            <QuickGameLabel>{menu.name}</QuickGameLabel>
          </QuickMenuCard>
        ))}
      </QuickMenuSection>

      {/* 실시간 인기 게임 랭킹 */}
      <Section>
        <SectionTitle>인기 게임 순위</SectionTitle>
        <SectionSubtitle>실시간 거래량 기준</SectionSubtitle>

        {isLoading ? (
          <LoadingText>
            서버에서 최신 게임 순위 정보를 가져오는 중입니다...
          </LoadingText>
        ) : popularGames.length > 0 ? (
          <RankGrid>
            {popularGames.map((game, index) => {
              const rank = game.rank || index + 1;
              const name = game.gameName || "알 수 없는 게임";
              const img = game.gameImg;

              return (
                <RankCard key={rank} onClick={() => handleGameClick(name)}>
                  <RankNumber $rank={rank}>{rank}</RankNumber>
                  <GameImageWrapper>
                    {img ? (
                      <img src={img} alt={name} />
                    ) : (
                      GAME_ICONS[name] || "🎮"
                    )}
                  </GameImageWrapper>
                  <GameContent>
                    <GameName>{name}</GameName>
                  </GameContent>
                </RankCard>
              );
            })}
          </RankGrid>
        ) : (
          <EmptyBox>인기 게임 순위 정보가 제공되지 않습니다.</EmptyBox>
        )}
      </Section>

      {/* 최근 등록 상품 목록 테이블 */}
      <RecentSection>
        <SectionTitle>최근 등록된 매물</SectionTitle>
        <SectionSubtitle>
          업데이트:{" "}
          {recentItems.length > 0
            ? formatRelativeTime(recentItems[0].createdAt)
            : "방금 전"}
        </SectionSubtitle>

        <TableWrapper>
          <ItemTable>
            <thead>
              <tr>
                <th style={{ width: "40%" }}>商品정보</th>
                <th>서버</th>
                <th>가격</th>
                <th>등록시간</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentItems.length > 0 ? (
                recentItems.map((item) => (
                  <tr key={item.itemId}>
                    <td>
                      <ItemInfoCell>
                        <ItemImgPlaceholder>
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title} />
                          ) : (
                            "📦"
                          )}
                        </ItemImgPlaceholder>
                        <div>
                          <ItemTitle>{item.title}</ItemTitle>
                          <ItemGameCategory>{item.gameName}</ItemGameCategory>
                        </div>
                      </ItemInfoCell>
                    </td>
                    <td className="gray-text">{item.server}</td>
                    <td className="price-text">
                      {Number(item.price).toLocaleString()}원
                    </td>
                    <td className="gray-text">
                      {formatRelativeTime(item.createdAt)}
                    </td>
                    <td>
                      <BuyButton onClick={() => handleBuyClick(item.itemId)}>
                        구매하기
                      </BuyButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    <span className="gray-text">
                      최근 등록된 판매 매물이 부재합니다.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </ItemTable>
        </TableWrapper>
      </RecentSection>
    </PageContainer>
  );
};

export default MainPage;
