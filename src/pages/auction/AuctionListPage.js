import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuctionApi from "../../api/auction.api";
import ItemApi from "../../api/item.api";
import { useAuth } from "../../context/AuthContext";

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
  @media (max-width: 992px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  background-color: var(--bg-container-low);
  border: 1px solid var(--border-color);
  border-radius: 25px;
  padding: 4px 16px;
  width: 280px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  &:focus-within {
    border-color: var(--border-focus);
  }
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
  gap: 12px;
  align-items: center;
  overflow-x: auto;
  padding-bottom: 8px;
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
  white-space: nowrap;
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
      props.$isActive
        ? "var(--color-primary)"
        : "var(--bg-container-low)"} !important;
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
  align-items: center;
  background-color: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px 24px;
  cursor: pointer;
  transition:
    transform 0.2s,
    border-color 0.2s;
  &:hover {
    border-color: var(--color-primary);
    transform: translateX(4px);
  }
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const ItemThumbnail = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 20px;
  background-color: var(--bg-container-low);
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const TimerBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.$isUrgent ? "var(--color-danger)" : "var(--color-primary)"};
  color: ${(props) =>
    props.$isUrgent ? "var(--on-tertiary-container)" : "var(--on-primary)"};
  border: 1px solid
    ${(props) => (props.$isUrgent ? "transparent" : "var(--border-color)")};
`;

const TimerIcon = styled.img`
  width: 12px;
  height: 12px;
`;

const ItemActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  @media (max-width: 640px) {
    width: 100%;
    justify-content: space-between;
    border-top: 1px solid var(--border-color);
    padding-top: 12px;
  }
`;

const PriceContainer = styled.div`
  text-align: right;
`;
const PriceLabel = styled.div`
  font-size: 10px;
  color: var(--text-secondary);
  margin-bottom: 2px;
`;
const PriceValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
`;

const BuyButton = styled.button`
  background-color: var(--color-primary);
  color: var(--on-primary);
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background-color: var(--primary-container);
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

const StatusText = styled.div`
  text-align: center;
  padding: 80px 0;
  color: var(--text-secondary);
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 30px;
`;
const PaginationBtn = styled.button`
  background: ${(props) =>
    props.$active ? "var(--color-primary)" : "var(--bg-container)"};
  color: ${(props) =>
    props.$active ? "var(--on-primary)" : "var(--text-secondary)"};
  border: 1px solid var(--border-color);
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
`;

const ParticipantBadge = styled.span`
  margin-left: 10px;
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-container-low);
  padding: 2px 6px;
  border-radius: 4px;
`;

// ── Constants & Helpers ───────────────────────

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
  ],
  던전앤파이터: [
    "통합서버",
    "카인",
    "디레지에",
    "바칼",
    "프레이",
    "시로코",
    "안톤",
  ],
  리니지M: ["데포로쥬", "판도라", "듀크데필", "파푸리온", "군터"],
  FC온라인: ["서버전체"],
  배틀그라운드: ["서버전체", "스팀서버", "카카오서버"],
  발로란트: ["서버전체"],
  오버워치2: ["전체"],
};

const Icon = {
  Search: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
};

const AuctionTimer = ({ endTimeStr }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTimeStr) - new Date();
      if (diff <= 0) return { text: "경매 종료", urgent: false };
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return {
        text: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
        urgent: diff < 3600000,
      };
    };
    const update = () => {
      const res = calc();
      setTimeLeft(res.text);
      setIsUrgent(res.urgent);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTimeStr]);

  return (
    <TimerBadge $isUrgent={isUrgent}>
      <TimerIcon src={timer} alt="t" /> {timeLeft}
    </TimerBadge>
  );
};

// ── Main Component ───────────────────────────

const AuctionListPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [games, setGames] = useState([]);
  const [servers, setServers] = useState(["전체 서버"]);
  const [auctions, setAuctions] = useState([]);

  const [selectedGameId, setSelectedGameId] = useState(null);
  const [selectedServer, setSelectedServer] = useState("전체 서버");
  const [searchKeyword, setSearchKeyword] = useState(
    searchParams.get("search") || "",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // 1. 게임 카테고리 로드
  useEffect(() => {
    ItemApi.getGames().then((res) => {
      if (res.data?.success) {
        const list = res.data.data;
        setGames(list);
        if (list.length > 0 && !selectedGameId)
          setSelectedGameId(list[0].gameId);
      }
    });
  }, []);

  // 2. 게임 변경 시 서버 리스트 업데이트
  useEffect(() => {
    const target = games.find((g) => g.gameId === selectedGameId);
    if (target) {
      setServers(["전체 서버", ...(serverListData[target.gameName] || [])]);
      setSelectedServer("전체 서버");
      fetchAuctions(selectedGameId);
    }
  }, [selectedGameId, games]);

  // 3. 경매 데이터 페칭
  const fetchAuctions = async (gameId) => {
    setIsLoading(true);
    try {
      const params = { gameId, page: 0, size: 100 };
      const res = await AuctionApi.getAuctions(params);
      if (res.data?.success) {
        setAuctions(res.data.data.content || res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. 실시간 필터링 로직
  const filteredData = auctions.filter((auc) => {
    const matchServer =
      selectedServer === "전체 서버" || auc.serverName === selectedServer;
    const matchKeyword =
      !searchKeyword ||
      auc.itemTitle.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchServer && matchKeyword;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ search: searchKeyword });
  };

  // 아이템 카드(썸네일/제목 영역) 클릭 시 상세 페이지로 이동
  // 단순 조회이므로 로그인 여부와 무관하게 이동 허용
  const handleItemClick = (id) => {
    navigate(`/auctions/${id}`);
  };

  // 입찰하기 버튼 클릭 시 - 로그인 체크 후 상세 페이지로 이동
  const handleBidClick = (id) => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return navigate("/login");
    }
    navigate(`/auctions/${id}`);
  };

  return (
    <PageLayout>
      <TopSection>
        <PageTitle>실시간 경매소</PageTitle>
        <FilterArea>
          <SearchForm onSubmit={handleSearch}>
            <SearchInput
              placeholder="경매 상품 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <SearchButton type="submit">
              <Icon.Search />
            </SearchButton>
          </SearchForm>
          <CategoryTabContainer>
            {games.map((g) => (
              <CategoryTab
                key={g.gameId}
                $isActive={selectedGameId === g.gameId}
                onClick={() => setSelectedGameId(g.gameId)}
              >
                {g.gameName}
              </CategoryTab>
            ))}
          </CategoryTabContainer>
        </FilterArea>
      </TopSection>

      <MainContentContainer>
        <ServerSidebar>
          <SidebarTitle>
            서버 필터 <span>SERVER</span>
          </SidebarTitle>
          <ServerList>
            {servers.map((s) => (
              <ServerItem
                key={s}
                $isActive={selectedServer === s}
                onClick={() => setSelectedServer(s)}
              >
                {s}
              </ServerItem>
            ))}
          </ServerList>
        </ServerSidebar>

        <ItemListSection>
          {isLoading ? (
            <StatusText>데이터를 불러오는 중입니다...</StatusText>
          ) : filteredData.length === 0 ? (
            <StatusText>등록된 경매 상품이 없습니다.</StatusText>
          ) : (
            filteredData.map((auc) => (
              <ItemCard
                key={auc.auctionId}
                onClick={() => handleItemClick(auc.auctionId)}
              >
                <ItemThumbnail>
                  <img
                    src={
                      auc.thumbnailImg ||
                      auc.imageUrl ||
                      auc.images?.[0] ||
                      auc.imageUrls?.[0] ||
                      "https://placehold.co/100x100/12131a/ffffff?text=ITEM"
                    }
                    alt="t"
                  />
                </ItemThumbnail>
                <ItemInfo>
                  <ItemName>{auc.itemTitle}</ItemName>
                  <ItemMeta>
                    <span>
                      {auc.gameName} / {auc.serverName || "전체"}
                    </span>
                    <AuctionTimer endTimeStr={auc.endTime} />
                    <span style={{ color: "var(--text-secondary)" }}>
                      {auc.bidCount || 0}명 참여
                    </span>
                  </ItemMeta>
                </ItemInfo>
                <ItemActionGroup>
                  <PriceContainer>
                    <PriceLabel>현재 최고가</PriceLabel>
                    <PriceValue>
                      {Number(
                        auc.currentPrice || auc.startPrice,
                      ).toLocaleString()}
                      원
                    </PriceValue>
                  </PriceContainer>
                  <BuyButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBidClick(auc.auctionId);
                    }}
                  >
                    입찰하기
                  </BuyButton>
                </ItemActionGroup>
              </ItemCard>
            ))
          )}
        </ItemListSection>
      </MainContentContainer>
    </PageLayout>
  );
};

export default AuctionListPage;
