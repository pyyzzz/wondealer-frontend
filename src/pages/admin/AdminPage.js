import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminApi from "../../api/admin.api";
import { useAuth } from "../../context/AuthContext";
import {
  getAdminBanReasons,
  getDeletedItemIds,
  getMemberIdentifiers,
  isAdminMember,
  isDeletedItem,
  itemMatchesSearch,
  memberMatchesSearch,
  removeAdminBanReason,
  saveAdminBanReason,
  saveDeletedItemId,
} from "../../utils/adminLocalState";

import admindelete from "../../img/admindelete.svg";
import adminfilter from "../../img/adminfilter.svg";
import admingame from "../../img/admingame.svg";
import admingameserver from "../../img/admingameserver.svg";
import adminlogout from "../../img/adminlogout.svg";
import adminmain from "../../img/adminmain.svg";
import adminmember from "../../img/adminmember.svg";
import adminproduct from "../../img/adminproduct.svg";

// ── 사이드바 ───────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    key: "members",
    icon: (
      <img
        src={adminmember}
        alt="회원"
        style={{
          width: "16px",
          height: "16px",
          marginRight: "8px",
          verticalAlign: "middle",
        }}
      />
    ),
    label: "회원 관리",
  },
  {
    key: "items",
    icon: (
      <img
        src={adminproduct}
        alt="상품"
        style={{
          width: "16px",
          height: "16px",
          marginRight: "8px",
          verticalAlign: "middle",
        }}
      />
    ),
    label: "상품 관리",
  },
  {
    key: "games",
    icon: (
      <img
        src={admingame}
        alt="게임"
        style={{
          width: "16px",
          height: "16px",
          marginRight: "8px",
          verticalAlign: "middle",
        }}
      />
    ),
    label: "게임/카테고리 관리",
  },
];

function Sidebar({ active, onChange, onLogout, onGoMain }) {
  return (
    <div
      className="admin-sidebar"
      style={{
        width: 200,
        minHeight: "100vh",
        background: "var(--bg-container)",
        borderRight: "1px solid var(--border-color)",
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

      <nav className="admin-nav" style={{ flex: 1, padding: "4px 8px" }}>
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
          onClick={onGoMain}
          style={{
            width: "100%",
            textAlign: "left",
            padding: "9px 10px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            color: "var(--text-secondary)",
            background: "transparent",
            marginBottom: 4,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <img
            src={adminmain}
            alt="메인"
            style={{
              width: "14px",
              height: "14px",
              marginRight: "6px",
              verticalAlign: "middle",
            }}
          />
          메인 페이지
        </button>
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
          <img
            src={adminlogout}
            alt="로그아웃"
            style={{
              width: "14px",
              height: "14px",
              marginRight: "6px",
              verticalAlign: "middle",
              filter:
                "invert(35%) sepia(95%) saturate(1200%) hue-rotate(335deg) brightness(95%) contrast(90%)",
            }}
          />
          로그아웃
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
        width: 260,
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
        justifyContent: "center",
        marginTop: 16,
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
  const [banTarget, setBanTarget] = useState(null);
  const [banTargetMember, setBanTargetMember] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [banReasons, setBanReasons] = useState({});
  const PAGE_SIZE = 10;

  const confirmBan = async () => {
    if (!banTarget) return;
    const reason = banReason.trim();
    if (!reason) {
      alert("제재 사유를 입력해주세요.");
      return;
    }
    const targetMember = banTargetMember ||
      members.find(
        (member) => String(member.memberId ?? member.id) === String(banTarget),
      ) || { memberId: banTarget, id: banTarget };
    const savedBeforeRequest = saveAdminBanReason(targetMember, reason);
    setBanReasons(savedBeforeRequest);
    try {
      // 1. 백엔드 API 호출
      const res = await AdminApi.banMember(banTarget, { reason });

      // 2. 백엔드 응답(ApiResponse) 구조에서 데이터 추출 (res.data.data)
      // 백엔드가 ApiResponse.ok("회원이 정지되었습니다.", response) 형태로 주므로 .data.data에 DTO가 들어있음
      const updatedMember = res.data?.data;
      const savedReasons = saveAdminBanReason(
        { ...targetMember, ...updatedMember },
        reason,
      );

      // 3. 현재 프론트엔드 리스트(members) 상태를 즉시 동기화해 줍니다.
      setMembers((prevMembers) =>
        prevMembers.map((member) => {
          const memberId = member.memberId ?? member.id;
          if (memberId === banTarget) {
            return {
              ...member,
              // 백엔드가 준 최신 상태가 있으면 덮어쓰고, 없으면 프론트에서 강제 세팅
              isBanned: updatedMember?.isBanned ?? true,
              banned: updatedMember?.isBanned ?? true,
              banReason: updatedMember?.banReason ?? reason,
              status: "BANNED", // 프론트의 status 조건 방어용
            };
          }
          return member;
        }),
      );

      // 로컬 사유 상태 맵도 함께 백업
      setBanReasons(savedReasons);

      setBanTarget(null);
      setBanTargetMember(null);
      setBanReason("");

      // 서버와 최종 리스트 동기화
      fetchMembers();
    } catch (e) {
      alert("처리 실패: " + (e.response?.data?.message ?? e.message));
    }
  };

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdminApi.getMembers({
        page: 0,
        size: 1000,
        keyword: "",
        sort: "createdAt,desc",
      });
      const savedReasons = getAdminBanReasons();
      const content = res.data.data?.content ?? res.data.data ?? [];
      const list = (Array.isArray(content) ? content : [])
        .filter((member) => !isAdminMember(member))
        .map((member) => {
          const reasonKey = getMemberIdentifiers(member).find(
            (key) => savedReasons[key],
          );
          return reasonKey
            ? {
                ...member,
                isBanned: true,
                banned: true,
                status: "BANNED",
                banReason: member.banReason || savedReasons[reasonKey],
              }
            : member;
        });
      setMembers(list);
      setBanReasons(savedReasons);
      setTotal(list.length);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleBan = async (memberId, isBanned) => {
    try {
      const targetMember = members.find(
        (member) => String(member.memberId ?? member.id) === String(memberId),
      ) ?? { memberId };
      if (isBanned) {
        await AdminApi.unbanMember(memberId);
        const savedReasons = removeAdminBanReason(targetMember);
        setBanReasons(savedReasons);
      } else {
        await AdminApi.banMember(memberId, { reason: "관리자 정지" });
        const savedReasons = saveAdminBanReason(targetMember, "관리자 정지");
        setBanReasons(savedReasons);
      }
      fetchMembers();
    } catch (e) {
      alert("처리 실패: " + (e.response?.data?.message ?? e.message));
    }
  };

  const filteredMembers = members.filter(
    (member) => !isAdminMember(member) && memberMatchesSearch(member, search),
  );
  const displayMembers = filteredMembers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <div>
      <div
        className="admin-section-head"
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
        className="admin-table-scroll"
        style={{
          background: "var(--bg-container)",
          border: "1px solid var(--border-color)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
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
            ) : displayMembers.length === 0 ? (
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
              displayMembers.map((u) => {
                const isBanned =
                  u.isBanned === true ||
                  u.banned === true ||
                  u.status === "BANNED" ||
                  u.status === "제한됨";
                const currentBanReason =
                  u.banReason || banReasons[u.memberId ?? u.id] || "사유 없음";
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
                      <Badge label={isBanned ? "정지됨" : "활성"} />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: isBanned ? "column" : "row",
                          alignItems: "flex-start",
                          gap: 6,
                        }}
                      >
                        {isBanned && (
                          <ActionBtn
                            label="제재 사유"
                            onClick={() =>
                              alert(
                                u.banReason ??
                                  banReasons[u.memberId ?? u.id] ??
                                  "저장된 제재 사유가 없습니다.",
                              )
                            }
                          />
                        )}
                        <ActionBtn
                          label={isBanned ? "정지 해제" : "정지 처리"}
                          variant={isBanned ? "success" : "danger"}
                          onClick={() => {
                            const memberId = u.memberId ?? u.id;
                            if (isBanned) handleBan(memberId, true);
                            else {
                              setBanTarget(memberId);
                              setBanTargetMember(u);
                              setBanReason("");
                            }
                          }}
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
      {banTarget && (
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
              width: 360,
              maxWidth: "90vw",
              background: "var(--bg-container)",
              border: "1px solid var(--border-color)",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <h3 style={{ marginBottom: 12, color: "var(--text-primary)" }}>
              제재 사유 입력
            </h3>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              rows={4}
              placeholder="제재 사유를 입력해주세요."
              style={{
                width: "100%",
                resize: "vertical",
                padding: 12,
                borderRadius: 8,
                border: "1px solid var(--border-color)",
                background: "var(--bg-container-high)",
                color: "var(--text-primary)",
                marginBottom: 14,
              }}
            />
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <ActionBtn
                label="취소"
                onClick={() => {
                  setBanTarget(null);
                  setBanTargetMember(null);
                }}
              />
              <ActionBtn label="확인" variant="danger" onClick={confirmBan} />
            </div>
          </div>
        </div>
      )}
      <Pagination
        page={page}
        total={filteredMembers.length}
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
  const [sort, setSort] = useState("latest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletedIds, setDeletedIds] = useState(() => getDeletedItemIds());
  const PAGE_SIZE = 10;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      // 백엔드 미구현 시 목데이터 fallback
      const res = await AdminApi.getItems({
        page: 0,
        size: 1000,
        keyword: "",
        sort: sort === "latest" ? "createdAt,desc" : "createdAt,asc",
      });
      const content = res.data.data?.content ?? res.data.data ?? [];
      const list = (Array.isArray(content) ? content : []).filter(
        (item) => !isDeletedItem(item, deletedIds),
      );
      setItems(list);
      setTotal(list.length);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [sort, deletedIds]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (itemId) => {
    if (!window.confirm("상품을 삭제하시겠습니까?")) return;
    try {
      await AdminApi.deleteItem(itemId);
      const nextDeletedIds = saveDeletedItemId(itemId);
      setDeletedIds(nextDeletedIds);
      setItems((prev) =>
        prev.filter(
          (item) => String(item.itemId ?? item.id) !== String(itemId),
        ),
      );
      setTotal((prev) => Math.max(0, prev - 1));
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

  void MOCK;
  const filteredItems = items.filter(
    (item) =>
      !isDeletedItem(item, deletedIds) && itemMatchesSearch(item, search),
  );
  const displayItems = filteredItems.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <div>
      <div
        className="admin-section-head"
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
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setFilterOpen((prev) => !prev)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid var(--border-color)",
                background: "var(--bg-container-high)",
                color: "var(--text-secondary)",
                fontSize: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <img
                src={adminfilter}
                alt="필터"
                style={{
                  width: "14px",
                  height: "14px",
                  verticalAlign: "middle",
                }}
              />
              필터
            </button>
            {filterOpen && (
              <button
                onClick={() => {
                  setSort("latest");
                  setPage(1);
                  setFilterOpen(false);
                }}
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  zIndex: 5,
                  minWidth: 92,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-container)",
                  color: "var(--text-primary)",
                  fontSize: 12,
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(0,0,0,.18)",
                }}
              >
                최신순
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        className="admin-table-scroll"
        style={{
          background: "var(--bg-container)",
          border: "1px solid var(--border-color)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
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
            ) : displayItems.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  상품이 없습니다.
                </td>
              </tr>
            ) : (
              displayItems.map((item) => (
                <tr
                  key={item.itemId ?? item.id}
                  style={{ borderBottom: "1px solid rgba(70,69,84,.3)" }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--text-secondary)",
                      fontFamily: "monospace",
                    }}
                  >
                    {item.itemId ?? item.id}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--text-primary)",
                      fontWeight: 600,
                    }}
                  >
                    {item.title ?? item.name ?? item.itemName}
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
                        {item.seller ?? item.sellerNickname ?? "-"}
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
                    ₩{(item.basePrice ?? item.price ?? 0).toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {item.createdAt?.slice(0, 10) ?? item.date}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <ActionBtn
                      label={
                        <img
                          src={admindelete}
                          alt="삭제"
                          style={{
                            width: "14px",
                            height: "14px",
                            verticalAlign: "middle",
                          }}
                        />
                      }
                      variant="danger"
                      onClick={() => handleDelete(item.itemId ?? item.id)}
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
        total={filteredItems.length}
        pageSize={PAGE_SIZE}
        onChange={setPage}
      />
    </div>
  );
}

// ── 게임/카테고리 관리 ─────────────────────────────────────────

const CATEGORY_OPTIONS = ["아이템", "게임머니", "계정", "기타"];

function NewGameModal({ initialGame = null, onClose, onSubmit }) {
  const isEdit = Boolean(initialGame);
  const [name, setName] = useState(
    initialGame?.name ?? initialGame?.gameName ?? "",
  );
  const [imageUrl, setImageUrl] = useState(initialGame?.gameImg ?? "");
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

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUrl(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("게임 이름을 입력해주세요.");
      return;
    }
    onSubmit({ name, imageUrl, categories, servers });
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
        className="admin-modal-panel"
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
            {isEdit ? "게임 기본 정보 수정" : "신규 게임 등록"}
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
              marginBottom: 6,
            }}
          >
            게임 이미지
          </label>
          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              style={{
                width: "100%",
                height: 120,
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid var(--border-color)",
                marginBottom: 8,
              }}
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
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

        {!isEdit && (
          <>
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
                여러 개의 서버는 Enter 키를 사용하여 다음 서버를 등록할 수
                있습니다.
              </div>
            </div>
          </>
        )}

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
            {isEdit ? "수정하기" : "등록하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function GamesTab() {
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
  const [editingGame, setEditingGame] = useState(null);

  useEffect(() => {
    if (games.length > 0 && !selectedGame) setSelectedGame(games[0]);
  }, [games, selectedGame]);

  const handleCreateGame = async (data) => {
    try {
      const res = await AdminApi.createGame({
        gameName: data.name.trim(),
        gameImg: data.imageUrl?.trim() || null,
      });
      const newGame = res.data.data;
      const gameId = newGame.gameId ?? newGame.id;
      for (const category of data.categories) {
        await AdminApi.createCategory({ gameId, categoryName: category });
      }
      // 서버 일괄 등록
      for (const s of data.servers) {
        await AdminApi.createServer(gameId, { serverName: s });
      }
      const createdGame = {
        ...newGame,
        gameId,
        name: newGame.name ?? newGame.gameName ?? data.name,
        gameImg: newGame.gameImg ?? data.imageUrl,
        status: newGame.status ?? "ACTIVE",
        servers: data.servers.map((s, i) => ({ serverId: i, name: s })),
      };
      setGames((prev) => [...prev, createdGame]);
      setSelectedGame(createdGame);
      setShowModal(false);
    } catch {
      // 백엔드 미구현 시 로컬 추가
      const mock = {
        gameId: Date.now(),
        name: data.name,
        gameImg: data.imageUrl,
        status: "ACTIVE",
        servers: data.servers.map((s, i) => ({ serverId: i, name: s })),
      };
      setGames((prev) => [...prev, mock]);
      setSelectedGame(mock);
      setShowModal(false);
    }
  };

  const handleUpdateGame = async (data) => {
    if (!editingGame) return;
    const gameId = editingGame.gameId ?? editingGame.id;
    try {
      const res = await AdminApi.updateGame(gameId, {
        gameName: data.name.trim(),
        gameImg: data.imageUrl?.trim() || null,
      });
      const updated = {
        ...editingGame,
        ...res.data.data,
        gameId,
        name: res.data.data?.name ?? res.data.data?.gameName ?? data.name,
        gameImg: res.data.data?.gameImg ?? data.imageUrl,
      };
      setGames((prev) =>
        prev.map((game) =>
          (game.gameId ?? game.id) === gameId ? updated : game,
        ),
      );
      setSelectedGame(updated);
    } catch {
      const updated = {
        ...editingGame,
        name: data.name,
        gameImg: data.imageUrl,
      };
      setGames((prev) =>
        prev.map((game) =>
          (game.gameId ?? game.id) === gameId ? updated : game,
        ),
      );
      setSelectedGame(updated);
    } finally {
      setEditingGame(null);
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
        className="admin-section-head"
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
          onClick={() => {
            setEditingGame(null);
            setShowModal(true);
          }}
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
        className="admin-games-layout"
        style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}
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
              {g.gameImg ? (
                <img
                  src={g.gameImg}
                  alt=""
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              ) : (
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
              )}
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
                {selectedGame.gameImg ? (
                  <img
                    src={selectedGame.gameImg}
                    alt=""
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      objectFit: "cover",
                    }}
                  />
                ) : (
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
                )}
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
                  onClick={() => {
                    setEditingGame(selectedGame);
                    setShowModal(true);
                  }}
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
                    display: "flex",
                    alignItems: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  <img
                    src={admingameserver}
                    alt="게임서버"
                    style={{
                      width: "14px",
                      height: "16px",
                      marginRight: "6px",
                      verticalAlign: "middle",
                    }}
                  />
                  게임 서버 목록
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
          initialGame={editingGame}
          onClose={() => {
            setEditingGame(null);
            setShowModal(false);
          }}
          onSubmit={editingGame ? handleUpdateGame : handleCreateGame}
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
      const res = await fetch("http://localhost:8111/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: username, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.message || "관리자 계정 정보가 올바르지 않습니다.");
        setPassword("");
        return;
      }
      if (json.data?.role !== "ROLE_ADMIN") {
        setError("관리자 계정이 아닙니다.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        return;
      }
      localStorage.setItem("accessToken", json.data.accessToken);
      localStorage.setItem("refreshToken", json.data.refreshToken);
      localStorage.setItem("role", json.data.role);
      onLogin({ username, role: json.data.role });
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

function AdminResponsiveStyles() {
  return (
    <style>{`
      .admin-table-scroll { overflow-x: auto !important; }
      .admin-table-scroll table { min-width: 720px; }
      @media (max-width: 900px) {
        .admin-dashboard { flex-direction: column; }
        .admin-sidebar {
          width: auto !important;
          min-height: auto !important;
          border-right: 0 !important;
          border-bottom: 1px solid var(--border-color);
        }
        .admin-nav { display: flex; overflow-x: auto; gap: 4px; }
        .admin-nav button { white-space: nowrap; width: auto !important; flex: 0 0 auto; }
        .admin-content { padding: 16px !important; }
        .admin-section-head { align-items: flex-start !important; flex-direction: column; gap: 12px; }
        .admin-games-layout { grid-template-columns: 1fr !important; }
        .admin-modal-panel { width: min(420px, calc(100vw - 32px)) !important; max-height: 88vh; overflow: auto; padding: 20px !important; }
      }
      @media (max-width: 520px) {
        .admin-content { padding: 12px !important; }
        .admin-table-scroll table { min-width: 640px; }
      }
    `}</style>
  );
}

function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("members");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    onLogout();
  };

  return (
    <div
      className="admin-dashboard"
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-primary)",
      }}
    >
      <Sidebar
        active={activeTab}
        onChange={setActiveTab}
        onLogout={handleLogout}
        onGoMain={() => navigate("/")}
      />
      <AdminResponsiveStyles />
      <div
        className="admin-content"
        style={{ flex: 1, padding: 28, overflow: "auto" }}
      >
        {activeTab === "members" && <MembersTab />}
        {activeTab === "items" && <ItemsTab />}
        {activeTab === "games" && <GamesTab />}
      </div>
    </div>
  );
}

// ── 진입점 ─────────────────────────────────────────────────────

export default function AdminPage() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
      return;
    }
    if (user?.authority !== "ROLE_ADMIN") {
      navigate("/login", { replace: true });
      return;
    }
    setChecked(true);
  }, [isLoggedIn, user, navigate]);

  if (!checked) {
    return (
      <div style={{ padding: 28, color: "var(--text-secondary)" }}>
        관리자 권한 확인 중...
      </div>
    );
  }

  return (
    <AdminDashboard
      admin={{ username: user?.nickname || "관리자" }}
      onLogout={logout}
    />
  );
}
