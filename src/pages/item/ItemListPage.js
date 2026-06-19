import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import ItemApi from "../../api/item.api";
import { useTheme } from "../../context/ThemeContext";

// ── Themes ──────────────────────────────────────────────────────
const darkTheme = {
  bgPrimary: "#0b0c10",
  bgContainer: "#12131a",
  bgContainerLow: "#1c1d26",
  borderColor: "#1f2029",
  borderHover: "#2d2f3d",
  textPrimary: "#e2e8f0",
  textSecondary: "#62667d",
  textMuted: "#3c4060",
  colorPrimary: "#635bff",
  colorPrimaryHover: "#4335b3",
  sidebarActiveText: "#8083ff",
  sidebarActiveBg: "#635bff22",
  toggleBg: "#1c1d26",
  toggleBorder: "#2d2f3d",
};

const lightTheme = {
  bgPrimary: "#f5f6fa",
  bgContainer: "#ffffff",
  bgContainerLow: "#f0f1f7",
  borderColor: "#e2e4f0",
  borderHover: "#c5c7dc",
  textPrimary: "#1a1b2e",
  textSecondary: "#6b7080",
  textMuted: "#b0b3c6",
  colorPrimary: "#635bff",
  colorPrimaryHover: "#4335b3",
  sidebarActiveText: "#635bff",
  sidebarActiveBg: "#635bff18",
  toggleBg: "#e8e9f5",
  toggleBorder: "#d1d3e8",
};

// ── Icons ────────────────────────────────────────────────────────
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
  Sun: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  Moon: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
};

const SIZE = 10;

export default function ItemListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme: themeMode, setTheme } = useTheme();

  const isDark = themeMode !== "light";
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  // filter state — URL 쿼리로 초기화
  const initialGameId = (() => {
    const v = searchParams.get("gameId");
    const n = Number(v);
    return v && !Number.isNaN(n) ? n : null;
  })();

  const [games, setGames] = useState([]);
  const [servers, setServers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedGameId, setSelectedGameId] = useState(initialGameId);
  const [selectedServerId, setSelectedServerId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [inputKeyword, setInputKeyword] = useState(
    searchParams.get("keyword") || "",
  );
  const [page, setPage] = useState(1);

  // 게임 목록
  useEffect(() => {
    ItemApi.getGames()
      .then((r) => setGames(r.data?.data ?? []))
      .catch(() => {});
  }, []);

  // 게임 변경 시 서버·카테고리 리셋 + 재조회
  useEffect(() => {
    setSelectedServerId(null);
    setSelectedCategoryId(null);
    setServers([]);
    setCategories([]);
    setPage(1);

    if (!selectedGameId) return;

    ItemApi.getGameServers(selectedGameId)
      .then((r) => {
        const list = r.data?.data ?? r.data ?? [];
        setServers(
          list.map((s) => ({
            id: s.serverId ?? s.id,
            name: s.serverName ?? s.name,
          })),
        );
      })
      .catch(() => {});

    ItemApi.getCategories(selectedGameId)
      .then((r) => {
        const list = r.data?.data ?? r.data ?? [];
        setCategories(
          list.map((c) => ({
            id: c.categoryId ?? c.id,
            name: c.categoryName ?? c.name,
          })),
        );
      })
      .catch(() => {});
  }, [selectedGameId]);

  // 아이템 조회
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page - 1, size: SIZE };
      if (selectedGameId) params.gameId = selectedGameId;
      if (selectedServerId) params.serverId = selectedServerId;
      if (selectedCategoryId) params.categoryId = selectedCategoryId;
      if (keyword.trim()) params.keyword = keyword.trim();

      const res = await ItemApi.getItems(params);
      const pageData = res.data?.data ?? {};
      setItems(pageData.content ?? []);
      setTotal(pageData.totalElements ?? 0);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [selectedGameId, selectedServerId, selectedCategoryId, keyword, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setKeyword(inputKeyword);
    setPage(1);
  };

  const handleGameSelect = (gameId) => {
    setSelectedGameId(gameId);
    setKeyword("");
    setInputKeyword("");
    setPage(1);
    setSearchParams(gameId ? { gameId: String(gameId) } : {});
  };

  const totalPages = Math.ceil(total / SIZE) || 1;

  // 현재 게임명
  const currentGameName = selectedGameId
    ? (games.find((g) => (g.gameId ?? g.id) === selectedGameId)?.gameName ??
      "게임")
    : "전체";

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <PageLayout>
        <TopSection>
          <HeaderRow>
            <PageTitle>아이템 거래소</PageTitle>
            <HeaderActions>
              <ThemeToggle onClick={toggleTheme} aria-label="테마 전환">
                {isDark ? <Icon.Sun /> : <Icon.Moon />}
              </ThemeToggle>
              <AddBtn onClick={() => navigate("/items/new")}>
                + 판매 등록
              </AddBtn>
            </HeaderActions>
          </HeaderRow>

          {/* 게임 탭 */}
          <GameTabContainer>
            <GameTabButton
              $active={selectedGameId === null}
              onClick={() => handleGameSelect(null)}
            >
              전체
            </GameTabButton>
            {games.map((g) => (
              <GameTabButton
                key={g.gameId ?? g.id}
                $active={selectedGameId === (g.gameId ?? g.id)}
                onClick={() => handleGameSelect(g.gameId ?? g.id)}
              >
                {g.gameName ?? g.name}
              </GameTabButton>
            ))}
          </GameTabContainer>

          {/* 검색 + 카테고리 */}
          <FilterArea>
            <SearchForm onSubmit={handleSearchSubmit}>
              <SearchInput
                value={inputKeyword}
                onChange={(e) => setInputKeyword(e.target.value)}
                placeholder="아이템, 키워드 검색"
              />
              <SearchButton type="submit">
                <Icon.Search />
              </SearchButton>
            </SearchForm>

            {categories.length > 0 && (
              <CategoryTabContainer>
                <CategoryTab
                  $active={selectedCategoryId === null}
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setPage(1);
                  }}
                >
                  전체
                </CategoryTab>
                {categories.map((c) => (
                  <CategoryTab
                    key={c.id}
                    $active={selectedCategoryId === c.id}
                    onClick={() => {
                      setSelectedCategoryId(c.id);
                      setPage(1);
                    }}
                  >
                    {c.name}
                  </CategoryTab>
                ))}
              </CategoryTabContainer>
            )}
          </FilterArea>
        </TopSection>

        <MainContentContainer>
          {/* 서버 사이드바 */}
          <ServerSidebar>
            <SidebarTitle>
              {currentGameName} 서버
              <span>SERVER LIST</span>
            </SidebarTitle>
            <ServerList>
              <ServerItem
                $active={selectedServerId === null}
                onClick={() => {
                  setSelectedServerId(null);
                  setPage(1);
                }}
              >
                전체 서버
              </ServerItem>
              {servers.map((s) => (
                <ServerItem
                  key={s.id}
                  $active={selectedServerId === s.id}
                  onClick={() => {
                    setSelectedServerId(s.id);
                    setPage(1);
                  }}
                >
                  {s.name}
                </ServerItem>
              ))}
              {selectedGameId && servers.length === 0 && (
                <ServerEmpty>서버 없음</ServerEmpty>
              )}
            </ServerList>
          </ServerSidebar>

          {/* 아이템 목록 */}
          <ItemListSection>
            <TotalIndicator>
              총 <strong>{total}</strong>개의 거래 항목
            </TotalIndicator>

            {loading ? (
              <StatusText>데이터를 불러오는 중...</StatusText>
            ) : items.length === 0 ? (
              <StatusText>등록된 판매 아이템이 없습니다.</StatusText>
            ) : (
              <>
                {items.map((item, idx) => {
                  const itemId = item.itemId ?? item.id ?? idx;
                  return (
                    <ItemCard
                      key={itemId}
                      onClick={() => navigate(`/items/${itemId}`)}
                    >
                      <ItemThumbnail>📦</ItemThumbnail>
                      <ItemInfo>
                        <ItemName>{item.title}</ItemName>
                        <ItemMeta>
                          {item.gameName && <GameTag>{item.gameName}</GameTag>}
                          {item.serverName && (
                            <>
                              <Divider>|</Divider>
                              <span>{item.serverName}</span>
                            </>
                          )}
                          {item.categoryName && (
                            <>
                              <Divider>·</Divider>
                              <span>{item.categoryName}</span>
                            </>
                          )}
                        </ItemMeta>
                      </ItemInfo>
                      <ItemActionGroup>
                        <PriceContainer>
                          <PriceLabel>판매 가격</PriceLabel>
                          <PriceValue>
                            {Number(
                              item.price ?? item.basePrice ?? 0,
                            ).toLocaleString()}
                            원
                          </PriceValue>
                        </PriceContainer>
                        <BuyButton
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/items/${itemId}`);
                          }}
                        >
                          구매하기
                        </BuyButton>
                      </ItemActionGroup>
                    </ItemCard>
                  );
                })}

                {totalPages > 1 && (
                  <PaginationContainer>
                    <PaginationArrow
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <Icon.ArrowLeft />
                    </PaginationArrow>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationNumber
                        key={i + 1}
                        $active={page === i + 1}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationNumber>
                    ))}
                    <PaginationArrow
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <Icon.ArrowRight />
                    </PaginationArrow>
                  </PaginationContainer>
                )}
              </>
            )}
          </ItemListSection>
        </MainContentContainer>
      </PageLayout>
    </ThemeProvider>
  );
}

// ── Global ───────────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
`;

// ── Styled Components ────────────────────────────────────────────
const PageLayout = styled.div`
  background-color: ${({ theme }) => theme.bgPrimary};
  color: ${({ theme }) => theme.textPrimary};
  min-height: 100vh;
  padding: 40px 8%;
  font-family: "Noto Sans KR", sans-serif;
  transition:
    background-color 0.2s,
    color 0.2s;

  @media (max-width: 1024px) {
    padding: 32px 5%;
  }
  @media (max-width: 768px) {
    padding: 20px 4%;
  }
  @media (max-width: 480px) {
    padding: 16px 4%;
  }
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 32px;
  gap: 20px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.textPrimary};
  margin: 0;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ThemeToggle = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.toggleBorder};
  background: ${({ theme }) => theme.toggleBg};
  color: ${({ theme }) => theme.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    border-color 0.2s,
    color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.textPrimary};
  }
`;

const AddBtn = styled.button`
  background: ${({ theme }) => theme.colorPrimary};
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.88;
  }

  @media (max-width: 480px) {
    padding: 8px 14px;
    font-size: 13px;
  }
`;

const GameTabContainer = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    height: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.borderHover};
    border-radius: 4px;
  }
`;

const GameTabButton = styled.button`
  background-color: ${({ theme, $active }) =>
    $active ? theme.colorPrimary : theme.bgContainerLow};
  color: ${({ theme, $active }) => ($active ? "#fff" : theme.textSecondary)};
  border: 1px solid
    ${({ theme, $active }) => ($active ? "transparent" : theme.borderHover)};
  padding: 8px 18px;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  transition:
    background-color 0.18s,
    color 0.18s;

  &:hover {
    background-color: ${({ theme, $active }) =>
      $active ? theme.colorPrimary : theme.borderHover};
    color: ${({ $active }) => ($active ? "#fff" : "#fff")};
  }
`;

const FilterArea = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.bgContainerLow};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 25px;
  padding: 4px 16px;
  width: 300px;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: ${({ theme }) => theme.colorPrimary};
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  padding: 8px 4px;
  width: 100%;
  color: ${({ theme }) => theme.textPrimary};
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
  }
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colorPrimary};
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const CategoryTabContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const CategoryTab = styled.button`
  background-color: ${({ theme, $active }) =>
    $active ? theme.colorPrimary : "transparent"};
  color: ${({ theme, $active }) => ($active ? "#fff" : theme.textSecondary)};
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colorPrimary : theme.borderHover};
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: 0.15s;

  &:hover {
    background-color: ${({ theme }) => theme.colorPrimary};
    color: #fff;
    border-color: ${({ theme }) => theme.colorPrimary};
  }
`;

const MainContentContainer = styled.div`
  display: flex;
  gap: 36px;

  @media (max-width: 992px) {
    flex-direction: column;
    gap: 20px;
  }
`;

// 사이드바: 992px 이하에서 가로 스크롤 목록으로 전환
const ServerSidebar = styled.aside`
  width: 200px;
  flex-shrink: 0;

  @media (max-width: 992px) {
    width: 100%;
  }
`;

const SidebarTitle = styled.h2`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colorPrimary};
  margin: 0 0 16px;

  span {
    display: block;
    font-size: 10px;
    font-weight: 400;
    color: ${({ theme }) => theme.textMuted};
    margin-top: 3px;
    letter-spacing: 0.5px;
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
  gap: 4px;

  @media (max-width: 992px) {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 6px;
    gap: 6px;

    &::-webkit-scrollbar {
      height: 3px;
    }
    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.borderHover};
      border-radius: 4px;
    }
  }
`;

const ServerItem = styled.li`
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  background-color: ${({ theme, $active }) =>
    $active ? theme.sidebarActiveBg : "transparent"};
  color: ${({ theme, $active }) =>
    $active ? theme.sidebarActiveText : theme.textSecondary};
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  transition:
    background-color 0.15s,
    color 0.15s;

  &:hover {
    background-color: ${({ theme }) => theme.bgContainerLow};
    color: ${({ theme }) => theme.textPrimary};
  }

  @media (max-width: 992px) {
    white-space: nowrap;
    padding: 7px 14px;
    border: 1px solid
      ${({ theme, $active }) =>
        $active ? theme.colorPrimary : theme.borderColor};
    border-radius: 20px;
  }
`;

const ServerEmpty = styled.li`
  font-size: 12px;
  color: ${({ theme }) => theme.textMuted};
  padding: 8px 10px;
  list-style: none;
`;

const ItemListSection = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`;

const TotalIndicator = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.textSecondary};

  strong {
    color: ${({ theme }) => theme.textPrimary};
  }
`;

const ItemCard = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.bgContainer};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 10px;
  padding: 16px 20px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colorPrimary};
    transform: translateX(4px);
    box-shadow: 0 2px 12px rgba(99, 91, 255, 0.08);
  }

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 16px;
    &:hover {
      transform: none;
    }
  }
`;

const ItemThumbnail = styled.div`
  width: 48px;
  height: 48px;
  background: ${({ theme }) => theme.bgContainerLow};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-right: 18px;
  flex-shrink: 0;

  @media (max-width: 576px) {
    margin-right: 0;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.h3`
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.textPrimary};
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.textSecondary};
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
`;

const GameTag = styled.span`
  color: ${({ theme }) => theme.colorPrimary};
  font-weight: 600;
`;

const Divider = styled.span`
  margin: 0 6px;
  color: ${({ theme }) => theme.borderHover};
`;

const ItemActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;

  @media (max-width: 576px) {
    width: 100%;
    justify-content: space-between;
    border-top: 1px solid ${({ theme }) => theme.borderColor};
    padding-top: 12px;
  }
`;

const PriceContainer = styled.div`
  text-align: right;

  @media (max-width: 576px) {
    text-align: left;
  }
`;

const PriceLabel = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.textMuted};
  margin-bottom: 2px;
`;

const PriceValue = styled.div`
  font-size: 17px;
  font-weight: 800;
  color: ${({ theme }) => theme.textPrimary};
`;

const BuyButton = styled.button`
  background: ${({ theme }) => theme.colorPrimary};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colorPrimaryHover};
  }
`;

const StatusText = styled.div`
  padding: 80px 0;
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 28px;
  flex-wrap: wrap;
`;

const PaginationArrow = styled.button`
  background: ${({ theme }) => theme.bgContainerLow};
  border: 1px solid ${({ theme }) => theme.borderColor};
  color: ${({ theme }) => theme.textPrimary};
  width: 34px;
  height: 34px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
  &:not(:disabled):hover {
    border-color: ${({ theme }) => theme.colorPrimary};
  }
`;

const PaginationNumber = styled.button`
  background: ${({ theme, $active }) =>
    $active ? theme.colorPrimary : theme.bgContainerLow};
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colorPrimary : theme.borderColor};
  color: #fff;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? "700" : "400")};
  cursor: pointer;
  transition: background-color 0.15s;

  &:not([data-active]):hover {
    border-color: ${({ theme }) => theme.colorPrimary};
  }
`;
