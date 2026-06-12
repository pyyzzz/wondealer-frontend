import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import heroBgImage from "../../img/HeroSection.jpg";
import AxiosInstance from "../../api/AxiosInstance";
import ItemApi from "../../api/item.api";
import GameRankingApi from "../../api/gameRanking.api";

const PageContainer = styled.div`
  // 페이지 전체를 감싸는 부분
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding-bottom: 80px;
  // 반응형
  @media (max-width: 768px) {
    padding-bottom: 40px;
  }
`;

// 히어로 섹션 (배경 이미지 영역)
const HeroSection = styled.div`
  position: relative;
  width: 100%;
  height: 631px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  overflow: hidden;
  // 반응형
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

// 배너 이미지
const HeroOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
`;

// 배너 내부 텍스트와 검색창 담기는 부분
const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 600px;
  padding: 0 20px;
`;

// 배너 텍스트(가장 빠르고~)
const MainTitle = styled.h1`
  font-size: 42px;
  font-weight: 800;
  line-height: 1.3;
  margin-top: 12px;
  letter-spacing: -0.5px;
  // 반응형
  @media (max-width: 768px) {
    font-size: 32px;
  }
  @media (max-width: 480px) {
    font-size: 26px;
  }
`;

// 배너 텍스트(믿을 수 있는 거래~)
const Description = styled.p`
  font-size: 15px;
  color: var(--text-secondary);
  margin-top: 16px;
  opacity: 0.8;

  // 반응형
  @media (max-width: 480px) {
    font-size: 13px;
    margin-top: 10px;
  }
`;

// 배너 검색창 테두리
const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 30px;
  padding: 6px 6px 6px 24px;
  margin-top: 32px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);

  // 반응형
  @media (max-width: 480px) {
    margin-top: 24px;
    padding: 4px 4px 4px 16px;
  }
`;

// 배너 검색창 입력 부분
const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  font-size: 16px;
  color: #121317;
  &::placeholder {
    color: #9aa0a6;
  }
  // 반응형
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

// 검색창 검색 버튼
const SearchButton = styled.button`
  width: 44px;
  height: 44px;
  background-color: #6339f9;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 16px;
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.05);
  }

  // 반응형
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
`;

// 배너 아래 8개 게임 부분
const QuickMenuSection = styled.div`
  max-width: 1080px;
  margin: -40px auto 0 auto;
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
  padding: 0 20px;
  // 반응형
  @media (max-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    margin-top: 24px;
    gap: 16px 12px;
  }
`;

// 배너 아래 8개 게임 동그라미 부분
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

// 배너 아래 8개 게임 원형 아이콘 백그라운드
const QuickIconCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #111827;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  // 반응형
  @media (max-width: 480px) {
    width: 52px;
    height: 52px;
    font-size: 22px;
  }
`;

// 배너 아래 8개 게임명
const QuickGameLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 8px;
  text-align: center;
  white-space: nowrap;
  // 반응형
  @media (max-width: 480px) {
    font-size: 11px;
    margin-top: 6px;
  }
`;

// 인기 순위, 최근 등록된 매물
const Section = styled.section`
  max-width: 1080px;
  margin: 60px auto 0 auto;
  padding: 0 20px;
  // 반응형
  @media (max-width: 768px) {
    margin-top: 40px;
  }
`;

const RecentSection = styled(Section)`
  margin-top: 100px; /* 기존 60px에서 100px로 대폭 늘려 여유 공간 확보 */

  @media (max-width: 768px) {
    margin-top: 60px; /* 모바일/태블릿 가독성을 위해 반응형 간격 지정 */
  }
`;

// 인기 게임 순위, 최근 등록된 매물 텍스트
const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  // 반응형
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

// 실시간 거래량 기준 텍스트
const SectionSubtitle = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
  margin-bottom: 24px;
  // 반응형
  @media (max-width: 768px) {
    font-size: 12px;
    margin-bottom: 16px;
  }
`;

// 인기 순위 레이아웃 (좌우 2줄 정렬)
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

// 인기 순위 리스트 부분
const RankCard = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px 24px;
  transition: background-color 0.2s;
  &:hover {
    background-color: var(--bg-container-high);
  }
  // 반응형
  @media (max-width: 480px) {
    padding: 12px 16px;
  }
`;

// 인기 순위 번호
const RankNumber = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-secondary);
  width: 24px;
  // 반응형
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

// 인기 게임 순위 세로 정렬
const GameContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

// 게임명 텍스트
const GameName = styled.span`
  font-size: 15px;
  font-weight: 600;
  flex: 1;
  // 반응형
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

// 최근 등록 매물 테이블 스타일
const TableWrapper = styled.div`
  background-color: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  // 반응형
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
  // 반응형
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
  // 반응형
  @media (max-width: 480px) {
    gap: 10px;
  }
`;

// 최근 등록된 매물 아이콘
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

// 최근 등록된 매물 텍스트
const ItemTitle = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: var(--text-primary);

  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 14px;
    max-width: 150px;
  }
`;

const ItemGameCategory = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
`;

// 최근 등록된 매물의 구매하기 버튼
const BuyButton = styled.button`
  background-color: var(--bg-surface-bright);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: var(--color-primary);
    color: var(--on-primary);
    border-color: var(--color-primary);
  }

  // 반응형
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`;

const MainPage = () => {
  const navigate = useNavigate(); // 페이지 이동
  const [searchKeyword, setSearchKeyword] = useState(""); // 검색창 입력 관리
  // 백엔드 크롤링 데이터 연동 관리
  const [popularGames, setPopularGames] = useState([]); // 인기 순위 보관
  const [recentItems, setRecentItems] = useState([]); // 최근 등록된 매물
  const [isLoading, setIsLoading] = useState(true);

  // 검색창 부분
  const handleSearch = (e) => {
    if (e.key && e.key !== "Enter") return;

    if (!searchKeyword.trim()) {
      // 빈 문자열일 때 경고 메시지
      alert("검색어를 입력하세요.");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(searchKeyword)}`); // ItemListPage로 이동
  };

  // 배너 아래의 아이콘 클릭 시 ItemListPage로 이동
  const handleQuickMenuClick = (gameName) => {
    navigate(`/search?q=${encodeURIComponent(gameName)}`);
  };

  // 메인 베너 아래 8개
  const quickMenus = [
    { name: "로스트아크", icon: "⚔️" },
    { name: "메이플스토리", icon: "🍁" },
    { name: "던전앤파이터", icon: "💀" },
    { name: "리니지M", icon: "👑" },
    { name: "FC 온라인", icon: "⚽" },
    { name: "배틀그라운드", icon: "🪖" },
    { name: "발로란트", icon: "🎯" },
    { name: "오버워치2", icon: "🤖" },
  ];

  useEffect(() => {
    // useErrect는 컴포넌트가 화면에 다 그려지면 안쪽에 적어둔 작업 실행 명령
    // 인기 게임 순위 처리
    const fetchGameRankings = async () => {
      try {
        const response = await GameRankingApi.getGameRankings();
        console.log("인기 게임 API 응답 원본:", response); // 브라우저 콘솔에서 확인용

        // 1. 백엔드 데이터 포맷 유연하게 추출
        let rawData = [];
        if (
          response.data &&
          response.data.success &&
          Array.isArray(response.data.data)
        ) {
          rawData = response.data.data;
        } else if (Array.isArray(response.data)) {
          rawData = response.data;
        }

        // 백엔드 필드명인 gameRank 기준으로 안전하게 정렬
        const sortedRank = rawData.sort((a, b) => {
          const rankA = Number(a?.gameRank) || 999;
          const rankB = Number(b?.gameRank) || 999;
          return rankA - rankB;
        });

        setPopularGames(sortedRank);
      } catch (error) {
        console.error("인기 게임 순위를 불러오지 못했습니다.", error);
      }
    };

    const fetchRecentItems = async () => {
      try {
        // ItemApi 명세 구조인 getItems 함수 사용 (최신 매물 5개 요청 예시)
        const response = await ItemApi.getItems({ page: 0, size: 5 });

        // 백엔드 반환 데이터 포맷 형태에 맞춰 분기 핸들링
        if (response.data && response.data.success) {
          setRecentItems(response.data.data);
        } else if (Array.isArray(response.data)) {
          setRecentItems(response.data);
        }
      } catch (error) {
        console.error("최근 등록된 매물을 불러오지 못했습니다.", error);
      }
    };

    const fetchAllData = async () => {
      setIsLoading(true);
      // 병렬 데이터 페칭 최적화
      await Promise.all([fetchGameRankings(), fetchRecentItems()]);
      setIsLoading(false);
    };

    fetchAllData(); // 위의 함수들 실행시킴
  }, []);

  // 최근 등록된 매물 카테고리의 등록시간 -분 전/ -시간 전
  const formatRelativeTime = (createdAtString) => {
    const now = new Date(); // 지금 현재 시간을 가져옴
    const createdTime = new Date(createdAtString); // 매물이 등록된 시간 받아옴
    const diffInSeconds = Math.floor((now - createdTime) / 1000);

    if (diffInSeconds < 60) return "방금 전";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}일 전`;
  };

  const [timeTicker, setTimeTicker] = useState(0); // 시간이 줄어들거나 늘어나게 하기 위해 화면을 주기적으로 새로고침
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTicker((prev) => prev + 1);
    }, 30000); // 30초 주기 동작
    return () => clearInterval(timer);
  }, []);

  // 구매하기 버튼 클릭
  const handleBuyClick = (itemId) => {
    navigate(`/item/${itemId}`);
  };

  return (
    <PageContainer>
      {/* 상단 히어로 배너 영역 */}
      <HeroSection>
        <HeroOverlay />
        <HeroContent>
          <MainTitle>
            가장 빠르고 안전한
            <br />
            <span>아이템 거래</span>의 시작
          </MainTitle>
          <Description>믿을 수 있는 거래, ITEM MARKET</Description>

          <SearchWrapper>
            <SearchInput
              placeholder="게임 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={handleSearch}
            />
            <SearchButton onClick={handleSearch}>🔍</SearchButton>
          </SearchWrapper>
        </HeroContent>
      </HeroSection>

      {/* 배너 아래 8개 게임 */}
      <QuickMenuSection>
        {quickMenus.map((menu, index) => (
          <QuickMenuCard
            key={index}
            onClick={() => handleQuickMenuClick(menu.name)}
          >
            <QuickIconCircle>{menu.icon}</QuickIconCircle>
            <QuickGameLabel>{menu.name}</QuickGameLabel>
          </QuickMenuCard>
        ))}
      </QuickMenuSection>

      {/* 인기 게임 순위 영역*/}
      <Section>
        <SectionTitle>인기 게임 순위</SectionTitle>

        {isLoading ? (
          <LoadingText>
            서버에서 최신 게임 순위 정보를 가져오는 중입니다.
          </LoadingText>
        ) : (
          <RankGrid>
            {popularGames.map((game, index) => {
              const rank = game.gameRank || index + 1;
              const name = game.gameName || "알 수 없는 게임";
              const img =
                game.gameImg ||
                "https://placehold.co/40x40/171821/ffffff?text=Game";

              return (
                <RankCard key={rank} onClick={() => handleQuickMenuClick(name)}>
                  <RankNumber>{rank}</RankNumber>
                  <GameImageWrapper>
                    <img src={img} alt={name} />
                  </GameImageWrapper>
                  <GameContent>
                    <GameName>{name}</GameName>
                  </GameContent>
                </RankCard>
              );
            })}
          </RankGrid>
        )}
      </Section>

      {/* 최근 등록된 매물 영역 */}
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
                <th style={{ width: "40%" }}>상품정보</th>
                <th>서버</th>
                <th>가격</th>
                <th>등록시간</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentItems.map((item) => (
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
              ))}
            </tbody>
          </ItemTable>
        </TableWrapper>
      </RecentSection>
    </PageContainer>
  );
};

export default MainPage;
