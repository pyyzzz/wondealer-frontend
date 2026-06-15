import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import AuctionApi from "../../api/auction.api";

const GAMES = [
  { key: "전체", label: "전체" },
  { key: "lostark", label: "LOST ARK" },
  { key: "maple", label: "MapleStory" },
  { key: "dungeon", label: "Dungeon & Fighter" },
  { key: "fc", label: "FC ONLINE" },
  { key: "lineage", label: "Lineage" },
  { key: "valorant", label: "Valorant" },
  { key: "overwatch", label: "Overwatch 2" },
];

const DUMMY_AUCTIONS = [
  {
    id: "auc-1",
    title: "발할라의 심장: 고대 용의 숨결",
    game: "lostark",
    gameServer: "VALHALLA-01",
    currentBid: 2850000,
    instantPrice: 5000000,
    minIncrement: 28586,
    startPrice: 1500000,
    endAt: new Date(Date.now() + 14753000).toISOString(),
    bidCount: 47,
    imageUrl: null,
  },
  {
    id: "auc-2",
    title: "천상의 불꽃 대검",
    game: "lostark",
    gameServer: "루페온",
    currentBid: 500000,
    instantPrice: 1200000,
    minIncrement: 10000,
    startPrice: 300000,
    endAt: new Date(Date.now() + 5712000).toISOString(),
    bidCount: 12,
    imageUrl: null,
  },
  {
    id: "auc-3",
    title: "영혼의 독요석 반지",
    game: "lostark",
    gameServer: "아만",
    currentBid: 1250000,
    instantPrice: 2000000,
    minIncrement: 15000,
    startPrice: 800000,
    endAt: new Date(Date.now() + 2193000).toISOString(),
    bidCount: 31,
    imageUrl: null,
  },
  {
    id: "auc-4",
    title: "정령의 속박 갑옷",
    game: "lostark",
    gameServer: "카마인",
    currentBid: 750000,
    instantPrice: 1500000,
    minIncrement: 12000,
    startPrice: 500000,
    endAt: new Date(Date.now() + 19913000).toISOString(),
    bidCount: 8,
    imageUrl: null,
  },
];

const DUMMY_BIDS = [
  { bidder: "K-Gamer***", amount: 2850000, time: "방금 전", status: "최고가" },
  {
    bidder: "ShadowV***",
    amount: 2420000,
    time: "15분 전",
    status: "상위입찰",
  },
  { bidder: "Knight***", amount: 2380000, time: "28분 전", status: "상위입찰" },
  {
    bidder: "ProTrad***",
    amount: 2350000,
    time: "44분 전",
    status: "상위입찰",
  },
  {
    bidder: "LootHun***",
    amount: 2300000,
    time: "1시간 전",
    status: "상위입찰",
  },
  {
    bidder: "Dungeon***",
    amount: 2250000,
    time: "1시간 전",
    status: "상위입찰",
  },
  {
    bidder: "RareFin***",
    amount: 2200000,
    time: "2시간 전",
    status: "상위입찰",
  },
  {
    bidder: "BossKil***",
    amount: 2160000,
    time: "3시간 전",
    status: "상위입찰",
  },
];

function useTimer(endAt) {
  const [timeStr, setTimeStr] = useState("");
  useEffect(() => {
    const calc = () => {
      if (!endAt) return setTimeStr("00:00:00");
      const diff = new Date(endAt) - Date.now();
      if (diff <= 0) return setTimeStr("종료");
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeStr(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endAt]);
  return timeStr;
}

function AuctionTimer({ endAt }) {
  const t = useTimer(endAt);
  return <>{t}</>;
}

export default function AuctionListPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState("lostark");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // 상세 뷰
  const [selected, setSelected] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidLoading, setBidLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [customBid, setCustomBid] = useState("");
  const [bidding, setBidding] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [bidError, setBidError] = useState("");

  const fmt = (n) => Number(n || 0).toLocaleString("ko-KR");

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 12 };
      if (game !== "전체") params.game = game;
      const res = await AuctionApi.getAuctions(params);
      const raw = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(raw) ? raw : (raw.content ?? []);
      setAuctions(list.length > 0 ? list : DUMMY_AUCTIONS);
      setTotal(
        res.data?.total ??
          res.data?.totalCount ??
          res.data?.totalElements ??
          list.length,
      );
    } catch {
      setAuctions(DUMMY_AUCTIONS);
      setTotal(DUMMY_AUCTIONS.length);
    } finally {
      setLoading(false);
    }
  }, [game, page]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const openDetail = async (auction) => {
    setSelected(auction);
    setCustomBid(
      String(
        (auction.currentBid ?? auction.currentPrice ?? 0) +
          (auction.minIncrement ?? 1000),
      ),
    );
    setBidError("");
    setBidLoading(true);
    try {
      const res = await AuctionApi.getAuctionBids(auction.id);
      const list = res.data?.data ?? res.data ?? [];
      setBids(list.length > 0 ? list : DUMMY_BIDS);
    } catch {
      setBids(DUMMY_BIDS);
    } finally {
      setBidLoading(false);
    }
  };

  const handleBid = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return navigate("/login");
    }
    const amount = Number(String(customBid).replace(/,/g, ""));
    const minBid =
      (selected.currentBid ?? selected.currentPrice ?? 0) +
      (selected.minIncrement ?? 1000);
    if (amount < minBid)
      return setBidError(`최소 입찰가는 ${fmt(minBid)}원입니다.`);

    setBidding(true);
    setBidError("");
    try {
      await AuctionApi.placeBid(selected.id, { bidAmount: amount });
      alert("입찰이 완료되었습니다!");
      setSelected((prev) => ({
        ...prev,
        currentBid: amount,
        bidCount: (prev.bidCount ?? 0) + 1,
      }));
      setCustomBid(String(amount + (selected.minIncrement ?? 1000)));
      // 입찰 내역 갱신
      const res = await AuctionApi.getAuctionBids(selected.id);
      const list = res.data?.data ?? res.data ?? [];
      setBids(list.length > 0 ? list : DUMMY_BIDS);
    } catch (err) {
      setBidError(
        err.response?.data?.message ?? "입찰 중 오류가 발생했습니다.",
      );
    } finally {
      setBidding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return navigate("/login");
    }
    if (
      !window.confirm(
        `${fmt(selected.instantPrice)}원에 즉시 낙찰하시겠습니까?`,
      )
    )
      return;

    setBuyingNow(true);
    setBidError("");
    try {
      await AuctionApi.buyNow(selected.id);
      alert("즉시 낙찰이 완료되었습니다! 마이페이지에서 거래를 확인하세요.");
      navigate("/mypage");
    } catch (err) {
      setBidError(
        err.response?.data?.message ?? "즉시 낙찰 중 오류가 발생했습니다.",
      );
    } finally {
      setBuyingNow(false);
    }
  };

  const totalPages = Math.ceil(total / 12) || 1;

  return (
    <PageWrap>
      {!selected ? (
        /* ── 목록 ── */
        <>
          <TitleBar>
            <PageTitle>실시간 경매 아이템</PageTitle>
            <AddBtn onClick={() => navigate("/auctions/new")}>
              + 새 경매 등록
            </AddBtn>
          </TitleBar>

          <GameTabRow>
            {GAMES.map((g) => (
              <GameTab
                key={g.key}
                $active={game === g.key}
                onClick={() => {
                  setGame(g.key);
                  setPage(1);
                }}
              >
                {g.label}
              </GameTab>
            ))}
          </GameTabRow>

          {loading ? (
            <LoadingBox>경매 데이터 파싱 중...</LoadingBox>
          ) : (
            <Grid>
              {auctions.map((item) => (
                <AuctionCard key={item.id} onClick={() => openDetail(item)}>
                  <TimerTag>
                    ⏰ <AuctionTimer endAt={item.endAt} />
                  </TimerTag>
                  <CardImg>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 52 }}>⚔️</span>
                    )}
                  </CardImg>
                  <CardTitle>{item.title}</CardTitle>
                  <CardPrice>
                    {fmt(item.currentBid ?? item.currentPrice)} 원
                  </CardPrice>
                  <CardBidCount>
                    {item.bidCount ?? 0}명 입찰 참여 중
                  </CardBidCount>
                  <CardBtn>입찰 하러가기</CardBtn>
                </AuctionCard>
              ))}
            </Grid>
          )}

          {totalPages > 1 && (
            <Pagination>
              <PageArrow
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ‹
              </PageArrow>
              {Array.from({ length: totalPages }, (_, i) => (
                <PageBtn
                  key={i + 1}
                  $active={page === i + 1}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </PageBtn>
              ))}
              <PageArrow
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                ›
              </PageArrow>
            </Pagination>
          )}
        </>
      ) : (
        /* ── 상세 ── */
        <DetailWrap>
          <BackLink onClick={() => setSelected(null)}>
            ← 목록으로 돌아가기
          </BackLink>

          <DetailGrid>
            {/* 좌측 */}
            <MediaCol>
              <DetailImgBox>
                {selected.imageUrl ? (
                  <img
                    src={selected.imageUrl}
                    alt={selected.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 12,
                    }}
                  />
                ) : (
                  <BigIcon>⚔️</BigIcon>
                )}
              </DetailImgBox>
              <DotRow>
                <DotActive />
                <Dot />
                <Dot />
              </DotRow>
              <DescBar>
                • 공격력 고정 수치 반영 • 고대 등급 옵션 귀속 • 치명타 특화 스탯
                최상위
              </DescBar>
            </MediaCol>

            {/* 우측 */}
            <InfoCol>
              <DetailTitle>{selected.title}</DetailTitle>
              <ServerTag>
                GAME SERVER :{" "}
                {selected.gameServer ?? selected.serverName ?? "-"}
              </ServerTag>

              <CountdownStrip>
                ⏳ 남은 시간 :{" "}
                <strong>
                  <AuctionTimer endAt={selected.endAt} />
                </strong>
              </CountdownStrip>

              <FinanceBox>
                <FinRow>
                  <FinLabel>즉시 낙찰 금액</FinLabel>
                  <FinInstant>{fmt(selected.instantPrice)} KRW</FinInstant>
                </FinRow>
                <FinRow>
                  <FinLabel>현재 최고 입찰가</FinLabel>
                  <FinCurrent>
                    {fmt(selected.currentBid ?? selected.currentPrice)} KRW
                  </FinCurrent>
                </FinRow>
                <FinRow>
                  <FinLabel>최소 입찰 증액</FinLabel>
                  <FinStep>+ {fmt(selected.minIncrement)} KRW</FinStep>
                </FinRow>

                <BidInputWrap>
                  <BidInputLabel>입찰가 입력</BidInputLabel>
                  <BidInput
                    type="number"
                    value={customBid}
                    onChange={(e) => setCustomBid(e.target.value)}
                  />
                  <BidUnit>KRW</BidUnit>
                </BidInputWrap>

                {bidError && <BidErrorBox>{bidError}</BidErrorBox>}

                <ActionBtns>
                  <BidBtn disabled={bidding} onClick={handleBid}>
                    {bidding ? "입찰 중..." : "🔨 입찰하기"}
                  </BidBtn>
                  {selected.instantPrice && (
                    <InstantBtn disabled={buyingNow} onClick={handleBuyNow}>
                      {buyingNow ? "처리 중..." : "⚡ 즉시 낙찰"}
                    </InstantBtn>
                  )}
                </ActionBtns>
              </FinanceBox>

              <BidHistoryPanel>
                <HistoryHeader>
                  <span style={{ fontWeight: 700 }}>실시간 입찰 현황</span>
                  <LiveBadge>LIVE</LiveBadge>
                </HistoryHeader>
                {bidLoading ? (
                  <div
                    style={{
                      color: "#888da8",
                      fontSize: 13,
                      padding: "10px 0",
                    }}
                  >
                    로딩 중...
                  </div>
                ) : (
                  bids.slice(0, 3).map((b, i) =>
                    i === 0 ? (
                      <TopBidRow key={i}>
                        <span>👑 {b.bidder ?? b.bidderNickname}</span>
                        <span style={{ fontWeight: 700, color: "#b76eff" }}>
                          {fmt(b.amount ?? b.bidAmount)} KRW
                        </span>
                      </TopBidRow>
                    ) : (
                      <NormalBidRow key={i}>
                        <span>{b.bidder ?? b.bidderNickname}</span>
                        <span>{fmt(b.amount ?? b.bidAmount)} KRW</span>
                      </NormalBidRow>
                    ),
                  )
                )}
                <ModalLink onClick={() => setShowModal(true)}>
                  전체 내역 보기
                </ModalLink>
              </BidHistoryPanel>

              <EscrowBanner>
                🔒 WONDEALER 에스크로 안전장치가 작동 중입니다. 낙찰 완료 전까지
                거래 대금은 안전하게 보호됩니다.
              </EscrowBanner>
            </InfoCol>
          </DetailGrid>
        </DetailWrap>
      )}

      {/* ── 전체 입찰 내역 모달 ── */}
      {showModal && (
        <Overlay onClick={() => setShowModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTop>
              <ModalTitle>전체 입찰 내역</ModalTitle>
              <CloseX onClick={() => setShowModal(false)}>✕</CloseX>
            </ModalTop>
            <ModalSub>
              총 {selected?.bidCount ?? bids.length}차례 입찰이 발생했습니다.
              최신 입찰가 순서로 표시됩니다.
            </ModalSub>

            <ModalTable>
              <thead>
                <tr>
                  <Th>입찰자</Th>
                  <Th>금액</Th>
                  <Th>시간</Th>
                  <Th>상태</Th>
                </tr>
              </thead>
              <tbody>
                {bids.map((b, i) => (
                  <tr
                    key={i}
                    style={{
                      background:
                        i === 0 ? "rgba(114,9,183,0.08)" : "transparent",
                    }}
                  >
                    <Td>
                      {i === 0 ? "👤 " : ""}
                      {b.bidder ?? b.bidderNickname} {i === 0 ? "(최고가)" : ""}
                    </Td>
                    <Td
                      style={
                        i === 0 ? { color: "#b76eff", fontWeight: 800 } : {}
                      }
                    >
                      {fmt(b.amount ?? b.bidAmount)} KRW
                    </Td>
                    <Td>{b.time ?? b.createdAt ?? "-"}</Td>
                    <Td>
                      {i === 0 ? (
                        <StatusBadge $green>● 최고가 갱신</StatusBadge>
                      ) : (
                        <span style={{ color: "#888da8", fontSize: 12 }}>
                          상위 입찰 발생
                        </span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </ModalTable>

            <ModalFooter>
              <span style={{ fontSize: 12, color: "#545a6e" }}>
                시작가: {fmt(selected?.startPrice)} KRW
              </span>
              <CloseBtn onClick={() => setShowModal(false)}>닫기</CloseBtn>
            </ModalFooter>
          </Modal>
        </Overlay>
      )}
    </PageWrap>
  );
}

// ── Styled Components ──────────────────────────────────────────
const PageWrap = styled.div`
  background: #090a0f;
  color: #f8f9fa;
  min-height: 100vh;
  font-family: "Noto Sans KR", sans-serif;
`;
const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px 40px 10px;
  @media (max-width: 768px) {
    padding: 24px 20px 10px;
  }
`;
const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
`;
const AddBtn = styled.button`
  background: linear-gradient(135deg, #7209b7, #f72585);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    opacity: 0.85;
  }
`;
const GameTabRow = styled.div`
  display: flex;
  gap: 10px;
  padding: 10px 40px 20px;
  border-bottom: 1px solid #1a1d29;
  overflow-x: auto;
  @media (max-width: 768px) {
    padding: 10px 20px 16px;
  }
`;
const GameTab = styled.button`
  background: ${(p) => (p.$active ? "#7209b7" : "#11131a")};
  color: ${(p) => (p.$active ? "#fff" : "#6f768a")};
  border: 1px solid ${(p) => (p.$active ? "#7209b7" : "#222636")};
  padding: 8px 18px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
  transition: all 0.2s;
  &:hover {
    border-color: #7209b7;
  }
`;
const LoadingBox = styled.div`
  text-align: center;
  padding: 80px;
  color: #6f768a;
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 28px;
  padding: 30px 40px;
  @media (max-width: 768px) {
    padding: 20px;
    gap: 16px;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
`;
const AuctionCard = styled.div`
  background: #12141c;
  border: 1px solid #1f2333;
  border-radius: 16px;
  padding: 20px;
  position: relative;
  cursor: pointer;
  transition:
    border-color 0.2s,
    transform 0.15s;
  &:hover {
    border-color: #7209b7;
    transform: translateY(-2px);
  }
`;
const TimerTag = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: #e63946;
  color: #fff;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
`;
const CardImg = styled.div`
  height: 150px;
  background: #090a0f;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  overflow: hidden;
`;
const CardTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.3;
`;
const CardPrice = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: #b76eff;
`;
const CardBidCount = styled.div`
  font-size: 12px;
  color: #6f768a;
  margin-top: 6px;
  margin-bottom: 14px;
`;
const CardBtn = styled.button`
  width: 100%;
  background: #1f2333;
  border: none;
  color: #fff;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  &:hover {
    background: #7209b7;
  }
`;
const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  flex-wrap: wrap;
`;
const PageArrow = styled.button`
  background: #11131a;
  border: 1px solid #1e2230;
  color: ${(p) => (p.disabled ? "#333" : "#fff")};
  width: 34px;
  height: 34px;
  border-radius: 6px;
  cursor: ${(p) => (p.disabled ? "default" : "pointer")};
  font-size: 18px;
`;
const PageBtn = styled.button`
  background: ${(p) => (p.$active ? "#7209b7" : "#11131a")};
  border: 1px solid ${(p) => (p.$active ? "#7209b7" : "#1e2230")};
  color: ${(p) => (p.$active ? "#fff" : "#6f768a")};
  width: 34px;
  height: 34px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
`;

// 상세
const DetailWrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;
const BackLink = styled.div`
  color: #b76eff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
  display: inline-block;
  &:hover {
    opacity: 0.8;
  }
`;
const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 45px;
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;
const MediaCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const DetailImgBox = styled.div`
  background: #12141c;
  border: 1px solid #1f2333;
  border-radius: 16px;
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  @media (max-width: 480px) {
    height: 240px;
  }
`;
const BigIcon = styled.span`
  font-size: 110px;
  filter: drop-shadow(0 0 25px rgba(183, 110, 255, 0.4));
`;
const DotRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`;
const DotActive = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #7209b7;
`;
const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #2d334a;
`;
const DescBar = styled.div`
  background: #12141c;
  border: 1px solid #1f2333;
  border-radius: 10px;
  padding: 16px;
  font-size: 13px;
  color: #a0a5b5;
  text-align: center;
`;
const InfoCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const DetailTitle = styled.h2`
  font-size: 24px;
  font-weight: 800;
  line-height: 1.3;
`;
const ServerTag = styled.div`
  color: #b76eff;
  font-size: 13px;
  font-weight: 700;
`;
const CountdownStrip = styled.div`
  background: rgba(230, 57, 70, 0.12);
  color: #ff6b6b;
  padding: 12px 18px;
  border-radius: 8px;
  font-size: 14px;
  strong {
    font-weight: 800;
  }
`;
const FinanceBox = styled.div`
  background: #12141c;
  border: 1px solid #1f2333;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;
const FinRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid #1f2333;
  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
  }
`;
const FinLabel = styled.span`
  color: #888e9e;
  font-size: 14px;
`;
const FinInstant = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
`;
const FinCurrent = styled.span`
  font-size: 22px;
  font-weight: 800;
  color: #b76eff;
`;
const FinStep = styled.span`
  font-size: 14px;
  color: #a0a5b5;
`;
const BidInputWrap = styled.div`
  position: relative;
  margin-top: 8px;
`;
const BidInputLabel = styled.label`
  position: absolute;
  left: 16px;
  top: 12px;
  font-size: 11px;
  color: #545a6e;
  font-weight: 700;
`;
const BidInput = styled.input`
  width: 100%;
  background: #090a0f;
  border: 1px solid #2d334a;
  border-radius: 8px;
  padding: 28px 70px 12px 16px;
  color: #fff;
  font-size: 20px;
  font-weight: 800;
  outline: none;
  box-sizing: border-box;
`;
const BidUnit = styled.span`
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-10%);
  color: #545a6e;
  font-weight: 700;
`;
const BidErrorBox = styled.div`
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  font-size: 12px;
  color: #ef4444;
`;
const ActionBtns = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 4px;
`;
const BidBtn = styled.button`
  flex: 1;
  background: #7209b7;
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  opacity: ${(p) => (p.disabled ? 0.6 : 1)};
  &:hover:not(:disabled) {
    opacity: 0.85;
  }
`;
const InstantBtn = styled.button`
  flex: 1;
  background: #2d334a;
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  opacity: ${(p) => (p.disabled ? 0.6 : 1)};
  &:hover:not(:disabled) {
    background: #f72585;
  }
`;
const BidHistoryPanel = styled.div`
  background: #12141c;
  border: 1px solid #1f2333;
  border-radius: 16px;
  padding: 20px;
`;
const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
`;
const LiveBadge = styled.span`
  background: #06d6a0;
  color: #fff;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 700;
`;
const TopBidRow = styled.div`
  display: flex;
  justify-content: space-between;
  background: #1c1f2c;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 8px;
`;
const NormalBidRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  font-size: 13px;
  color: #a0a5b5;
`;
const ModalLink = styled.div`
  text-align: center;
  color: #b76eff;
  font-size: 13px;
  margin-top: 14px;
  cursor: pointer;
  font-weight: 700;
  &:hover {
    text-decoration: underline;
  }
`;
const EscrowBanner = styled.div`
  background: #12141c;
  border: 1px solid #1f2333;
  padding: 14px 16px;
  border-radius: 8px;
  color: #06d6a0;
  font-size: 12px;
  line-height: 1.5;
`;

// 모달
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(5, 6, 8, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;
const Modal = styled.div`
  background: #12141c;
  border: 1px solid #2d334a;
  border-radius: 16px;
  width: 100%;
  max-width: 580px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 28px;
`;
const ModalTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;
const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
`;
const CloseX = styled.span`
  cursor: pointer;
  color: #545a6e;
  font-size: 20px;
  &:hover {
    color: #fff;
  }
`;
const ModalSub = styled.div`
  font-size: 13px;
  color: #888e9e;
  margin-bottom: 20px;
`;
const ModalTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;
const Th = styled.th`
  text-align: left;
  padding: 12px 10px;
  font-size: 12px;
  color: #545a6e;
  border-bottom: 1px solid #1f2333;
`;
const Td = styled.td`
  padding: 14px 10px;
  font-size: 13px;
  border-bottom: 1px solid #1f2333;
`;
const StatusBadge = styled.span`
  background: ${(p) => (p.$green ? "#06d6a0" : "#545a6e")};
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
`;
const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
`;
const CloseBtn = styled.button`
  background: #2d334a;
  color: #fff;
  border: none;
  padding: 8px 22px;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background: #7209b7;
  }
`;
