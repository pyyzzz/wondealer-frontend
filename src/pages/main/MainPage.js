import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import heroBgImage from "../../img/HeroSection.jpg";
import AxiosInstance from "../../api/AxiosInstance";

const PageContainer = styled.div`
  // 페이지 전체를 감싸는 부분
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding-bottom: 80px;
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
`;

// 배너 텍스트(믿을 수 있는 거래~)
const Description = styled.p`
  font-size: 15px;
  color: var(--text-secondary);
  margin-top: 16px;
  opacity: 0.8;
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
  @media (max-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    margin-top: 20px;
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
`;

// 배너 아래 8개 게임명
const QuickGameLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 8px;
  text-align: center;
  white-space: nowrap;
`;

// 인기 순위, 최근 등록된 매물
const Section = styled.section`
  max-width: 1080px;
  margin: 60px auto 0 auto;
  padding: 0 20px;
`;

// 인기 게임 순위, 최근 등록된 매물 텍스트
const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
`;

// 실시간 거래량 기준 텍스트
const SectionSubtitle = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
  margin-bottom: 24px;
`;

// 인기 순위 그리드 레이아웃 (좌우 2줄 정렬)
const RankGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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
`;

// 인기 순위 번호
const RankNumber = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-secondary);
  width: 24px;
`;

// 인기 순위 아이콘
const GameIcon = styled.span`
  font-size: 20px;
  margin-left: 12px;
  margin-right: 16px;
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
`;

// 게임명 하단 텍스트
const GameGenre = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
`;

const LoadingText = styled.div`
  color: var(--text-secondary);
  text-align: center;
  padding: 40px;
  font-size: 15px;
`;

// 인기 순위 변동 부분
const RankChange = styled.span`
  font-size: 12px;
  font-weight: 600;
  margin-left: auto;

  &.up {
    color: #4edea3; /* 상승 시 */
  }
  &.down {
    color: #ffb2b7; /* 하락 시 */
  }
  &.same {
    color: #c7c4d7; /* 순위 유지 시 */
  }
`;

// 최근 등록 매물 테이블 스타일
const TableWrapper = styled.div`
  background-color: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
`;

const ItemTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;

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
`;

// 최근 등록된 매물 텍스트
const ItemTitle = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: var(--text-primary);
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

  &:hover {
    background-color: var(--color-primary);
    color: var(--on-primary);
    border-color: var(--color-primary);
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
        setIsLoading(true);
        const response = await AxiosInstance.get("/api/rankings"); // 인기 게임 순위 정보 요청

        if (response.data && response.data.success) {
          setPopularGames(response.data.data);
        }
      } catch (error) {
        console.error("인기 게임 순위를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameRankings(); // 위의 함수들 실행시킴
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
        <SectionSubtitle>실시간 거래량 기준</SectionSubtitle>

        {isLoading ? (
          <LoadingText>
            서버에서 최신 게임 순위 정보를 가져오는 중입니다.
          </LoadingText>
        ) : (
          <RankGrid>
            {popularGames.map((game) => (
              // API 명세 필드값 구조화 매핑 (rank 고유 키 설정)
              <RankCard key={game.rank}>
                <RankNumber>{game.rank}</RankNumber> {/* 순위 번호 */}
                <GameIcon>🎮</GameIcon>
                <GameContent>
                  <GameName>{game.gameName}</GameName> {/* 게임명 */}
                  <GameGenre>{game.genre}</GameGenre> {/* 장르명 */}
                </GameContent>
              </RankCard>
            ))}
          </RankGrid>
        )}
      </Section>

      {/* 3. 최근 등록된 매물 영역 */}
      <Section>
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
                <tr key={item.id}>
                  <td>
                    <ItemInfoCell>
                      <ItemImgPlaceholder>📦</ItemImgPlaceholder>
                      <div>
                        <ItemTitle>{item.title}</ItemTitle>
                        <ItemGameCategory>{item.game}</ItemGameCategory>
                      </div>
                    </ItemInfoCell>
                  </td>
                  <td className="gray-text">{item.server}</td>
                  <td className="price-text">{item.price}</td>
                  <td className="gray-text">
                    {formatRelativeTime(item.createdAt)}
                  </td>
                  <td>
                    <BuyButton onClick={() => handleBuyClick(item.id)}>
                      구매하기
                    </BuyButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </ItemTable>
        </TableWrapper>
      </Section>
    </PageContainer>
  );
};

export default MainPage;
