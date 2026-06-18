import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import ItemApi from "../../api/item.api";

// ── 데이터 및 상수 ──────────────────────────────────────────────────────────
const GAMES = [
  { key: "all", label: "전체" },
  { key: "lostark", label: "LOST ARK" },
  { key: "maple", label: "MapleStory" },
  { key: "dungeon", label: "Dungeon & Fighter" },
  { key: "fc", label: "FC ONLINE" },
  { key: "lineage", label: "Lineage" },
  { key: "battle", label: "PUBG" },
  { key: "valorant", label: "Valorant" },
  { key: "overwatch", label: "Overwatch 2" },
];

const FALLBACK_SERVERS = {
  lostark: [
    "루페온",
    "카마인",
    "아브렐슈드",
    "카단",
    "아만",
    "실리안",
    "카제로스",
    "니나브",
  ],
  maple: ["스카니아", "루나", "엘리시움", "크로아", "베라", "오로라"],
  dungeon: ["통합서버", "카인", "디레지에", "바칼", "프레이"],
  fc: ["서버전체"],
};

const CATEGORIES = ["상품전체", "아이템", "게임머니", "계정", "기타"];

const DUMMY_ITEMS = [
  {
    id: 1,
    title: "멸화의 보석 10레벨",
    game: "lostark",
    gameName: "LOST ARK",
    gameServer: "루페온",
    category: "아이템",
    price: 245000,
  },
  {
    id: 2,
    title: "10만 골드",
    game: "lostark",
    gameName: "LOST ARK",
    gameServer: "카마인",
    category: "게임머니",
    price: 120000,
  },
  {
    id: 5,
    title: "아케인셰이드 두손검",
    game: "maple",
    gameName: "MapleStory",
    gameServer: "스카니아",
    category: "아이템",
    price: 550000,
  },
  {
    id: 8,
    title: "자석펫 (쁘띠 티모)",
    game: "maple",
    gameName: "MapleStory",
    gameServer: "엘리시움",
    category: "아이템",
    price: 990000,
  },
];

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
  const [searchParams, setSearchParams] = useSearchParams();

  // URL 파라미터 읽기
  const game = searchParams.get("game") || "all";
  const server = searchParams.get("server") || "";
  const category = searchParams.get("category") || "상품전체";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const keyword = searchParams.get("keyword") || "";

  const [inputKeyword, setInputKeyword] = useState(keyword);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [serverList, setServerList] = useState([]);

  const SIZE = 10;

  // 필터 업데이트 공통 로직
  const updateParams = useCallback(
    (newParams) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(newParams).forEach(([key, val]) => {
          if (!val || val === "all" || val === "상품전체") next.delete(key);
          else next.set(key, val);
        });
        // 필터가 바뀌면 페이지는 항상 1로 리셋 (단, 페이지 이동 요청이 아닐 때만)
        if (!newParams.page) next.set("page", "1");
        return next;
      });
    },
    [setSearchParams],
  );

  // 게임 선택 시 해당 게임의 서버 목록 로드
  useEffect(() => {
    if (game === "all") {
      setServerList([]);
      return;
    }
    // 우선 로컬 데이터를 보여주고 API가 성공하면 덮어씀
    setServerList(FALLBACK_SERVERS[game] ?? []);
    ItemApi.getGameServers(game)
      .then((r) => {
        const list = r.data?.data ?? [];
        if (list.length > 0)
          setServerList(list.map((s) => s.serverName ?? s.name ?? s));
      })
      .catch(() => {});
  }, [game]);

  // 키워드 파라미터와 인풋 동기화
  useEffect(() => {
    setInputKeyword(keyword);
  }, [keyword]);

  // 데이터 불러오기 및 필터링 적용
  // 1. fetchItems 함수 내부 로직 수정 (더미 데이터 필터링 강화)
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page - 1,
        size: SIZE,
        game: game !== "all" ? game : "",
        server,
        category: category !== "상품전체" ? category : "",
        keyword,
      };
      const res = await ItemApi.getItems(params);
      const pageData = res.data?.data ?? {};
      setItems(pageData.content ?? []);
      setTotal(pageData.totalElements ?? 0);
    } catch (err) {
      // API 실패 시 더미 데이터 기반 실시간 필터링
      let filtered = [...DUMMY_ITEMS];

      // 1. 게임 필터링 (game 키값 매칭)
      if (game !== "all") {
        filtered = filtered.filter((i) => i.game === game);
      }
      // 2. 서버 필터링 (DUMMY_ITEMS의 gameServer 키값 매칭)
      if (server) {
        filtered = filtered.filter((i) => i.gameServer === server);
      }
      // 3. 카테고리 필터링
      if (category !== "상품전체") {
        filtered = filtered.filter((i) => i.category === category);
      }
      // 4. 키워드 필터링
      if (keyword) {
        filtered = filtered.filter((i) =>
          i.title.toLowerCase().includes(keyword.toLowerCase()),
        );
      }

      setTotal(filtered.length);
      setItems(filtered.slice((page - 1) * SIZE, page * SIZE));
    } finally {
      setLoading(false);
    }
  }, [game, server, category, page, keyword]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ keyword: inputKeyword });
  };

  const totalPages = Math.ceil(total / SIZE) || 1;

  return (
    <PageLayout>
      <TopSection>
        <HeaderRow>
          <PageTitle>아이템 거래소</PageTitle>
          <AddBtn onClick={() => navigate("/items/new")}>+ 판매 등록</AddBtn>
        </HeaderRow>

        <GameTabContainer>
          {GAMES.map((g) => (
            <GameTabButton
              key={g.key}
              $isActive={game === g.key}
              onClick={() =>
                updateParams({ game: g.key, server: "", keyword: "" })
              }
            >
              {g.label}
            </GameTabButton>
          ))}
        </GameTabContainer>

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

          <CategoryTabContainer>
            {CATEGORIES.map((cat) => (
              <CategoryTab
                key={cat}
                $isActive={category === cat}
                onClick={() => updateParams({ category: cat })}
              >
                {cat}
              </CategoryTab>
            ))}
          </CategoryTabContainer>
        </FilterArea>
      </TopSection>

      <MainContentContainer>
        <ServerSidebar>
          <SidebarTitle>
            {GAMES.find((g) => g.key === game)?.label || "전체"} 서버
            <span>SERVER LIST</span>
          </SidebarTitle>
          <ServerList>
            <ServerItem
              $isActive={!server}
              onClick={() => updateParams({ server: "" })}
            >
              전체 서버
            </ServerItem>
            {serverList.map((s) => (
              <ServerItem
                key={s}
                $isActive={server === s}
                onClick={() => updateParams({ server: s })}
              >
                {s}
              </ServerItem>
            ))}
          </ServerList>
        </ServerSidebar>

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
                  key={item.itemId || item.id || idx}
                  onClick={() => navigate(`/items/${item.itemId || item.id}`)}
                >
                  <ItemThumbnail>📦</ItemThumbnail>
                  <ItemInfo>
                    <ItemName>{item.title}</ItemName>
                    <ItemMeta>
                      <span className="game-tag">
                        {GAMES.find(
                          (g) => g.key === (item.game || item.gameName),
                        )?.label ||
                          item.gameName ||
                          item.game ||
                          "기타"}
                      </span>
                      <span className="divider"> | </span>
                      <span className="server-tag">
                        {item.serverName || item.gameServer || "전체서버"}
                      </span>
                    </ItemMeta>
                  </ItemInfo>
                  <ItemActionGroup>
                    <PriceContainer>
                      <PriceLabel>판매 가격</PriceLabel>
                      <PriceValue>
                        {Number(
                          item.price || item.basePrice || 0,
                        ).toLocaleString()}
                        원
                      </PriceValue>
                    </PriceContainer>
                    <BuyButton>구매하기</BuyButton>
                  </ItemActionGroup>
                </ItemCard>
              ))}

              <PaginationContainer>
                <PaginationArrow
                  disabled={page === 1}
                  onClick={() => updateParams({ page: String(page - 1) })}
                >
                  <Icon.ArrowLeft />
                </PaginationArrow>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationNumber
                    key={i + 1}
                    $isActive={page === i + 1}
                    onClick={() => updateParams({ page: String(i + 1) })}
                  >
                    {i + 1}
                  </PaginationNumber>
                ))}
                <PaginationArrow
                  disabled={page === totalPages}
                  onClick={() => updateParams({ page: String(page + 1) })}
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
}

// ── Styled Components (기존 스타일 유지) ──────────────────────────────────────────────────

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
  background-color: ${(props) => (props.$isActive ? "#635BFF" : "#1c1d26")};
  color: ${(props) => (props.$isActive ? "#ffffff" : "#9ca3af")};
  border: 1px solid ${(props) => (props.$isActive ? "transparent" : "#2d2f3d")};
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.2s;
  &:hover {
    background-color: #2d2f3d;
  }
`;
const FilterArea = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
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
`;
const SearchButton = styled.button`
  background: none;
  border: none;
  color: #635bff;
  cursor: pointer;
`;
const CategoryTabContainer = styled.div`
  display: flex;
  gap: 10px;
`;
const CategoryTab = styled.button`
  background-color: ${(props) => (props.$isActive ? "#635BFF" : "transparent")};
  color: ${(props) => (props.$isActive ? "#ffffff" : "#B0B2C3")};
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
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
  background-color: ${(props) =>
    props.$isActive ? "#635BFF22" : "transparent"};
  color: ${(props) => (props.$isActive ? "#8083FF" : "#C7C4D7")};
  font-weight: ${(props) => (props.$isActive ? "700" : "400")};
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #1c1d26;
  }
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
    margin: 0 8px;
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
  }
`;
const PaginationNumber = styled.button`
  background: ${(props) => (props.$isActive ? "#635BFF" : "#1c1d26")};
  border: 1px solid ${(props) => (props.$isActive ? "#635BFF" : "#2d2f3d")};
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: ${(props) => (props.$isActive ? "700" : "400")};
  position: relative;
  ${(props) =>
    props.$isActive &&
    `&::after { content: ''; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; background: white; border-radius: 50%; }`}
`;
