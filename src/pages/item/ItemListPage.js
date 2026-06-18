import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import ItemApi from "../../api/item.api";

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
  Tag: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
};

const ItemListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [games, setGames] = useState([]);
  const [servers, setServers] = useState([]);
  const [items, setItems] = useState([]);

  const [selectedGameId, setSelectedGameId] = useState(null);
  const [selectedServerId, setSelectedServerId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("상품전체");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 페이지네이션을 위한 상태 추가
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // 상품 카테고리 종류
  const productCategories = ["상품전체", "아이템", "게임머니", "계정"];

  useEffect(() => {
    const fetchGamesData = async () => {
      try {
        const response = await ItemApi.getGames();
        if (response.data && response.data.success) {
          setGames(response.data.data);
        }
      } catch (error) {
        console.error("게임 목록 로드 실패:", error);
      }
    };
    fetchGamesData();
  }, []);

  useEffect(() => {
    if (games.length === 0) return; // 게임 목록 아직 안 불러졌으면 대기

    const queryGame = searchParams.get("game");
    const querySearch = searchParams.get("search");

    // 검색어 동기화 (값이 다를 때만 셋팅해서 무한 루프 방지)
    if (querySearch !== null) {
      if (querySearch !== searchKeyword) setSearchKeyword(querySearch);
    } else {
      setSearchKeyword("");
    }

    if (queryGame) {
      const matchedGame = games.find(
        (g) => g.game_name.toUpperCase() === queryGame.toUpperCase(),
      );
      if (matchedGame && matchedGame.game_id !== selectedGameId) {
        setSelectedGameId(matchedGame.game_id);
        setSelectedServerId(null); // 게임이 바뀌면 서버 선택 초기화
      }
    } else if (games.length > 0 && !selectedGameId) {
      setSelectedGameId(games[0].game_id);
    }
  }, [searchParams, games]);

  // 선택된 게임 바뀔 때마다 서버 목록 가져오기
  useEffect(() => {
    if (!selectedGameId) return;

    const fetchServersData = async () => {
      try {
        const response = await ItemApi.getGameServers(selectedGameId);
        if (response.data && response.data.success) {
          setServers(response.data.data);
        }
      } catch (error) {
        console.error("서버 목록 로드 실패:", error);
      }
    };
    fetchServersData();
  }, [selectedGameId]);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedGameId, selectedServerId, selectedCategory]);

  // 아이템 목록 최신화
  useEffect(() => {
    if (!selectedGameId) return;

    const fetchItemsData = async () => {
      setIsLoading(true);
      try {
        const params = {
          gameId: selectedGameId,
          serverId: selectedServerId || "",
          category: selectedCategory === "상품전체" ? "" : selectedCategory,
          keyword: searchParams.get("search") || "",
          page: currentPage,
          size: 20,
        };
        const response = await ItemApi.getItems(params);
        if (response.data && response.data.success) {
          if (response.data.data.content) {
            setItems(response.data.data.content);
            setTotalPages(response.data.data.totalPages || 1);
          } else {
            setItems(response.data.data);
            setTotalPages(1);
          }
        }
      } catch (error) {
        console.error("아이템 목록 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItemsData();
  }, [
    selectedGameId,
    selectedServerId,
    selectedCategory,
    currentPage,
    searchParams,
  ]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const currentGameName =
      games.find((g) => g.game_id === selectedGameId)?.game_name || "";
    setCurrentPage(0);
    setSearchParams({
      game: currentGameName,
      search: searchKeyword,
    });
  };

  // 게임 탭 변경 핸들러
  const handleGameChange = (game) => {
    setSelectedGameId(game.game_id);
    setSelectedServerId(null);
    setCurrentPage(0);
    setSearchParams({
      game: game.game_name,
      search: searchParams.get("search") || "",
    });
  };

  // 구매하기 버튼 클릭 시 로그인 여부 체크
  const handleBuyClick = (itemId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return; // 토큰이 없으면 여기서 함수를 종료하여 상세페이지 이동을 막음
    }
    // 토큰이 있을 때만 상세 페이지로 이동
    navigate(`/items/${itemId}`);
  };

  // 페이지 변경
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo(0, 0); // 페이지 변경 시 스크롤 맨 위로
    }
  };

  return (
    <PageLayout>
      {/* 상단 타이틀 및 검색 바 구역 */}
      <TopSection>
        <PageTitle>아이템 거래소</PageTitle>

        <GameTabContainer>
          {games.map((game) => (
            <GameTabButton
              key={game.game_id}
              isActive={selectedGameId === game.game_id}
              onClick={() => handleGameChange(game)}
            >
              {game.game_name}
            </GameTabButton>
          ))}
        </GameTabContainer>

        <FilterArea>
          <SearchForm onSubmit={handleSearchSubmit}>
            <SearchInput
              type="text"
              placeholder="아이템, 키워드 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />

            <SearchButton type="submit">
              <Icon.Search />
            </SearchButton>
          </SearchForm>

          {/* 카테고리는 검색창 옆에 유지 */}
          <CategoryTabContainer>
            {productCategories.map((cat) => (
              <CategoryTab
                key={cat}
                isActive={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </CategoryTab>
            ))}
          </CategoryTabContainer>
        </FilterArea>
      </TopSection>

      {/* 메인 콘텐츠 바디 영역 (서버 사이드바 + 아이템 리스트) */}
      <MainContentContainer>
        {/* 좌측 세로 서버 카테고리 영역 */}
        <ServerSidebar>
          <SidebarTitle>
            {games.find((g) => g.game_id === selectedGameId)?.game_name ||
              "GAME"}{" "}
            서버
            <span>SERVER</span>
          </SidebarTitle>
          <ServerList>
            <ServerItem
              isActive={selectedServerId === null}
              onClick={() => setSelectedServerId(null)}
            >
              전체 서버
            </ServerItem>
            {servers.map((server) => (
              <ServerItem
                key={server.server_id}
                isActive={selectedServerId === server.server_id}
                onClick={() => setSelectedServerId(server.server_id)}
              >
                {server.server_name}
              </ServerItem>
            ))}
          </ServerList>
        </ServerSidebar>

        {/* 우측 아이템 리스트 영역 */}
        <ItemListSection>
          {isLoading ? (
            <StatusText>아이템을 불러오는 중입니다...</StatusText>
          ) : items.length === 0 ? (
            <StatusText>등록된 판매 아이템 목록이 없습니다.</StatusText>
          ) : (
            <>
              {items.map((item) => (
                <ItemCard key={item.item_id}>
                  {/* 왼쪽: 아이템 썸네일 (DB 설계의 대표 이미지 매핑) */}
                  <ItemThumbnail>
                    <img
                      src={
                        item.preview_image ||
                        "https://placehold.co/60x60/171821/ffffff?text=Item"
                      }
                      alt={item.title}
                    />
                  </ItemThumbnail>

                  {/* 중간: 아이템 제목 및 상세 분류 정보 */}
                  <ItemInfo>
                    <ItemName>{item.title}</ItemName>
                    <ItemMeta>
                      {
                        games.find((g) => g.game_id === selectedGameId)
                          ?.game_name
                      }{" "}
                      / {item.server_name || "서버 정보 없음"}
                    </ItemMeta>
                  </ItemInfo>

                  {/* 오른쪽: 가격 및 구매 상세페이지 연결 버튼 */}
                  <ItemActionGroup>
                    <PriceContainer>
                      <PriceLabel>판매 가격</PriceLabel>
                      <PriceValue>
                        {Number(item.price).toLocaleString()}원
                      </PriceValue>
                    </PriceContainer>
                    <BuyButton onClick={() => handleBuyClick(item.item_id)}>
                      구매하기
                    </BuyButton>
                  </ItemActionGroup>
                </ItemCard>
              ))}

              {/* 페이지네이션 UI 구역 */}
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
                    isActive={currentPage === index}
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

export default ItemListPage;

// ── Styled Components (CSS 변수 기반 다크모드 및 모바일 대응 반응형 레이아웃) ───────────────────────

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

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  background-color: var(--bg-container-low);
  border-radius: 25px;
  padding: 4px 16px;
  width: 280px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

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
    color: var(--text-secondary);
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

const GameTabContainer = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #252631;
    border-radius: 4px;
  }
`;

const GameTabButton = styled.button`
  background-color: ${(props) => (props.isActive ? "var(--color-primary)" : "var(--bg-container-low)")};
  color: ${(props) => (props.isActive ? "#ffffff" : "var(--text-secondary)")};
  border: 1px solid ${(props) => (props.isActive ? "transparent" : "var(--border-color)")};
  border-radius: 20px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${(props) =>
      props.isActive ? "var(--color-primary, #5445d4)" : "#252733"};
    color: #ffffff;
  }
`;

const CategoryTabContainer = styled.div`
  display: flex;
  gap: 18px;
  align-items: center;
`;

const CategoryTab = styled.button`
  height: 38px;
  padding: 0 22px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background-color: ${(props) => (props.isActive ? "var(--color-primary)" : "var(--bg-container-low)")};
  color: ${(props) => (props.isActive ? "#ffffff" : "var(--text-secondary)")};
  font-size: 14px;
  font-weight: 400;
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

  background-color: ${(props) => (props.isActive ? "var(--color-primary)" : "transparent")};

  color: ${(props) => (props.isActive ? "#ffffff" : "var(--text-secondary)")};

  font-weight: ${(props) => (props.isActive ? "600" : "400")};

  &:hover {
    background-color: ${(props) =>
      props.isActive ? "#8083FF" : "transparent"} !important;

    color: ${(props) => (props.isActive ? "#0D0096" : "#C7C4D7")} !important;
  }

  @media (max-width: 992px) {
    white-space: nowrap;
    padding: 8px 16px;
  }
`;

const FilterArea = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
  width: 100%;
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
  transition:
    transform 0.2s,
    border-color 0.2s;

  &:hover {
    border-color: #3b3d54;
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

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.h3`
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 6px;
`;

const ItemMeta = styled.p`
  font-size: 12px;
  color: var(--text-secondary);
`;

const ItemActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;

  @media (max-width: 576px) {
    width: 100%;
    justify-content: space-between;
    border-top: 1px solid #1f2029;
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
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: #4335b3;
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
    color: var(--border-color);
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    color: #ffffff;
  }
`;

const PaginationNumber = styled.button`
  background: transparent;
  color: ${(props) => (props.isActive ? "var(--color-primary)" : "var(--text-secondary)")};
  border: none;
  width: 32px;
  height: 32px;
  font-size: 14px;
  font-weight: ${(props) => (props.isActive ? "700" : "400")};
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
    background-color: ${(props) => (props.isActive ? "var(--color-primary)" : "transparent")};
  }

  &:hover {
    color: #ffffff;
  }
`;
