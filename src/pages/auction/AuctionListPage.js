import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuctionApi from "../../api/auction.api";
import ItemApi from "../../api/item.api";
import { useAuth } from "../../context/AuthContext";

import timer from "../../img/timer.svg";

// ── Styled Components ───────────────────────

const PageLayout = styled.div`
  background-color: #0b0c10;
  color: #ffffff;
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
  background-color: #ffffff;
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
  color: #333333;
  &::placeholder {
    color: #999999;
  }
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  color: #6c5ce7;
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
    background: #252631;
    border-radius: 4px;
  }
`;

const CategoryTab = styled.button`
  height: 38px;
  padding: 0 22px;
  border-radius: 20px;
  border: 1px solid #3b3d50;
  background-color: ${(props) => (props.$isActive ? "#635BFF" : "#1B1C25")};
  color: ${(props) => (props.$isActive ? "#ffffff" : "#B0B2C3")};
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    background-color: #635bff;
    color: white;
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
  color: #c0c1ff;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  span {
    font-size: 10px;
    color: #555870;
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
  }
`;

const ServerItem = styled.li`
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  background-color: ${(props) => (props.$isActive ? "#8083FF" : "transparent")};
  color: ${(props) => (props.$isActive ? "#0D0096" : "#C7C4D7")};
  font-weight: ${(props) => (props.$isActive ? "600" : "400")};
  white-space: nowrap;
  &:hover {
    background-color: rgba(128, 131, 255, 0.1);
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
  background-color: #12131a;
  border: 1px solid #1f2029;
  border-radius: 8px;
  padding: 16px 24px;
  transition:
    transform 0.2s,
    border-color 0.2s;
  &:hover {
    border-color: #3b3d54;
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
  background-color: #1c1d26;
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
  color: #e2e8f0;
  margin-bottom: 6px;
`;
const ItemMeta = styled.div`
  font-size: 12px;
  color: #62667d;
  display: flex;
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
  background-color: ${(props) => (props.$isUrgent ? "#FF516A" : "#1B1C25")};
  color: ${(props) => (props.$isUrgent ? "#ffffff" : "#8083FF")};
  border: 1px solid ${(props) => (props.$isUrgent ? "transparent" : "#3b3d50")};
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
    border-top: 1px solid #1f2029;
    padding-top: 12px;
  }
`;

const PriceContainer = styled.div`
  text-align: right;
`;
const PriceLabel = styled.div`
  font-size: 10px;
  color: #52556a;
  margin-bottom: 2px;
`;
const PriceValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #c0c1ff;
`;

const BuyButton = styled.button`
  background-color: #635bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background-color: #4f46e5;
  }
`;

const StatusText = styled.div`
  text-align: center;
  padding: 80px 0;
  color: #62667d;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 30px;
`;
const PaginationBtn = styled.button`
  background: ${(props) => (props.$active ? "#635bff" : "#12131a")};
  color: white;
  border: 1px solid #1f2029;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
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
              <ItemCard key={auc.auctionId}>
                <ItemThumbnail>
                  <img
                    src={
                      auc.thumbnailImg ||
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
                    <span style={{ color: "#888" }}>
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
                  <BuyButton onClick={() => handleBidClick(auc.auctionId)}>
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
