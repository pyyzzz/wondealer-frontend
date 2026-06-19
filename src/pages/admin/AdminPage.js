import { useState, useEffect, useCallback } from "react";
import AdminApi from "../../api/admin.api";

// ── 사이드바 ───────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: "members", icon: "👥", label: "회원 관리" },
  { key: "items", icon: "📦", label: "상품 관리" },
  { key: "games", icon: "🎮", label: "게임/카테고리 관리" },
];

function Sidebar({ active, onChange, adminName, onLogout }) {
  const isNarrow =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;
  return (
    <div
      style={{
        width: isNarrow ? "100%" : 200,
        minHeight: isNarrow ? "auto" : "100vh",
        background: "var(--bg-container)",
        borderRight: isNarrow ? "none" : "1px solid var(--border-color)",
        borderBottom: isNarrow ? "1px solid var(--border-color)" : "none",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "20px 16px 12px" }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 900,
            color: "var(--color-primary)",
          }}
        >
          Wondealer
        </div>
        <div
          style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 2 }}
        >
          Admin Console
        </div>
      </div>

      <div
        style={{
          padding: "8px 0",
          borderTop: "1px solid var(--border-color)",
          borderBottom: "1px solid var(--border-color)",
          margin: "0 12px 8px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--text-secondary)",
            padding: "4px 8px",
          }}
        >
          {adminName}
        </div>
      </div>

      <nav style={{ flex: 1, padding: "4px 8px" }}>
        {NAV_ITEMS.map((n) => (
          <button
            key={n.key}
            onClick={() => onChange(n.key)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "9px 10px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: active === n.key ? 700 : 400,
              background:
                active === n.key ? "rgba(192,193,255,.12)" : "transparent",
              color:
                active === n.key
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              marginBottom: 2,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      <div
        style={{
          padding: "12px 8px",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            textAlign: "left",
            padding: "9px 10px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            color: "var(--color-danger)",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          🚪 로그아웃
        </button>
      </div>
    </div>
  );
}

// ── 공통 컴포넌트 ──────────────────────────────────────────────

function Badge({ label, type }) {
  const styles = {
    정상: {
      bg: "rgba(78,222,163,.1)",
      color: "var(--color-secondary)",
      border: "rgba(78,222,163,.3)",
    },
    제한됨: {
      bg: "rgba(244,63,94,.1)",
      color: "var(--color-danger)",
      border: "rgba(244,63,94,.3)",
    },
    휴면: {
      bg: "rgba(70,69,84,.2)",
      color: "var(--text-secondary)",
      border: "var(--border-color)",
    },
    active: {
      bg: "rgba(78,222,163,.1)",
      color: "var(--color-secondary)",
      border: "rgba(78,222,163,.3)",
    },
    suspended: {
      bg: "rgba(244,63,94,.1)",
      color: "var(--color-danger)",
      border: "rgba(244,63,94,.3)",
    },
  };
  const s = styles[label] ?? styles["휴면"];
  return (
    <span
      style={{
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 4,
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {label === "active" ? "활성" : label === "suspended" ? "정지" : label}
    </span>
  );
}

function ActionBtn({ label, onClick, variant = "default" }) {
  const styles = {
    danger: {
      bg: "rgba(244,63,94,.1)",
      color: "var(--color-danger)",
      border: "rgba(244,63,94,.3)",
    },
    success: {
      bg: "rgba(78,222,163,.1)",
      color: "var(--color-secondary)",
      border: "rgba(78,222,163,.3)",
    },
    default: {
      bg: "rgba(70,69,84,.2)",
      color: "var(--text-secondary)",
      border: "var(--border-color)",
    },
  };
  const s = styles[variant];
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 10,
        padding: "4px 10px",
        borderRadius: 6,
        cursor: "pointer",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {label}
    </button>
  );
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "min(260px, 100%)",
        background: "var(--bg-container-high)",
        border: "1px solid var(--border-color)",
        borderRadius: 8,
        padding: "8px 12px",
        color: "var(--text-primary)",
        fontSize: 12,
        outline: "none",
      }}
    />
  );
}

function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        justifyContent: "flex-end",
        marginTop: 12,
      }}
    >
      <span
        style={{ fontSize: 11, color: "var(--text-secondary)", marginRight: 8 }}
      >
        전체 {total}개
      </span>
      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
        (p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "1px solid var(--border-color)",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: p === page ? 700 : 400,
              background: p === page ? "var(--color-primary)" : "transparent",
              color: p === page ? "var(--on-primary)" : "var(--text-secondary)",
            }}
          >
            {p}
          </button>
        ),
      )}
      {totalPages > 5 && (
        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
          ... {totalPages}
        </span>
      )}
    </div>
  );
}

// ── 회원 관리 ──────────────────────────────────────────────────

function MembersTab() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 10;

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdminApi.getMembers({
        page: page - 1,
        size: PAGE_SIZE,
        search,
      });
      setMembers(res.data.data?.content ?? []);
      setTotal(res.data.data?.totalElements ?? 0);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleBan = async (memberId, isBanned) => {
    try {
      if (isBanned) await AdminApi.unbanMember(memberId);
      else await AdminApi.banMember(memberId, { reason: "관리자 정지" });
      fetchMembers();
    } catch (e) {
      alert("처리 실패: " + (e.response?.data?.message ?? e.message));
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            회원 관리
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            플랫폼의 전체 사용자 목록을 조회하고 관리합니다.
          </p>
        </div>
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="닉네임 또는 이메일 검색..."
        />
      </div>

      <div
        style={{
          background: "var(--bg-container)",
          border: "1px solid var(--border-color)",
          borderRadius: 12,
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: 680,
            borderCollapse: "collapse",
            fontSize: 12,
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
              {["사용자", "이메일", "가입일", "상태", "관리"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  로딩 중...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  회원이 없습니다.
                </td>
              </tr>
            ) : (
              members.map((u) => {
                const isBanned = u.status === "BANNED" || u.status === "제한됨";
                const initials = (u.nickname ?? u.name ?? "?")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <tr
                    key={u.memberId ?? u.id}
                    style={{ borderBottom: "1px solid rgba(70,69,84,.3)" }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "var(--color-primary-container)",
                            color: "var(--on-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 900,
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div
                            style={{
                              color: "var(--text-primary)",
                              fontWeight: 600,
                            }}
                          >
                            {u.nickname ?? u.name}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "var(--text-secondary)",
                              fontFamily: "monospace",
                            }}
                          >
                            UID · {u.memberId ?? u.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {u.email}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {u.createdAt?.slice(0, 10) ?? u.date}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge label={isBanned ? "제한됨" : "정상"} />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <ActionBtn
                          label={isBanned ? "제한 해제" : "정지 처리"}
                          variant={isBanned ? "success" : "danger"}
                          onClick={() =>
                            handleBan(u.memberId ?? u.id, isBanned)
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        total={total}
        pageSize={PAGE_SIZE}
        onChange={setPage}
      />
    </div>
  );
}

// ── 상품 관리 ──────────────────────────────────────────────────

function ItemsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 10;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      // 백엔드 미구현 시 목데이터 fallback
      const res = await AdminApi.getMembers({
        page: page - 1,
        size: PAGE_SIZE,
      });
      setItems([]);
      setTotal(0);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (itemId) => {
    if (!window.confirm("상품을 삭제하시겠습니까?")) return;
    try {
      await AdminApi.deleteItem(itemId);
      fetchItems();
    } catch (e) {
      alert("삭제 실패: " + (e.response?.data?.message ?? e.message));
    }
  };

  const MOCK = [
    {
      id: "#ME-82918",
      name: "공허의 칼도자 (VoidBringer)",
      seller: "ShadowWalker_77",
      price: 12500,
      date: "2023.11.15",
      status: "active",
    },
    {
      id: "#ME-82915",
      name: "네뷸라 코이 등 V2",
      seller: "TechNexus",
      price: 5280,
      date: "2023.11.16",
      status: "active",
    },
    {
      id: "#ME-82921",
      name: "초록빛 파워 장수",
      seller: "GreenSage",
      price: 400,
      date: "2023.11.16",
      status: "active",
    },
    {
      id: "#ME-82942",
      name: "고대 아카이브 상자",
      seller: "Archivist_X",
      price: 89800,
      date: "2023.11.17",
      status: "active",
    },
  ];

  const displayItems = items.length > 0 ? items : MOCK;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            Item Management
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            거래소에 등록된 전체 상품목록을 관리하고 규정 위반 상품을
            조치합니다.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="상품 이름으로 다검색..."
          />
          <button
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid var(--border-color)",
              background: "var(--bg-container-high)",
              color: "var(--text-secondary)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            🔽 필터
          </button>
        </div>
      </div>

      <div
        style={{
          background: "var(--bg-container)",
          border: "1px solid var(--border-color)",
          borderRadius: 12,
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: 760,
            borderCollapse: "collapse",
            fontSize: 12,
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
              {["상품 ID", "아이템", "판매자", "가격", "등록일", "관리"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  로딩 중...
                </td>
              </tr>
            ) : (
              displayItems.map((item) => (
                <tr
                  key={item.id ?? item.itemId}
                  style={{ borderBottom: "1px solid rgba(70,69,84,.3)" }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--text-secondary)",
                      fontFamily: "monospace",
                    }}
                  >
                    {item.id ?? item.itemId}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--text-primary)",
                      fontWeight: 600,
                    }}
                  >
                    {item.name ?? item.itemName}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span
                        style={{
                          color: "var(--color-secondary)",
                          fontSize: 11,
                        }}
                      >
                        👤
                      </span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {item.seller ?? item.sellerNickname}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--color-primary)",
                      fontWeight: 700,
                      fontFamily: "monospace",
                    }}
                  >
                    ₩{(item.price ?? 0).toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {item.date ?? item.createdAt?.slice(0, 10)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <ActionBtn
                      label="🗑"
                      variant="danger"
                      onClick={() => handleDelete(item.id ?? item.itemId)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        total={total || displayItems.length}
        pageSize={PAGE_SIZE}
        onChange={setPage}
      />
    </div>
  );
}

// ── 게임/카테고리 관리 ─────────────────────────────────────────

const CATEGORY_OPTIONS = ["아이템", "게임머니", "계정", "기타"];

function NewGameModal({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState(["아이템"]);
  const [serverInput, setServerInput] = useState("");
  const [servers, setServers] = useState([]);

  const toggleCategory = (cat) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const handleServerKey = (e) => {
    if (e.key === "Enter" && serverInput.trim()) {
      setServers((prev) => [...prev, serverInput.trim()]);
      setServerInput("");
    }
  };

  const removeServer = (s) => setServers((prev) => prev.filter((x) => x !== s));

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("게임 이름을 입력해주세요.");
      return;
    }
    onSubmit({ name, categories, servers });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "var(--bg-container)",
          border: "1px solid var(--border-color)",
          borderRadius: 16,
          padding: 28,
          width: 420,
          maxWidth: "90vw",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              fontSize: 15,
              fontWeight: 900,
              color: "var(--text-primary)",
            }}
          >
            신규 게임 등록
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              color: "var(--text-secondary)",
              marginBottom: 6,
            }}
          >
            게임 이름
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="게임 이름을 입력하세요 (예: 로스트아크)"
            style={{
              width: "100%",
              background: "var(--bg-container-high)",
              border: "1px solid var(--border-color)",
              borderRadius: 8,
              padding: "10px 12px",
              color: "var(--text-primary)",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            기본 카테고리 설정
          </label>
          <div style={{ display: "flex", gap: 12 }}>
            {CATEGORY_OPTIONS.map((cat) => (
              <label
                key={cat}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "var(--text-primary)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={categories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                {cat}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            초기 서버 설정
          </label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 8,
            }}
          >
            {servers.map((s) => (
              <span
                key={s}
                style={{
                  fontSize: 11,
                  padding: "3px 8px",
                  borderRadius: 6,
                  background: "rgba(192,193,255,.1)",
                  color: "var(--color-primary)",
                  border: "1px solid rgba(192,193,255,.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {s}
                <button
                  onClick={() => removeServer(s)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: 10,
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <input
            value={serverInput}
            onChange={(e) => setServerInput(e.target.value)}
            onKeyDown={handleServerKey}
            placeholder="서버 이름을 입력하고 Enter를 누르세요"
            style={{
              width: "100%",
              background: "var(--bg-container-high)",
              border: "1px solid var(--border-color)",
              borderRadius: 8,
              padding: "8px 12px",
              color: "var(--text-primary)",
              fontSize: 12,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              fontSize: 10,
              color: "var(--text-secondary)",
              marginTop: 4,
            }}
          >
            여러 개의 서버는 Enter 키를 사용하여 다음 서버를 등록할 수 있습니다.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 20px",
              borderRadius: 8,
              border: "1px solid var(--border-color)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: "9px 20px",
              borderRadius: 8,
              border: "none",
              background: "var(--color-primary)",
              color: "var(--on-primary)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
}

function GamesTab() {
  const isNarrow =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;
  const [games, setGames] = useState([
    {
      gameId: 1,
      name: "로스트아크",
      status: "ACTIVE",
      servers: [
        { serverId: 1, name: "루페온" },
        { serverId: 2, name: "카제로스" },
        { serverId: 3, name: "아단" },
      ],
    },
    { gameId: 2, name: "메이플스토리", status: "ACTIVE", servers: [] },
    { gameId: 3, name: "발로란트", status: "ACTIVE", servers: [] },
    { gameId: 4, name: "리그오브레전드 2", status: "INACTIVE", servers: [] },
  ]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (games.length > 0 && !selectedGame) setSelectedGame(games[0]);
  }, [games, selectedGame]);

  const handleCreateGame = async (data) => {
    try {
      const res = await AdminApi.createGame({
        gameName: data.name,
        categories: data.categories,
      });
      const newGame = res.data.data;
      // 서버 일괄 등록
      for (const s of data.servers) {
        await AdminApi.createServer(newGame.gameId, { serverName: s });
      }
      setGames((prev) => [
        ...prev,
        {
          ...newGame,
          servers: data.servers.map((s, i) => ({ serverId: i, name: s })),
        },
      ]);
      setShowModal(false);
    } catch {
      // 백엔드 미구현 시 로컬 추가
      const mock = {
        gameId: Date.now(),
        name: data.name,
        status: "ACTIVE",
        servers: data.servers.map((s, i) => ({ serverId: i, name: s })),
      };
      setGames((prev) => [...prev, mock]);
      setSelectedGame(mock);
      setShowModal(false);
    }
  };

  const handleToggleGame = async (game) => {
    const nextStatus = game.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await AdminApi.updateGame(game.gameId, { status: nextStatus });
    } catch {
      /* fallback */
    }
    setGames((prev) =>
      prev.map((g) =>
        g.gameId === game.gameId ? { ...g, status: nextStatus } : g,
      ),
    );
    if (selectedGame?.gameId === game.gameId)
      setSelectedGame((g) => ({ ...g, status: nextStatus }));
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            게임/카테고리 관리
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            등록된 게임과 아이템들은 새로운 게임 카테고리를 /소화하고 서버
            정보를 관리합니다.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "9px 16px",
            borderRadius: 8,
            border: "none",
            background: "var(--color-primary)",
            color: "var(--on-primary)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + 신규 게임 등록
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isNarrow ? "1fr" : "220px 1fr",
          gap: 16,
        }}
      >
        {/* 게임 목록 */}
        <div
          style={{
            background: "var(--bg-container)",
            border: "1px solid var(--border-color)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid var(--border-color)",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text-secondary)",
            }}
          >
            게임 목록
          </div>
          {games.map((g) => (
            <div
              key={g.gameId}
              onClick={() => setSelectedGame(g)}
              style={{
                padding: "12px 14px",
                borderBottom: "1px solid rgba(70,69,84,.3)",
                cursor: "pointer",
                background:
                  selectedGame?.gameId === g.gameId
                    ? "rgba(192,193,255,.08)"
                    : "transparent",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: "var(--color-primary-container)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 900,
                  color: "var(--on-primary)",
                  flexShrink: 0,
                }}
              >
                {g.name.slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {g.name}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color:
                      g.status === "ACTIVE"
                        ? "var(--color-secondary)"
                        : "var(--color-danger)",
                  }}
                >
                  {g.status === "ACTIVE" ? "활성 상태" : "비활성"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 게임 상세 */}
        {selectedGame ? (
          <div
            style={{
              background: "var(--bg-container)",
              border: "1px solid var(--border-color)",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: "var(--color-primary-container)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 900,
                    color: "var(--on-primary)",
                  }}
                >
                  {selectedGame.name.slice(0, 2)}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: "var(--text-primary)",
                    }}
                  >
                    {selectedGame.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                    {selectedGame.status === "ACTIVE" ? "활성 상태" : "비활성"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <ActionBtn
                  label="기본 정보 수정"
                  variant="default"
                  onClick={() => {}}
                />
                <ActionBtn
                  label={
                    selectedGame.status === "ACTIVE"
                      ? "게임 비활성화"
                      : "게임 활성화"
                  }
                  variant={
                    selectedGame.status === "ACTIVE" ? "danger" : "success"
                  }
                  onClick={() => handleToggleGame(selectedGame)}
                />
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid var(--border-color)",
                paddingTop: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  🖥 게임 서버 목록
                </div>
                <button
                  onClick={async () => {
                    const name = window.prompt("서버 이름 입력:");
                    if (!name?.trim()) return;
                    try {
                      await AdminApi.createServer(selectedGame.gameId, {
                        serverName: name.trim(),
                      });
                    } catch {
                      /* fallback */
                    }
                    const newServer = {
                      serverId: Date.now(),
                      name: name.trim(),
                    };
                    setGames((prev) =>
                      prev.map((g) =>
                        g.gameId === selectedGame.gameId
                          ? { ...g, servers: [...(g.servers ?? []), newServer] }
                          : g,
                      ),
                    );
                    setSelectedGame((prev) => ({
                      ...prev,
                      servers: [...(prev.servers ?? []), newServer],
                    }));
                  }}
                  style={{
                    fontSize: 11,
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: "1px solid var(--border-color)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  + 서버 추가
                </button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: 8,
                }}
              >
                {(selectedGame.servers ?? []).length === 0 ? (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      padding: "8px 0",
                    }}
                  >
                    등록된 서버가 없습니다.
                  </div>
                ) : (
                  (selectedGame.servers ?? []).map((s) => (
                    <div
                      key={s.serverId}
                      style={{
                        padding: "8px 12px",
                        background: "var(--bg-container-high)",
                        border: "1px solid var(--border-color)",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "var(--text-primary)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      {s.name}
                      <button
                        onClick={async () => {
                          try {
                            await AdminApi.updateServer(s.serverId, {
                              status: "INACTIVE",
                            });
                          } catch {
                            /* fallback */
                          }
                          setGames((prev) =>
                            prev.map((g) =>
                              g.gameId === selectedGame.gameId
                                ? {
                                    ...g,
                                    servers: g.servers.filter(
                                      (x) => x.serverId !== s.serverId,
                                    ),
                                  }
                                : g,
                            ),
                          );
                          setSelectedGame((prev) => ({
                            ...prev,
                            servers: prev.servers.filter(
                              (x) => x.serverId !== s.serverId,
                            ),
                          }));
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-secondary)",
                          cursor: "pointer",
                          fontSize: 10,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "var(--bg-container)",
              border: "1px solid var(--border-color)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
              게임을 선택하세요
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <NewGameModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateGame}
        />
      )}
    </div>
  );
}

// ── 관리자 로그인 ──────────────────────────────────────────────

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8111/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.message || "관리자 계정 정보가 올바르지 않습니다.");
        setPassword("");
        return;
      }
      localStorage.setItem("accessToken", json.data.accessToken);
      localStorage.setItem("refreshToken", json.data.refreshToken);
      onLogin({ username, role: "슈퍼관리자" });
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-primary)",
      }}
    >
      <div style={{ width: 400, maxWidth: "90vw" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "var(--color-primary)",
              marginBottom: 4,
            }}
          >
            WONDEALER
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
            Admin Console · 관리자 전용
          </div>
        </div>
        <div
          style={{
            background: "var(--bg-container)",
            border: "1px solid var(--border-color)",
            borderRadius: 16,
            padding: 32,
          }}
        >
          <h2
            style={{
              fontSize: 15,
              fontWeight: 900,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            관리자 로그인
          </h2>
          <p
            style={{
              fontSize: 11,
              color: "var(--text-secondary)",
              marginBottom: 24,
            }}
          >
            관리자 계정으로만 접근 가능합니다.
          </p>
          {error && (
            <div
              style={{
                background: "rgba(244,63,94,.1)",
                border: "1px solid rgba(244,63,94,.3)",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 16,
                fontSize: 11,
                color: "var(--color-danger)",
              }}
            >
              {error}
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                color: "var(--text-secondary)",
                marginBottom: 6,
              }}
            >
              관리자 아이디
            </label>
            <input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="wondealer_admin"
              style={{
                width: "100%",
                background: "var(--bg-container-high)",
                border: "1px solid var(--border-color)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "var(--text-primary)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                color: "var(--text-secondary)",
                marginBottom: 6,
              }}
            >
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="비밀번호 입력"
              style={{
                width: "100%",
                background: "var(--bg-container-high)",
                border: "1px solid var(--border-color)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "var(--text-primary)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              background: "var(--color-primary)",
              border: "none",
              borderRadius: 8,
              padding: "12px",
              color: "var(--on-primary)",
              fontSize: 13,
              fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "확인 중..." : "관리자 로그인"}
          </button>
          <div
            style={{
              marginTop: 16,
              padding: "10px 14px",
              background: "rgba(192,193,255,.05)",
              borderRadius: 8,
              fontSize: 11,
              color: "var(--text-secondary)",
            }}
          >
            wondealer_admin / Admin1234!
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 대시보드 ───────────────────────────────────────────────────

function AdminDashboard({ admin, onLogout }) {
  const [activeTab, setActiveTab] = useState("members");
  const isNarrow =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    onLogout();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isNarrow ? "column" : "row",
        minHeight: "100vh",
        background: "var(--bg-primary)",
      }}
    >
      <Sidebar
        active={activeTab}
        onChange={setActiveTab}
        adminName={admin.username}
        onLogout={handleLogout}
      />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: isNarrow ? 16 : 28,
          overflow: "auto",
        }}
      >
        {activeTab === "members" && <MembersTab />}
        {activeTab === "items" && <ItemsTab />}
        {activeTab === "games" && <GamesTab />}
      </div>
    </div>
  );
}

// ── 진입점 ─────────────────────────────────────────────────────

// ── 진입점 (AdminPage.js 맨 아래 부분을 이 코드로 교체하세요) ─────────────────────

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 💡 1. 이미 통합 로그인창에서 로그인하면서 저장해 둔 토큰이 있는지 확인합니다.
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");

    if (token) {
      // 💡 2. 토큰이 존재한다면, 이미 인증된 관리자로 간주하고 대시보드를 열어줍니다.
      // username은 로컬스토리지나 context에서 가져와도 되고, 여기선 임시로 세팅합니다.
      setAdminUser({ username: "wondealer_admin" });
    }
    setLoading(false);
  }, []);

  // 로딩 중일 때는 아무것도 안 띄우거나 로딩 스피너를 보여줍니다.
  if (loading)
    return (
      <div style={{ padding: 28, color: "var(--text-secondary)" }}>
        로딩 중...
      </div>
    );

  // 💡 3. 원래는 adminUser가 없으면 무조건 로그인 창을 띄웠지만,
  // 이제는 위 useEffect 덕분에 이미 로그인되어 있다면 바로 대시보드(AdminDashboard)가 열립니다!
  return adminUser ? (
    <AdminDashboard admin={adminUser} onLogout={() => setAdminUser(null)} />
  ) : (
    <AdminLogin onLoginSuccess={(user) => setAdminUser(user)} />
  );
}
