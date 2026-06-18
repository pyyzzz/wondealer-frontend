import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { useAuth } from "../../context/AuthContext";
import ChatApi from "../../api/chat.api";
import useWebSocket from "../../hooks/useWebSocket";

// ── 결제 모달 ─────────────────────────────────────────────────
function PaymentModal({ room, myMileage, onConfirm, onCancel }) {
  const [method, setMethod] = useState("mileage");
  const price = room?.itemPrice ?? room?.basePrice ?? room?.price ?? 0;
  const fee = Math.floor(price * 0.05);
  const total = price + fee;
  const lack = method === "mileage" && (myMileage ?? 0) < total;
  const fmt = (n) => Number(n || 0).toLocaleString("ko-KR");

  return (
    <Overlay>
      <PayBox>
        <PaySection>
          <PaySectionTitle>나의 화재매역 현황</PaySectionTitle>
          <PayItemRow>
            <PayItemIcon>📦</PayItemIcon>
            <PayItemInfo>
              <PayItemName>
                {room?.itemTitle ?? room?.itemName ?? "거래 아이템"}
              </PayItemName>
              <PayItemSub>
                {room?.gameName ?? ""}{" "}
                {room?.serverName ? `· ${room.serverName}` : ""}
              </PayItemSub>
            </PayItemInfo>
            <PayItemPrice>{fmt(price)} 원</PayItemPrice>
          </PayItemRow>
        </PaySection>
        <PaySection>
          <PaySectionTitle>결제 수단 선택</PaySectionTitle>
          <PayMethodRow>
            <PayMethod
              $active={method === "mileage"}
              onClick={() => setMethod("mileage")}
            >
              <span>🪙</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>
                  원페이 (마일리지)
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-secondary)",
                    marginTop: 2,
                  }}
                >
                  보유: {fmt(myMileage ?? 0)} M
                </div>
              </div>
              {method === "mileage" && <CheckDot />}
            </PayMethod>
            <PayMethod
              $active={method === "card"}
              onClick={() => setMethod("card")}
            >
              <span>💳</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>카드 결제</div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-secondary)",
                    marginTop: 2,
                  }}
                >
                  포트원 연동
                </div>
              </div>
              {method === "card" && <CheckDot />}
            </PayMethod>
          </PayMethodRow>
        </PaySection>
        <PaySection>
          <PaySectionTitle>최종 결제 금액</PaySectionTitle>
          <PriceBreakdown>
            <PriceRow2>
              <span>상품 금액</span>
              <span>{fmt(price)} 원</span>
            </PriceRow2>
            <PriceRow2>
              <span>에스크로 수수료 (5%)</span>
              <span style={{ color: "#ef4444" }}>+{fmt(fee)} 원</span>
            </PriceRow2>
            <Divider />
            <PriceRow2 $total>
              <span>총 결제 금액</span>
              <span
                style={{
                  color: "var(--color-primary-light, #c0c1ff)",
                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                {fmt(total)} 원
              </span>
            </PriceRow2>
          </PriceBreakdown>
          {lack && (
            <LackNotice>
              마일리지가 부족합니다. 카드 결제를 이용하거나 마일리지를 충전해
              주세요.
            </LackNotice>
          )}
          <EscrowNote>
            🔒 결제 금액은 거래 완료 전까지 에스크로에 안전 보관됩니다.
          </EscrowNote>
        </PaySection>
        <PayBtns>
          <PayCancel onClick={onCancel}>취소</PayCancel>
          <PayConfirm onClick={() => onConfirm(method)} disabled={lack}>
            {method === "mileage" ? "🪙 마일리지로 결제" : "💳 카드로 결제"}
          </PayConfirm>
        </PayBtns>
      </PayBox>
    </Overlay>
  );
}

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

function roomId(r) {
  return r.chatRoomId ?? r.id;
}
function roomPartner(r) {
  return r.opponent?.nickname ?? r.partnerNickname ?? r.partnerName ?? "상대방";
}
function roomItem(r) {
  return r.itemTitle ?? r.itemName ?? "거래 아이템";
}
function roomLast(r) {
  return r.lastMessage ?? "";
}
function roomLastTime(r) {
  return r.lastMessageAt ?? r.lastMessageTime ?? r.lastMsgTime ?? null;
}
function roomUnread(r) {
  return r.unreadCount ?? 0;
}
function roomStatus(r) {
  if (r.tradeStatus) return r.tradeStatus;
  return r.tradeId ? "PAID" : "CONSULTING";
}

function msgId(m) {
  return m.chatMessageId ?? m.messageId ?? m.id ?? null;
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
// ✅ senderNickname 기준으로 isMe 판별
function msgSenderNickname(m) {
  return m.senderNickname ?? "";
}

const STEPS = ["거래 대기", "결제 완료", "거래 완료"];
const STATUS_STEP = {
  CONSULTING: 0,
  PAID: 1,
  TRANSFER_PENDING: 1,
  COMPLETED: 2,
};
function getStep(status) {
  return STATUS_STEP[status] ?? 0;
}
const STATUS_LABEL = {
  CONSULTING: "거래대기",
  PAID: "결제완료",
  TRANSFER_PENDING: "인수대기",
  COMPLETED: "거래완료",
};

// ── 채팅 목록 패널 ─────────────────────────────────────────────
function RoomList({ rooms, loading, selectedId, onSelect, search, onSearch }) {
  return (
    <ListPanel>
      <ListHeader>
        <ListTitle>채팅</ListTitle>
      </ListHeader>
      <SearchWrap>
        <SearchIcon>🔍</SearchIcon>
        <SearchInput
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="채팅방 검색"
        />
      </SearchWrap>
      <RoomScroll>
        {loading ? (
          <EmptyMsg>로딩 중...</EmptyMsg>
        ) : rooms.length === 0 ? (
          <EmptyMsg>채팅방이 없습니다</EmptyMsg>
        ) : (
          rooms
            .filter(
              (r) =>
                roomPartner(r).includes(search) || roomItem(r).includes(search),
            )
            .map((r) => {
              const rid = roomId(r);
              const active = String(rid) === String(selectedId);
              const unread = roomUnread(r);
              const status = roomStatus(r);
              const stepIdx = getStep(status);
              const statusColor =
                stepIdx === 2
                  ? "var(--color-success, #10b981)"
                  : stepIdx === 1
                    ? "var(--color-primary)"
                    : "var(--text-secondary)";
              return (
                <RoomItem
                  key={rid}
                  $active={active}
                  onClick={() => onSelect(rid)}
                >
                  <RoomAvatar>
                    {(roomPartner(r)[0] || "?").toUpperCase()}
                  </RoomAvatar>
                  <RoomInfo>
                    <RoomTop>
                      <RoomName>{roomPartner(r)}</RoomName>
                      <RoomTime>
                        {roomLastTime(r) ? fmtDate(roomLastTime(r)) : ""}
                      </RoomTime>
                    </RoomTop>
                    <RoomItemName>{roomItem(r)}</RoomItemName>
                    <RoomBottom>
                      <RoomLastMsg>{roomLast(r)}</RoomLastMsg>
                      <RoomStatusBadge style={{ color: statusColor }}>
                        {STATUS_LABEL[status] ?? status}
                      </RoomStatusBadge>
                      {unread > 0 && <UnreadBadge>{unread}</UnreadBadge>}
                    </RoomBottom>
                  </RoomInfo>
                </RoomItem>
              );
            })
        )}
      </RoomScroll>
    </ListPanel>
  );
}

// ── 우측 사이드바 ─────────────────────────────────────────────
function Sidebar({ room, myNickname, onPay, onComplete }) {
  if (!room) return null;
  const status = roomStatus(room);
  const stepIdx = getStep(status);
  const isDone = stepIdx >= 2;
  const isSeller = room.sellerNickname === myNickname;

  return (
    <SidePanel>
      <SideSection>
        <SideSectionTitle>상대방 정보</SideSectionTitle>
        <PartnerRow>
          <PartnerAvatar>
            {(roomPartner(room)[0] || "?").toUpperCase()}
          </PartnerAvatar>
          <PartnerDetail>
            <PartnerName>{roomPartner(room)}</PartnerName>
            <PartnerSub>
              Verified Dealer · {room.partnerOnline ? "Online" : "Offline"}
            </PartnerSub>
          </PartnerDetail>
          {room.partnerOnline && <OnlineDot />}
        </PartnerRow>
        <VerifyRow>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            본인인증
          </span>
          <span
            style={{
              color: room.partnerVerified
                ? "var(--color-success, #10b981)"
                : "var(--outline)",
              fontSize: 16,
            }}
          >
            {room.partnerVerified ? "✓" : "○"}
          </span>
        </VerifyRow>
        <ActionBtns>
          <ActionBtn $warn>
            <span>⚠</span>신고하기
          </ActionBtn>
          <ActionBtn>
            <span>🚫</span>차단하기
          </ActionBtn>
        </ActionBtns>
      </SideSection>
      <SideSection>
        <SideSectionTitle>거래 현황</SideSectionTitle>
        {STEPS.map((label, i) => {
          const done = stepIdx > i;
          const active = stepIdx === i;
          return (
            <StepItem key={label} $active={active}>
              <StepDot $done={done} $active={active}>
                {done ? "✓" : i + 1}
              </StepDot>
              <span
                style={{
                  fontSize: 12,
                  color: active
                    ? "var(--text-primary)"
                    : done
                      ? "var(--text-secondary)"
                      : "var(--outline)",
                }}
              >
                {label}
              </span>
            </StepItem>
          );
        })}
      </SideSection>
      {!isSeller && !isDone && stepIdx === 0 && (
        <PayBtn onClick={onPay}>💳 결제하기</PayBtn>
      )}
      {!isSeller && !isDone && stepIdx === 1 && (
        <CompleteBtn onClick={onComplete}>✅ 인수하기</CompleteBtn>
      )}
    </SidePanel>
  );
}

// ── 메인 ChatPage ─────────────────────────────────────────────
export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const myNickname = user?.nickname ?? "";
  const myMileage = user?.mileage ?? 0;

  const [rooms, setRooms] = useState([]);
  const [roomsLoad, setRoomsLoad] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoad, setMsgLoad] = useState(false);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showPay, setShowPay] = useState(false);

  const endRef = useRef(null);
  const activeRoom =
    rooms.find((r) => String(roomId(r)) === String(selectedId)) ?? null;
  const isDone = getStep(roomStatus(activeRoom ?? {})) >= 2;
  const isSeller = activeRoom?.sellerNickname === myNickname;

  const topic = selectedId ? `/topic/chat/${selectedId}` : null;
  const dest = selectedId ? `/app/chat/${selectedId}` : null;

  const handleIncoming = useCallback(
    (msg) => {
      setMessages((prev) => {
        if (msgId(msg) && prev.some((m) => msgId(m) === msgId(msg)))
          return prev;
        return [...prev, msg];
      });
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

  const { sendMessage } = useWebSocket(topic, dest, handleIncoming);

  useEffect(() => {
    setRoomsLoad(true);
    ChatApi.getChatRooms({ page: 0, size: 50 })
      .then((res) => {
        const list = res.data?.data?.content ?? res.data?.content ?? [];
        setRooms(list);
        const urlRoom = searchParams.get("roomId");
        if (urlRoom) {
          setSelectedId(String(urlRoom));
        } else if (list.length > 0) {
          setSelectedId(String(roomId(list[0])));
        }
      })
      .catch(() => {})
      .finally(() => setRoomsLoad(false));
  }, []);

  const loadMessages = useCallback((rId) => {
    if (!rId) return;
    setMsgLoad(true);
    ChatApi.getChatMessages(rId, { page: 0, size: 50 })
      .then((res) => {
        const raw =
          res.data?.data?.content ?? res.data?.content ?? res.data ?? [];
        setMessages([...raw].reverse());
        ChatApi.readMessages(rId).catch(() => {});
        setRooms((prev) =>
          prev.map((r) =>
            String(roomId(r)) === String(rId) ? { ...r, unreadCount: 0 } : r,
          ),
        );
      })
      .catch(() => {})
      .finally(() => setMsgLoad(false));
  }, []);

  useEffect(() => {
    if (selectedId) loadMessages(selectedId);
  }, [selectedId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ 낙관적 업데이트 제거 — WebSocket 브로드캐스트로만 수신
  function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !selectedId) return;
    const content = input.trim();
    setInput("");
    sendMessage({ content, type: "CHAT" });
  }

  async function handlePayConfirm(method) {
    if (!activeRoom) return;
    try {
      await ChatApi.payForRoom(selectedId, method);
      setRooms((prev) =>
        prev.map((r) =>
          String(roomId(r)) === String(selectedId)
            ? { ...r, tradeStatus: "PAID", lastMessage: "결제 완료" }
            : r,
        ),
      );
      setShowPay(false);
    } catch (err) {
      alert(err.response?.data?.message || "결제에 실패했습니다.");
    }
  }

  async function handleComplete() {
    if (!activeRoom || isDone) return;
    if (!window.confirm("거래를 최종 인수 완료 처리하겠습니까?")) return;
    try {
      await ChatApi.completeRoom(selectedId);
      setRooms((prev) =>
        prev.map((r) =>
          String(roomId(r)) === String(selectedId)
            ? { ...r, tradeStatus: "COMPLETED" }
            : r,
        ),
      );
    } catch (err) {
      alert(err.response?.data?.message || "거래 완료 처리에 실패했습니다.");
    }
  }

  const quickReplies = isSeller
    ? [
        "안녕하세요! 거래 진행해요.",
        "아이템 준비 완료됐습니다.",
        "거래 감사합니다!",
      ]
    : ["얼마까지 가능하신가요?", "결제 완료했습니다.", "아이템 수령 완료!"];

  return (
    <Wrap>
      <style>{`
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#2a2a3e;border-radius:4px}
        input::placeholder,textarea::placeholder{color:#52525b}
      `}</style>

      {showPay && activeRoom && (
        <PaymentModal
          room={activeRoom}
          myMileage={myMileage}
          onConfirm={handlePayConfirm}
          onCancel={() => setShowPay(false)}
        />
      )}

      <RoomList
        rooms={rooms}
        loading={roomsLoad}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(String(id))}
        search={search}
        onSearch={setSearch}
      />

      {activeRoom ? (
        <ChatArea>
          <ChatHeader>
            <HeaderLeft>
              <HeaderTitle>
                파트너(마족) / {roomPartner(activeRoom)}
                {activeRoom.partnerOnline && <OnlinePill>● ONLINE</OnlinePill>}
              </HeaderTitle>
              <HeaderSub>
                {activeRoom.gameName ?? activeRoom.gameServer ?? "거래 진행 중"}
              </HeaderSub>
            </HeaderLeft>
            <HeaderActions>
              <HeaderBtn>🔍</HeaderBtn>
              <HeaderBtn>⋯</HeaderBtn>
            </HeaderActions>
          </ChatHeader>

          <WarnBanner>
            ⚠ 채팅 내부에서 개인정보 보호 목적으로 개인정보 7일까지 보관됩니다.
          </WarnBanner>

          <MsgList>
            {msgLoad ? (
              <EmptyMsg style={{ color: "var(--outline)" }}>
                메시지 로딩 중...
              </EmptyMsg>
            ) : messages.length === 0 ? (
              <EmptyMsg>
                아직 메시지가 없습니다. 먼저 인사해 보세요! 👋
              </EmptyMsg>
            ) : (
              messages.map((msg, i) => {
                if (msgType(msg) === "SYSTEM")
                  return (
                    <SystemMsg key={msgId(msg) ?? i}>
                      <span>🔒</span>
                      {msgContent(msg)}
                    </SystemMsg>
                  );
                if (msgType(msg) === "PAYMENT_CARD")
                  return (
                    <PayCardWrap key={msgId(msg) ?? i}>
                      <PayCard>
                        <PayCardHeader>
                          <PayCardCheck>✓</PayCardCheck>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>
                              결제 완료되었습니다.
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "var(--text-secondary)",
                              }}
                            >
                              안전하게 거래를 진행해 주세요.
                            </div>
                          </div>
                        </PayCardHeader>
                        <PayCardBody>
                          <PayCardRow>
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--text-secondary)",
                              }}
                            >
                              결제 수단
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600 }}>
                              {msg.method === "card" ? "카드 결제" : "마일리지"}
                            </span>
                          </PayCardRow>
                          <PayCardRow>
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--text-secondary)",
                              }}
                            >
                              총 결제금액
                            </span>
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: "var(--color-primary)",
                              }}
                            >
                              {Number(msg.totalAmount ?? 0).toLocaleString()}{" "}
                              KRW
                            </span>
                          </PayCardRow>
                        </PayCardBody>
                        <PayCardFooter>
                          🔒 결제 완료 후 물품을 상대방에게 전달해 주세요.
                        </PayCardFooter>
                      </PayCard>
                    </PayCardWrap>
                  );

                // ✅ senderNickname으로 isMe 판별
                const isMe = msgSenderNickname(msg) === myNickname;
                return (
                  <MsgRow key={msgId(msg) ?? i} $isMe={isMe}>
                    {!isMe && (
                      <MsgAvatar>
                        {(roomPartner(activeRoom)[0] || "?").toUpperCase()}
                      </MsgAvatar>
                    )}
                    <MsgBubbleWrap $isMe={isMe}>
                      <MsgBubble $isMe={isMe}>{msgContent(msg)}</MsgBubble>
                      <MsgMeta $isMe={isMe}>
                        {isMe && (
                          <ReadLabel>
                            {msgRead(msg) ? "읽음" : "전송"}
                          </ReadLabel>
                        )}
                        <MsgTime>
                          {msgTime(msg) ? fmtTime(msgTime(msg)) : ""}
                        </MsgTime>
                      </MsgMeta>
                    </MsgBubbleWrap>
                  </MsgRow>
                );
              })
            )}
            <div ref={endRef} />
          </MsgList>

          {isDone && (
            <DoneBanner>⚠ 이 채팅은 거래가 완료된 채팅방입니다.</DoneBanner>
          )}

          {!isSeller && !isDone && getStep(roomStatus(activeRoom)) === 1 && (
            <CompleteBtnBottom onClick={handleComplete}>
              ✅ 인수하기 (거래 완료)
            </CompleteBtnBottom>
          )}

          {!isDone && (
            <QuickRow>
              {quickReplies.map((q) => (
                <QuickBtn key={q} onClick={() => setInput(q)}>
                  {q}
                </QuickBtn>
              ))}
            </QuickRow>
          )}

          <InputArea onSubmit={handleSend}>
            <InputBox>
              <InputBtns>
                <InputIcon type="button">📎</InputIcon>
                <InputIcon type="button">😊</InputIcon>
              </InputBtns>
              <InputField
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="[공지] 계정 인계 전 입금내역 확인 하세요."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
              <ShiftHint>Shift + Enter for new line</ShiftHint>
            </InputBox>
            <SendBtn type="submit" $active={!!input.trim()}>
              ➤
            </SendBtn>
          </InputArea>
        </ChatArea>
      ) : (
        <NoChat>
          <span style={{ fontSize: 48 }}>💬</span>
          <p style={{ color: "var(--outline)", marginTop: 16 }}>
            채팅방을 선택해 주세요
          </p>
        </NoChat>
      )}

      {activeRoom && (
        <Sidebar
          room={activeRoom}
          myNickname={myNickname}
          onPay={() => setShowPay(true)}
          onComplete={handleComplete}
        />
      )}
    </Wrap>
  );
}

// ── Styled Components ──────────────────────────────────────────
const fadeIn = keyframes`from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}`;

const Wrap = styled.div`
  display: flex;
  height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: "Pretendard", "Noto Sans KR", sans-serif;
  overflow: hidden;
`;
const ListPanel = styled.div`
  width: 300px;
  flex-shrink: 0;
  background: var(--bg-container);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
`;
const ListHeader = styled.div`
  padding: 20px 16px 12px;
  border-bottom: 1px solid var(--border-color);
`;
const ListTitle = styled.div`
  font-size: 18px;
  font-weight: 800;
`;
const SearchWrap = styled.div`
  position: relative;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-color);
`;
const SearchIcon = styled.span`
  position: absolute;
  left: 22px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  pointer-events: none;
`;
const SearchInput = styled.input`
  width: 100%;
  background: var(--bg-container-low);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 10px 8px 30px;
  font-size: 12px;
  color: var(--text-primary);
  outline: none;
`;
const RoomScroll = styled.div`
  flex: 1;
  overflow-y: auto;
`;
const RoomItem = styled.div`
  display: flex;
  gap: 10px;
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  background: ${(p) => (p.$active ? "var(--bg-container-low)" : "transparent")};
  border-left: 3px solid
    ${(p) => (p.$active ? "var(--color-primary)" : "transparent")};
  transition: background 0.15s;
  &:hover {
    background: var(--bg-container-low);
  }
`;
const RoomAvatar = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--bg-container-low);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
`;
const RoomInfo = styled.div`
  flex: 1;
  min-width: 0;
`;
const RoomTop = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
`;
const RoomName = styled.div`
  font-size: 13px;
  font-weight: 700;
`;
const RoomTime = styled.div`
  font-size: 10px;
  color: var(--outline);
`;
const RoomItemName = styled.div`
  font-size: 11px;
  color: var(--color-primary);
  font-weight: 600;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const RoomBottom = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;
const RoomLastMsg = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const RoomStatusBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
`;
const UnreadBadge = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 99px;
  background: var(--color-primary);
  color: var(--on-primary);
  font-size: 9px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;
const EmptyMsg = styled.div`
  text-align: center;
  padding: 40px 16px;
  color: var(--outline);
  font-size: 13px;
`;
const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid var(--border-color);
`;
const ChatHeader = styled.div`
  padding: 12px 16px;
  background: var(--bg-container);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
`;
const HeaderLeft = styled.div``;
const HeaderTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
`;
const OnlinePill = styled.span`
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 9px;
  font-weight: 700;
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
`;
const HeaderSub = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
`;
const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;
const HeaderBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--bg-container-low);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const WarnBanner = styled.div`
  margin: 8px 12px 0;
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  font-size: 10px;
  color: rgba(252, 165, 165, 0.85);
  flex-shrink: 0;
`;
const MsgList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: var(--bg-primary);
`;
const SystemMsg = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--bg-container-low);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 6px 14px;
  font-size: 11px;
  color: var(--text-secondary);
  align-self: center;
  max-width: 80%;
  text-align: center;
`;
const PayCardWrap = styled.div`
  display: flex;
  justify-content: center;
`;
const PayCard = styled.div`
  width: 280px;
  background: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  overflow: hidden;
  animation: ${fadeIn} 0.2s ease;
`;
const PayCardHeader = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border-color);
`;
const PayCardCheck = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 99px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #10b981;
  font-weight: 700;
`;
const PayCardBody = styled.div`
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const PayCardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const PayCardFooter = styled.div`
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.05);
  border-top: 1px solid var(--border-color);
  font-size: 10px;
  color: rgba(147, 197, 253, 0.7);
`;
const MsgRow = styled.div`
  display: flex;
  flex-direction: ${(p) => (p.$isMe ? "row-reverse" : "row")};
  align-items: flex-end;
  gap: 8px;
`;
const MsgAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--bg-container-low);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
`;
const MsgBubbleWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(p) => (p.$isMe ? "flex-end" : "flex-start")};
  max-width: 65%;
  gap: 3px;
`;
const MsgBubble = styled.div`
  padding: 10px 14px;
  border-radius: 16px;
  border-bottom-right-radius: ${(p) => (p.$isMe ? "4px" : "16px")};
  border-bottom-left-radius: ${(p) => (p.$isMe ? "16px" : "4px")};
  background: ${(p) =>
    p.$isMe ? "var(--color-primary)" : "var(--bg-container)"};
  color: ${(p) => (p.$isMe ? "var(--on-primary)" : "var(--text-primary)")};
  font-size: 13px;
  line-height: 1.5;
  border: ${(p) => (p.$isMe ? "none" : "1px solid var(--border-color)")};
`;
const MsgMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-direction: ${(p) => (p.$isMe ? "row-reverse" : "row")};
`;
const ReadLabel = styled.span`
  font-size: 10px;
  color: var(--color-primary);
`;
const MsgTime = styled.span`
  font-size: 10px;
  color: var(--outline);
`;
const DoneBanner = styled.div`
  margin: 0 12px 8px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  font-size: 10px;
  color: rgba(252, 165, 165, 0.85);
  flex-shrink: 0;
`;
const CompleteBtnBottom = styled.button`
  margin: 0 12px 8px;
  padding: 11px;
  background: var(--color-primary);
  border: none;
  border-radius: 10px;
  color: var(--on-primary);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  &:hover {
    opacity: 0.88;
  }
`;
const QuickRow = styled.div`
  display: flex;
  gap: 6px;
  padding: 6px 12px;
  border-top: 1px solid var(--border-color);
  overflow-x: auto;
  flex-shrink: 0;
`;
const QuickBtn = styled.button`
  flex-shrink: 0;
  padding: 5px 12px;
  border-radius: 99px;
  background: var(--bg-container-low);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 10px;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    border-color: var(--color-primary);
    color: var(--text-primary);
  }
`;
const InputArea = styled.form`
  padding: 10px 12px;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-shrink: 0;
`;
const InputBox = styled.div`
  flex: 1;
  background: var(--bg-container-low);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  display: flex;
  align-items: flex-end;
`;
const InputBtns = styled.div`
  display: flex;
  padding: 0 4px;
`;
const InputIcon = styled.button`
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  color: var(--outline);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const InputField = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 10px 8px;
  font-size: 12px;
  color: var(--text-primary);
`;
const ShiftHint = styled.span`
  font-size: 9px;
  color: var(--outline);
  padding: 0 8px 10px;
  white-space: nowrap;
`;
const SendBtn = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  flex-shrink: 0;
  background: ${(p) =>
    p.$active ? "var(--color-primary)" : "var(--bg-container-low)"};
  border: 1px solid
    ${(p) => (p.$active ? "var(--color-primary)" : "var(--border-color)")};
  color: ${(p) => (p.$active ? "var(--on-primary)" : "var(--outline)")};
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const NoChat = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
const OnlineDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 99px;
  background: #22c55e;
  border: 2px solid var(--bg-container);
  margin-left: auto;
`;
const SidePanel = styled.div`
  width: 200px;
  flex-shrink: 0;
  background: var(--bg-container);
  border-left: 1px solid var(--border-color);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
`;
const SideSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const SideSectionTitle = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: var(--outline);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;
const PartnerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
const PartnerAvatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--bg-container-low);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
`;
const PartnerDetail = styled.div`
  flex: 1;
  min-width: 0;
`;
const PartnerName = styled.div`
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const PartnerSub = styled.div`
  font-size: 9px;
  color: var(--outline);
  margin-top: 2px;
`;
const VerifyRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: var(--bg-container-low);
  border: 1px solid var(--border-color);
  border-radius: 8px;
`;
const ActionBtns = styled.div`
  display: flex;
  gap: 6px;
`;
const ActionBtn = styled.button`
  flex: 1;
  padding: 7px 0;
  background: var(--bg-container-low);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  color: ${(p) => (p.$warn ? "#f59e0b" : "var(--text-secondary)")};
  font-size: 9px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  span {
    font-size: 13px;
  }
  &:hover {
    border-color: var(--color-primary);
  }
`;
const StepItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: ${(p) =>
    p.$active
      ? "rgba(var(--color-primary-rgb, 108,92,231),.15)"
      : "var(--bg-container-low)"};
  border: 1px solid
    ${(p) => (p.$active ? "var(--color-primary)" : "var(--border-color)")};
`;
const StepDot = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 99px;
  flex-shrink: 0;
  background: ${(p) =>
    p.$done
      ? "var(--color-primary)"
      : p.$active
        ? "rgba(var(--color-primary-rgb, 108,92,231),.2)"
        : "var(--bg-container-low)"};
  border: 1px solid
    ${(p) =>
      p.$done || p.$active ? "var(--color-primary)" : "var(--border-color)"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  color: ${(p) =>
    p.$done
      ? "var(--on-primary)"
      : p.$active
        ? "var(--color-primary)"
        : "var(--outline)"};
`;
const PayBtn = styled.button`
  width: 100%;
  padding: 11px 0;
  background: var(--color-primary);
  border: none;
  border-radius: 10px;
  color: var(--on-primary);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    opacity: 0.88;
  }
`;
const CompleteBtn = styled.button`
  width: 100%;
  padding: 11px 0;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 10px;
  color: #10b981;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    background: rgba(16, 185, 129, 0.25);
  }
`;
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;
const PayBox = styled.div`
  width: 100%;
  max-width: 480px;
  background: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  overflow: hidden;
  animation: ${fadeIn} 0.2s ease;
`;
const PaySection = styled.div`
  padding: 18px 20px;
  border-bottom: 1px solid var(--border-color);
  &:last-child {
    border-bottom: none;
  }
`;
const PaySectionTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: var(--outline);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;
const PayItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
const PayItemIcon = styled.div`
  font-size: 28px;
`;
const PayItemInfo = styled.div`
  flex: 1;
`;
const PayItemName = styled.div`
  font-size: 14px;
  font-weight: 700;
`;
const PayItemSub = styled.div`
  font-size: 11px;
  color: var(--outline);
  margin-top: 2px;
`;
const PayItemPrice = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: var(--color-primary-light, #c0c1ff);
`;
const PayMethodRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const PayMethod = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: ${(p) =>
    p.$active
      ? "rgba(var(--color-primary-rgb, 108,92,231),.12)"
      : "var(--bg-container-low)"};
  border: 1px solid
    ${(p) => (p.$active ? "var(--color-primary)" : "var(--border-color)")};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    border-color: var(--color-primary);
  }
  span {
    font-size: 22px;
  }
`;
const CheckDot = styled.div`
  margin-left: auto;
  width: 18px;
  height: 18px;
  border-radius: 99px;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  &::after {
    content: "✓";
    font-size: 10px;
    color: var(--on-primary);
    font-weight: 700;
  }
`;
const PriceBreakdown = styled.div`
  background: var(--bg-container-low);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 14px;
`;
const PriceRow2 = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${(p) => (p.$total ? "14px" : "13px")};
  font-weight: ${(p) => (p.$total ? 700 : 400)};
  color: ${(p) => (p.$total ? "var(--text-primary)" : "var(--text-secondary)")};
  padding: ${(p) => (p.$total ? "8px 0 0" : "4px 0")};
`;
const Divider = styled.div`
  height: 1px;
  background: var(--border-color);
  margin: 8px 0;
`;
const LackNotice = styled.div`
  margin-top: 10px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  font-size: 11px;
  color: #ef4444;
`;
const EscrowNote = styled.div`
  margin-top: 10px;
  font-size: 11px;
  color: var(--outline);
`;
const PayBtns = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px 20px;
`;
const PayCancel = styled.button`
  flex: 1;
  padding: 12px 0;
  border-radius: 10px;
  cursor: pointer;
  background: var(--bg-container-low);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  &:hover {
    border-color: var(--color-primary);
  }
`;
const PayConfirm = styled.button`
  flex: 2;
  padding: 12px 0;
  border-radius: 10px;
  cursor: pointer;
  background: ${(p) =>
    p.disabled ? "var(--bg-container-low)" : "var(--color-primary)"};
  border: none;
  color: ${(p) => (p.disabled ? "var(--outline)" : "var(--on-primary)")};
  font-size: 13px;
  font-weight: 700;
  opacity: ${(p) => (p.disabled ? 0.5 : 1)};
  &:hover:not(:disabled) {
    opacity: 0.88;
  }
`;
