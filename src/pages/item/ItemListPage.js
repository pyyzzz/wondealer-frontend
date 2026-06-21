import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ItemApi from "../../api/item.api";
import { isDeletedItem } from "../../utils/adminLocalState";

/* ── 인라인 스타일 (CSS 파일 없이 단일 파일로 완결) ── */
const css = `
  .il-page {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    min-height: 100vh;
    padding: 40px 5%;
    box-sizing: border-box;
    font-family: "Noto Sans KR", sans-serif;
  }
  @media (max-width: 768px) { .il-page { padding: 20px 4%; } }

  /* 상단 */
  .il-top { display: flex; flex-direction: column; margin-bottom: 32px; gap: 20px; }

  /* 헤더 행 */
  .il-header-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .il-title { font-size: 24px; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -0.5px; }
  @media (max-width: 480px) { .il-title { font-size: 20px; } }

  .il-add-btn {
    background: var(--color-primary); color: var(--on-primary); border: none;
    padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 14px;
    cursor: pointer; white-space: nowrap; transition: opacity 0.2s;
  }
  .il-add-btn:hover { opacity: 0.88; }
  @media (max-width: 480px) { .il-add-btn { padding: 8px 14px; font-size: 13px; } }

  /* 게임 탭 */
  .il-game-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
  .il-game-tabs::-webkit-scrollbar { height: 3px; }
  .il-game-tabs::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }

  .il-game-tab {
    background-color: var(--bg-container-low); color: var(--text-secondary);
    border: 1px solid var(--border-color); padding: 8px 18px; border-radius: 20px;
    cursor: pointer; white-space: nowrap; font-size: 13px; font-weight: 500;
    transition: background-color 0.18s, color 0.18s;
  }
  .il-game-tab:hover,
  .il-game-tab.active { background-color: var(--color-primary); color: var(--on-primary); border-color: transparent; }

  /* 검색 + 카테고리 */
  .il-filter-area { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }

  .il-search-form {
    display: flex; align-items: center; background-color: var(--bg-container-low);
    border: 1px solid var(--border-color); border-radius: 25px; padding: 4px 16px;
    width: 280px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); transition: border-color 0.2s;
  }
  .il-search-form:focus-within { border-color: var(--color-primary); }
  @media (max-width: 480px) { .il-search-form { width: 100%; } }

  .il-search-input {
    border: none; outline: none; background: transparent;
    padding: 8px 4px; width: 100%; font-size: 14px; color: var(--text-primary);
  }
  .il-search-input::placeholder { color: var(--text-secondary); }

  .il-search-btn {
    background: none; border: none; color: var(--color-primary);
    cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;
  }

  .il-category-tabs { display: flex; gap: 8px; align-items: center; overflow-x: auto; padding-bottom: 4px; flex-wrap: wrap; }

  .il-category-tab {
    height: 34px; padding: 0 16px; border-radius: 20px; border: 1px solid var(--border-color);
    background-color: transparent; color: var(--text-secondary); font-size: 13px;
    font-weight: 500; white-space: nowrap; cursor: pointer; transition: 0.2s;
  }
  .il-category-tab:hover,
  .il-category-tab.active { background-color: var(--color-primary); color: var(--on-primary); border-color: transparent; }

  /* 메인 레이아웃 */
  .il-main { display: flex; gap: 36px; }
  @media (max-width: 992px) { .il-main { flex-direction: column; gap: 20px; } }

  /* 사이드바 */
  .il-sidebar { width: 200px; flex-shrink: 0; }
  @media (max-width: 992px) { .il-sidebar { width: 100%; } }

  .il-sidebar-title { font-size: 15px; font-weight: 600; color: var(--color-primary); margin: 0 0 16px; display: flex; flex-direction: column; }
  .il-sidebar-title span { font-size: 10px; font-weight: 400; color: var(--text-secondary); margin-top: 3px; letter-spacing: 0.5px; }
  @media (max-width: 992px) { .il-sidebar-title { margin-bottom: 10px; } }

  .il-server-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
  @media (max-width: 992px) {
    .il-server-list { flex-direction: row; overflow-x: auto; padding-bottom: 6px; gap: 6px; }
    .il-server-list::-webkit-scrollbar { height: 3px; }
    .il-server-list::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
  }

  .il-server-item {
    padding: 10px 14px; border-radius: 6px; font-size: 14px; cursor: pointer;
    color: var(--text-secondary); font-weight: 400; transition: background-color 0.15s, color 0.15s;
  }
  .il-server-item:hover { background-color: var(--bg-container-low); color: var(--text-primary); }
  .il-server-item.active { background-color: var(--color-primary); color: var(--on-primary); font-weight: 600; }

  @media (max-width: 992px) {
    .il-server-item { white-space: nowrap; padding: 7px 14px; border: 1px solid var(--border-color); border-radius: 20px; }
    .il-server-item.active { border-color: var(--color-primary); }
  }

  .il-server-empty { font-size: 12px; color: var(--text-secondary); padding: 8px 10px; }

  /* 목록 섹션 */
  .il-list-section { flex: 1; display: flex; flex-direction: column; gap: 10px; min-width: 0; }

  .il-total { font-size: 13px; color: var(--text-secondary); }
  .il-total strong { color: var(--text-primary); }

  /* 카드 */
  .il-card {
    display: flex; align-items: center; background-color: var(--bg-container);
    border: 1px solid var(--border-color); border-radius: 10px; padding: 16px 20px;
    cursor: pointer; transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  }
  .il-card:hover {
    border-color: var(--color-primary); transform: translateX(4px);
    box-shadow: 0 2px 12px rgba(99,91,255,0.08);
  }
  @media (max-width: 576px) {
    .il-card { flex-direction: column; align-items: flex-start; gap: 14px; padding: 14px 16px; }
    .il-card:hover { transform: none; }
  }

  /* 썸네일 */
  .il-thumb {
    width: 52px; height: 52px; background: var(--bg-container-low); border-radius: 8px;
    display: flex; align-items: center; justify-content: center; font-size: 22px;
    margin-right: 20px; flex-shrink: 0; overflow: hidden;
  }
  .il-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  @media (max-width: 576px) { .il-thumb { margin-right: 0; } }

  /* 아이템 정보 */
  .il-info { flex: 1; min-width: 0; }
  .il-item-name {
    font-size: 15px; font-weight: 500; color: var(--text-primary);
    margin: 0 0 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .il-item-meta { font-size: 12px; color: var(--text-secondary); display: inline-flex; align-items: center; flex-wrap: wrap; gap: 4px; }
  .il-game-tag { color: var(--color-primary); font-weight: 600; }
  .il-divider { margin: 0 4px; color: var(--border-color); }

  /* 액션 그룹 */
  .il-action-group { display: flex; align-items: center; gap: 24px; flex-shrink: 0; }
  @media (max-width: 576px) {
    .il-action-group { width: 100%; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 12px; }
  }

  .il-price-box { text-align: right; }
  @media (max-width: 576px) { .il-price-box { text-align: left; } }
  .il-price-label { font-size: 10px; color: var(--text-secondary); margin-bottom: 2px; }
  .il-price-value { font-size: 18px; font-weight: 700; color: var(--color-primary); }

  .il-buy-btn {
    background: var(--color-primary); color: var(--on-primary); border: none;
    border-radius: 6px; padding: 10px 20px; font-size: 13px; font-weight: 600;
    cursor: pointer; white-space: nowrap; transition: opacity 0.2s;
  }
  .il-buy-btn:hover { opacity: 0.88; }

  /* 상태 텍스트 */
  .il-status { padding: 80px 0; text-align: center; color: var(--text-secondary); font-size: 14px; }

  /* 페이지네이션 */
  .il-pagination { display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 30px; flex-wrap: wrap; }

  .il-page-arrow {
    background: var(--bg-container-low); border: 1px solid var(--border-color);
    color: var(--text-primary); width: 34px; height: 34px; border-radius: 8px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: border-color 0.2s, opacity 0.2s;
  }
  .il-page-arrow:disabled { opacity: 0.3; cursor: default; }
  .il-page-arrow:not(:disabled):hover { border-color: var(--color-primary); }

  .il-page-num {
    background: var(--bg-container-low); border: 1px solid var(--border-color);
    color: var(--text-secondary); width: 34px; height: 34px; border-radius: 8px;
    font-size: 13px; font-weight: 400; cursor: pointer; transition: background-color 0.15s;
  }
  .il-page-num:hover { border-color: var(--color-primary); color: var(--text-primary); }
  .il-page-num.active { background: var(--color-primary); border-color: var(--color-primary); color: var(--on-primary); font-weight: 700; }
`;

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

const SIZE = 10;

export default function ItemListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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

  // 게임 목록 로드
  useEffect(() => {
    ItemApi.getGames()
      .then((r) => {
        const list = r.data?.data ?? r.data ?? [];
        setGames(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, []);

  // URL 파라미터 → state 동기화
  useEffect(() => {
    const gameIdParam = searchParams.get("gameId");
    const keywordParam = searchParams.get("keyword") || "";
    const gameIdNum = gameIdParam ? Number(gameIdParam) : null;
    setSelectedGameId(gameIdNum && !Number.isNaN(gameIdNum) ? gameIdNum : null);
    setKeyword(keywordParam);
    setInputKeyword(keywordParam);
    setSelectedServerId(null);
    setSelectedCategoryId(null);
    setPage(1);
  }, [searchParams]);

  // 게임 변경 시 서버·카테고리 로드
  useEffect(() => {
    setServers([]);
    setCategories([]);
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
      params.tradeType = "DIRECT";
      if (selectedGameId) params.gameId = selectedGameId;
      if (selectedServerId) params.serverId = selectedServerId;
      if (selectedCategoryId) params.categoryId = selectedCategoryId;
      if (keyword.trim()) params.keyword = keyword.trim();

      const res = await ItemApi.getItems(params);
      const pageData = res.data?.data ?? {};
      const visibleItems = (pageData.content ?? []).filter(
        (item) => !isDeletedItem(item),
      );
      setItems(visibleItems);
      setTotal(
        Math.max(
          visibleItems.length,
          Number(pageData.totalElements ?? visibleItems.length) -
            ((pageData.content ?? []).length - visibleItems.length),
        ),
      );
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
    setSelectedServerId(null);
    setSelectedCategoryId(null);
    setKeyword("");
    setInputKeyword("");
    setPage(1);
    setSearchParams(gameId ? { gameId: String(gameId) } : {});
  };

  const totalPages = Math.ceil(total / SIZE) || 1;
  const currentGameName = selectedGameId
    ? (games.find((g) => (g.gameId ?? g.id) === selectedGameId)?.gameName ??
      "게임")
    : "전체";

  return (
    <>
      <style>{css}</style>
      <div className="il-page">
        {/* ── 상단 ── */}
        <div className="il-top">
          {/* 헤더 */}
          <div className="il-header-row">
            <h1 className="il-title">아이템 거래소</h1>
            <button
              className="il-add-btn"
              onClick={() => navigate("/items/new")}
            >
              + 판매 등록
            </button>
          </div>

          {/* 게임 탭 */}
          <div className="il-game-tabs">
            <button
              className={`il-game-tab${selectedGameId === null ? " active" : ""}`}
              onClick={() => handleGameSelect(null)}
            >
              전체
            </button>
            {games.map((g) => (
              <button
                key={g.gameId ?? g.id}
                className={`il-game-tab${selectedGameId === (g.gameId ?? g.id) ? " active" : ""}`}
                onClick={() => handleGameSelect(g.gameId ?? g.id)}
              >
                {g.gameName ?? g.name}
              </button>
            ))}
          </div>

          {/* 검색 + 카테고리 */}
          <div className="il-filter-area">
            <form className="il-search-form" onSubmit={handleSearchSubmit}>
              <input
                className="il-search-input"
                value={inputKeyword}
                onChange={(e) => setInputKeyword(e.target.value)}
                placeholder="아이템, 키워드 검색"
              />
              <button type="submit" className="il-search-btn">
                <Icon.Search />
              </button>
            </form>

            {categories.length > 0 && (
              <div className="il-category-tabs">
                <button
                  className={`il-category-tab${selectedCategoryId === null ? " active" : ""}`}
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setPage(1);
                  }}
                >
                  전체
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    className={`il-category-tab${selectedCategoryId === c.id ? " active" : ""}`}
                    onClick={() => {
                      setSelectedCategoryId(c.id);
                      setPage(1);
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── 메인 콘텐츠 ── */}
        <div className="il-main">
          {/* 서버 사이드바 */}
          <aside className="il-sidebar">
            <h2 className="il-sidebar-title">
              {currentGameName} 서버
              <span>SERVER LIST</span>
            </h2>
            <ul className="il-server-list">
              <li
                className={`il-server-item${selectedServerId === null ? " active" : ""}`}
                onClick={() => {
                  setSelectedServerId(null);
                  setPage(1);
                }}
              >
                전체 서버
              </li>
              {servers.map((s) => (
                <li
                  key={s.id}
                  className={`il-server-item${selectedServerId === s.id ? " active" : ""}`}
                  onClick={() => {
                    setSelectedServerId(s.id);
                    setPage(1);
                  }}
                >
                  {s.name}
                </li>
              ))}
              {selectedGameId && servers.length === 0 && (
                <li className="il-server-empty">서버 없음</li>
              )}
            </ul>
          </aside>

          {/* 아이템 목록 */}
          <section className="il-list-section">
            <div className="il-total">
              총 <strong>{total}</strong>개의 거래 항목
            </div>

            {loading ? (
              <div className="il-status">데이터를 불러오는 중...</div>
            ) : items.length === 0 ? (
              <div className="il-status">등록된 판매 아이템이 없습니다.</div>
            ) : (
              <>
                {items.map((item, idx) => {
                  const itemId = item.itemId ?? item.id ?? idx;
                  const thumbnail =
                    item.thumbnailImg ||
                    item.imageUrl ||
                    item.images?.[0] ||
                    item.imageUrls?.[0];
                  return (
                    <div
                      key={itemId}
                      className="il-card"
                      onClick={() => navigate(`/items/${itemId}`)}
                    >
                      {/* 썸네일 */}
                      <div className="il-thumb">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={item.title || "상품 이미지"}
                          />
                        ) : (
                          "📦"
                        )}
                      </div>

                      {/* 정보 */}
                      <div className="il-info">
                        <h3 className="il-item-name">{item.title}</h3>
                        <div className="il-item-meta">
                          {item.gameName && (
                            <span className="il-game-tag">{item.gameName}</span>
                          )}
                          {item.serverName && (
                            <>
                              <span className="il-divider">|</span>
                              <span>{item.serverName}</span>
                            </>
                          )}
                          {item.categoryName && (
                            <>
                              <span className="il-divider">·</span>
                              <span>{item.categoryName}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* 가격 + 버튼 */}
                      <div className="il-action-group">
                        <div className="il-price-box">
                          <div className="il-price-label">판매 가격</div>
                          <div className="il-price-value">
                            {Number(
                              item.price ?? item.basePrice ?? 0,
                            ).toLocaleString()}
                            원
                          </div>
                        </div>
                        <button
                          className="il-buy-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/items/${itemId}`);
                          }}
                        >
                          구매하기
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="il-pagination">
                    <button
                      className="il-page-arrow"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <Icon.ArrowLeft />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        className={`il-page-num${page === i + 1 ? " active" : ""}`}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="il-page-arrow"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <Icon.ArrowRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
}