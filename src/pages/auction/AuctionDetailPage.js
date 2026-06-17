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
  const [showAllBids, setShowAllBids] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    AuctionApi.getAuction(auctionId)
      .then((r) => {
        const d = r.data?.data || r.data;
        setAuction(d);
        setTimeStr(timeLeft(d?.endAt || d?.endTime));
      })
      .catch(() => navigate("/auctions"))
      .finally(() => setLoading(false));

    AuctionApi.getBids(auctionId)
      .then((r) => setBids(r.data?.data || r.data || []))
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

  const fmt = (n) => Number(n || 0).toLocaleString("ko-KR");

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
      const goInstant = window.confirm(
        `입찰 금액이 즉시 낙찰가(${fmt(instantBuyPrice)}원) 이상입니다.\n즉시 낙찰로 진행하시겠습니까?\n\n취소를 누르면 즉시 낙찰가보다 낮은 금액으로 다시 입력해주세요.`,
      );
      if (goInstant) {
        try {
          await AuctionApi.instantBuy(auctionId);
          alert("즉시 낙찰 완료!");
          navigate("/payment", { state: { item: auction } });
        } catch (err) {
          alert(err.response?.data?.message || "즉시 낙찰에 실패했습니다.");
        }
      }
      return;
    }
    setBidding(true);
    try {
      await AuctionApi.placeBid(auctionId, amount);
      alert(`${amount.toLocaleString()}원 입찰 완료!`);
      setBidAmount("");
      const r = await AuctionApi.getAuction(auctionId);
      setAuction(r.data?.data || r.data);
      const br = await AuctionApi.getBids(auctionId);
      setBids(br.data?.data || br.data || []);
    } catch (err) {
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
    if (!window.confirm("이 경매를 낙찰 처리하시겠습니까?")) return;
    setClosing(true);
    try {
      await AuctionApi.closeAuction(auctionId);
      alert("낙찰 처리가 완료되었습니다.");
      const r = await AuctionApi.getAuction(auctionId);
      setAuction(r.data?.data || r.data);
    } catch (err) {
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
          color: "var(--text-faint)",
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
          color: "var(--text-faint)",
        }}
      >
        경매를 찾을 수 없습니다.
      </div>
    );

  const ended = timeStr === "종료";
  const currentBid = Number(
    auction.currentBid || auction.startPrice || auction.price || 0,
  );
  const minBidUnit = Number(auction.minBidUnit || 1000);
  const instantBuyPrice = auction.instantBuyPrice
    ? Number(auction.instantBuyPrice)
    : null;
  const rawMinBid = currentBid + minBidUnit;
  // 즉시낙찰가가 일반 최소입찰가보다 낮게 설정된 경우, 즉시낙찰가를 최소입찰가로 사용
  const minBid =
    instantBuyPrice && rawMinBid > instantBuyPrice
      ? instantBuyPrice
      : rawMinBid;

  return (
    <div className="detail-wrap">
      <div className="breadcrumb">
        <Link to="/auctions">경매 목록</Link>
        <span>/</span>
        <span>{auction.game}</span>
        <span>/</span>
        <span>{auction.title}</span>
      </div>

      <div className="detail-grid">
        <div>
          <div className="detail-image-box">
            {auction.imageUrl ? (
              <img
                src={auction.imageUrl}
                alt={auction.title}
                className="detail-image-img"
              />
            ) : (
              <span className="detail-image-fallback">🔨</span>
            )}
          </div>
          {Array.isArray(auction.images) && auction.images.length > 1 && (
            <div className="detail-image-dots">
              {auction.images.map((_, i) => (
                <span
                  key={i}
                  className={`detail-image-dot ${i === 0 ? "active" : ""}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="detail-info-col">
          <div className="detail-info-title">{auction.title}</div>
          {auction.seriesId && (
            <div className="detail-series-id">시리즈ID: {auction.seriesId}</div>
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

          {auction.instantBuyPrice && (
            <div className="detail-stat-row">
              <span className="detail-stat-label">즉시낙찰가</span>
              <span className="detail-stat-value">
                {fmt(auction.instantBuyPrice)} <small>KRW</small>
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
              {fmt(auction.minBidUnit || 1000)} <small>KRW</small>
            </span>
          </div>

          {!ended && (
            <>
              <div className="detail-bid-input-row">
                <span className="detail-bid-input-label">입찰가 입력</span>
                <input
                  className="detail-bid-input"
                  placeholder={`${fmt(minBid)}`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                />
              </div>
              {auction.instantBuyPrice &&
                parseInt(bidAmount.replace(/,/g, ""), 10) >=
                  auction.instantBuyPrice && (
                  <div className="detail-bid-hint">
                    즉시 낙찰가({fmt(auction.instantBuyPrice)}원) 이상입니다.
                    입찰하기를 누르면 즉시 낙찰로 안내됩니다.
                  </div>
                )}

              <div className="detail-action-row">
                <form onSubmit={handleBid} className="detail-action-item">
                  <button
                    type="submit"
                    className="detail-btn-outline"
                    disabled={bidding}
                  >
                    <span className="detail-btn-icon">⚔</span>
                    {bidding ? "처리 중..." : "입찰하기"}
                  </button>
                </form>
                <div className="detail-action-item">
                  <button
                    type="button"
                    className="detail-btn-outline"
                    disabled={closing}
                    onClick={handleClose}
                  >
                    <span className="detail-btn-icon">🏆</span>
                    {closing ? "처리 중..." : "낙찰하기"}
                  </button>
                </div>
              </div>
            </>
          )}

          {!ended && auction.instantBuyPrice && (
            <button
              className="detail-btn-instant"
              onClick={async () => {
                if (!isLoggedIn) {
                  navigate("/login");
                  return;
                }
                if (
                  !window.confirm(
                    `${fmt(auction.instantBuyPrice)}원에 즉시 낙찰하시겠습니까?`,
                  )
                )
                  return;
                try {
                  await AuctionApi.instantBuy(auctionId);
                  alert("즉시 낙찰 완료!");
                  navigate("/payment", { state: { item: auction } });
                } catch (err) {
                  alert(
                    err.response?.data?.message || "즉시 낙찰에 실패했습니다.",
                  );
                }
              }}
            >
              ⚡ 즉시 낙찰 ({fmt(auction.instantBuyPrice)}원)
            </button>
          )}

          {ended && (
            <button
              type="button"
              className="detail-btn-outline"
              style={{ width: "100%" }}
              disabled={closing}
              onClick={handleClose}
            >
              <span className="detail-btn-icon">🏆</span>
              {closing ? "처리 중..." : "낙찰하기"}
            </button>
          )}

          {/* 입찰 내역 */}
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
                  {(showAllBids ? bids : bids.slice(0, 3)).map((bid, i) => {
                    const name = bid.bidderNickname || bid.bidder || "익명";
                    return (
                      <div key={bid.id || i} className="detail-bidlist-row">
                        <span className="detail-bid-avatar">
                          {name.charAt(0).toUpperCase()}
                        </span>
                        <span className="detail-bid-name">{name}</span>
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
                    onClick={() => setShowAllBids((v) => !v)}
                  >
                    {showAllBids ? "접기" : "전체 내역 보기"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {auction.details && (
        <div className="detail-desc-section">
          <div className="detail-desc-title">상세 설명</div>
          <div className="detail-desc-box">{auction.details}</div>
        </div>
      )}
    </div>
  );
}
