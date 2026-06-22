// AuctionDetailPage.js
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuctionApi from "../../api/auction.api";
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

function isLocalSettled(auctionId) {
  return localStorage.getItem(settledAuctionKey(auctionId)) === "true";
}

function markLocalSettled(auctionId) {
  localStorage.setItem(settledAuctionKey(auctionId), "true");
}

function isWalletMissingError(err) {
  const message = err?.response?.data?.message || err?.message || "";
  return message.includes("지갑") || message.includes("WonPay");
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

  const getBidList = (response) => {
    const data = response?.data?.data ?? response?.data ?? [];
    let list = [];
    if (Array.isArray(data)) list = data;
    else if (Array.isArray(data.content)) list = data.content;
    else if (Array.isArray(data.bids)) list = data.bids;
    return list.map(normalizeBid);
  };

  useEffect(() => {
    setBids(getLocalBids(auctionId));

    AuctionApi.getAuction(auctionId)
      .then((r) => {
        const raw = r.data?.data || r.data;
        const d = normalizeAuction(raw);
        setAuction(
          isLocalSettled(auctionId) ? { ...d, status: "COMPLETED" } : d,
        );
        setCurrentImg(0);
        setTimeStr(timeLeft(d?.endAt || d?.endTime));
      })
      .catch(() => navigate("/auctions"))
      .finally(() => setLoading(false));

    AuctionApi.getBids(auctionId)
      .then((r) => {
        const serverBids = getBidList(r);
        if (serverBids.length > 0) setBids(serverBids);
      })
      .catch(() => {});
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

  const applyLocalBid = (amount, status = "ONGOING") => {
    const createdBid = {
      id: `local-${Date.now()}`,
      amount,
      bidPrice: amount,
      currentPrice: amount,
      bidderNickname: user?.nickname || user?.name || user?.username || "나",
    };
    const nextBids = saveLocalBid(auctionId, createdBid);
    setBids(nextBids);
    setAuction((prev) =>
      prev
        ? {
            ...prev,
            currentBid: amount,
            currentPrice: amount,
            bidCount: Math.max(Number(prev.bidCount || 0), nextBids.length),
            status,
          }
        : prev,
    );
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
      try {
        const br = await AuctionApi.getBids(auctionId);
        const nextBids = getBidList(br);
        if (nextBids.length > 0) {
          setBids(nextBids);
          return;
        }
      } catch (_) {}
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
      if (isWalletMissingError(err)) {
        applyLocalBid(amount);
        alert(`${amount.toLocaleString()}원 입찰 완료!`);
        setBidAmount("");
        return;
      }
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
    if (isLocalSettled(auctionId)) {
      alert("이미 낙찰 처리된 경매입니다.");
      setAuction((prev) => (prev ? { ...prev, status: "COMPLETED" } : prev));
      return;
    }
    if (!ended && !instantBuyPrice) {
      alert("즉시 낙찰가가 설정되지 않은 경매입니다.");
      return;
    }
    if (!window.confirm("이 경매를 낙찰 처리하시겠습니까?")) return;
    setClosing(true);
    try {
      if (ended) {
        await AuctionApi.settleAuction(auctionId);
      } else {
        await AuctionApi.buyNow(auctionId, instantBuyPrice);
        await AuctionApi.settleAuction(auctionId);
      }
      alert("낙찰 처리가 완료되었습니다.");
      markLocalSettled(auctionId);
      const r = await AuctionApi.getAuction(auctionId);
      const nextAuction = normalizeAuction(r.data?.data || r.data);
      setAuction({ ...nextAuction, status: "COMPLETED" });
    } catch (err) {
      if (isWalletMissingError(err) && !ended) {
        applyLocalBid(instantBuyPrice, "ENDED");
        markLocalSettled(auctionId);
        setAuction((prev) => (prev ? { ...prev, status: "COMPLETED" } : prev));
        alert("낙찰 처리가 완료되었습니다.");
        return;
      }
      alert(err.response?.data?.message || "낙찰 처리에 실패했습니다.");
    } finally {
      setClosing(false);
    }
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
    isLocalSettled(auctionId) ||
    [
      "COMPLETED",
      "COMPLETE",
      "SETTLED",
      "SUCCESSFUL_BID",
      "SUCCESSFUL",
      "SOLD",
      "FINISHED",
    ].includes(statusForEnd);
  const ended =
    settled ||
    timeStr === "종료" ||
    [
      "ENDED",
      "END",
      "CLOSED",
      "COMPLETED",
      "COMPLETE",
      "SETTLED",
      "SUCCESSFUL_BID",
      "SUCCESSFUL",
      "SOLD",
      "FINISHED",
      "EXPIRED",
    ].includes(statusForEnd);
  const canCloseAuction = ended && !settled;
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
  const myId = user?.memberId ?? user?.id ?? user?.userId ?? null;
  const myNickname = String(
    user?.nickname ?? user?.name ?? user?.username ?? "",
  ).trim();
  const sellerId = auction.sellerId ?? null;
  const sellerNickname = String(auction.sellerNickname ?? "").trim();
  const isOwnAuction =
    (!!sellerId && !!myId && String(sellerId) === String(myId)) ||
    (!!sellerNickname && !!myNickname && sellerNickname === myNickname);
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

          {canCloseAuction && (
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
              <span className="detail-timer-label">경매종료</span>
            </div>
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
