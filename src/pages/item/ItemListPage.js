import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import ItemApi from "../../api/item.api";

const CATEGORIES = ["상품전체", "아이템", "게임머니", "계정", "기타"];

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
};

export default function ItemListPage() {
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [servers, setServers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedGameId, setSelectedGameId] = useState(null);
  const [selectedServerId, setSelectedServerId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [inputKeyword, setInputKeyword] = useState("");
  const [page, setPage] = useState(1);

  const SIZE = 10;

  // 게임 목록 로드
  useEffect(() => {
    ItemApi.getGames()
      .then((r) => {
        const list = r.data?.data ?? [];
        setGames(list);
      })
      .catch(() => {});
  }, []);

  // 게임 선택 시 서버·카테고리 로드
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
  };

  const totalPages = Math.ceil(total / SIZE) || 1;

  return (
    <PageLayout>
      <TopSection>
        <HeaderRow>
          <PageTitle>아이템 거래소</PageTitle>
          <AddBtn onClick={() => navigate("/items/new")}>+ 판매 등록</AddBtn>
        </HeaderRow>

        {/* 게임 탭 */}
        <GameTabContainer>
          <GameTabButton
            $isActive={selectedGameId === null}
            onClick={() => handleGameSelect(null)}
          >
            전체
          </GameTabButton>
          {games.map((g) => (
            <GameTabButton
              key={g.gameId ?? g.id}
              $isActive={selectedGameId === (g.gameId ?? g.id)}
              onClick={() => handleGameSelect(g.gameId ?? g.id)}
            >
              {g.gameName ?? g.name}
            </GameTabButton>
          ))}
        </GameTabContainer>

        {/* 검색 */}
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

          {/* 카테고리 탭 (백엔드 카테고리) */}
          {categories.length > 0 && (
            <CategoryTabContainer>
              <CategoryTab
                $isActive={selectedCategoryId === null}
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
                  $isActive={selectedCategoryId === c.id}
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
            {selectedGameId
              ? (games.find((g) => (g.gameId ?? g.id) === selectedGameId)
                  ?.gameName ?? "게임")
              : "전체"}{" "}
            서버
            <span>SERVER LIST</span>
          </SidebarTitle>
          <ServerList>
            <ServerItem
              $isActive={selectedServerId === null}
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
                $isActive={selectedServerId === s.id}
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
              {items.map((item, idx) => (
                <ItemCard
                  key={item.itemId ?? item.id ?? idx}
                  onClick={() => navigate(`/items/${item.itemId ?? item.id}`)}
                >
                  <ItemThumbnail>📦</ItemThumbnail>
                  <ItemInfo>
                    <ItemName>{item.title}</ItemName>
                    <ItemMeta>
                      <span className="game-tag">{item.gameName ?? ""}</span>
                      {item.serverName && (
                        <>
                          <span className="divider"> | </span>
                          <span className="server-tag">{item.serverName}</span>
                        </>
                      )}
                      {item.categoryName && (
                        <>
                          <span className="divider"> · </span>
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
                        navigate(`/items/${item.itemId ?? item.id}`);
                      }}
                    >
                      구매하기
                    </BuyButton>
                  </ItemActionGroup>
                </ItemCard>
              ))}

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
                      $isActive={page === i + 1}
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
  );
}

// ── Styled Components ──────────────────────────────────────────
const PageLayout = styled.div`
  background-color: #0b0c10;
  color: #ffffff;
  min-height: 100vh;
  padding: 40px 8%;
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
const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const PageTitle = styled.h1`
  font-size: 26px;
  font-weight: 800;
  background: linear-gradient(to right, #ffffff, #8083ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;
const AddBtn = styled.button`
  background: #635bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;
const GameTabContainer = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 10px;
  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #2d2f3d;
    border-radius: 4px;
  }
`;
const GameTabButton = styled.button`
  background-color: ${(p) => (p.$isActive ? "#635BFF" : "#1c1d26")};
  color: ${(p) => (p.$isActive ? "#ffffff" : "#9ca3af")};
  border: 1px solid ${(p) => (p.$isActive ? "transparent" : "#2d2f3d")};
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.2s;
  &:hover {
    background-color: ${(p) => (p.$isActive ? "#635BFF" : "#2d2f3d")};
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
  background-color: #1c1d26;
  border: 1px solid #2d2f3d;
  border-radius: 25px;
  padding: 4px 16px;
  width: 300px;
`;
const SearchInput = styled.input`
  border: none;
  background: transparent;
  padding: 8px;
  width: 100%;
  color: white;
  outline: none;
  font-size: 14px;
`;
const SearchButton = styled.button`
  background: none;
  border: none;
  color: #635bff;
  cursor: pointer;
`;
const CategoryTabContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;
const CategoryTab = styled.button`
  background-color: ${(p) => (p.$isActive ? "#635BFF" : "transparent")};
  color: ${(p) => (p.$isActive ? "#ffffff" : "#B0B2C3")};
  border: 1px solid ${(p) => (p.$isActive ? "#635BFF" : "#2d2f3d")};
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: 0.15s;
`;
const MainContentContainer = styled.div`
  display: flex;
  gap: 40px;
  @media (max-width: 992px) {
    flex-direction: column;
  }
`;
const ServerSidebar = styled.aside`
  width: 200px;
  flex-shrink: 0;
`;
const SidebarTitle = styled.h2`
  font-size: 16px;
  color: #c0c1ff;
  margin-bottom: 20px;
  span {
    font-size: 10px;
    color: #555870;
    display: block;
    margin-top: 4px;
  }
`;
const ServerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const ServerItem = styled.div`
  background-color: ${(p) => (p.$isActive ? "#635BFF22" : "transparent")};
  color: ${(p) => (p.$isActive ? "#8083FF" : "#C7C4D7")};
  font-weight: ${(p) => (p.$isActive ? "700" : "400")};
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #1c1d26;
  }
`;
const ServerEmpty = styled.div`
  font-size: 12px;
  color: #3c4060;
  padding: 8px 10px;
`;
const ItemListSection = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const TotalIndicator = styled.div`
  font-size: 13px;
  color: #62667d;
  strong {
    color: #fff;
  }
`;
const ItemCard = styled.div`
  display: flex;
  align-items: center;
  background-color: #12131a;
  border: 1px solid #1f2029;
  border-radius: 12px;
  padding: 18px 24px;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    border-color: #635bff;
    transform: translateX(5px);
  }
`;
const ItemThumbnail = styled.div`
  width: 48px;
  height: 48px;
  background: #1c1d26;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 20px;
  flex-shrink: 0;
`;
const ItemInfo = styled.div`
  flex: 1;
`;
const ItemName = styled.h3`
  font-size: 16px;
  color: #e2e8f0;
  margin-bottom: 6px;
`;
const ItemMeta = styled.div`
  font-size: 12px;
  color: #62667d;
  .game-tag {
    color: #8083ff;
    font-weight: 600;
  }
  .divider {
    margin: 0 6px;
    color: #2d2f3d;
  }
`;
const ItemActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
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
  font-weight: 800;
  color: #fff;
`;
const BuyButton = styled.button`
  background: #635bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
`;
const StatusText = styled.div`
  padding: 100px 0;
  text-align: center;
  color: #52556a;
`;
const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 30px;
`;
const PaginationArrow = styled.button`
  background: #1c1d26;
  border: 1px solid #2d2f3d;
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;
const PaginationNumber = styled.button`
  background: ${(p) => (p.$isActive ? "#635BFF" : "#1c1d26")};
  border: 1px solid ${(p) => (p.$isActive ? "#635BFF" : "#2d2f3d")};
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-weight: ${(p) => (p.$isActive ? "700" : "400")};
  cursor: pointer;
`;
