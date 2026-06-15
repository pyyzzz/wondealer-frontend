import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ChatApi from "../../api/chat.api";
import useWebSocket from "../../hooks/useWebSocket";

// ── 색상 토큰 ─────────────────────────────────────────────────
const C = {
  bg: "#0a0a0f",
  bgPanel: "#0d0d14",
  bgCard: "#13131c",
  bgItem: "#1a1a26",
  border: "#2a2a3e",
  borderFaint: "#1e1e2a",
  violet: "#7c3aed",
  violetDim: "rgba(124,58,237,.15)",
  violetBorder: "rgba(124,58,237,.4)",
  indigo: "#6366f1",
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  text: "#f1f1f5",
  textSub: "#a1a1b5",
  textMuted: "#71717a",
  textFaint: "#52525b",
  white: "#ffffff",
  online: "#22c55e",
};

// ── 유틸 ─────────────────────────────────────────────────────
function fmtTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function fmtDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const today = new Date();
    const diff =
      new Date(today.getFullYear(), today.getMonth(), today.getDate()) -
      new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (diff === 0) return fmtTime(iso);
    if (diff === 86400000) return "어제";
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return "";
  }
}

function nowTime() {
  return new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 백엔드 tradeStatus 값 → 스텝 인덱스 매핑
// 백엔드 enum: CONSULTING / PAID / TRANSFER_PENDING / COMPLETED
const STATUS_STEP = {
  CONSULTING: 0,
  상담진행: 0,
  PAID: 1,
  대금보관: 1,
  TRANSFER_PENDING: 1,
  인수대기: 1,
  COMPLETED: 2,
  거래완료: 2,
};
const TRADE_STEPS = ["거래 대기", "결제 완료", "거래 완료"];

function getStepIdx(status) {
  return STATUS_STEP[status] ?? 0;
}

// 백엔드에서 내려주는 채팅방 필드 정규화
// GET /api/chat/rooms 응답 필드명이 다를 수 있으므로 단일 접근자로 통일
function roomId(r) {
  return r.chatRoomId ?? r.id;
}
function roomPartnerName(r) {
  return r.partnerNickname ?? r.partnerName ?? "상대방";
}
function roomItemTitle(r) {
  return r.itemName ?? r.itemTitle ?? "거래 아이템";
}
function roomLastMsg(r) {
  return r.lastMessage ?? "";
}
function roomLastTime(r) {
  return r.lastMessageTime ?? r.lastMsgTime ?? null;
}
function roomUnread(r) {
  return r.unreadCount ?? 0;
}
function roomStatus(r) {
  return r.tradeStatus ?? r.status ?? "CONSULTING";
}
function roomSellerId(r) {
  return r.sellerId ?? r.sellerMemberId ?? null;
}

// 메시지 필드 정규화
// GET /api/chat/rooms/:id/messages 응답 필드명 통일
function msgId(m) {
  return m.chatMessageId ?? m.id ?? null;
}
function msgSender(m) {
  return String(m.senderId ?? m.senderMemberId ?? "");
}
function msgContent(m) {
  return m.content ?? m.message ?? m.text ?? "";
}
function msgTime(m) {
  return m.sentAt ?? m.createdAt ?? m.timestamp ?? null;
}
function msgRead(m) {
  return m.isRead ?? m.read ?? false;
}
function msgType(m) {
  return m.messageType ?? m.type ?? "CHAT";
}

const txt = (size, weight = "400", color = C.text) => ({
  fontSize: size,
  fontWeight: weight,
  color,
  margin: 0,
  padding: 0,
});

// ── 스켈레톤 ────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 14, r = 6, mb = 0 }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        marginBottom: mb,
        background: `linear-gradient(90deg,${C.bgItem} 25%,${C.bgCard} 50%,${C.bgItem} 75%)`,
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
      }}
    />
  );
}

// ── 결제 완료 인라인 카드 ─────────────────────────────────────
// PAYMENT_CARD 타입은 백엔드에서 안 내려오므로 프론트 로컬 생성
function PaymentCard({ msg }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
      <div
        style={{
          width: 260,
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: `1px solid ${C.borderFaint}`,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 99,
              background: "rgba(16,185,129,.15)",
              border: "1px solid rgba(16,185,129,.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: C.emerald,
              fontWeight: 700,
            }}
          >
            ✓
          </div>
          <div>
            <div style={txt(12, 700)}>결제 완료되었습니다.</div>
            <div style={txt(10, 400, C.textMuted)}>
              안전하게 거래를 진행해 주세요.
            </div>
          </div>
        </div>
        <div style={{ padding: "10px 16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={txt(10, 400, C.textMuted)}>거래 캐릭터</span>
            <span style={txt(11, 600)}>{msg.tradeChar ?? "—"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={txt(10, 400, C.textMuted)}>총 결제금액</span>
            <span
              style={{ ...txt(13, 800, C.indigo), fontFamily: "monospace" }}
            >
              {(msg.totalAmount ?? 0).toLocaleString()} KRW
            </span>
          </div>
        </div>
        <div
          style={{
            padding: "8px 16px",
            borderTop: `1px solid ${C.borderFaint}`,
            background: "rgba(59,130,246,.04)",
            fontSize: 10,
            color: "rgba(147,197,253,.7)",
          }}
        >
          🔒 결제 완료 후 물품을 상대방에게 전달해 주세요.
        </div>
      </div>
    </div>
  );
}

// ── 채팅 메시지 ──────────────────────────────────────────────
function ChatMessage({ msg, myUserId, partnerAvatar }) {
  // 로컬 결제 카드
  if (msgType(msg) === "PAYMENT_CARD") return <PaymentCard msg={msg} />;

  // 백엔드 SYSTEM 메시지 (messageType: "SYSTEM")
  if (msgType(msg) === "SYSTEM") {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: C.bgItem,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "6px 14px",
            fontSize: 11,
            color: C.textSub,
            maxWidth: 420,
            textAlign: "center",
          }}
        >
          <span>🔒</span>
          <span>{msgContent(msg)}</span>
        </div>
      </div>
    );
  }

  const isMe = msgSender(msg) === String(myUserId);
  const content = msgContent(msg);
  const time = msgTime(msg) ? fmtTime(msgTime(msg)) : (msg.timestamp ?? "");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMe ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 8,
      }}
    >
      {!isMe && (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            flexShrink: 0,
            background: C.bgItem,
            border: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            marginBottom: 2,
          }}
        >
          {partnerAvatar || "👤"}
        </div>
      )}
      <div
        style={{
          maxWidth: "65%",
          display: "flex",
          flexDirection: "column",
          alignItems: isMe ? "flex-end" : "flex-start",
          gap: 3,
        }}
      >
        <div
          style={{
            padding: "9px 14px",
            lineHeight: 1.6,
            fontSize: 12,
            borderRadius: 16,
            borderBottomRightRadius: isMe ? 4 : 16,
            borderBottomLeftRadius: isMe ? 16 : 4,
            background: isMe ? C.violet : C.bgItem,
            color: isMe ? C.white : C.text,
            border: isMe ? "none" : `1px solid ${C.border}`,
          }}
        >
          {content}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexDirection: isMe ? "row-reverse" : "row",
          }}
        >
          <span style={txt(10, 400, C.textFaint)}>{time}</span>
          {isMe && (
            <span
              style={{
                fontSize: 10,
                color: msgRead(msg) ? "#818cf8" : C.textFaint,
              }}
            >
              {msgRead(msg) ? "읽음" : "전송"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 채팅 목록 모달 ────────────────────────────────────────────
function ChatListModal({
  rooms,
  loading,
  selectedId,
  onSelect,
  onClose,
  search,
  onSearch,
}) {
  const [tab, setTab] = useState(0);

  const filtered = rooms
    .filter((r) => {
      const name = roomPartnerName(r);
      const title = roomItemTitle(r);
      return name.includes(search) || title.includes(search);
    })
    .sort(
      tab === 1
        ? (a, b) => roomUnread(b) - roomUnread(a)
        : (a, b) => {
            const ta = roomLastTime(a) ? new Date(roomLastTime(a)) : 0;
            const tb = roomLastTime(b) ? new Date(roomLastTime(b)) : 0;
            return tb - ta;
          },
    );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 900,
        background: "rgba(0,0,0,.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 340,
          maxHeight: "75vh",
          background: C.bgPanel,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,.8)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "14px 16px 0",
            borderBottom: `1px solid ${C.borderFaint}`,
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
            <span style={txt(14, 800)}>WONDEALER</span>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: C.textMuted,
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
                padding: 0,
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <span
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 12,
                pointerEvents: "none",
                color: C.textFaint,
              }}
            >
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="채팅방 또는 품목별 검색"
              style={{
                width: "100%",
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: "7px 10px 7px 30px",
                fontSize: 11,
                color: C.text,
                outline: "none",
              }}
            />
          </div>
          <div style={{ display: "flex" }}>
            {["최신순", "미읽음"].map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${tab === i ? C.violet : "transparent"}`,
                  color: tab === i ? C.text : C.textFaint,
                  fontSize: 12,
                  fontWeight: tab === i ? 700 : 400,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: "6px 16px",
            display: "flex",
            justifyContent: "space-between",
            borderBottom: `1px solid ${C.borderFaint}`,
          }}
        >
          <span style={txt(10, 600, C.textFaint)}>
            {tab === 0 ? "최신순" : "미읽음"}
          </span>
          <span style={txt(10, 400, C.textFaint)}>전체 {rooms.length}개</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div
              style={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <Skeleton w={40} h={40} r={10} />
                  <div style={{ flex: 1 }}>
                    <Skeleton h={11} mb={5} />
                    <Skeleton h={9} w="75%" mb={4} />
                    <Skeleton h={8} w="50%" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: C.textFaint,
                fontSize: 12,
              }}
            >
              채팅방이 없습니다
            </div>
          ) : (
            filtered.map((room) => {
              const id = roomId(room);
              const isActive = String(id) === String(selectedId);
              const unread = roomUnread(room);
              const status = roomStatus(room);
              const statusColor =
                {
                  COMPLETED: C.emerald,
                  거래완료: C.emerald,
                  PAID: "#60a5fa",
                  대금보관: "#60a5fa",
                  TRANSFER_PENDING: C.amber,
                  인수대기: C.amber,
                }[status] ?? C.textFaint;
              const statusLabel =
                {
                  CONSULTING: "상담진행",
                  PAID: "대금보관",
                  TRANSFER_PENDING: "인수대기",
                  COMPLETED: "거래완료",
                }[status] ?? status;

              return (
                <button
                  key={id}
                  onClick={() => {
                    onSelect(id);
                    onClose();
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "11px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: isActive ? C.bgItem : "transparent",
                    border: "none",
                    borderBottom: `1px solid ${C.borderFaint}`,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: C.bgCard,
                        border: `1px solid ${C.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                      }}
                    >
                      {room.partnerAvatar ?? "👤"}
                    </div>
                    {room.partnerOnline && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: -1,
                          right: -1,
                          width: 10,
                          height: 10,
                          borderRadius: 99,
                          background: C.online,
                          border: `2px solid ${C.bgPanel}`,
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 2,
                      }}
                    >
                      <span style={txt(12, 700)}>{roomPartnerName(room)}</span>
                      <span style={txt(10, 400, C.textFaint)}>
                        {roomLastTime(room) ? fmtDate(roomLastTime(room)) : ""}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.textSub,
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginBottom: 3,
                      }}
                    >
                      {roomItemTitle(room)}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: C.textFaint,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginBottom: 4,
                      }}
                    >
                      {roomLastMsg(room)}
                    </div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "1px 7px",
                        borderRadius: 99,
                        fontSize: 9,
                        fontWeight: 700,
                        color: statusColor,
                        background: "rgba(99,102,241,.08)",
                        border: "1px solid rgba(99,102,241,.2)",
                      }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      flexShrink: 0,
                    }}
                  >
                    {unread > 0 && (
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 99,
                          background: C.violet,
                          color: C.white,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 9,
                          fontWeight: 900,
                        }}
                      >
                        {unread}
                      </span>
                    )}
                    <button
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: C.bgItem,
                        border: `1px solid ${C.border}`,
                        color: C.textFaint,
                        fontSize: 11,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      🗑
                    </button>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ── 우측 사이드바: 상대방 정보 ────────────────────────────────
function PartnerSidebar({ room, myUserId, onPayment, onChatList }) {
  if (!room) return null;
  const stepIdx = getStepIdx(roomStatus(room));
  const isSeller = String(roomSellerId(room)) === String(myUserId);
  const isDone = stepIdx >= 2;

  const statusLabel =
    {
      CONSULTING: "상담진행",
      PAID: "대금보관",
      TRANSFER_PENDING: "인수대기",
      COMPLETED: "거래완료",
    }[roomStatus(room)] ?? roomStatus(room);

  return (
    <div
      style={{
        width: 180,
        flexShrink: 0,
        background: C.bgPanel,
        borderLeft: `1px solid ${C.borderFaint}`,
        display: "flex",
        flexDirection: "column",
        padding: "14px 12px",
        gap: 14,
        overflowY: "auto",
      }}
    >
      <div style={txt(10, 700, C.textFaint)}>상대방 정보</div>

      {/* 프로필 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            {room.partnerAvatar ?? "👤"}
          </div>
          {room.partnerOnline && (
            <span
              style={{
                position: "absolute",
                bottom: -1,
                right: -1,
                width: 9,
                height: 9,
                borderRadius: 99,
                background: C.online,
                border: `2px solid ${C.bgPanel}`,
              }}
            />
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.text,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {roomPartnerName(room)}
          </div>
          <div
            style={{
              fontSize: 9,
              color: room.partnerOnline ? C.online : C.textFaint,
              marginTop: 2,
            }}
          >
            {room.partnerOnline ? "• Online" : "• Offline"}
          </div>
        </div>
      </div>

      {/* 본인인증 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 10px",
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
        }}
      >
        <span style={txt(10, 500, C.textSub)}>본인인증</span>
        <span
          style={{
            fontSize: 14,
            color: room.partnerVerified ? C.emerald : C.textFaint,
          }}
        >
          {room.partnerVerified ? "✓" : "○"}
        </span>
      </div>

      {/* 신고 / 차단 */}
      <div style={{ display: "flex", gap: 6 }}>
        {[
          { label: "신고하기", icon: "⚠" },
          { label: "차단하기", icon: "🚫" },
        ].map(({ label, icon }) => (
          <button
            key={label}
            style={{
              flex: 1,
              padding: "7px 0",
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              cursor: "pointer",
              color: C.textSub,
              fontSize: 9,
              fontWeight: 600,
              fontFamily: "inherit",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
            }}
          >
            <span style={{ fontSize: 13 }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      <div style={{ height: 1, background: C.borderFaint }} />

      {/* 거래 현황 */}
      <div>
        <div style={{ ...txt(10, 700, C.textFaint), marginBottom: 10 }}>
          거래 현황
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {TRADE_STEPS.map((label, i) => {
            const done = stepIdx > i;
            const active = stepIdx === i;
            return (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 10px",
                  background: active ? C.violetDim : C.bgCard,
                  border: `1px solid ${active ? C.violetBorder : C.borderFaint}`,
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 99,
                    flexShrink: 0,
                    background: done
                      ? C.violet
                      : active
                        ? C.violetDim
                        : C.bgItem,
                    border: `1px solid ${done || active ? C.violet : C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    color: done ? C.white : active ? C.violet : C.textFaint,
                    fontWeight: 700,
                  }}
                >
                  {done ? "✓" : i + 1}
                </div>
                <span
                  style={txt(
                    10,
                    active ? 700 : 400,
                    active ? C.text : done ? C.textSub : C.textFaint,
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 결제하기 — 구매자이고 미완료일 때 */}
      {!isSeller && !isDone && (
        <button
          onClick={onPayment}
          style={{
            width: "100%",
            padding: "10px 0",
            background: C.violet,
            border: "none",
            borderRadius: 10,
            color: C.white,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          💳 결제하기
        </button>
      )}

      {/* 채팅목록 */}
      <button
        onClick={onChatList}
        style={{
          width: "100%",
          padding: "9px 0",
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          color: C.textSub,
          fontSize: 11,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        💬 채팅목록
      </button>
    </div>
  );
}

// ── 마일리지 결제 모달 ────────────────────────────────────────
function MileageModal({ room, myMileage, onConfirm, onCancel }) {
  const price = room?.itemPrice ?? room?.price ?? 0;
  const fee = Math.floor(price * 0.015);
  const total = price + fee;
  const lack = (myMileage ?? 0) < total;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(0,0,0,.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: `1px solid ${C.borderFaint}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>🪙</span>
            <span style={txt(13, 700)}>마일리지 결제</span>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: "none",
              border: "none",
              color: C.textMuted,
              cursor: "pointer",
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding: "10px 18px",
            background: C.bgPanel,
            borderBottom: `1px solid ${C.borderFaint}`,
          }}
        >
          <div style={txt(9, 400, C.textMuted)}>
            {room?.gameServer ?? room?.gameName}
          </div>
          <div style={{ ...txt(12, 700), marginTop: 3 }}>
            {room?.itemIcon} {roomItemTitle(room)}
          </div>
        </div>

        <div
          style={{
            padding: "14px 18px",
            borderBottom: `1px solid ${C.borderFaint}`,
          }}
        >
          {[
            ["상품 금액", `${price.toLocaleString()} M`],
            ["에스크로 수수료 (1.5%)", `${fee.toLocaleString()} M`],
          ].map(([label, val]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={txt(11, 400, C.textSub)}>{label}</span>
              <span style={txt(11, 600)}>{val}</span>
            </div>
          ))}
          <div style={{ height: 1, background: C.border, margin: "8px 0" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={txt(12, 700)}>총 결제 마일리지</span>
            <span style={txt(14, 800, C.violet)}>
              {total.toLocaleString()} M
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={txt(10, 400, C.textMuted)}>보유 마일리지</span>
            <span style={txt(11, 600, lack ? C.red : C.emerald)}>
              {(myMileage ?? 0).toLocaleString()} M
            </span>
          </div>
          {lack && (
            <div
              style={{
                marginTop: 8,
                padding: "7px 10px",
                borderRadius: 8,
                background: "rgba(239,68,68,.08)",
                border: "1px solid rgba(239,68,68,.2)",
              }}
            >
              <span style={txt(10, 500, C.red)}>
                마일리지가 부족합니다. 충전 후 이용해 주세요.
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            padding: "8px 18px",
            background: "rgba(59,130,246,.04)",
            borderBottom: `1px solid ${C.borderFaint}`,
            display: "flex",
            alignItems: "flex-start",
            gap: 7,
            fontSize: 10,
            color: "rgba(147,197,253,.8)",
          }}
        >
          <span style={{ flexShrink: 0 }}>🔒</span>
          결제 마일리지는 거래 완료 전까지 에스크로에 안전 보관됩니다.
        </div>

        <div style={{ padding: "12px 18px", display: "flex", gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 10,
              cursor: "pointer",
              background: C.bgItem,
              border: `1px solid ${C.border}`,
              color: C.textSub,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={lack}
            style={{
              flex: 2,
              padding: "9px 0",
              borderRadius: 10,
              cursor: lack ? "not-allowed" : "pointer",
              background: lack ? C.bgItem : C.violet,
              border: "none",
              color: lack ? C.textFaint : C.white,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            <span>🪙</span> 마일리지로 결제
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 메인 ChatPage ─────────────────────────────────────────────
export default function ChatPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 백엔드 Member 응답 필드: id / memberId / userId 모두 대응
  const myUserId = user?.memberId ?? user?.id ?? user?.userId;
  const myMileage = user?.mileage ?? user?.point ?? user?.balance ?? 0;

  const [rooms, setRooms] = useState([]);
  const [roomsLoad, setRoomsLoad] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoad, setMsgLoad] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [showPayModal, setShowPayModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);

  const endRef = useRef(null);
  const listRef = useRef(null);

  const activeRoom =
    rooms.find((r) => String(roomId(r)) === String(selectedId)) ?? null;
  const isDone = getStepIdx(roomStatus(activeRoom ?? {})) >= 2;
  const isSeller = String(roomSellerId(activeRoom ?? {})) === String(myUserId);

  const quickReplies = isSeller
    ? [
        "접속 완료했습니다. 거래 진행해요.",
        "아이템 준비 완료됐습니다.",
        "거래 감사합니다!",
      ]
    : [
        "인게임 위치가 어디인가요?",
        "마일리지 예치 완료했습니다.",
        "아이템 수령 완료했습니다!",
      ];

  // ── WebSocket 연동 ─────────────────────────────────────────
  // useWebSocket(subscribeTopic, sendDestination, onMessage)
  // subscribeTopic  : 수신 구독 경로 — 백엔드: /topic/chat/{chatRoomId}
  // sendDestination : 발신 경로    — 백엔드: /app/chat/{chatRoomId}
  const subscribeTopic = selectedId ? `/topic/chat/${selectedId}` : null;
  const sendDestination = selectedId ? `/app/chat/${selectedId}` : null;

  const handleIncoming = useCallback(
    (msg) => {
      setMessages((prev) => {
        // 중복 방지 (id 기준)
        if (msgId(msg) && prev.some((m) => msgId(m) === msgId(msg)))
          return prev;
        return [...prev, msg];
      });
      // 목록의 lastMessage 업데이트
      setRooms((prev) =>
        prev.map((r) =>
          String(roomId(r)) === String(selectedId)
            ? {
                ...r,
                lastMessage: msgContent(msg),
                lastMessageTime: msgTime(msg),
              }
            : r,
        ),
      );
    },
    [selectedId],
  );

  // hook 호출 — 시그니처: (subscribeTopic, sendDestination, onMessage)
  const { sendMessage } = useWebSocket(
    subscribeTopic,
    sendDestination,
    handleIncoming,
  );

  // ── 채팅방 목록 로드 ──────────────────────────────────────
  useEffect(() => {
    setRoomsLoad(true);
    ChatApi.getChatRooms()
      .then((res) => {
        // 백엔드 응답: { data: [...] } 또는 배열 직접
        const list = res.data?.data ?? res.data ?? [];
        setRooms(list);
        if (list.length > 0 && !selectedId) {
          setSelectedId(String(roomId(list[0])));
        }
      })
      .catch((err) => console.error("채팅방 목록 오류", err))
      .finally(() => setRoomsLoad(false));
  }, []);

  // ── 메시지 로드 ───────────────────────────────────────────
  const loadMessages = useCallback((rId, pg = 0, prepend = false) => {
    if (!rId) return;
    setMsgLoad(true);
    ChatApi.getChatMessages(rId, { page: pg, size: 30 })
      .then((res) => {
        // 백엔드: Page<ChatMessageResponse> → { data: { content: [...], last: bool } }
        const raw =
          res.data?.data?.content ?? res.data?.content ?? res.data ?? [];
        const list = [...raw].reverse(); // 최신순 → 오래된순으로 뒤집어 렌더
        setMessages((prev) => (prepend ? [...list, ...prev] : list));
        setHasMore(!(res.data?.data?.last ?? res.data?.last ?? true));
        setPage(pg);
        // 읽음 처리
        ChatApi.readMessages(rId).catch(() => {});
        setRooms((prev) =>
          prev.map((r) =>
            String(roomId(r)) === String(rId) ? { ...r, unreadCount: 0 } : r,
          ),
        );
      })
      .catch((err) => console.error("메시지 로드 오류", err))
      .finally(() => setMsgLoad(false));
  }, []);

  useEffect(() => {
    if (selectedId) loadMessages(selectedId, 0);
  }, [selectedId, loadMessages]);

  // ── 스크롤 to bottom ──────────────────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── 무한 스크롤 (위로 스크롤 시 이전 메시지) ──────────────
  const handleScroll = useCallback(
    (e) => {
      if (e.target.scrollTop === 0 && hasMore && !msgLoad) {
        const prevH = e.target.scrollHeight;
        loadMessages(selectedId, page + 1, true);
        requestAnimationFrame(() => {
          e.target.scrollTop = e.target.scrollHeight - prevH;
        });
      }
    },
    [hasMore, msgLoad, selectedId, page, loadMessages],
  );

  // ── 메시지 전송 ───────────────────────────────────────────
  function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !selectedId) return;
    const content = input.trim();
    setInput("");

    // 낙관적 업데이트
    const optimistic = {
      id: `opt-${Date.now()}`,
      senderId: myUserId,
      content,
      sentAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, optimistic]);

    // useWebSocket.sendMessage(body) — body는 백엔드 ChatMessageRequest DTO에 맞춤
    // 백엔드: { content: string } 또는 { message: string } — 팀 백엔드 확인 필요
    sendMessage({ content, type: "CHAT" });
  }

  // ── 결제 확인 ─────────────────────────────────────────────
  function handleMileagePay() {
    if (!activeRoom) return;
    const price = activeRoom.itemPrice ?? activeRoom.price ?? 0;
    const fee = Math.floor(price * 0.015);
    const total = price + fee;

    // 로컬 결제 완료 카드 삽입 (백엔드에서 SYSTEM 메시지로 내려오기 전 낙관적 표시)
    const card = {
      id: `pay-${Date.now()}`,
      messageType: "PAYMENT_CARD",
      totalAmount: total,
      tradeChar: activeRoom.tradeChar ?? "—",
      sentAt: new Date().toISOString(),
      isRead: true,
    };
    setMessages((prev) => [...prev, card]);
    setRooms((prev) =>
      prev.map((r) =>
        String(roomId(r)) === String(selectedId)
          ? { ...r, tradeStatus: "PAID", lastMessage: "결제 완료" }
          : r,
      ),
    );
    setShowPayModal(false);

    // TODO: 실제 결제 API 호출 — 팀 결제 파트 연동
    // WonPayApi.pay({ chatRoomId: selectedId, amount: total })
  }

  // ── 인수 완료 ─────────────────────────────────────────────
  function handleComplete() {
    if (!activeRoom || isDone) return;
    if (!window.confirm("거래를 최종 인수 완료 처리하겠습니까?")) return;
    setRooms((prev) =>
      prev.map((r) =>
        String(roomId(r)) === String(selectedId)
          ? { ...r, tradeStatus: "COMPLETED" }
          : r,
      ),
    );
    // 로컬 시스템 메시지
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        messageType: "SYSTEM",
        content: "거래 완료. 마일리지가 판매자에게 이관되었습니다.",
        sentAt: new Date().toISOString(),
        isRead: true,
      },
    ]);
    // TODO: 거래 완료 API 호출
    // TradeApi.complete(activeRoom.tradeId)
  }

  // ── 렌더 ──────────────────────────────────────────────────
  return (
    <div
      style={{
        height: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily:
          "'Pretendard','Noto Sans KR','Apple SD Gothic Neo',sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}
        input::placeholder{color:${C.textFaint}}
        button{font-family:inherit}
      `}</style>

      {showPayModal && activeRoom && (
        <MileageModal
          room={activeRoom}
          myMileage={myMileage}
          onConfirm={handleMileagePay}
          onCancel={() => setShowPayModal(false)}
        />
      )}
      {showListModal && (
        <ChatListModal
          rooms={rooms}
          loading={roomsLoad}
          selectedId={selectedId}
          search={search}
          onSearch={setSearch}
          onSelect={(id) => setSelectedId(String(id))}
          onClose={() => setShowListModal(false)}
        />
      )}

      {activeRoom ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
            border: `1px solid ${C.violetBorder}`,
          }}
        >
          {/* ── 채팅 영역 ── */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            {/* 헤더 */}
            <div
              style={{
                padding: "10px 16px",
                flexShrink: 0,
                borderBottom: `1px solid ${C.borderFaint}`,
                background: C.bgPanel,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={txt(12, 700)}>
                    파트너(마족) / {roomPartnerName(activeRoom)}
                  </span>
                  {activeRoom.partnerOnline && (
                    <span
                      style={{
                        padding: "1px 6px",
                        borderRadius: 99,
                        fontSize: 9,
                        fontWeight: 700,
                        background: "rgba(34,197,94,.15)",
                        color: C.online,
                        border: "1px solid rgba(34,197,94,.3)",
                      }}
                    >
                      ● ONLINE
                    </span>
                  )}
                </div>
                <div style={txt(10, 400, C.textMuted)}>
                  {activeRoom.gameServer ??
                    activeRoom.gameName ??
                    "거래 진행 중"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    cursor: "pointer",
                    background: C.bgItem,
                    border: `1px solid ${C.border}`,
                    color: C.textSub,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  🔍
                </button>
                <button
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    cursor: "pointer",
                    background: C.bgItem,
                    border: `1px solid ${C.border}`,
                    color: C.textSub,
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ⋯
                </button>
              </div>
            </div>

            {/* 경고 배너 */}
            <div
              style={{
                margin: "10px 14px 0",
                padding: "7px 12px",
                background: "rgba(239,68,68,.06)",
                border: "1px solid rgba(239,68,68,.2)",
                borderRadius: 8,
                fontSize: 10,
                color: "rgba(252,165,165,.85)",
                display: "flex",
                alignItems: "center",
                gap: 7,
                flexShrink: 0,
              }}
            >
              ⚠ 채팅 내부에서 개인 정보 보호 목적으로 개인정보 7일까지
              보관됩니다.
            </div>

            {/* 메시지 목록 */}
            <div
              ref={listRef}
              onScroll={handleScroll}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {msgLoad && page === 0 ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: i % 2 === 0 ? "row-reverse" : "row",
                        gap: 8,
                      }}
                    >
                      <Skeleton w={28} h={28} r={8} />
                      <Skeleton w={`${40 + i * 8}%`} h={36} r={12} />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.textFaint,
                    fontSize: 12,
                  }}
                >
                  아직 메시지가 없습니다. 먼저 인사해 보세요! 👋
                </div>
              ) : (
                messages.map((msg, i) => (
                  <ChatMessage
                    key={msgId(msg) ?? i}
                    msg={msg}
                    myUserId={myUserId}
                    partnerAvatar={activeRoom.partnerAvatar ?? "👤"}
                  />
                ))
              )}
              <div ref={endRef} />
            </div>

            {/* 거래 완료 배너 */}
            {isDone && (
              <div
                style={{
                  margin: "0 14px 8px",
                  padding: "8px 12px",
                  background: "rgba(239,68,68,.06)",
                  border: "1px solid rgba(239,68,68,.2)",
                  borderRadius: 8,
                  fontSize: 10,
                  color: "rgba(252,165,165,.85)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                ⚠ 이 채팅은 거래가 완료된 채팅방입니다.
              </div>
            )}

            {/* 인수하기 버튼 */}
            {!isSeller &&
              !isDone &&
              (roomStatus(activeRoom) === "PAID" ||
                roomStatus(activeRoom) === "대금보관" ||
                roomStatus(activeRoom) === "TRANSFER_PENDING" ||
                roomStatus(activeRoom) === "인수대기") && (
                <div style={{ padding: "0 14px 8px", flexShrink: 0 }}>
                  <button
                    onClick={handleComplete}
                    style={{
                      width: "100%",
                      padding: "10px 0",
                      background: C.violet,
                      border: "none",
                      borderRadius: 10,
                      color: C.white,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    ✅ 인수하기
                  </button>
                </div>
              )}

            {/* 빠른 답장 */}
            {!isDone && (
              <div
                style={{
                  padding: "6px 12px",
                  borderTop: `1px solid ${C.borderFaint}`,
                  display: "flex",
                  gap: 6,
                  overflowX: "auto",
                  flexShrink: 0,
                }}
              >
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    style={{
                      flexShrink: 0,
                      padding: "5px 10px",
                      borderRadius: 99,
                      cursor: "pointer",
                      background: C.bgItem,
                      border: `1px solid ${C.border}`,
                      color: C.textSub,
                      fontSize: 10,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* 입력창 */}
            <form
              onSubmit={handleSend}
              style={{
                padding: "10px 12px",
                borderTop: `1px solid ${C.borderFaint}`,
                display: "flex",
                alignItems: "flex-end",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  flex: 1,
                  background: C.bgCard,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 4px",
                  }}
                >
                  {["📎", "😊"].map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      style={{
                        width: 28,
                        height: 28,
                        background: "none",
                        border: "none",
                        color: C.textFaint,
                        fontSize: 14,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="[공지] 계정 인게 전 입금내역 확인 하세요."
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    padding: "10px 8px",
                    fontSize: 11,
                    color: C.text,
                    outline: "none",
                  }}
                />
                <span
                  style={{
                    fontSize: 9,
                    color: C.textFaint,
                    padding: "0 8px 10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Shift + Enter for new line
                </span>
              </div>
              <button
                type="submit"
                disabled={!input.trim()}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  flexShrink: 0,
                  cursor: input.trim() ? "pointer" : "not-allowed",
                  background: input.trim() ? C.violet : C.bgItem,
                  border: `1px solid ${input.trim() ? C.violet : C.border}`,
                  color: input.trim() ? C.white : C.textFaint,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ➤
              </button>
            </form>
          </div>

          {/* ── 우측 사이드바 ── */}
          <PartnerSidebar
            room={activeRoom}
            myUserId={myUserId}
            onPayment={() => setShowPayModal(true)}
            onChatList={() => setShowListModal(true)}
          />
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <span style={{ fontSize: 48 }}>💬</span>
          <p style={txt(14, 400, C.textFaint)}>채팅방을 선택해 주세요</p>
          <button
            onClick={() => setShowListModal(true)}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              background: C.violet,
              border: "none",
              color: C.white,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            채팅목록 열기
          </button>
        </div>
      )}
    </div>
  );
}
