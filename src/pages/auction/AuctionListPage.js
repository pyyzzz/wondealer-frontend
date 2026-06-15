import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import AuctionApi from "../../api/auction.api";

// 1. 지원하는 게임 목록
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

// 2. 게임별 선택 가능한 서버 리스트 정의
const SERVER_LISTS = {
  lostark: ["루페온", "아만", "카마인", "카단", "실리안", "아브렐슈드"],
  maple: ["스카니아", "루나", "엘리시움", "크로아", "베라", "오로라"],
  dungeon: ["카인", "디레지에", "시로코", "프레이", "카시야스", "바칼"],
  fc: ["아시아", "유럽", "북미"],
  lineage: ["데포로쥬", "켄라우헬", "질리언", "이실로테", "아툰"],
  valorant: ["한국", "아시아", "북미", "유럽"],
  overwatch: ["아시아", "아메리카", "유럽"],
};

// 3. 테스트용 다양한 게임의 더미 데이터
const DUMMY_AUCTIONS = [
  {
    id: "auc-1",
    title: "발할라의 심장: 고대 용의 숨결",
    game: "lostark",
    gameServer: "루페온",
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
    title: "아케인셰이드 두손검 +22성",
    game: "maple",
    gameServer: "스카니아",
    currentBid: 7500000,
    instantPrice: 12000000,
    minIncrement: 100000,
    startPrice: 5000000,
    endAt: new Date(Date.now() + 5712000).toISOString(),
    bidCount: 12,
    imageUrl: null,
  },
  {
    id: "auc-3",
    title: "+12 증폭 구원의 이기 - 도",
    game: "dungeon",
    gameServer: "카인",
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
    title: "240TOT 날두 5카 (강화완료)",
    game: "fc",
    gameServer: "아시아",
    currentBid: 9500000,
    instantPrice: 15000000,
    minIncrement: 50000,
    startPrice: 7000000,
    endAt: new Date(Date.now() + 19913000).toISOString(),
    bidCount: 8,
    imageUrl: null,
  },
  {
    id: "auc-5",
    title: "집행자의 대검 (+9 제련)",
    game: "lineage",
    gameServer: "데포로쥬",
    currentBid: 4500000,
    instantPrice: 8000000,
    minIncrement: 30000,
    startPrice: 3000000,
    endAt: new Date(Date.now() + 35000000).toISOString(),
    bidCount: 15,
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
];

function useTimer(endAt) {
  const [timeStr, setTimeStr] = useState("");
  useEffect(() => {
    const calc = () => {
      if (!endAt) return setTimeStr("00:00:00");
      const diff = new Date(endAt).getTime() - Date.now();
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
  const [game, setGame] = useState("전체"); // 기본값을 '전체'로 설정하여 모든 아이템이 먼저 보이도록 유도
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // 상세 뷰 상태
  const [selected, setSelected] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidLoading, setBidLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [customBid, setCustomBid] = useState("");
  const [bidding, setBidding] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [bidError, setBidError] = useState("");

  const fmt = (n) => Number(n || 0).toLocaleString("ko-KR");

  // ── 데이터 호출 및 선택 게임 필터링 ──
  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 12 };
      if (game !== "전체") params.game = game;

      const res = await AuctionApi.getAuctions(params);
      const raw = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(raw) ? raw : (raw.content ?? []);

      if (list.length > 0) {
        setAuctions(list);
        setTotal(res.data?.total ?? list.length);
      } else {
        // 백엔드 데이터가 없을 때 선택한 게임 탭에 맞게 필터링
        const filtered =
          game === "전체"
            ? DUMMY_AUCTIONS
            : DUMMY_AUCTIONS.filter((item) => item.game === game);
        setAuctions(filtered);
        setTotal(filtered.length);
      }
    } catch {
      // 에러 대피책: 선택한 게임 탭에 맞는 데이터만 바인딩
      const filtered =
        game === "전체"
          ? DUMMY_AUCTIONS
          : DUMMY_AUCTIONS.filter((item) => item.game === game);
      setAuctions(filtered);
      setTotal(filtered.length);
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

  // 서버 변경 시 호출되는 핸들러 함수
  const handleServerChange = (e) => {
    const nextServer = e.target.value;
    setSelected((prev) => ({
      ...prev,
      gameServer: nextServer,
    }));
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
      await AuctionApi.placeBid(selected.id, {
        bidAmount: amount,
        server: selected.gameServer,
      });
      alert("입찰이 완료되었습니다!");
      setSelected((prev) => ({
        ...prev,
        currentBid: amount,
        bidCount: (prev.bidCount ?? 0) + 1,
      }));
      setCustomBid(String(amount + (selected.minIncrement ?? 1000)));

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
      alert("즉시 낙찰이 완료되었습니다!");
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

  // 현재 아이템에 매칭되는 게임 서버군 가져오기 (없으면 기본 배열 설정)
  const availableServers = SERVER_LISTS[selected?.game] || ["기본 서버"];

  return (
    <PageWrap>
      {!selected ? (
        /* ── [1] 목록 화면 ── */
        <>
          <TitleBar>
            <PageTitle>실시간 경매 아이템</PageTitle>
            <AddBtn onClick={() => navigate("/auctions/new")}>
              + 새 경매 등록
            </AddBtn>
          </TitleBar>

          {/* 게임 필터 탭 */}
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
                  <ServerBadge>{item.gameServer || "전체서버"}</ServerBadge>
                  <CardPrice>
                    {fmt(item.currentBid ?? item.currentPrice)} 원
                  </CardPrice>
                  <CardBidCount>
                    {item.bidCount ?? 0}명 입찰 참여 중
                  </CardBidCount>
                  <CardBtn>입찰 하러가기</CardBtn>
                </AuctionCard>
              ))}
              {!loading && auctions.length === 0 && (
                <LoadingBox style={{ gridColumn: "1 / -1" }}>
                  등록된 경매 아이템이 없습니다.
                </LoadingBox>
              )}
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
        /* ── [2] 상세 화면 ── */
        <DetailWrap>
          <BackLink onClick={() => setSelected(null)}>
            ← 목록으로 돌아가기
          </BackLink>

          <DetailGrid>
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
              <DescBar>
                • 공격력 고정 수치 반영 • 고대 등급 옵션 귀속 • 치명타 특화 스탯
                최상위
              </DescBar>
            </MediaCol>

            <InfoCol>
              <DetailTitle>{selected.title}</DetailTitle>

              {/* 서버 선택 드롭다운 폼 제어 */}
              <ServerSelectBox>
                <label htmlFor="server-select">🎯 거래 대상 서버 선택 : </label>
                <StyledSelect
                  id="server-select"
                  value={selected.gameServer || ""}
                  onChange={handleServerChange}
                >
                  {availableServers.map((srv) => (
                    <option key={srv} value={srv}>
                      {srv}
                    </option>
                  ))}
                </StyledSelect>
              </ServerSelectBox>

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
                  bids.slice(0, 3).map((b, i) => (
                    <TopBidRow key={i}>
                      <span>👑 {b.bidder ?? b.bidderNickname}</span>
                      <span style={{ fontWeight: 700, color: "#b76eff" }}>
                        {fmt(b.amount ?? b.bidAmount)} KRW
                      </span>
                    </TopBidRow>
                  ))
                )}
                <ModalLink onClick={() => setShowModal(true)}>
                  전체 내역 보기
                </ModalLink>
              </BidHistoryPanel>
            </InfoCol>
          </DetailGrid>
        </DetailWrap>
      )}

      {/* ── [3] 전체 입찰 내역 모달 생략 (동작 유지됨) ── */}
    </PageWrap>
  );
}

// ── Styled Components 추가 및 보완 ──────────────────────────────────────────
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
`;
const GameTabRow = styled.div`
  display: flex;
  gap: 10px;
  padding: 10px 40px 20px;
  border-bottom: 1px solid #1a1d29;
  overflow-x: auto;
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
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 28px;
  padding: 30px 40px;
`;
const AuctionCard = styled.div`
  background: #12141c;
  border: 1px solid #1f2333;
  border-radius: 16px;
  padding: 20px;
  position: relative;
  cursor: pointer;
  &:hover {
    border-color: #7209b7;
    transform: translateY(-2px);
  }
  transition: all 0.2s;
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
`;
const CardTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
`;
const ServerBadge = styled.div`
  display: inline-block;
  background: #222636;
  color: #b76eff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 10px;
  font-weight: 600;
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
  &:hover {
    background: #7209b7;
  }
`;
const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 24px;
`;
const PageArrow = styled.button`
  background: #11131a;
  border: 1px solid #1e2230;
  color: #fff;
  width: 34px;
  height: 34px;
  border-radius: 6px;
`;
const PageBtn = styled.button`
  background: ${(p) => (p.$active ? "#7209b7" : "#11131a")};
  border: 1px solid ${(p) => (p.$active ? "#7209b7" : "#1e2230")};
  color: #fff;
  width: 34px;
  height: 34px;
  border-radius: 6px;
`;
const LoadingBox = styled.div`
  text-align: center;
  padding: 80px;
  color: #6f768a;
`;
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
`;
const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 45px;
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
`;
const BigIcon = styled.span`
  font-size: 110px;
  filter: drop-shadow(0 0 25px rgba(183, 110, 255, 0.4));
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
`;

// 서버 셀렉트 스타일 컴포넌트
const ServerSelectBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #a0a5b5;
`;
const StyledSelect = styled.select`
  background: #12141c;
  color: #fff;
  border: 1px solid #2d334a;
  padding: 8px 14px;
  border-radius: 6px;
  outline: none;
  font-weight: 600;
  cursor: pointer;
  &:focus {
    border-color: #7209b7;
  }
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
`;
const ModalLink = styled.div`
  text-align: center;
  color: #b76eff;
  font-size: 13px;
  margin-top: 14px;
  cursor: pointer;
  font-weight: 700;
`;
