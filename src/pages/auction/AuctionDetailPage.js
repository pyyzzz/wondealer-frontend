import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuctionApi from '../../api/auction.api';
import './auction.css';

function timeLeft(endAt) {
  if (!endAt) return '정보 없음';
  const diff = new Date(endAt) - Date.now();
  if (diff <= 0) return '종료';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 24) return `${Math.floor(h/24)}일 ${h%24}시간`;
  return `${h}시간 ${m}분 ${s}초`;
}

export default function AuctionDetailPage() {
  const { auctionId } = useParams();
  const navigate      = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [auction, setAuction]   = useState(null);
  const [bids, setBids]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding]   = useState(false);
  const [timeStr, setTimeStr]   = useState('');

  useEffect(() => {
    AuctionApi.getAuction(auctionId)
      .then(r => {
        const d = r.data?.data || r.data;
        setAuction(d);
        setTimeStr(timeLeft(d?.endAt || d?.endTime));
      })
      .catch(() => navigate('/auctions'))
      .finally(() => setLoading(false));

    AuctionApi.getBids(auctionId)
      .then(r => setBids(r.data?.data || r.data || []))
      .catch(() => {});
  }, [auctionId]); // eslint-disable-line

  useEffect(() => {
    if (!auction) return;
    const timer = setInterval(() => setTimeStr(timeLeft(auction.endAt || auction.endTime)), 1000);
    return () => clearInterval(timer);
  }, [auction]);

  const handleBid = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { navigate('/login'); return; }
    const amount = parseInt(bidAmount.replace(/,/g, ''), 10);
    if (!amount || amount <= 0) return;
    setBidding(true);
    try {
      await AuctionApi.placeBid(auctionId, amount);
      alert(`${amount.toLocaleString()}원 입찰 완료!`);
      setBidAmount('');
      const r = await AuctionApi.getAuction(auctionId);
      setAuction(r.data?.data || r.data);
    } catch (err) {
      alert(err.response?.data?.message || '입찰에 실패했습니다.');
    } finally {
      setBidding(false);
    }
  };

  const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');

  if (loading) return <div style={{ textAlign:'center', padding:'80px', color:'var(--text-faint)' }}>로딩 중...</div>;
  if (!auction) return <div style={{ textAlign:'center', padding:'80px', color:'var(--text-faint)' }}>경매를 찾을 수 없습니다.</div>;

  const ended = timeStr === '종료';
  const currentBid = auction.currentBid || auction.startPrice || auction.price || 0;
  const minBid = currentBid + (auction.minBidUnit || 1000);

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
          <div className="detail-image-box" style={{ fontSize: 80 }}>{auction.imageUrl || '🔨'}</div>
          {/* 입찰 내역 */}
          {bids.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>입찰 내역</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {bids.slice(0, 5).map((bid, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-container)', border: '1px solid var(--border-color)', borderRadius: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{bid.bidderNickname || bid.bidder}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>{fmt(bid.amount)}원</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, background: ended ? 'rgba(244,63,94,.1)' : 'rgba(78,222,163,.1)', color: ended ? 'var(--color-danger)' : 'var(--color-secondary)', padding: '3px 10px', borderRadius: 6, fontWeight: 700 }}>
              {ended ? '종료' : '진행 중'}
            </span>
          </div>
          <div className="detail-info-title">{auction.title}</div>

          <table className="detail-meta-table">
            <tbody>
              {[
                { label: '게임',     val: auction.game },
                { label: '서버',     val: auction.gameServer },
                { label: '카테고리', val: auction.category },
                { label: '판매자',   val: auction.seller || auction.sellerNickname },
                { label: '입찰 수',  val: auction.bidCount ? `${auction.bidCount}회` : '0회' },
                { label: '등록일',   val: auction.createdAt ? auction.createdAt.split('T')[0] : '' },
              ].filter(m => m.val).map(m => (
                <tr key={m.label}><td className="detail-meta-label">{m.label}</td><td className="detail-meta-val">{m.val}</td></tr>
              ))}
            </tbody>
          </table>

          {/* 가격 정보 */}
          <div className="detail-price-box">
            <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 4 }}>현재 최고가</div>
            <div className="detail-price-main">{fmt(currentBid)}원</div>
            {auction.instantBuyPrice && (
              <div style={{ fontSize: 12, color: 'var(--color-secondary)', marginTop: 6 }}>즉시 낙찰가: {fmt(auction.instantBuyPrice)}원</div>
            )}
          </div>

          {/* 남은 시간 */}
          {!ended && (
            <div style={{ padding: '12px 16px', background: 'rgba(192,193,255,.06)', border: '1px solid rgba(192,193,255,.2)', borderRadius: 10, marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>남은 시간</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'monospace' }}>{timeStr}</div>
            </div>
          )}

          {/* 입찰 폼 */}
          {!ended && (
            <form onSubmit={handleBid} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                style={{ flex: 1, padding: '10px 14px', background: 'var(--bg-container-high)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 14 }}
                placeholder={`최소 ${fmt(minBid)}원 이상`}
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
              />
              <button type="submit" className="detail-btn-buy" style={{ width: 'auto', padding: '0 20px' }} disabled={bidding}>
                {bidding ? '처리 중...' : '입찰하기'}
              </button>
            </form>
          )}

          {/* 즉시 낙찰 */}
          {!ended && auction.instantBuyPrice && (
            <button className="detail-btn-chat" style={{ width: '100%', color: 'var(--color-secondary)', borderColor: 'rgba(78,222,163,.3)' }}
              onClick={async () => {
                if (!isLoggedIn) { navigate('/login'); return; }
                if (!window.confirm(`${fmt(auction.instantBuyPrice)}원에 즉시 낙찰하시겠습니까?`)) return;
                try { await AuctionApi.instantBuy(auctionId); alert('즉시 낙찰 완료!'); navigate('/payment', { state: { item: auction } }); }
                catch (err) { alert(err.response?.data?.message || '즉시 낙찰에 실패했습니다.'); }
              }}>
              ⚡ 즉시 낙찰 ({fmt(auction.instantBuyPrice)}원)
            </button>
          )}

          {ended && (
            <div style={{ padding: '12px', background: 'rgba(244,63,94,.08)', border: '1px solid rgba(244,63,94,.2)', borderRadius: 10, fontSize: 13, color: 'var(--color-danger)', textAlign: 'center' }}>
              경매가 종료되었습니다.
            </div>
          )}
        </div>
      </div>

      {auction.details && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '24px 0 10px' }}>상품 설명</div>
          <div className="detail-desc-box">{auction.details}</div>
        </div>
      )}
    </div>
  );
}
