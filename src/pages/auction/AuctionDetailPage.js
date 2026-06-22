// AuctionDetailPage.js
import { useState, useEffect } from "react";
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

// AuctionDetailResDto 구조:
// { auctionId, item: { itemId, title, description, gameName, categoryName,
//   serverName, images: [], seller: { memberId, nickname } },
//   startPrice, currentPrice, instantBuyPrice, bidCount, endTime, status, winnerId }
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
    sellerNickname: item.seller?.nickname ?? "",
    endAt: data.endTime ?? data.endAt,
    currentBid: data.currentPrice ?? data.currentBid,
  };
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
  const [currentImg, setCurrentImg] = useState(0);
  const [closing, setClosing] = useState(false);

  // ── 경매 상세 조회 (입찰 목록 조회 API가 백엔드에 없어 bids는 비워둔 채 시작) ──
  useEffect(() => {
    setBids([]);

    AuctionApi.getAuction(auctionId)
      .then((r) => {
        const raw = r.data?.data || r.data;
        const d = normalizeAuction(raw);
        setAuction(d);
        setCurrentImg(0);
        setTimeStr(timeLeft(d?.endAt || d?.endTime));
      })
      .catch(() => navigate("/auctions"))
      .finally(() => setLoading(false));
  }, [auctionId]); // eslint-disable-line

  useEffect(() => {
    if (!auction) return;
    const timer = setInterval(
      () => setTimeStr(timeLeft(auction.endAt || auction.endTime)),
      1000,
    );
    return () => clearInterval(timer);
  }, [auction]);

  // 모달이 열려 있을 때 배경 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow =
      showBidModal || showImageModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showBidModal, showImageModal]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!showBidModal && !showImageModal) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setShowBidModal(false);
      if (e.key === "Escape") setShowImageModal(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showBidModal, showImageModal]);

  const fmt = (n) => Number(n || 0).toLocaleString("ko-KR");

  const addBidToList = (bidInfo) => {
    setBids((prev) => {
      const alreadyExists = prev.some(
        (b) =>
          b.amount === bidInfo.amount &&
          b.bidderNickname === bidInfo.bidderNickname,
      );
      if (alreadyExists) return prev;
      return [normalizeBid(bidInfo), ...prev];
    });
  };

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
      const bidResponse = await AuctionApi.placeBid(auctionId, amount);
      alert(`${amount.toLocaleString()}원 입찰 완료!`);
      setBidAmount("");

      const r = await AuctionApi.getAuction(auctionId);
      setAuction(normalizeAuction(r.data?.data || r.data));

      // 입찰 목록 조회 API가 없으므로, 방금 한 입찰 응답으로 직접 목록에 추가한다.
      const created = bidResponse?.data?.data ?? bidResponse?.data;
      addBidToList({
        id: created?.bidId ?? `local-${Date.now()}`,
        amount: created?.currentPrice ?? amount,
        bidderNickname:
          created?.bidderNickname ||
          user?.nickname ||
          user?.name ||
          user?.username ||
          "나",
      });
    } catch (err) {
      console.error("입찰 오류:", err.response?.data || err);
      alert(err.response?.data?.message || "입찰에 실패했습니다.");
    } finally {
      setBidding(false);
    }
  };
  const handleClose = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const myNickname = user?.nickname || user?.name || user?.username || "";
    const isAlreadyTopBidder =
      bids.length > 0 && bids[0]?.bidderNickname === myNickname;

    if (!ended) {
      if (isAlreadyTopBidder) {
        alert(
          "이미 최고 입찰자입니다. 경매가 종료되면 자동으로 낙찰 처리할 수 있습니다.",
        );
      } else if (instantBuyPrice) {
        // 최고 입찰자가 아닌 경우에만 즉시낙찰가로 구매 시도
        if (!window.confirm("즉시낙찰가로 구매하시겠습니까?")) return;
        setClosing(true);
        try {
          await AuctionApi.buyNow(auctionId, instantBuyPrice);
          await AuctionApi.settleAuction(auctionId);
          alert("낙찰 처리가 완료되었습니다.");
          const r = await AuctionApi.getAuction(auctionId);
          setAuction(normalizeAuction(r.data?.data || r.data));
        } catch (err) {
          console.error("낙찰 처리 오류:", err.response?.data || err);
          alert(err.response?.data?.message || "낙찰 처리에 실패했습니다.");
        } finally {
          setClosing(false);
        }
      } else {
        alert("즉시 낙찰가가 설정되지 않은 경매입니다.");
      }
      return;
    }

    // 경매가 이미 종료된 경우 → 정산만 진행
    if (!window.confirm("이 경매를 낙찰 처리하시겠습니까?")) return;
    setClosing(true);
    try {
      await AuctionApi.settleAuction(auctionId);
      alert("낙찰 처리가 완료되었습니다.");
      const r = await AuctionApi.getAuction(auctionId);
      setAuction(normalizeAuction(r.data?.data || r.data));
    } catch (err) {
      console.error("낙찰 처리 오류:", err.response?.data || err);
      alert(err.response?.data?.message || "낙찰 처리에 실패했습니다.");
    } finally {
      setClosing(false);
    }
  };

  // ── WebSocket 실시간 동기화 ──────────────────────────────────
  // BidService.placeBid()의 broadcastBid()가 보내는 AuctionBidBroadcastDto 구조:
  // { auctionId, currentPrice, bidCount, bidderId, bidderNickname, status, winnerId }
  useWebSocket(
    auctionId ? `/topic/auction/${auctionId}` : null,
    null,
    (msg) => {
      // 1. 경매 상태(현재가/입찰수/상태/낙찰자) 실시간 업데이트
      setAuction((prev) =>
        prev
          ? {
              ...prev,
              currentBid: msg.currentPrice ?? prev.currentBid,
              currentPrice: msg.currentPrice ?? prev.currentPrice,
              bidCount: msg.bidCount ?? prev.bidCount,
              status: msg.status ?? prev.status,
              winnerId: msg.winnerId ?? prev.winnerId,
            }
          : prev,
      );

      // 2. 새 입찰을 입찰 목록 맨 앞에 추가 (다른 사용자 화면에도 실시간으로 보이도록)
      if (msg.bidderId != null) {
        addBidToList({
          id: `ws-${msg.auctionId}-${Date.now()}`,
          amount: msg.currentPrice,
          bidderNickname: msg.bidderNickname,
        });
      }

      // 3. 경매가 종료 상태로 바뀌면 세부 정보 보강을 위해 한 번 더 재조회
      if (msg.status && msg.status !== "ONGOING") {
        AuctionApi.getAuction(auctionId)
          .then((r) => setAuction(normalizeAuction(r.data?.data || r.data)))
          .catch(() => {});
      }
    },
  );

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

  const ended = timeStr === "종료" || auction?.status === "ENDED";
  const currentBid = Number(
    auction.currentBid ||
      auction.currentPrice ||
      auction.startPrice ||
      auction.price ||
      0,
  );
  const minBidUnit = 100;
  const instantBuyPrice = auction.instantBuyPrice
    ? Number(auction.instantBuyPrice)
    : null;
  const minBid = currentBid + minBidUnit;
  const visibleBids = bids.slice(0, 3);
  const auctionImages = Array.isArray(auction.images) ? auction.images : [];
  const hasAuctionImages = auctionImages.length > 0 || !!auction.imageUrl;
  const hasMultipleImages = auctionImages.length > 1;
  const currentImage = auctionImages[currentImg] || auction.imageUrl;
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

  return (
    <div className="detail-wrap">
      <div className="breadcrumb">
        <Link to="/auctions">경매 목록</Link>
        <span>/</span>
        <span>{auction.game || ""}</span>
        <span>/</span>
        <span>{auction.title}</span>
      </div>

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

          {instantBuyPrice && (
            <div className="detail-stat-row">
              <span className="detail-stat-label">즉시낙찰가</span>
              <span className="detail-stat-value">
                {fmt(instantBuyPrice)} <small>KRW</small>
              </span>
            </div>
          )}

          <div className="detail-stat-row">
            <span className="detail-stat-label">현재 최고 입찰가</span>
            <span className="detail-stat-value highlight">
              {fmt(currentBid)} <small>KRW</small>
            </span>
          </div>

          <div className="detail-stat-row sub">
            <span className="detail-stat-label">최소 입찰 증가액</span>
            <span className="detail-stat-value sub">
              {fmt(minBidUnit)} <small>KRW</small>
            </span>
          </div>

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
                {instantBuyPrice && (
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

          {ended && !auction?.winnerId && (
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

          {/* 입찰 내역 (요약 - 최대 3개) */}
          <div className="detail-bidlist-box">
            <div className="detail-bidlist-header">
              <span>입찰 내역</span>
              <span className={`detail-status-badge ${ended ? "ended" : ""}`}>
                {ended ? "종료" : "진행 중"}
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
                          <span className="detail-bid-sub">입찰완료</span>
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
                      {isTop && (
                        <span className="bid-modal-top-badge">최고가</span>
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
    </div>
  );
}
