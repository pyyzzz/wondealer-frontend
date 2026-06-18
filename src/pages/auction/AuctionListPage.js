import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuctionApi from "../../api/auction.api";
import ItemApi from "../../api/item.api";

import timer from "../../img/timer.svg";

// ── Styled Components ───────────────────────

const PageLayout = styled.div`
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  padding: 40px 5%;
  box-sizing: border-box;
  font-family: "Noto Sans KR", sans-serif;

  @media (max-width: 768px) {
    padding: 20px 4%;
  }
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 35px;
  gap: 25px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

const FilterArea = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
  width: 100%;
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  background-color: var(--bg-container-low);
  border-radius: 25px;
  padding: 4px 16px;
  width: 280px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  padding: 8px 4px;
  width: 100%;
  font-size: 14px;
  color: var(--text-primary);

  &::placeholder {
    color: var(--outline);
  }
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CategoryTabContainer = styled.div`
  display: flex;
  gap: 18px;
  align-items: center;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--outline);
    border-radius: 4px;
  }
`;

const CategoryTab = styled.button`
  height: 38px;
  padding: 0 22px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background-color: ${(props) =>
    props.$isActive ? "var(--color-primary)" : "var(--bg-container-low)"};
  color: ${(props) =>
    props.$isActive ? "var(--on-primary)" : "var(--text-secondary)"};
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    background-color: var(--color-primary);
    color: var(--on-primary);
  }
`;

const MainContentContainer = styled.div`
  display: flex;
  gap: 30px;

  @media (max-width: 992px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const ServerSidebar = styled.aside`
  width: 200px;
  flex-shrink: 0;

  @media (max-width: 992px) {
    width: 100%;
  }
`;

const SidebarTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;

  span {
    font-size: 10px;
    color: var(--text-secondary);
    margin-top: 4px;
    font-weight: 400;
  }

  @media (max-width: 992px) {
    margin-bottom: 10px;
  }
`;

const ServerList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;

  @media (max-width: 992px) {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 8px;

    &::-webkit-scrollbar {
      height: 4px;
    }
  }
`;

const ServerItem = styled.li`
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: none;

  background-color: ${(props) =>
    props.$isActive ? "var(--color-primary)" : "transparent"};
  color: ${(props) =>
    props.$isActive ? "var(--on-primary)" : "var(--text-secondary)"};
  font-weight: ${(props) => (props.$isActive ? "600" : "400")};

  &:hover {
    background-color: ${(props) =>
      props.$isActive ? "var(--color-primary)" : "var(--bg-container-low)"} !important;
    color: ${(props) =>
      props.$isActive ? "var(--on-primary)" : "var(--text-primary)"} !important;
  }

  @media (max-width: 992px) {
    white-space: nowrap;
    padding: 8px 16px;
  }
`;

const ItemListSection = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ItemCard = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  background-color: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px 24px;
  transition:
    transform 0.2s,
    border-color 0.2s;

  &:hover {
    border-color: var(--color-primary);
    transform: translateX(4px);
  }

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
  }
`;

const ItemThumbnail = styled.div`
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 20px;
  flex-shrink: 0;
  background-color: var(--bg-container-low);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 576px) {
    margin-right: 0;
  }
`;

const TimerBadge = styled.div`
  //position: absolute;
  top: 4px;
  left: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.$isUrgent ? "var(--color-danger)" : "var(--color-primary)"};
  color: ${(props) =>
    props.$isUrgent ? "var(--on-tertiary-container)" : "var(--on-primary)"};
  backdrop-filter: blur(1px);
  z-index: 10;
  white-space: nowrap;
`;

const TimerIcon = styled.img`
  width: 11px;
  height: 11px;
  object-fit: contain;
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.h3`
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 6px;
`;

const ItemMeta = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
`;

const ItemActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;

  @media (max-width: 576px) {
    width: 100%;
    justify-content: space-between;
    border-top: 1px solid var(--border-color);
    padding-top: 12px;
  }
`;

const PriceContainer = styled.div`
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media (max-width: 576px) {
    text-align: left;
  }
`;

const PriceLabel = styled.span`
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const PriceValue = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
`;

const BuyButton = styled.button`
  background-color: var(--color-primary);
  color: var(--on-primary);
  border: none;
  border-radius: 4px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: var(--primary-container);
  }
`;

const StatusText = styled.div`
  text-align: center;
  padding: 80px 0;
  color: var(--text-secondary);
  font-size: 14px;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 40px;
  padding: 16px 0;
`;

const PaginationArrow = styled.button`
  background: transparent;
  color: var(--text-secondary);
  border: none;
  width: 32px;
  height: 32px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:disabled {
    color: var(--outline);
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    color: var(--text-primary);
  }
`;

const PaginationNumber = styled.button`
  background: transparent;
  color: ${(props) =>
    props.$isActive ? "var(--color-primary)" : "var(--text-secondary)"};
  border: none;
  width: 32px;
  height: 32px;
  font-size: 14px;
  font-weight: ${(props) => (props.$isActive ? "700" : "400")};
  cursor: pointer;
  position: relative;
  transition: color 0.2s;

  &::after {
    content: "";
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: ${(props) =>
      props.$isActive ? "var(--color-primary)" : "transparent"};
  }

  &:hover {
    color: var(--text-primary);
  }
`;

const ParticipantBadge = styled.span`
  margin-left: 10px;
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-container-low);
  padding: 2px 6px;
  border-radius: 4px;
`;

const serverListData = {
  로스트아크: [
    "루페온",
    "카마인",
    "아브렐슈드",
    "카단",
    "아만",
    "실리안",
    "카제로스",
    "니나브",
    "북미",
    "유럽",
  ],
  메이플스토리: [
    "스카니아",
    "루나",
    "엘리시움",
    "크로아",
    "베라",
    "오로라",
    "유니온",
    "이노시스",
    "제니스",
    "RED",
    "아케인",
    "노바",
    "에오스",
    "헬리오스",
    " 챌린저스1",
    "챌린저스2",
    "챌린저스3",
    "챌린저스4",
  ],
  던전앤파이터: [
    "통합서버",
    "카인",
    "디레지에",
    "바칼",
    "프레이",
    "시로코",
    "안톤",
    "카시야스",
    "힐더",
    "스타트",
    "이벤트(시즌)서버",
    "퍼스트-테스트",
    "퍼스트-테스트(1군)",
    "퍼스트-테스트(2군)",
  ],
  리니지M: [
    "데포로쥬",
    "판도라",
    "듀크데필",
    "파푸리온",
    "린드비오르",
    "군터",
    "하딘",
    "아툰",
    "케레니스",
    "이실로테",
    "켄라우헬",
    "데스나이트",
    "안타라스",
    "발라카스",
    "사이하",
    "질리언",
    "블루디카",
    "라스타바드",
    "기르타스",
    "그림리퍼",
    "발록",
    "진기르타스",
    "말하는섬",
    "원다우드",
    "글루디오",
    "그레시아",
    "켄트",
    "오렌",
  ],
  FC온라인: ["서버전체"],
  배틀그라운드: ["서버전체", "스팀서버", "카카오서버"],
  발로란트: ["서버전체"],
  오버워치2: ["전체"],
};

// 공통 SVG 아이콘 컴포넌트들
const Icon = {
  Search: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ArrowRight: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Clock: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      style={{ marginRight: "4px" }}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

// ⏱ 실시간 카운트다운 전용 컴포넌트
const AuctionTimer = ({ endTimeStr }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTimeStr) - new Date();
      if (difference <= 0) return { text: "경매 종료", urgent: false };

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const pad = (num) => String(num).padStart(2, "0");

      const urgent = difference < 1000 * 60 * 60;

      let text = "";
      if (days > 0) {
        text = `${days}일 ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
      } else {
        text = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
      }
      return { text, urgent };
    };

    const initialRes = calculateTimeLeft();
    setTimeLeft(initialRes.text);
    setIsUrgent(initialRes.urgent);

    const timerInterval = setInterval(() => {
      const res = calculateTimeLeft();
      setTimeLeft(res.text);
      setIsUrgent(res.urgent);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [endTimeStr]);

  return (
    <TimerBadge $isUrgent={isUrgent}>
      <TimerIcon
        src={timer}
        alt="timer"
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
      {timeLeft}
    </TimerBadge>
  );
};

const AuctionListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL에서 쿼리스트링 실시간으로 안전하게 고정 문자열 추출
  const urlSearchKeyword = searchParams.get("search") || "";
  const urlGameName = searchParams.get("game") || "";

  const [games, setGames] = useState([
    { gameId: 1, gameName: "로스트아크", game_id: 1, game_name: "로스트아크" },
    {
      gameId: 2,
      gameName: "메이플스토리",
      game_id: 2,
      game_name: "메이플스토리",
    },
    {
      gameId: 3,
      gameName: "던전앤파이터",
      game_id: 3,
      game_name: "던전앤파이터",
    },
    { gameId: 4, gameName: "리니지M", game_id: 4, game_name: "리니지M" },
    { gameId: 5, gameName: "FC온라인", game_id: 5, game_name: "FC온라인" },
    {
      gameId: 6,
      gameName: "배틀그라운드",
      game_id: 6,
      game_name: "배틀그라운드",
    },
    { gameId: 7, gameName: "발로란트", game_id: 7, game_name: "발로란트" },
    { gameId: 8, gameName: "오버워치2", game_id: 8, game_name: "오버워치2" },
  ]);

  const [servers, setServers] = useState(["전체 서버"]);
  const [rawAuctions, setRawAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);

  const [selectedGameId, setSelectedGameId] = useState(1);
  const [selectedServer, setSelectedServer] = useState("전체 서버");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // 1. 초기 게임 카테고리 리스트 조회 및 연동
  useEffect(() => {
    const fetchGamesData = async () => {
      try {
        const response = await ItemApi.getGames();
        if (
          response.data &&
          response.data.success &&
          response.data.data.length > 0
        ) {
          const normalizedGames = response.data.data.map((g) => ({
            ...g,
            gameId: g.gameId || g.game_id,
            gameName: g.gameName || g.game_name,
          }));
          setGames(normalizedGames);

          if (!urlGameName) {
            setSelectedGameId(normalizedGames[0].gameId);
          }
        }
      } catch (error) {
        console.error("게임 카테고리 로드 실패:", error);
      }
    };
    fetchGamesData();
  }, []);

  // 게임 선택 변경 시 해당 서버 리스트 업데이트 트리거
  useEffect(() => {
    const targetGame = games.find(
      (g) => (g.gameId || g.game_id) === selectedGameId,
    );
    const selectedGameName = targetGame?.gameName || targetGame?.game_name;
    if (selectedGameName) {
      const gameServers = serverListData[selectedGameName] || [];
      setServers(["전체 서버", ...gameServers]);
    }
  }, [selectedGameId, games]);

  // 2. URL 쿼리 파라미터 제어 및 동기화 처리 (추출된 원시문자열 기반으로 무한 루프 차단)
  useEffect(() => {
    if (games.length === 0) return;

    if (urlSearchKeyword !== searchKeyword) {
      setSearchKeyword(urlSearchKeyword);
    }

    if (urlGameName) {
      const matchedGame = games.find(
        (g) =>
          (g.gameName || g.game_name).toUpperCase() ===
          urlGameName.toUpperCase(),
      );
      const matchedId = matchedGame
        ? matchedGame.gameId || matchedGame.game_id
        : null;
      if (matchedId && matchedId !== selectedGameId) {
        setSelectedGameId(matchedId);
        setSelectedServer("전체 서버");
        setCurrentPage(0);
      }
    }
  }, [urlSearchKeyword, urlGameName, games]);

  // 3. 백엔드 API 데이터 조회 연동
  useEffect(() => {
    const fetchAuctionsData = async () => {
      setIsLoading(true);
      try {
        const params = {
          gameId: selectedGameId || "",
          page: 0,
          size: 150,
        };

        const response = await AuctionApi.getAuctions(params);
        if (response.data && response.data.success) {
          const pageData = response.data.data;
          if (pageData && pageData.content) {
            setRawAuctions(pageData.content);
          } else if (Array.isArray(pageData)) {
            setRawAuctions(pageData);
          } else {
            setRawAuctions([]);
          }
        }
      } catch (error) {
        console.error("경매 목록 로드 실패:", error);
        setRawAuctions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctionsData();
  }, [selectedGameId]);

  // 4. 프론트엔드 단에서 서버 및 검색 키워드 기반 실시간 필터링
  useEffect(() => {
    let result = [...rawAuctions];

    // [서버 필터 적용]
    if (selectedServer !== "전체 서버") {
      result = result.filter(
        (auc) =>
          auc.serverName && auc.serverName.trim() === selectedServer.trim(),
      );
    }

    // [검색 키워드 필터 적용]
    if (urlSearchKeyword.trim() !== "") {
      result = result.filter(
        (auc) =>
          auc.itemTitle &&
          auc.itemTitle.toLowerCase().includes(urlSearchKeyword.toLowerCase()),
      );
    }

    setFilteredAuctions(result);
    setTotalPages(Math.ceil(result.length / itemsPerPage) || 1);
  }, [rawAuctions, selectedServer, urlSearchKeyword]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const targetGame = games.find(
      (g) => (g.gameId || g.game_id) === selectedGameId,
    );
    const currentGameName = targetGame?.gameName || targetGame?.game_name || "";
    setCurrentPage(0);
    setSearchParams({ game: currentGameName, search: searchKeyword });
  };

  const handleGameChange = (game) => {
    const gameId = game.gameId || game.game_id;
    const gameName = game.gameName || game.game_name;
    setSelectedGameId(gameId);
    setSelectedServer("전체 서버");
    setCurrentPage(0);
    setSearchParams({
      game: gameName,
      search: searchParams.get("search") || "",
    });
  };

  const handleServerChange = (serverName) => {
    setSelectedServer(serverName);
    setCurrentPage(0); // 서버 바꿀 때도 즉시 첫 페이지로 리셋
  };

  const handleBidClick = (auctionId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }
    navigate(`/auctions/${auctionId}`);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo(0, 0);
    }
  };

  // 현재 페이지의 데이터 슬라이싱
  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = currentPage * itemsPerPage;
  const currentItems = filteredAuctions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const getCurrentGameName = () => {
    const target = games.find(
      (g) => (g.gameId || g.game_id) === selectedGameId,
    );
    return target?.gameName || target?.game_name || "GAME";
  };

  return (
    <PageLayout>
      <TopSection>
        <PageTitle>실시간 경매소</PageTitle>

        <FilterArea>
          <SearchForm onSubmit={handleSearchSubmit}>
            <SearchInput
              type="text"
              placeholder="경매 상품, 키워드 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <SearchButton type="submit">
              <Icon.Search />
            </SearchButton>
          </SearchForm>

          <CategoryTabContainer
            style={{ overflowX: "auto", paddingBottom: "4px" }}
          >
            {games.map((game) => {
              const gameId = game.gameId || game.game_id;
              const gameName = game.gameName || game.game_name;
              return (
                <CategoryTab
                  key={gameId}
                  $isActive={selectedGameId === gameId}
                  onClick={() => handleGameChange(game)}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {gameName}
                </CategoryTab>
              );
            })}
          </CategoryTabContainer>
        </FilterArea>
      </TopSection>

      <MainContentContainer>
        <ServerSidebar>
          <SidebarTitle>
            {getCurrentGameName()} 서버
            <span>SERVER</span>
          </SidebarTitle>
          <ServerList>
            {servers.map((server, idx) => (
              <ServerItem
                key={idx}
                $isActive={selectedServer === server}
                onClick={() => handleServerChange(server)}
              >
                {server}
              </ServerItem>
            ))}
          </ServerList>
        </ServerSidebar>

        <ItemListSection>
          {isLoading ? (
            <StatusText>경매를 불러오는 중입니다...</StatusText>
          ) : currentItems.length === 0 ? (
            <StatusText>등록된 경매 상품이 없습니다.</StatusText>
          ) : (
            <>
              {currentItems.map((auction) => (
                <ItemCard key={auction.auctionId}>
                  <ItemThumbnail>
                    <img
                      src={
                        auction.thumbnailImg ||
                        "https://placehold.co/60x60/171821/ffffff?text=Auction"
                      }
                      alt={auction.itemTitle}
                    />
                  </ItemThumbnail>

                  <ItemInfo>
                    <ItemName>{auction.itemTitle}</ItemName>
                    <ItemMeta>
                      <span>
                        {getCurrentGameName()} /{" "}
                        {auction.serverName || "전체 서버"}
                      </span>
                      {/* 깨짐이 발생하는 썸네일 내부 대신 가독성이 뛰어난 메타 정보 영역에 타이머 배치 */}
                      <AuctionTimer endTimeStr={auction.endTime} />
                      <ParticipantBadge>
                        {auction.bidCount || 0}명 참여 중
                      </ParticipantBadge>
                    </ItemMeta>
                  </ItemInfo>

                  <ItemActionGroup>
                    <PriceContainer>
                      <PriceLabel>
                        시작 {Number(auction.startPrice).toLocaleString()}원
                      </PriceLabel>
                      <PriceValue>
                        {Number(auction.currentPrice).toLocaleString()}원
                      </PriceValue>
                    </PriceContainer>
                    <BuyButton
                      onClick={() => handleBidClick(auction.auctionId)}
                    >
                      입찰하기
                    </BuyButton>
                  </ItemActionGroup>
                </ItemCard>
              ))}

              <PaginationContainer>
                <PaginationArrow
                  disabled={currentPage === 0}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <Icon.ArrowLeft />
                </PaginationArrow>

                {[...Array(totalPages)].map((_, index) => (
                  <PaginationNumber
                    key={index}
                    $isActive={currentPage === index}
                    onClick={() => handlePageChange(index)}
                  >
                    {index + 1}
                  </PaginationNumber>
                ))}

                <PaginationArrow
                  disabled={currentPage === totalPages - 1}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <Icon.ArrowRight />
                </PaginationArrow>
              </PaginationContainer>
            </>
          )}
        </ItemListSection>
      </MainContentContainer>
    </PageLayout>
  );
};

export default AuctionListPage;
