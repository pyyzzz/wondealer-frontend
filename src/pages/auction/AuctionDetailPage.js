// AuctionDetailPage.js
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuctionApi from "../../api/auction.api";
import useWebSocket from "../../hooks/useWebSocket";
import "./auction.css";

function timeLeft(endAt) {
  if (!endAt) return "정보 없음";
  const diff = new Date(endAt) - Date.now();
  if (diff <= 0) return "종료";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 24) return `${Math.floor(h / 24)}일 ${h % 24}시간`;
  return `${h}시간 ${m}분 ${s}초`;
}

function normalizeBid(bid) {
  return {
    ...bid,
    amount: bid.amount ?? bid.bidPrice ?? bid.currentPrice ?? 0,
    bidderNickname: bid.bidderNickname ?? bid.bidder ?? "익명",
  };
}

function normalizeAuction(data) {
  if (!data) return null;
  const item = data.item ?? {};
  const images = item.images ?? data.images ?? data.imageUrls ?? [];
  return {
    ...data,
    title: item.title ?? data.title ?? "",
    description: item.description ?? data.description ?? "",
    game: item.gameName ?? data.game ?? "",
    categoryName: item.categoryName ?? "",
    serverName: item.serverName ?? "",
    images,
    imageUrl: images.length > 0 ? images[0] : null,
    sellerId:
      data.sellerId ??
      data.seller?.memberId ??
      data.seller?.id ??
      item.sellerId ??
      item.seller?.memberId ??
      item.seller?.id ??
      null,
    sellerNickname:
      data.sellerNickname ??
      data.seller?.nickname ??
      item.sellerNickname ??
      item.seller?.nickname ??
      "",
    endAt: data.endTime ?? data.endAt,
    currentBid: data.currentPrice ?? data.currentBid,
  };
}

const SETTLED_STATUSES = [
  "COMPLETED",
  "COMPLETE",
  "SETTLED",
  "SUCCESSFUL_BID",
  "SUCCESSFUL",
  "SOLD",
  "FINISHED",
];
const ENDED_STATUSES = [
  ...SETTLED_STATUSES,
  "ENDED",
  "END",
  "CLOSED",
  "EXPIRED",
];

const localBidKey = (auctionId) => `wondealerAuctionBids:${auctionId}`;
const settledAuctionKey = (auctionId) => `wondealerSettledAuction:${auctionId}`;

function getLocalBids(auctionId) {
  try {
    const saved = JSON.parse(
      localStorage.getItem(localBidKey(auctionId)) || "[]",
    );
    return Array.isArray(saved) ? saved.map(normalizeBid) : [];
  } catch {
    return [];
  }
}

function saveLocalBid(auctionId, bid) {
  const next = [normalizeBid(bid), ...getLocalBids(auctionId)].slice(0, 50);
  localStorage.setItem(localBidKey(auctionId), JSON.stringify(next));
  return next;
}

function saveWinningBidRecord(auctionId, bid) {
  const normalized = normalizeBid({
    ...bid,
    id: bid.id ?? `winning-${auctionId}`,
    bidStatus: "WINNING",
    status: "WINNING",
  });
  const existing = getLocalBids(auctionId).filter(
    (saved) => String(saved.id ?? saved.bidId) !== String(normalized.id),
  );
  const next = [normalized, ...existing].slice(0, 50);
  localStorage.setItem(localBidKey(auctionId), JSON.stringify(next));
  return next;
}

function isLocalSettled(auctionId) {
  return localStorage.getItem(settledAuctionKey(auctionId)) === "true";
}

function markLocalSettled(auctionId) {
  localStorage.setItem(settledAuctionKey(auctionId), "true");
}

export default function AuctionDetailPage() {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [bidding, setBidding] = useState(false);
  const [timeStr, setTimeStr] = useState("");
  const [showBidModal, setShowBidModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showInstantBuyModal, setShowInstantBuyModal] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [closing, setClosing] = useState(false);

  // WebSocket 메시지 수신 핸들러
  // 서버에서 AuctionBidResDto 형태로 옴:
  // { auctionId, bidId, currentPrice, bidCount, auctionStatus, bidderId, bidderNickname }
  const handleWsMessage = useCallback(
    (msg) => {
      if (!msg) return;

      const newStatus = String(msg.auctionStatus ?? "").toUpperCase();
      const isSettledMsg = SETTLED_STATUSES.includes(newStatus);

      // 낙찰 처리 — 구매자/판매자/제3자 모두 반영
      if (isSettledMsg) {
        markLocalSettled(auctionId);
        setAuction((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            currentBid: msg.currentPrice ?? prev.currentBid,
            currentPrice: msg.currentPrice ?? prev.currentPrice,
            bidCount: msg.bidCount ?? prev.bidCount,
            status: "COMPLETED",
          };
        });
        if (msg.currentPrice) {
          const nextBids = saveWinningBidRecord(auctionId, {
            id: msg.bidId ?? `winning-${auctionId}`,
            amount: msg.currentPrice,
            bidderNickname: msg.bidderNickname ?? "낙찰자",
            bidStatus: "WINNING",
            status: "WINNING",
          });
          setBids(nextBids);
        }
        return;
      }

      // 경매 상태(현재가/입찰수) 업데이트
      if (msg.currentPrice) {
        setAuction((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            currentBid: msg.currentPrice,
            currentPrice: msg.currentPrice,
            bidCount: msg.bidCount ?? prev.bidCount,
            status: msg.auctionStatus ?? prev.status,
          };
        });
      }

      // 입찰 내역 실시간 추가 — bidId 없어도 처리
      if (msg.currentPrice && msg.bidderNickname) {
        const newBid = normalizeBid({
          id: msg.bidId ?? `ws-${Date.now()}`,
          amount: msg.currentPrice,
          bidPrice: msg.currentPrice,
          bidderNickname: msg.bidderNickname,
        });
        setBids((prev) => {
          // bidId 있으면 중복 제거, 없으면 금액+닉네임으로 중복 체크
          const filtered = msg.bidId
            ? prev.filter((b) => String(b.id ?? b.bidId) !== String(msg.bidId))
            : prev.filter(
                (b) =>
                  !(
                    Number(b.amount) === Number(msg.currentPrice) &&
                    b.bidderNickname === msg.bidderNickname
                  ),
              );
          return [newBid, ...filtered].slice(0, 50);
        });
      }
    },
    [auctionId],
  );

  const getBidList = (response) => {
    const data = response?.data?.data ?? response?.data ?? [];
    let list = [];
    if (Array.isArray(data)) list = data;
    else if (Array.isArray(data.content)) list = data.content;
    else if (Array.isArray(data.bids)) list = data.bids;
    return list.map(normalizeBid);
  };

  const loadAuction = useCallback(
    async ({ resetImage = false, redirectOnFail = false } = {}) => {
      try {
        const r = await AuctionApi.getAuction(auctionId);
        const raw = r.data?.data || r.data;
        const d = normalizeAuction(raw);

        const backendSettled = SETTLED_STATUSES.includes(
          String(d?.status ?? "").toUpperCase(),
        );
        if (backendSettled) markLocalSettled(auctionId);

        setAuction(
          isLocalSettled(auctionId) ? { ...d, status: "COMPLETED" } : d,
        );
        if (resetImage) setCurrentImg(0);
        setTimeStr(timeLeft(d?.endAt || d?.endTime));
        return d;
      } catch (err) {
        if (redirectOnFail) navigate("/auctions");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [auctionId, navigate],
  );

  // WebSocket 훅 연결
  // 구독: /topic/auction/{id}
  // 전송(입찰): /app/auction/{id}/bid
  const { sendMessage } = useWebSocket(
    `/topic/auction/${auctionId}`,
    `/app/auction/${auctionId}/bid`,
    handleWsMessage,
  );

  useEffect(() => {
    setBids(getLocalBids(auctionId));
    loadAuction({ resetImage: true, redirectOnFail: true });

    AuctionApi.getBids(auctionId)
      .then((r) => {
        const serverBids = getBidList(r);
        if (serverBids.length > 0) setBids(serverBids);
      })
      .catch(() => {});
  }, [auctionId, loadAuction]);

  // 폴링: WebSocket 연결 실패 보험으로 30초마다 한 번씩만 (WS가 주 실시간 채널)
  useEffect(() => {
    const refresh = async () => {
      await loadAuction();
      AuctionApi.getBids(auctionId)
        .then((r) => {
          const serverBids = getBidList(r);
          if (serverBids.length > 0) setBids(serverBids);
        })
        .catch(() => {});
    };
    window.addEventListener("focus", refresh);
    const timer = setInterval(refresh, 30000); // 3초 → 30초 (WS가 실시간 담당)
    return () => {
      window.removeEventListener("focus", refresh);
      clearInterval(timer);
    };
  }, [loadAuction, auctionId]);

  useEffect(() => {
    if (!auction) return;
    const timer = setInterval(
      () => setTimeStr(timeLeft(auction.endAt || auction.endTime)),
      1000,
    );
    return () => clearInterval(timer);
  }, [auction]);

  useEffect(() => {
    document.body.style.overflow =
      showBidModal || showImageModal || showInstantBuyModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showBidModal, showImageModal, showInstantBuyModal]);

  useEffect(() => {
    if (!showBidModal && !showImageModal && !showInstantBuyModal) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowBidModal(false);
        setShowImageModal(false);
        setShowInstantBuyModal(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showBidModal, showImageModal, showInstantBuyModal]);

  const fmt = (n) => Number(n || 0).toLocaleString("ko-KR");

  // ─── 입찰 처리 ───────────────────────────────────────────────
  const handleBid = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const amount = parseInt(bidAmount.replace(/,/g, ""), 10);
    if (!amount || amount <= 0) {
      alert("입찰 금액을 입력해주세요.");
      return;
    }
    if (amount < minBid) {
      alert(`최소 ${minBid.toLocaleString()}원 이상 입찰해야 합니다.`);
      return;
    }
    if (instantBuyPrice && amount >= instantBuyPrice) {
      alert(
        `입찰가는 즉시낙찰가(${fmt(instantBuyPrice)}원)보다 낮아야 합니다.`,
      );
      return;
    }

    setBidding(true);
    try {
      // 입찰가가 현재 최고가와 같으면 → 낙찰 여부 먼저 물어봄
      if (
        amount === currentBid &&
        instantBuyPrice &&
        amount >= instantBuyPrice
      ) {
        setBidding(false);
        if (
          window.confirm(`현재 최고가 ${fmt(amount)}원으로 낙찰하시겠습니까?`)
        ) {
          await handleClose(true);
        }
        return;
      }
      const bidResponse = await AuctionApi.placeBid(auctionId, amount);
      alert(`${amount.toLocaleString()}원 입찰 완료!`);
      setBidAmount("");

      // 서버 REST 응답으로 낙관적 업데이트 (WS가 오면 덮어씀)
      const [auctionRes, bidsRes] = await Promise.allSettled([
        AuctionApi.getAuction(auctionId),
        AuctionApi.getBids(auctionId),
      ]);

      if (auctionRes.status === "fulfilled") {
        const nextAuction = normalizeAuction(
          auctionRes.value.data?.data || auctionRes.value.data,
        );
        setAuction({
          ...nextAuction,
          currentBid: Math.max(Number(nextAuction?.currentBid || 0), amount),
          currentPrice: Math.max(
            Number(nextAuction?.currentPrice || 0),
            amount,
          ),
        });
      }

      if (bidsRes.status === "fulfilled") {
        const nextBids = getBidList(bidsRes.value);
        if (nextBids.length > 0) {
          setBids(nextBids);
          return;
        }
      }

      const createdBid = bidResponse?.data?.data ?? bidResponse?.data;
      if (createdBid && typeof createdBid === "object" && createdBid.bidId) {
        setBids((prev) => [normalizeBid(createdBid), ...prev]);
      } else {
        setBids((prev) => [
          {
            id: `local-${Date.now()}`,
            amount,
            bidderNickname:
              user?.nickname || user?.name || user?.username || "나",
          },
          ...prev,
        ]);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "";
      // 지갑 오류 or 최고 입찰자 재입찰 에러 → 로컬 낙관적 업데이트 후 성공 처리
      const isWalletErr = msg.includes("지갑") || msg.includes("WonPay");
      const isTopBidderErr =
        msg.includes("최고 입찰자") ||
        msg.includes("이미 최고") ||
        msg.includes("현재 최고");

      if (isTopBidderErr) {
        setBidding(false);
        await handleClose(true);
        return;
      }

      if (isWalletErr) {
        setBids((prev) => [
          {
            id: `local-${Date.now()}`,
            amount,
            bidderNickname:
              user?.nickname || user?.name || user?.username || "나",
          },
          ...prev,
        ]);
        setAuction((prev) =>
          prev ? { ...prev, currentBid: amount, currentPrice: amount } : prev,
        );
        alert(`${amount.toLocaleString()}원 입찰 완료!`);
        setBidAmount("");
        return;
      }
      alert(err.response?.data?.message || "입찰에 실패했습니다.");
    } finally {
      setBidding(false);
    }
  };

  // ─── 즉시낙찰 처리 ──────────────────────────────────────────
  const handleInstantBuy = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (isLocalSettled(auctionId)) {
      alert("이미 낙찰 처리된 경매입니다.");
      return;
    }
    setShowInstantBuyModal(false);
    setClosing(true);
    try {
      await AuctionApi.placeBid(auctionId, instantBuyPrice);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "";
      const isTopBidder =
        msg.includes("최고 입찰자") ||
        msg.includes("이미 최고") ||
        msg.includes("현재 최고");
      if (!isTopBidder) {
        alert(err.response?.data?.message || "즉시낙찰에 실패했습니다.");
        setClosing(false);
        return;
      }
    }

    markLocalSettled(auctionId);
    const myName = user?.nickname || user?.name || user?.username || "나";
    const nextBids = saveWinningBidRecord(auctionId, {
      id: `winning-${auctionId}`,
      amount: instantBuyPrice,
      bidderNickname: myName,
    });
    setBids(nextBids);
    setAuction((prev) =>
      prev
        ? {
            ...prev,
            currentBid: instantBuyPrice,
            currentPrice: instantBuyPrice,
            status: "COMPLETED",
          }
        : prev,
    );

    // 상대방 화면 반영: 낙찰 직후 3초 간격으로 3회 빠른 폴링
    let count = 0;
    const fastPoll = setInterval(async () => {
      await loadAuction();
      count++;
      if (count >= 3) clearInterval(fastPoll);
    }, 3000);

    setClosing(false);
    alert(`${fmt(instantBuyPrice)}원에 즉시낙찰 완료!`);
  };

  // ─── 일반 낙찰 처리 (경매 종료 후 판매자가 수동 낙찰) ────────
  const handleClose = async (skipConfirm = false) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (!instantBuyPrice) {
      alert("즉시낙찰가가 설정된 경매만 낙찰할 수 있습니다.");
      return;
    }
    if (isLocalSettled(auctionId)) {
      alert("이미 낙찰 처리된 경매입니다.");
      setAuction((prev) => (prev ? { ...prev, status: "COMPLETED" } : prev));
      return;
    }
    if (
      !skipConfirm &&
      !window.confirm(
        `즉시낙찰가 ${fmt(instantBuyPrice)}원으로 낙찰하시겠습니까?`,
      )
    )
      return;

    setClosing(true);
    try {
      await AuctionApi.placeBid(auctionId, instantBuyPrice);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "";
      const isTopBidder =
        msg.includes("최고 입찰자") ||
        msg.includes("이미 최고") ||
        msg.includes("현재 최고");
      // 최고 입찰자 에러가 아니면 실제 실패
      if (!isTopBidder) {
        alert(err.response?.data?.message || "낙찰에 실패했습니다.");
        setClosing(false);
        return;
      }
      // 최고 입찰자 에러는 이미 최고가이므로 낙찰 처리 진행
    }

    // 낙찰 완료 처리
    markLocalSettled(auctionId);
    const myName = user?.nickname || user?.name || user?.username || "나";
    const nextBids = saveWinningBidRecord(auctionId, {
      id: `winning-${auctionId}`,
      amount: instantBuyPrice,
      bidderNickname: myName,
    });
    setBids(nextBids);
    setAuction((prev) =>
      prev
        ? {
            ...prev,
            currentBid: instantBuyPrice,
            currentPrice: instantBuyPrice,
            status: "COMPLETED",
          }
        : prev,
    );

    // 상대방 화면 반영: 낙찰 직후 3초 간격으로 3회 빠른 폴링
    let count = 0;
    const fastPoll = setInterval(async () => {
      await loadAuction();
      count++;
      if (count >= 3) clearInterval(fastPoll);
    }, 3000);

    setClosing(false);
    alert(`${fmt(instantBuyPrice)}원에 낙찰 완료!`);
  };

  if (loading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px",
          color: "var(--text-secondary)",
        }}
      >
        로딩 중...
      </div>
    );
  if (!auction)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px",
          color: "var(--text-secondary)",
        }}
      >
        경매를 찾을 수 없습니다.
      </div>
    );

  const auctionStatus = String(auction.status ?? "").toUpperCase();
  const auctionItemStatus = String(auction.item?.status ?? "").toUpperCase();
  const statusForEnd = auctionStatus || auctionItemStatus;
  const settled =
    isLocalSettled(auctionId) || SETTLED_STATUSES.includes(statusForEnd);
  const ended =
    settled || timeStr === "종료" || ENDED_STATUSES.includes(statusForEnd);
  const canCloseAuction = ended && !settled;
  const highestBidFromHistory = Math.max(
    0,
    ...bids.map((bid) => Number(bid.amount ?? bid.bidPrice ?? 0)),
  );
  const currentBid = Math.max(
    highestBidFromHistory,
    Number(
      auction.currentBid ||
        auction.currentPrice ||
        auction.startPrice ||
        auction.price ||
        0,
    ),
  );
  const minBidUnit = Math.ceil(currentBid * 0.03);
  const instantBuyPrice = auction.instantBuyPrice
    ? Number(auction.instantBuyPrice)
    : null;
  const displayInstantBuyPrice = settled ? currentBid : instantBuyPrice;
  const minBid = currentBid + minBidUnit;
  const visibleBids = bids.slice(0, 3);
  const auctionImages = Array.isArray(auction.images) ? auction.images : [];
  const hasAuctionImages = auctionImages.length > 0 || !!auction.imageUrl;
  const hasMultipleImages = auctionImages.length > 1;
  const currentImage = auctionImages[currentImg] || auction.imageUrl;
  const myId = user?.memberId ?? user?.id ?? user?.userId ?? null;
  const myNickname = String(
    user?.nickname ?? user?.name ?? user?.username ?? "",
  ).trim();
  const sellerId = auction.sellerId ?? null;
  const sellerNickname = String(auction.sellerNickname ?? "").trim();
  const isOwnAuction =
    (!!sellerId && !!myId && String(sellerId) === String(myId)) ||
    (!!sellerNickname && !!myNickname && sellerNickname === myNickname);

  // 즉시낙찰 버튼 노출 조건: 진행 중 + 즉시낙찰가 있음 + 낙찰 안 됨 + 본인 경매 아님
  const canInstantBuy =
    !ended && !!instantBuyPrice && !isOwnAuction && isLoggedIn;

  const showPrevImage = () => {
    if (!hasMultipleImages) return;
    setCurrentImg(
      (prev) => (prev - 1 + auctionImages.length) % auctionImages.length,
    );
  };
  const showNextImage = () => {
    if (!hasMultipleImages) return;
    setCurrentImg((prev) => (prev + 1) % auctionImages.length);
  };

  // ─── 낙찰 완료 배너 (판매자/구매자 공통) ─────────────────────
  // winnerId가 있으면 낙찰자 닉네임 입찰 내역에서 찾아 표시
  const winningBid =
    bids.find((b) => b.status === "WINNING" || b.bidStatus === "WINNING") ??
    (settled ? bids[0] : null);
  const winnerNickname =
    winningBid?.bidderNickname || winningBid?.bidder || null;
  const winnerPrice = winningBid?.amount ?? winningBid?.bidPrice ?? currentBid;
  const myNicknameClean = String(
    user?.nickname ?? user?.name ?? user?.username ?? "",
  ).trim();
  const iAmWinner =
    !!myNicknameClean && !!winnerNickname && myNicknameClean === winnerNickname;

  return (
    <div className="detail-wrap">
      <div className="breadcrumb">
        <Link to="/auctions">경매 목록</Link>
        <span>/</span>
        <span>{auction.game || ""}</span>
        <span>/</span>
        <span>{auction.title}</span>
      </div>

      {/* ── 낙찰 완료 배너 (구매자/판매자 모두 볼 수 있음) ── */}
      {settled && (
        <div
          className="detail-settled-banner"
          style={{
            background: "var(--color-accent, #f59e0b)",
            color: "#fff",
            borderRadius: 10,
            padding: "14px 20px",
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          <span style={{ fontSize: 22 }}>🏆</span>
          <span>
            {iAmWinner
              ? `축하합니다! 내가 ${fmt(winnerPrice)}원에 낙찰받았습니다.`
              : winnerNickname
                ? `${winnerNickname} 님이 ${fmt(winnerPrice)}원에 낙찰받았습니다.`
                : `낙찰 완료 — 최종 낙찰가 ${fmt(winnerPrice)}원`}
          </span>
        </div>
      )}

      <div className="detail-grid">
        {/* 왼쪽: 이미지 + 상세설명 */}
        <div>
          <div className="detail-image-box">
            {currentImage ? (
              <img
                src={currentImage}
                alt={auction.title}
                className="detail-image-img"
                onClick={() => setShowImageModal(true)}
              />
            ) : (
              <span className="detail-image-fallback">🔨</span>
            )}
            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  className="detail-image-arrow left"
                  onClick={showPrevImage}
                  aria-label="이전 이미지"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="detail-image-arrow right"
                  onClick={showNextImage}
                  aria-label="다음 이미지"
                >
                  ›
                </button>
              </>
            )}
          </div>
          {hasMultipleImages && (
            <div className="detail-image-dots">
              {auctionImages.map((_, i) => (
                <span
                  key={i}
                  className={`detail-image-dot ${i === currentImg ? "active" : ""}`}
                  onClick={() => setCurrentImg(i)}
                />
              ))}
            </div>
          )}
          {auction.description && (
            <div className="detail-desc-section">
              <div className="detail-desc-title">상세 설명</div>
              <div className="detail-desc-box">{auction.description}</div>
            </div>
          )}
        </div>

        {/* 오른쪽: 정보 + 입찰 */}
        <div className="detail-info-col">
          <div className="detail-info-title">
            {auction.title || "이름 없음"}
          </div>
          {isOwnAuction && (
            <div className="detail-owner-badge">내가 등록한 경매</div>
          )}
          {(auction.serverName || auction.categoryName) && (
            <div className="detail-series-id">
              {[auction.serverName, auction.categoryName]
                .filter(Boolean)
                .join(" · ")}
            </div>
          )}

          {!ended ? (
            <div className="detail-timer-row">
              <span className="detail-timer-dot" />
              <span className="detail-timer-label">남은 시간</span>
              <span className="detail-timer-value">{timeStr}</span>
            </div>
          ) : (
            <div className="detail-timer-row ended">
              <span className="detail-timer-label">경매 종료</span>
            </div>
          )}

          {/* 즉시낙찰가 — 진행 중일 때는 클릭 가능한 버튼으로 표시 */}
          {instantBuyPrice && !settled && (
            <div className="detail-stat-row">
              <span className="detail-stat-label">즉시낙찰가</span>
              <span
                className="detail-stat-value"
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                {fmt(instantBuyPrice)} <small>KRW</small>
                {canInstantBuy && (
                  <button
                    type="button"
                    onClick={() => setShowInstantBuyModal(true)}
                    disabled={closing}
                    style={{
                      marginLeft: 4,
                      padding: "2px 10px",
                      fontSize: 12,
                      fontWeight: 700,
                      background: "var(--color-accent, #f59e0b)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    즉시낙찰
                  </button>
                )}
              </span>
            </div>
          )}
          {settled && displayInstantBuyPrice && (
            <div className="detail-stat-row">
              <span className="detail-stat-label">낙찰가</span>
              <span className="detail-stat-value">
                {fmt(displayInstantBuyPrice)} <small>KRW</small>
              </span>
            </div>
          )}

          <div className="detail-stat-row">
            <span className="detail-stat-label">현재 최고 입찰가</span>
            <span className="detail-stat-value highlight">
              {fmt(currentBid)} <small>KRW</small>
            </span>
          </div>
          {/* 최고 입찰자 뱃지 — 가격 아래 별도 줄 */}
          {bids.length > 0 &&
            (() => {
              const topBid = bids[0];
              const topName = topBid?.bidderNickname || topBid?.bidder || "";
              if (!topName) return null;
              const isMe = !!myNickname && myNickname === topName;
              return (
                <div style={{ marginTop: -6, marginBottom: 4, paddingLeft: 2 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 10px",
                      fontSize: 12,
                      fontWeight: 700,
                      borderRadius: 20,
                      background: isMe
                        ? "var(--color-accent, #f59e0b)"
                        : "var(--bg-secondary, #2a2a3a)",
                      color: isMe ? "#fff" : "var(--text-secondary, #aaa)",
                    }}
                  >
                    👑 {isMe ? "내가 최고가" : topName}
                  </span>
                </div>
              );
            })()}

          {!ended && (
            <div className="detail-stat-row sub">
              <span className="detail-stat-label">최소 입찰 증가액</span>
              <span className="detail-stat-value sub">
                {fmt(minBidUnit)} <small>KRW</small>
                <small> (현재가 x 3% 이상)</small>
              </span>
            </div>
          )}

          {!ended && (
            <>
              <div className="detail-bid-input-row">
                <span className="detail-bid-input-label">입찰가 입력</span>
                <input
                  className="detail-bid-input"
                  placeholder={fmt(minBid)}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  inputMode="numeric"
                />
                <span className="detail-bid-input-suffix">원</span>
              </div>
              <div className="detail-action-row">
                <form onSubmit={handleBid} style={{ margin: 0 }}>
                  <button
                    type="submit"
                    className="detail-btn-outline"
                    disabled={bidding}
                  >
                    <span className="detail-btn-icon">⚔</span>
                    {bidding ? "처리 중..." : "입찰하기"}
                  </button>
                </form>
                {/* 즉시낙찰가 있으면 낙찰하기 버튼 표시 */}
                {!!instantBuyPrice && currentBid > 0 && (
                  <button
                    type="button"
                    className="detail-btn-outline"
                    disabled={closing}
                    onClick={handleClose}
                  >
                    <span className="detail-btn-icon">🏆</span>
                    {closing ? "처리 중..." : "낙찰하기"}
                  </button>
                )}
              </div>
            </>
          )}

          {/* 경매 종료 후 낙찰 버튼 (판매자 전용) */}
          {canCloseAuction && !!instantBuyPrice && (
            <button
              type="button"
              className="detail-btn-outline"
              style={{ width: "100%", marginTop: 10 }}
              disabled={closing}
              onClick={handleClose}
            >
              <span className="detail-btn-icon">🏆</span>
              {closing ? "처리 중..." : "낙찰하기"}
            </button>
          )}

          {settled && (
            <div className="detail-timer-row ended" style={{ marginTop: 10 }}>
              <span className="detail-timer-label">
                {iAmWinner ? "🎉 내가 낙찰받은 경매" : "경매종료"}
              </span>
            </div>
          )}

          {/* 입찰 내역 */}
          <div className="detail-bidlist-box">
            <div className="detail-bidlist-header">
              <span>입찰 내역</span>
              <span className={`detail-status-badge ${ended ? "ended" : ""}`}>
                {settled ? "낙찰완료" : ended ? "종료" : "진행 중"}
              </span>
            </div>

            {bids.length === 0 ? (
              <div className="detail-bidlist-empty">
                아직 입찰 내역이 없습니다.
              </div>
            ) : (
              <>
                <div className="detail-bidlist">
                  {visibleBids.map((bid, i) => {
                    const name = bid.bidderNickname || bid.bidder || "익명";
                    const isWinningBid =
                      bid.status === "WINNING" || bid.bidStatus === "WINNING";
                    return (
                      <div
                        key={bid.id ?? bid.bidId ?? i}
                        className="detail-bidlist-row"
                      >
                        <span className="detail-bid-avatar">
                          {name.charAt(0).toUpperCase()}
                        </span>
                        <div className="detail-bid-info">
                          <span className="detail-bid-name">{name}</span>
                          <span className="detail-bid-sub">
                            {isWinningBid ? "낙찰가" : "입찰완료"}
                          </span>
                        </div>
                        <span className="detail-bid-amount">
                          {fmt(bid.amount)} KRW
                        </span>
                      </div>
                    );
                  })}
                </div>
                {bids.length > 3 && (
                  <button
                    type="button"
                    className="detail-bidlist-more"
                    onClick={() => setShowBidModal(true)}
                  >
                    전체 내역 보기
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 이미지 모달 */}
      {showImageModal && hasAuctionImages && (
        <div
          className="detail-image-modal-overlay"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="detail-image-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="detail-image-modal-close"
              onClick={() => setShowImageModal(false)}
              aria-label="이미지 닫기"
            >
              ×
            </button>
            {hasMultipleImages && (
              <button
                type="button"
                className="detail-image-modal-arrow left"
                onClick={showPrevImage}
                aria-label="이전 이미지"
              >
                {"<"}
              </button>
            )}
            <img
              src={currentImage}
              alt={auction.title}
              className="detail-image-modal-img"
            />
            {hasMultipleImages && (
              <button
                type="button"
                className="detail-image-modal-arrow right"
                onClick={showNextImage}
                aria-label="다음 이미지"
              >
                {">"}
              </button>
            )}
            {hasMultipleImages && (
              <div className="detail-image-modal-count">
                {currentImg + 1} / {auctionImages.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 전체 입찰 내역 모달 */}
      {showBidModal && (
        <div
          className="bid-modal-overlay"
          onClick={() => setShowBidModal(false)}
        >
          <div className="bid-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="bid-modal-header">
              <span>전체 입찰 내역</span>
              <button
                type="button"
                className="bid-modal-close"
                onClick={() => setShowBidModal(false)}
                aria-label="닫기"
              >
                ×
              </button>
            </div>
            <div className="bid-modal-list">
              {bids.map((bid, i) => {
                const name = bid.bidderNickname || bid.bidder || "익명";
                const isWinningBid =
                  bid.status === "WINNING" || bid.bidStatus === "WINNING";
                const isTop = i === 0;
                return (
                  <div
                    key={bid.id ?? bid.bidId ?? i}
                    className={`bid-modal-row ${isTop ? "top" : ""}`}
                  >
                    <span className="bid-modal-avatar">
                      {name.charAt(0).toUpperCase()}
                    </span>
                    <div className="bid-modal-info">
                      <span className="bid-modal-name">{name}</span>
                      {(isTop || isWinningBid) && (
                        <span className="bid-modal-top-badge">
                          {isWinningBid ? "낙찰가" : "최고가"}
                        </span>
                      )}
                    </div>
                    <span className="bid-modal-amount">
                      {fmt(bid.amount)} KRW
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="bid-modal-footer">
              <span>현재가</span>
              <strong>{fmt(currentBid)} KRW</strong>
            </div>
          </div>
        </div>
      )}

      {/* 즉시낙찰 확인 모달 */}
      {showInstantBuyModal && (
        <div
          className="bid-modal-overlay"
          onClick={() => setShowInstantBuyModal(false)}
        >
          <div
            className="bid-modal-box"
            style={{ maxWidth: 360 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bid-modal-header">
              <span>즉시낙찰 확인</span>
              <button
                type="button"
                className="bid-modal-close"
                onClick={() => setShowInstantBuyModal(false)}
                aria-label="닫기"
              >
                ×
              </button>
            </div>
            <div style={{ padding: "20px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🏆</div>
              <p style={{ fontSize: 15, marginBottom: 8 }}>
                <strong>{fmt(instantBuyPrice)}원</strong>에 즉시낙찰
                하시겠습니까?
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary, #888)",
                  marginBottom: 20,
                }}
              >
                즉시낙찰은 취소할 수 없습니다.
              </p>
              <div
                style={{ display: "flex", gap: 10, justifyContent: "center" }}
              >
                <button
                  type="button"
                  className="detail-btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setShowInstantBuyModal(false)}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="detail-btn-outline"
                  style={{
                    flex: 1,
                    background: "var(--color-accent, #f59e0b)",
                    color: "#fff",
                    borderColor: "transparent",
                  }}
                  disabled={closing}
                  onClick={handleInstantBuy}
                >
                  {closing ? "처리 중..." : "즉시낙찰"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
