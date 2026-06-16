import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import ItemApi from "../../api/item.api";

const GAMES = [
  { key: "전체", label: "전체" },
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
    "북미",
    "유럽",
  ],
  maple: [
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
    "챌린저스1",
    "챌린저스2",
    "챌린저스3",
    "챌린저스4",
  ],
  dungeon: [
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
  ],
  lineage: [
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
    "안타라스",
    "발라카스",
    "사이하",
    "블루디카",
  ],
  fc: ["서버전체"],
  battle: ["서버전체", "스팀서버", "카카오서버"],
  valorant: ["서버전체"],
  overwatch: ["전체"],
};

const FALLBACK_CATEGORIES = {
  lostark: ["전체아이템", "장비", "각인서", "재료", "펫/탈것", "기타"],
  maple: ["전체아이템", "장비", "소비", "펫", "기타"],
  dungeon: ["전체아이템", "장비", "아바타", "강화재료", "기타"],
  lineage: ["전체아이템", "무기", "방어구", "재료", "기타"],
  fc: ["전체아이템", "선수권", "강화", "기타"],
  battle: ["전체아이템", "스킨", "기타"],
  valorant: ["전체아이템", "스킨", "포인트", "기타"],
  overwatch: ["전체아이템", "스킨", "기타"],
};

const SORT_OPTS = [
  { value: "newest", label: "최신순" },
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
];

const SIZE = 16;

const DUMMY_ITEMS = [
  {
    id: 1,
    title: "멸화의 보석 10레벨",
    game: "lostark",
    gameServer: "루페온",
    category: "재료",
    seller: "김루페온",
    price: 245000,
    date: 4,
  },
  {
    id: 2,
    title: "홍염의 보석 10레벨",
    game: "lostark",
    gameServer: "루페온",
    category: "재료",
    seller: "이실리안",
    price: 120000,
    date: 3,
  },
  {
    id: 3,
    title: "고대 등급 목걸이 (치신)",
    game: "lostark",
    gameServer: "카마인",
    category: "장비",
    seller: "박아만",
    price: 85000,
    date: 2,
  },
  {
    id: 4,
    title: "사멸의 지배 무기",
    game: "lostark",
    gameServer: "아브렐슈드",
    category: "장비",
    seller: "최카단",
    price: 15000,
    date: 1,
  },
  {
    id: 5,
    title: "아케인셰이드 두손검",
    game: "maple",
    gameServer: "스카니아",
    category: "장비",
    seller: "자쿰",
    price: 550000,
    date: 8,
  },
  {
    id: 6,
    title: "도미네이터 펜던트",
    game: "maple",
    gameServer: "루나",
    category: "장비",
    seller: "핑크빈",
    price: 180000,
    date: 7,
  },
  {
    id: 7,
    title: "파워 엘릭서 1000개",
    game: "maple",
    gameServer: "스카니아",
    category: "소비",
    seller: "시그너스",
    price: 5000,
    date: 6,
  },
  {
    id: 8,
    title: "자석펫 (쁘띠 티모)",
    game: "maple",
    gameServer: "엘리시움",
    category: "펫",
    seller: "오르카",
    price: 990000,
    date: 5,
  },
];

export default function ItemListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const game = searchParams.get("game") || "전체";
  const server = searchParams.get("server") || "";
  const category = searchParams.get("category") || "전체아이템";
  const sortBy = searchParams.get("sortBy") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const keyword = searchParams.get("keyword") || "";

  const [inputKeyword, setInputKeyword] = useState(keyword);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [servers, setServers] = useState([]);
  const [categories, setCategories] = useState([]);

  const updateParams = useCallback(
    (newParams) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(newParams).forEach(([key, val]) => {
          if (val === undefined || val === null || val === "") next.delete(key);
          else next.set(key, val);
        });
        return next;
      });
    },
    [setSearchParams],
  );

  useEffect(() => {
    setInputKeyword(keyword);
  }, [keyword]);

  // 게임 선택 시 서버/카테고리 세팅
  useEffect(() => {
    if (game === "전체") {
      setServers([]);
      setCategories(["전체아이템"]);
      return;
    }
    const fbServers = FALLBACK_SERVERS[game] ?? [];
    const fbCats = [
      "전체아이템",
      ...(FALLBACK_CATEGORIES[game]?.filter((c) => c !== "전체아이템") ?? []),
    ];
    setServers(fbServers);
    setCategories(fbCats);

    ItemApi.getGameServers(game)
      .then((r) => {
        const list = r.data?.data ?? r.data ?? [];
        if (list.length > 0)
          setServers(list.map((s) => s.serverName ?? s.name ?? s));
      })
      .catch(() => {});

    ItemApi.getCategories(game)
      .then((r) => {
        const list = r.data?.data ?? r.data ?? [];
        if (list.length > 0) {
          const names = list.map((c) => c.categoryName ?? c.name ?? c);
          setCategories([
            "전체아이템",
            ...names.filter((n) => n !== "전체아이템"),
          ]);
        }
      })
      .catch(() => {});
  }, [game]);

  // ✅ 목록 Fetch — 백엔드 ApiResponse<PageResDto<ItemListResDto>> 구조 대응
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: SIZE, sortBy };
      if (game !== "전체") params.game = game;
      if (server) params.server = server;
      if (category && category !== "전체아이템") params.category = category;
      if (keyword.trim()) params.keyword = keyword.trim();

      const res = await ItemApi.getItems(params);

      // 백엔드 응답 구조: { data: { content: [...], totalElements: N } }
      const pageData = res.data?.data ?? res.data ?? {};
      const list = Array.isArray(pageData)
        ? pageData
        : Array.isArray(pageData.content)
          ? pageData.content
          : [];

      setItems(list);
      setTotal(
        pageData.totalElements ??
          pageData.totalCount ??
          pageData.total ??
          list.length,
      );
    } catch (err) {
      console.warn("목록 API 실패, 더미 데이터 사용:", err.message);
      let filtered = [...DUMMY_ITEMS];
      if (game !== "전체") filtered = filtered.filter((i) => i.game === game);
      if (server) filtered = filtered.filter((i) => i.gameServer === server);
      if (category && category !== "전체아이템")
        filtered = filtered.filter((i) => i.category === category);
      if (keyword.trim())
        filtered = filtered.filter((i) =>
          i.title.toLowerCase().includes(keyword.trim().toLowerCase()),
        );
      if (sortBy === "price_asc") filtered.sort((a, b) => a.price - b.price);
      else if (sortBy === "price_desc")
        filtered.sort((a, b) => b.price - a.price);
      else filtered.sort((a, b) => b.date - a.date);
      const start = (page - 1) * SIZE;
      setItems(filtered.slice(start, start + SIZE));
      setTotal(filtered.length);
    } finally {
      setLoading(false);
    }
  }, [game, server, category, sortBy, page, keyword]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleGameChange = (g) => {
    setSearchParams({ game: g, page: "1" });
    setInputKeyword("");
  };
  const handleServerChange = (s) => updateParams({ server: s, page: "1" });
  const handleCategoryChange = (c) => updateParams({ category: c, page: "1" });
  const handleSortChange = (s) => updateParams({ sortBy: s, page: "1" });
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ keyword: inputKeyword.trim(), page: "1" });
  };
  const handlePageChange = (p) => updateParams({ page: String(p) });

  const fmt = (n) => Number(n || 0).toLocaleString("ko-KR");
  const totalPages = Math.ceil(total / SIZE) || 1;
  const displayGameName = (key) =>
    GAMES.find((g) => g.key === key)?.label || key;

  return (
    <PageWrap>
      <TitleBar>
        <PageTitle>아이템 거래소</PageTitle>
        <AddBtn onClick={() => navigate("/items/new")}>+ 판매 물품 등록</AddBtn>
      </TitleBar>

      <GameTabRow>
        {GAMES.map((g) => (
          <GameTab
            key={g.key}
            $active={game === g.key}
            onClick={() => handleGameChange(g.key)}
          >
            {g.label}
          </GameTab>
        ))}
      </GameTabRow>

      <MainLayout>
        <Sidebar>
          <SidebarHeader>
            <SidebarTitle>{displayGameName(game)}</SidebarTitle>
            <SidebarSub>SERVER LIST</SidebarSub>
          </SidebarHeader>

          <SearchForm onSubmit={handleSearchSubmit}>
            <SearchInput
              value={inputKeyword}
              onChange={(e) => setInputKeyword(e.target.value)}
              placeholder="아이템, 키워드 검색"
            />
            <SearchBtn type="submit">검색</SearchBtn>
          </SearchForm>

          <ServerList>
            <ServerItem
              $active={!server}
              onClick={() => handleServerChange("")}
            >
              전체 서버
            </ServerItem>
            {servers.map((s) => (
              <ServerItem
                key={s}
                $active={server === s}
                onClick={() => handleServerChange(s)}
              >
                {s}
              </ServerItem>
            ))}
          </ServerList>
        </Sidebar>

        <ContentArea>
          <FilterBar>
            <CategoryGroup>
              {categories.map((c) => (
                <CategoryChip
                  key={c}
                  $active={category === c}
                  onClick={() => handleCategoryChange(c)}
                >
                  {c}
                </CategoryChip>
              ))}
            </CategoryGroup>
            <SortGroup>
              {SORT_OPTS.map((o) => (
                <SortBtn
                  key={o.value}
                  $active={sortBy === o.value}
                  onClick={() => handleSortChange(o.value)}
                >
                  {o.label}
                </SortBtn>
              ))}
            </SortGroup>
          </FilterBar>

          <TotalIndicator>
            총 <strong>{total.toLocaleString()}</strong>개의 아이템 거래 항목이
            존재합니다.
          </TotalIndicator>

          {loading ? (
            <LoadingBox>데이터 로드 중...</LoadingBox>
          ) : items.length === 0 ? (
            <EmptyBox>
              조건에 일치하는 물품 거래 내역이 존재하지 않습니다.
            </EmptyBox>
          ) : (
            <ListContainer>
              {items.map((item) => {
                // ✅ 백엔드 ItemListResDto 필드명 기준
                const id = item.itemId ?? item.id;
                return (
                  <ItemCard key={id} onClick={() => navigate(`/items/${id}`)}>
                    <CardLeft>
                      <ItemIcon>📦</ItemIcon>
                      <ItemInfo>
                        <ItemTitle>{item.title}</ItemTitle>
                        <ItemMeta>
                          {item.gameName ?? displayGameName(item.game)} ·{" "}
                          {item.serverName ?? item.gameServer ?? "전체서버"} ·{" "}
                          판매자: {item.sellerNickname ?? item.seller ?? "-"}
                        </ItemMeta>
                      </ItemInfo>
                    </CardLeft>
                    <CardRight>
                      {/* ✅ 백엔드 필드명: basePrice */}
                      <PriceText>
                        {fmt(item.basePrice ?? item.price)} 원
                      </PriceText>
                      <BuyBtn
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/items/${id}`);
                        }}
                      >
                        구매하기
                      </BuyBtn>
                    </CardRight>
                  </ItemCard>
                );
              })}
            </ListContainer>
          )}

          {totalPages > 1 && (
            <Pagination>
              <PageArrow
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                ‹
              </PageArrow>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                const pNum = i + 1;
                return (
                  <PageBtn
                    key={pNum}
                    $active={page === pNum}
                    onClick={() => handlePageChange(pNum)}
                  >
                    {pNum}
                  </PageBtn>
                );
              })}
              <PageArrow
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                ›
              </PageArrow>
            </Pagination>
          )}
        </ContentArea>
      </MainLayout>
    </PageWrap>
  );
}

// ── Styled Components ──────────────────────────────────────────────────────────
const PageWrap = styled.div`
  background-color: #08090c;
  color: #f1f3f5;
  min-height: 100vh;
  font-family: "Noto Sans KR", sans-serif;
`;
const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px 40px 10px;
  @media (max-width: 768px) {
    padding: 24px 20px 10px;
  }
`;
const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;
const AddBtn = styled.button`
  background: linear-gradient(135deg, #7209b7, #f72585);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.85;
  }
`;
const GameTabRow = styled.div`
  display: flex;
  gap: 10px;
  padding: 10px 40px 20px;
  border-bottom: 1px solid #1a1d29;
  overflow-x: auto;
  @media (max-width: 768px) {
    padding: 10px 20px 16px;
  }
`;
const GameTab = styled.button`
  background-color: ${(p) => (p.$active ? "#7209b7" : "#11131a")};
  color: ${(p) => (p.$active ? "#fff" : "#6f768a")};
  border: 1px solid ${(p) => (p.$active ? "#7209b7" : "#222636")};
  padding: 8px 18px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;
  &:hover {
    border-color: #7209b7;
    color: #fff;
  }
`;
const MainLayout = styled.div`
  display: flex;
  padding: 30px 40px;
  gap: 40px;
  @media (max-width: 1024px) {
    padding: 20px;
    gap: 20px;
  }
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 16px;
  }
`;
const Sidebar = styled.aside`
  width: 220px;
  flex-shrink: 0;
  @media (max-width: 768px) {
    width: 100%;
  }
`;
const SidebarHeader = styled.div`
  margin-bottom: 16px;
  border-bottom: 1px solid #222636;
  padding-bottom: 10px;
`;
const SidebarTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
`;
const SidebarSub = styled.div`
  font-size: 11px;
  color: #50576e;
  margin-top: 2px;
`;
const SearchForm = styled.form`
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
`;
const SearchInput = styled.input`
  flex: 1;
  background: #11131a;
  border: 1px solid #222636;
  border-radius: 6px;
  padding: 8px 10px;
  color: #fff;
  font-size: 12px;
  outline: none;
  &::placeholder {
    color: #50576e;
  }
`;
const SearchBtn = styled.button`
  background: #7209b7;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
`;
const ServerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const ServerItem = styled.button`
  background: ${(p) => (p.$active ? "#161924" : "none")};
  color: ${(p) => (p.$active ? "#b76eff" : "#888e9e")};
  font-weight: ${(p) => (p.$active ? "700" : "400")};
  border: none;
  text-align: left;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.15s;
  &:hover {
    background: #161924;
    color: #b76eff;
  }
`;
const ContentArea = styled.section`
  flex-grow: 1;
  min-width: 0;
`;
const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
`;
const CategoryGroup = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;
const CategoryChip = styled.button`
  background: none;
  border: none;
  color: ${(p) => (p.$active ? "#fff" : "#888e9e")};
  font-weight: ${(p) => (p.$active ? "700" : "400")};
  border-bottom: ${(p) =>
    p.$active ? "2px solid #fff" : "2px solid transparent"};
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s;
`;
const SortGroup = styled.div`
  display: flex;
  gap: 14px;
`;
const SortBtn = styled.button`
  background: none;
  border: none;
  color: ${(p) => (p.$active ? "#fff" : "#545a6e")};
  font-weight: ${(p) => (p.$active ? "600" : "400")};
  cursor: pointer;
  font-size: 13px;
  transition: color 0.15s;
`;
const TotalIndicator = styled.div`
  font-size: 13px;
  color: #6f768a;
  margin-bottom: 16px;
  strong {
    color: #fff;
  }
`;
const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const ItemCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #11131a;
  border: 1px solid #1e2230;
  border-radius: 12px;
  padding: 18px 24px;
  cursor: pointer;
  transition: border-color 0.2s;
  &:hover {
    border-color: #7209b7;
  }
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
  }
`;
const CardLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;
const ItemIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #1c1f2c;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
`;
const ItemInfo = styled.div``;
const ItemTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;
const ItemMeta = styled.div`
  font-size: 12px;
  color: #6f768a;
  margin-top: 5px;
`;
const CardRight = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
  @media (max-width: 640px) {
    width: 100%;
    justify-content: space-between;
  }
`;
const PriceText = styled.span`
  font-size: 18px;
  font-weight: 700;
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;
const BuyBtn = styled.button`
  background: #7209b7;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.85;
  }
`;
const LoadingBox = styled.div`
  text-align: center;
  padding: 60px;
  color: #6f768a;
`;
const EmptyBox = styled.div`
  text-align: center;
  padding: 60px;
  color: #6f768a;
  background: #11131a;
  border-radius: 12px;
`;
const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
  flex-wrap: wrap;
`;
const PageArrow = styled.button`
  background: #11131a;
  border: 1px solid #1e2230;
  color: ${(p) => (p.disabled ? "#333" : "#fff")};
  width: 34px;
  height: 34px;
  border-radius: 6px;
  cursor: ${(p) => (p.disabled ? "default" : "pointer")};
  font-size: 18px;
`;
const PageBtn = styled.button`
  background: ${(p) => (p.$active ? "#7209b7" : "#11131a")};
  border: 1px solid ${(p) => (p.$active ? "#7209b7" : "#1e2230")};
  color: ${(p) => (p.$active ? "#fff" : "#6f768a")};
  width: 34px;
  height: 34px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
`;
