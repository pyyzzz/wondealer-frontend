import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import Common from "../../utils/Common";
import heroBgImage from "../../img/HeroSection.webp";
import herosectionlight from "../../img/HeroSectionlight.webp";

const api = axios.create({ baseURL: Common.API_URL });

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

const QUICK_MENUS = [
  { name: "로스트아크", key: "lostark" },
  { name: "메이플스토리", key: "maplestory" },
  { name: "던전앤파이터", key: "df" },
  { name: "리니지M", key: "lineagem" },
  { name: "FC 온라인", key: "fconline" },
  { name: "배틀그라운드", key: "pubg" },
  { name: "발로란트", key: "valorant" },
  { name: "오버워치2", key: "overwatch2" },
];

const MainPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [popularGames, setPopularGames] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeTicker, setTimeTicker] = useState(0);
  const [gameMap, setGameMap] = useState({});

  const formatRelativeTime = (createdAtString) => {
    if (!createdAtString) return "방금 전";
    const diff = Math.floor((Date.now() - new Date(createdAtString)) / 1000);
    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  };

  useEffect(() => {
    const timer = setInterval(() => setTimeTicker((p) => p + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchMainData = async () => {
      setIsLoading(true);
      try {
        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1. 게임 목록 로드 및 매핑 (공백 제거 .trim() 추가로 정확도 향상)
        try {
          const gamesRes = await api.get("/api/games", { headers });
          const gameList = gamesRes.data?.data ?? [];
          const map = {};
          gameList.forEach((g) => {
            if (g.gameName) map[g.gameName.trim()] = g.gameId;
          });
          setGameMap(map);
        } catch (e) {
          console.error("게임로드 실패", e);
        }

        // 2. 인기 게임 랭킹
        try {
          const rankRes = await api.get("/api/rankings", { headers });
          const rankList = rankRes.data?.data || rankRes.data || [];
          setPopularGames(
            rankList
              .map((r) => ({
                rank: r.gameRank,
                gameName: r.gameName,
                gameImg: r.gameImg,
                gameId: r.gameId,
              }))
              .sort(
                (a, b) => (Number(a.rank) || 999) - (Number(b.rank) || 999),
              ),
          );
        } catch (e) {
          console.error("랭킹로드 실패", e);
        }

        // 3. 최근 매물
        try {
          const itemRes = await api.get("/api/items", {
            params: { page: 0, size: 5 },
            headers,
          });
          const itemList =
            itemRes.data?.data?.content ||
            itemRes.data?.content ||
            itemRes.data?.data ||
            itemRes.data ||
            [];
          setRecentItems(Array.isArray(itemList) ? itemList : []);
        } catch (e) {
          setRecentItems([]);
        }
      } catch (err) {
        console.error("메인 데이터 페칭 에러", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMainData();
  }, [timeTicker]);

  // [수정된 클릭 로직] 이름이 정확히 일치하지 않아도 검색어로 보완 이동
  const handleGameClick = (gameName, gameId) => {
    const trimmedName = gameName ? gameName.trim() : "";
    const id = gameId ?? gameMap[trimmedName];

    if (id) {
      // ID를 찾은 경우 (정상)
      navigate(`/items?gameId=${id}`);
    } else {
      // ID를 못 찾은 경우, 검색어 파라미터로 넘겨서 필터링 유도
      navigate(`/items?keyword=${encodeURIComponent(trimmedName)}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!keyword.trim()) {
      alert("검색어를 입력하세요.");
      return;
    }
    navigate(`/items?keyword=${encodeURIComponent(keyword)}`);
  };

  const handleBuyClick = (itemId) => {
    if (!itemId) return;
    navigate(`/items/${itemId}`);
  };

  return (
    <PageContainer>
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
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </SearchButton>
          </SearchForm>
        </HeroContent>
      </HeroSection>

      <QuickMenuSection>
        {QUICK_MENUS.map((menu, index) => (
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
              return (
                <RankCard
                  key={rank}
                  onClick={() => handleGameClick(name, game.gameId)}
                >
                  <RankNumber $rank={rank}>{rank}</RankNumber>
                  <GameImageWrapper>
                    {game.gameImg ? (
                      <img src={game.gameImg} alt={name} />
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
                <th style={{ width: "40%" }}>상품 정보</th>
                <th>서버</th>
                <th>가격</th>
                <th>등록시간</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentItems.length > 0 ? (
                recentItems.map((item) => {
                  const id = item.itemId ?? item.id;
                  return (
                    <tr key={id}>
                      <td>
                        <ItemInfoCell>
                          <ItemImgPlaceholder>
                            {item.thumbnailImg ? (
                              <img src={item.thumbnailImg} alt={item.title} />
                            ) : (
                              "📦"
                            )}
                          </ItemImgPlaceholder>
                          <div>
                            <ItemTitle>{item.title}</ItemTitle>
                            <ItemGameCategory>
                              {item.categoryName}
                            </ItemGameCategory>
                          </div>
                        </ItemInfoCell>
                      </td>
                      <td className="gray-text">{item.serverName || "전체"}</td>
                      <td className="price-text">
                        {item.basePrice
                          ? Number(item.basePrice).toLocaleString()
                          : 0}
                        원
                      </td>
                      <td className="gray-text">
                        {formatRelativeTime(item.createdAt)}
                      </td>
                      <td>
                        <BuyButton onClick={() => handleBuyClick(id)}>
                          구매하기
                        </BuyButton>
                      </td>
                    </tr>
                  );
                })
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

// ── Styled Components (보내주신 틀 그대로 유지) ──────────────────────────────────────────
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

  /* 라이트모드 상태일 때: herosectionlight 이미지로 교체 */
  [data-theme="light"] &::before {
    background: url(${herosectionlight}) no-repeat center/cover;
    filter: brightness(1.1) contrast(1.05);
  }
`;

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
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
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;
const MainTitle = styled.h1`
  font-size: 42px;
  font-weight: 800;
  line-height: 1.3;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 34px;
  }

  @media (max-width: 480px) {
    font-size: 28px;
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
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.05);
  }
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
  }
`;
const QuickMenuSection = styled.div`
  max-width: 1080px;
  margin: -36px auto 0 auto;
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
  padding: 0 20px;
  @media (max-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    margin-top: -24px;
    gap: 16px 12px;
  }

  @media (max-width: 420px) {
    grid-template-columns: repeat(2, 1fr);
    padding: 0 16px;
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
  background-color: var(--bg-container-high);
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
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(5, auto);
  grid-auto-flow: column;
  gap: 16px;
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
  background-color: var(--bg-surface-lowest);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px 24px;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: var(--bg-container-high, #f4f4f4);
    border-color: var(--color-primary, #6339f9);
  }

  @media (max-width: 480px) {
    padding: 14px 16px;
  }
`;

const RankNumber = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${(p) =>
    p.$rank <= 3
      ? "var(--color-primary, #6339f9)"
      : "var(--text-secondary, #666)"};
  width: 24px;
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
  background: var(--bg-surface-lowest);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 40px 16px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  grid-column: span 2;
`;
const TableWrapper = styled.div`
  background-color: var(--bg-surface-lowest);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
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

  th,
  td {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border-color); /* 테마 변수 적용 */
    vertical-align: middle;
  }

  th {
    background-color: var(--bg-container-low); /* 테마 변수 적용 */
    color: var(--text-secondary);
  }

  .gray-text {
    color: var(--text-secondary);
  }
  .price-text {
    font-weight: 700;
    color: var(--color-primary);
  }

  @media (max-width: 768px) {
    min-width: 680px;

    th,
    td {
      padding: 12px 14px;
    }
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
  background-color: var(--bg-container-high); /* 라이트/다크 구분 */
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
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
