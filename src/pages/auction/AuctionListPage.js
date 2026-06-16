import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { useAuth } from "../../context/AuthContext";
import AuctionApi from "../../api/auction.api";
import ItemApi from "../../api/item.api";

const DUMMY_BIDS = [
  {
    bidderNickname: "K-Gamer***",
    amount: 2850000,
    time: "2분 전",
    isBest: true,
  },
  { bidderNickname: "ShadowV***", amount: 2420000, time: "15분 전" },
  { bidderNickname: "Knight***", amount: 2380000, time: "28분 전" },
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
  return <>{useTimer(endAt)}</>;
}

function BidHistoryModal({ bids, startPrice, onClose }) {
  const fmt = (n) => Number(n || 0).toLocaleString("ko-KR");
  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>전체 입찰 내역</ModalTitle>
          <ModalMeta>
            총 입찰자 수: <strong>{bids.length}명</strong>
          </ModalMeta>
          <ModalClose onClick={onClose}>✕</ModalClose>
        </ModalHeader>
        <ModalTableWrap>
          <ModalTable>
            <thead>
              <tr>
                <th>입찰자</th>
                <th>입찰 금액</th>
                <th>입찰 시간</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {bids.map((b, i) => (
                <tr key={i} className={i === 0 ? "best" : ""}>
                  <td>
                    <BidderCell>
                      <Avatar $color={i === 0 ? "#6c5ce7" : "#2d3050"}>
                        {(b.bidderNickname || "?")[0]}
                      </Avatar>
                      {b.bidderNickname || "익명"}
                    </BidderCell>
                  </td>
                  <td className="amount">{fmt(b.amount)} KRW</td>
                  <td className="time">{b.time || "-"}</td>
                  <td>
                    {i === 0 ? (
                      <StatusPill $type="best">최고가</StatusPill>
                    ) : (
                      <StatusPill $type="normal">입찰 중</StatusPill>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </ModalTable>
        </ModalTableWrap>
        <ModalFooter>
          <span>
            시작가 <strong>{fmt(startPrice)} KRW</strong>
          </span>
          <CloseBtn onClick={onClose}>닫기</CloseBtn>
        </ModalFooter>
      </ModalBox>
    </ModalOverlay>
  );
}

export default function AuctionListPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [games, setGames] = useState([{ id: null, name: "전체" }]);
  const [servers, setServers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [gameId, setGameId] = useState(null);
  const [serverId, setServerId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selected, setSelected] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidLoading, setBidLoading] = useState(false);
  const [customBid, setCustomBid] = useState("");
  const [bidding, setBidding] = useState(false);
  const [bidError, setBidError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const fmt = (n) => Number(n || 0).toLocaleString("ko-KR");

  /* 게임 목록 */
  useEffect(() => {
    ItemApi.getGames()
      .then((r) => {
        const list = r.data?.data || [];
        console.log("[games] 응답:", list);
        setGames([
          { id: null, name: "전체" },
          ...list.map((g) => ({ id: g.gameId, name: g.gameName })),
        ]);
      })
      .catch((err) => {
        console.error("[games] 에러:", err);
        setGames([{ id: null, name: "전체" }]);
      });
  }, []);

  /* 게임 선택 → 서버·카테고리 */
  useEffect(() => {
    setServerId(null);
    setCategoryId(null);
    setServers([]);
    setCategories([]);
    setPage(1);

    console.log("[gameId 변경됨]", gameId, typeof gameId);

    if (gameId === null || gameId === undefined) return;

    ItemApi.getGameServers(gameId)
      .then((r) => {
        console.log("[servers] 응답:", r.data);
        const list = r.data?.data ?? r.data ?? [];
        setServers([
          { id: null, name: "전체" },
          ...list.map((s) => ({
            id: s.serverId ?? s.id,
            name: s.serverName ?? s.name,
          })),
        ]);
      })
      .catch((err) => {
        console.error(
          "[servers] 에러:",
          err.response?.status,
          err.response?.data,
          err.message,
        );
        setServers([]);
      });

    ItemApi.getCategories(gameId)
      .then((r) => {
        console.log("[categories] 응답:", r.data);
        const list = r.data?.data ?? r.data ?? [];
        setCategories([
          { id: null, name: "전체" },
          ...list.map((c) => ({
            id: c.categoryId ?? c.id,
            name: c.categoryName ?? c.name,
          })),
        ]);
      })
      .catch((err) => {
        console.error(
          "[categories] 에러:",
          err.response?.status,
          err.response?.data,
          err.message,
        );
        setCategories([]);
      });
  }, [gameId]);

  /* 경매 목록 조회 */
  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page - 1,
        size: 12,
        ...(gameId != null && { gameId }),
        ...(serverId != null && { serverId }),
        ...(categoryId != null && { categoryId }),
        ...(keyword && { keyword }),
      };
      const res = await AuctionApi.getAuctions(params);
      const data = res.data?.data ?? {};
      setAuctions(data.content ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error("[auctions] 에러:", err);
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  }, [gameId, serverId, categoryId, keyword, page]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const openDetail = async (auction) => {
    setSelected(auction);
    setActiveImg(0);
    setCustomBid(
      String((auction.currentPrice ?? auction.startPrice ?? 0) + 100),
    );
    setBidError("");
    setBidLoading(true);
    try {
      const res = await AuctionApi.getBids(auction.auctionId);
      setBids(res.data?.data ?? DUMMY_BIDS);
    } catch {
      setBids(DUMMY_BIDS);
    } finally {
      setBidLoading(false);
    }
  };

  const handleBid = async () => {
    if (!isLoggedIn) return navigate("/login");
    const amount = Number(customBid);
    const currentPrice = selected.currentPrice ?? selected.startPrice ?? 0;
    if (!amount || amount <= 0)
      return setBidError("입찰 금액을 입력해 주세요.");
    if (amount <= currentPrice)
      return setBidError(
        `현재 최고가(${fmt(currentPrice)}원)보다 높아야 합니다.`,
      );
    setBidError("");
    setBidding(true);
    try {
      await AuctionApi.placeBid(selected.auctionId, amount);
      alert("입찰 완료!");
      openDetail(selected);
    } catch (err) {
      setBidError(err.response?.data?.message ?? "입찰에 실패했습니다.");
    } finally {
      setBidding(false);
    }
  };

  const handleInstantBuy = async () => {
    if (!isLoggedIn) return navigate("/login");
    if (
      !window.confirm(
        `${fmt(selected.instantBuyPrice)}원에 즉시 낙찰하시겠습니까?`,
      )
    )
      return;
    try {
      await AuctionApi.instantBuy(selected.auctionId);
      alert("즉시 낙찰 완료!");
      navigate("/payment", { state: { item: selected } });
    } catch (err) {
      alert(err.response?.data?.message || "즉시 낙찰에 실패했습니다.");
    }
  };

  if (!selected)
    return (
      <PageWrap>
        <TopGameBar>
          {games.map((g) => (
            <TopGameTab
              key={g.id ?? "all"}
              $active={gameId === g.id}
              onClick={() => {
                console.log("[클릭] 게임 선택:", g.id, g.name);
                setGameId(g.id);
                setPage(1);
              }}
            >
              {g.name}
            </TopGameTab>
          ))}
        </TopGameBar>

        <ContentRow>
          <Sidebar>
            {servers.length > 0 && (
              <SideSection>
                <SideLabel>서버</SideLabel>
                {servers.map((s) => (
                  <SideItem
                    key={s.id ?? "all-s"}
                    $active={serverId === s.id}
                    onClick={() => {
                      setServerId(s.id);
                      setPage(1);
                    }}
                  >
                    {s.name}
                  </SideItem>
                ))}
              </SideSection>
            )}
            {categories.length > 0 && (
              <SideSection>
                <SideLabel>카테고리</SideLabel>
                {categories.map((c) => (
                  <SideItem
                    key={c.id ?? "all-c"}
                    $active={categoryId === c.id}
                    onClick={() => {
                      setCategoryId(c.id);
                      setPage(1);
                    }}
                  >
                    {c.name}
                  </SideItem>
                ))}
              </SideSection>
            )}
            {gameId == null && (
              <SideEmpty>
                상단에서 게임을 선택하면
                <br />
                서버·카테고리 필터가 표시됩니다.
              </SideEmpty>
            )}
            {gameId != null &&
              servers.length === 0 &&
              categories.length === 0 && (
                <SideEmpty>
                  필터를 불러오는 중이거나
                  <br />
                  해당 게임에 데이터가 없습니다.
                </SideEmpty>
              )}
          </Sidebar>

          <MainArea>
            <ListTopBar>
              <PageTitle>실시간 경매 아이템</PageTitle>
              <ListTopRight>
                <SearchBox
                  placeholder="아이템, 키워드로 검색"
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setPage(1);
                  }}
                />
                <AddBtn onClick={() => navigate("/auctions/new")}>
                  + 새 경매 등록
                </AddBtn>
              </ListTopRight>
            </ListTopBar>

            {loading ? (
              <LoadingBox>
                <LoadingSpinner />
                <p style={{ marginTop: 16, color: "#555a75" }}>
                  경매 아이템을 불러오는 중...
                </p>
              </LoadingBox>
            ) : auctions.length === 0 ? (
              <EmptyBox>
                <EmptyIcon>🔍</EmptyIcon>
                <p>등록된 경매 아이템이 없습니다.</p>
              </EmptyBox>
            ) : (
              <Grid>
                {auctions.map((item) => (
                  <AuctionCard
                    key={item.auctionId}
                    onClick={() => openDetail(item)}
                  >
                    <TimerBadge>
                      ⏱ <AuctionTimer endAt={item.endTime} />
                    </TimerBadge>
                    <CardImgWrap>
                      {item.thumbnailImg ? (
                        <img
                          src={item.thumbnailImg}
                          alt={item.itemTitle}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <CardPlaceholder>⚔️</CardPlaceholder>
                      )}
                    </CardImgWrap>
                    <CardBody>
                      <CardGameTag>{item.gameName || "게임"}</CardGameTag>
                      <CardTitle>{item.itemTitle}</CardTitle>
                      <CardMeta>
                        {[item.serverName, item.categoryName]
                          .filter(Boolean)
                          .join(" · ")}
                      </CardMeta>
                      <CardPriceRow>
                        <div>
                          <CardPriceLabel>현재가</CardPriceLabel>
                          <CardPrice>
                            {fmt(item.currentPrice ?? item.startPrice)}
                            <span>원</span>
                          </CardPrice>
                        </div>
                        {item.instantBuyPrice && (
                          <div style={{ textAlign: "right" }}>
                            <CardPriceLabel>즉시낙찰</CardPriceLabel>
                            <CardInstant>
                              {fmt(item.instantBuyPrice)}원
                            </CardInstant>
                          </div>
                        )}
                      </CardPriceRow>
                      <CardBtn>입찰 하러가기</CardBtn>
                    </CardBody>
                  </AuctionCard>
                ))}
              </Grid>
            )}

            {totalPages > 1 && (
              <Pagination>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PageBtn
                    key={i + 1}
                    $active={page === i + 1}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </PageBtn>
                ))}
              </Pagination>
            )}
          </MainArea>
        </ContentRow>
      </PageWrap>
    );

  const currentPrice = selected.currentPrice ?? selected.startPrice ?? 0;
  const minBid = currentPrice + (selected.minBidUnit || 100);
  const images =
    selected.images ?? (selected.thumbnailImg ? [selected.thumbnailImg] : []);

  return (
    <PageWrap>
      {showModal && (
        <BidHistoryModal
          bids={bids}
          startPrice={selected.startPrice}
          onClose={() => setShowModal(false)}
        />
      )}
      <DetailWrap>
        <Breadcrumb>
          <BreadItem onClick={() => setSelected(null)}>경매 목록</BreadItem>
          <BreadSep>/</BreadSep>
          <BreadItem>{selected.gameName || "경매"}</BreadItem>
          <BreadSep>/</BreadSep>
          <BreadCurrent>{selected.itemTitle}</BreadCurrent>
        </Breadcrumb>

        <DetailGrid>
          <LeftCol>
            <ImgMain>
              {images[activeImg] ? (
                <img
                  src={images[activeImg]}
                  alt="item"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    borderRadius: 12,
                  }}
                />
              ) : (
                <BigEmoji>⚔️</BigEmoji>
              )}
              <RarityBadge>전설</RarityBadge>
            </ImgMain>
            {images.length > 1 && (
              <ImgDots>
                {images.map((_, i) => (
                  <ImgDot
                    key={i}
                    $active={i === activeImg}
                    onClick={() => setActiveImg(i)}
                  />
                ))}
              </ImgDots>
            )}
            {selected.description && (
              <DescBox>
                <DescTitle>▸ 상세 설명</DescTitle>
                <DescText>{selected.description}</DescText>
              </DescBox>
            )}
            {(
              selected.stats || [
                { label: "공격력", val: "+2,580" },
                { label: "명중률", val: "92%" },
                { label: "치명타 확률", val: "+15%" },
                { label: "공격 속도", val: "+10%" },
              ]
            ).map((s) => (
              <StatRow key={s.label}>
                <StatLabel>{s.label}</StatLabel>
                <StatVal>{s.val}</StatVal>
              </StatRow>
            ))}
          </LeftCol>

          <RightCol>
            <StatusRow>
              <LivePill>진행 중</LivePill>
            </StatusRow>
            <DetailTitle>{selected.itemTitle}</DetailTitle>
            <MetaTable>
              {[
                {
                  label: "서버",
                  val: selected.serverName || selected.gameServer,
                },
                { label: "게임", val: selected.gameName || selected.game },
                {
                  label: "카테고리",
                  val: selected.categoryName || selected.category,
                },
                {
                  label: "판매자",
                  val: selected.sellerNickname || selected.seller,
                },
                {
                  label: "입찰 수",
                  val:
                    selected.bidCount != null ? `${selected.bidCount}회` : null,
                },
                {
                  label: "등록일",
                  val: selected.createdAt
                    ? selected.createdAt.split("T")[0]
                    : null,
                },
              ]
                .filter((m) => m.val)
                .map((m) => (
                  <MetaRow key={m.label}>
                    <MetaLabel>{m.label}</MetaLabel>
                    <MetaVal>{m.val}</MetaVal>
                  </MetaRow>
                ))}
            </MetaTable>

            {(selected.sellerNickname || selected.seller) && (
              <SellerBadge>
                <SellerIcon>🛡</SellerIcon>
                <div>
                  <SellerName>
                    {selected.sellerNickname || selected.seller}
                  </SellerName>
                  <SellerSub>프리미엄 프로바이더</SellerSub>
                </div>
                <SellerChat>💬</SellerChat>
              </SellerBadge>
            )}

            <PriceBox>
              <PriceRow>
                <div>
                  <PriceBoxLabel>즉시 낙찰가</PriceBoxLabel>
                  <PriceInstant>
                    {selected.instantBuyPrice > 0
                      ? `${fmt(selected.instantBuyPrice)} KRW`
                      : "미설정"}
                  </PriceInstant>
                </div>
                <TimerBox>
                  <TimerLabel>⏱ 남은 시간</TimerLabel>
                  <TimerVal>
                    <AuctionTimer endAt={selected.endTime} />
                  </TimerVal>
                </TimerBox>
              </PriceRow>
              <Divider />
              <PriceBoxLabel>현재 최고 입찰가</PriceBoxLabel>
              <CurrentBidRow>
                <CurrentBid>{fmt(currentPrice)} KRW</CurrentBid>
                <MinBidNote>
                  최소 입찰 금액 {fmt(selected.minBidUnit || 1000)} KRW
                </MinBidNote>
              </CurrentBidRow>
            </PriceBox>

            <BidSection>
              <BidLabel>입찰가 입력</BidLabel>
              <BidInputRow>
                <BidInput
                  type="number"
                  step={100}
                  min={minBid}
                  value={customBid}
                  onChange={(e) => setCustomBid(e.target.value)}
                  placeholder={`최소 ${fmt(minBid)}`}
                />
              </BidInputRow>
              {bidError && <BidError>{bidError}</BidError>}
              <BidBtns>
                <BidBtnPrimary disabled={bidding} onClick={handleBid}>
                  🔨 {bidding ? "입찰 중..." : "입찰하기"}
                </BidBtnPrimary>
                {selected.instantBuyPrice && (
                  <BidBtnSecondary onClick={handleInstantBuy}>
                    ⚡ 낙찰하기
                  </BidBtnSecondary>
                )}
              </BidBtns>
              <SafeNote>
                🔒 안전한 거래가 보장됩니다. 거래 완료 후 에스크로 방식으로
                정산됩니다.
              </SafeNote>
            </BidSection>

            <BidPanel>
              <BidPanelHeader>
                <BidPanelTitle>입찰 내역</BidPanelTitle>
                <LiveTag>진행 중</LiveTag>
              </BidPanelHeader>
              {bidLoading ? (
                <p
                  style={{
                    color: "#555a75",
                    fontSize: 13,
                    textAlign: "center",
                    padding: "12px 0",
                  }}
                >
                  불러오는 중...
                </p>
              ) : (
                bids.slice(0, 3).map((b, i) => (
                  <BidRow key={i} $best={i === 0}>
                    <BidAvatar $best={i === 0}>
                      {(b.bidderNickname || "?")[0]}
                    </BidAvatar>
                    <BidNick>{b.bidderNickname}</BidNick>
                    <BidTime>{b.time || ""}</BidTime>
                    {i === 0 && <BestTag>최고가</BestTag>}
                    <BidAmt $best={i === 0}>{fmt(b.amount)} KRW</BidAmt>
                  </BidRow>
                ))
              )}
              <ViewAllBtn onClick={() => setShowModal(true)}>
                전체 내역 보기
              </ViewAllBtn>
            </BidPanel>
          </RightCol>
        </DetailGrid>
      </DetailWrap>
    </PageWrap>
  );
}

const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.5}`;
const PageWrap = styled.div`
  background: #090b12;
  color: #e8eaf0;
  min-height: 100vh;
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
`;
const TopGameBar = styled.div`
  display: flex;
  gap: 4px;
  padding: 0 32px;
  background: #0d0f1a;
  border-bottom: 1px solid #1a1d2e;
  overflow-x: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;
const TopGameTab = styled.button`
  padding: 14px 20px;
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => (p.$active ? "#fff" : "#555a75")};
  background: none;
  border: none;
  border-bottom: 2px solid ${(p) => (p.$active ? "#6c5ce7" : "transparent")};
  cursor: pointer;
  white-space: nowrap;
  transition:
    color 0.15s,
    border-color 0.15s;
  &:hover {
    color: #fff;
  }
`;
const ContentRow = styled.div`
  display: flex;
  min-height: calc(100vh - 48px);
`;
const Sidebar = styled.aside`
  width: 180px;
  flex-shrink: 0;
  background: #0d0f1a;
  border-right: 1px solid #1a1d2e;
  padding: 24px 16px;
`;
const SideSection = styled.div`
  margin-bottom: 28px;
`;
const SideLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #6c5ce7;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
  text-transform: uppercase;
`;
const SideItem = styled.div`
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  color: ${(p) => (p.$active ? "#fff" : "#555a75")};
  background: ${(p) => (p.$active ? "rgba(108,92,231,.15)" : "transparent")};
  font-weight: ${(p) => (p.$active ? 600 : 400)};
  margin-bottom: 2px;
  transition: all 0.15s;
  &:hover {
    color: #fff;
    background: rgba(108, 92, 231, 0.1);
  }
`;
const SideEmpty = styled.div`
  font-size: 11px;
  color: #3c4060;
  line-height: 1.6;
  padding: 8px 4px;
`;
const MainArea = styled.main`
  flex: 1;
  min-width: 0;
  padding: 24px 28px 40px;
`;
const ListTopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
`;
const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
`;
const ListTopRight = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;
const SearchBox = styled.input`
  background: #12141f;
  border: 1px solid #1e2133;
  color: #e8eaf0;
  padding: 9px 14px;
  border-radius: 8px;
  font-size: 13px;
  width: 220px;
  outline: none;
  &::placeholder {
    color: #3c4060;
  }
  &:focus {
    border-color: #6c5ce7;
  }
`;
const AddBtn = styled.button`
  background: #6c5ce7;
  color: #fff;
  border: none;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    opacity: 0.88;
  }
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
`;
const AuctionCard = styled.div`
  background: #12141f;
  border: 1px solid #1a1d2e;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition:
    border-color 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
  &:hover {
    border-color: #6c5ce7;
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(108, 92, 231, 0.18);
  }
`;
const TimerBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(230, 57, 70, 0.92);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 6px;
  z-index: 2;
  backdrop-filter: blur(4px);
  letter-spacing: 0.3px;
`;
const CardImgWrap = styled.div`
  height: 170px;
  background: linear-gradient(145deg, #0d0f1a, #13162a);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;
const CardPlaceholder = styled.span`
  font-size: 56px;
`;
const CardBody = styled.div`
  padding: 14px 14px 16px;
`;
const CardGameTag = styled.div`
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: #6c5ce7;
  background: rgba(108, 92, 231, 0.12);
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
`;
const CardTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #e8eaf0;
`;
const CardMeta = styled.div`
  font-size: 11px;
  color: #3c4060;
  margin-bottom: 10px;
`;
const CardPriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 10px;
`;
const CardPriceLabel = styled.div`
  font-size: 10px;
  color: #555a75;
  margin-bottom: 2px;
`;
const CardPrice = styled.div`
  font-size: 17px;
  font-weight: 800;
  color: #c0c1ff;
  span {
    font-size: 11px;
    font-weight: 400;
    margin-left: 2px;
  }
`;
const CardInstant = styled.div`
  font-size: 11px;
  color: #4edea3;
  font-weight: 600;
`;
const CardBtn = styled.button`
  width: 100%;
  background: #1a1d2e;
  border: 1px solid #252840;
  color: #e8eaf0;
  padding: 9px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover {
    background: #6c5ce7;
    border-color: #6c5ce7;
  }
`;
const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 32px 0 0;
`;
const PageBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 6px;
  background: ${(p) => (p.$active ? "#6c5ce7" : "#12141f")};
  border: 1px solid ${(p) => (p.$active ? "#6c5ce7" : "#1a1d2e")};
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  &:hover {
    border-color: #6c5ce7;
  }
`;
const LoadingBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
`;
const LoadingSpinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid #1a1d2e;
  border-top-color: #6c5ce7;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;
const EmptyBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  color: #555a75;
  font-size: 14px;
  gap: 12px;
`;
const EmptyIcon = styled.span`
  font-size: 40px;
`;
const DetailWrap = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 28px 60px;
`;
const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #555a75;
  margin-bottom: 28px;
`;
const BreadItem = styled.span`
  cursor: pointer;
  color: #6c5ce7;
  font-weight: 600;
  &:hover {
    opacity: 0.8;
  }
`;
const BreadSep = styled.span`
  color: #252840;
`;
const BreadCurrent = styled.span`
  color: #e8eaf0;
`;
const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;
const LeftCol = styled.div``;
const ImgMain = styled.div`
  background: #12141f;
  border: 1px solid #1a1d2e;
  border-radius: 16px;
  height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  margin-bottom: 12px;
`;
const BigEmoji = styled.span`
  font-size: 100px;
`;
const RarityBadge = styled.div`
  position: absolute;
  top: 14px;
  left: 14px;
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 6px;
`;
const ImgDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 16px;
`;
const ImgDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${(p) => (p.$active ? "#6c5ce7" : "#252840")};
  cursor: pointer;
  transition: background 0.15s;
`;
const DescBox = styled.div`
  background: #12141f;
  border: 1px solid #1a1d2e;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 14px;
`;
const DescTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #6c5ce7;
  margin-bottom: 8px;
`;
const DescText = styled.p`
  font-size: 13px;
  color: #888ea8;
  line-height: 1.6;
  margin: 0;
`;
const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #1a1d2e;
  &:last-child {
    border-bottom: none;
  }
`;
const StatLabel = styled.span`
  font-size: 12px;
  color: #555a75;
`;
const StatVal = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #4edea3;
`;
const RightCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const StatusRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;
const LivePill = styled.span`
  background: rgba(78, 222, 163, 0.1);
  color: #4edea3;
  border: 1px solid rgba(78, 222, 163, 0.25);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
`;
const DetailTitle = styled.h2`
  font-size: 22px;
  font-weight: 800;
  line-height: 1.3;
  margin: 0;
`;
const MetaTable = styled.div`
  background: #12141f;
  border: 1px solid #1a1d2e;
  border-radius: 12px;
  overflow: hidden;
`;
const MetaRow = styled.div`
  display: flex;
  border-bottom: 1px solid #1a1d2e;
  &:last-child {
    border-bottom: none;
  }
`;
const MetaLabel = styled.div`
  width: 90px;
  flex-shrink: 0;
  padding: 10px 14px;
  font-size: 12px;
  color: #555a75;
  background: #0d0f1a;
  border-right: 1px solid #1a1d2e;
`;
const MetaVal = styled.div`
  padding: 10px 14px;
  font-size: 13px;
  color: #e8eaf0;
`;
const SellerBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #12141f;
  border: 1px solid #1a1d2e;
  border-radius: 12px;
  padding: 14px 16px;
`;
const SellerIcon = styled.span`
  font-size: 20px;
`;
const SellerName = styled.div`
  font-size: 14px;
  font-weight: 700;
`;
const SellerSub = styled.div`
  font-size: 11px;
  color: #555a75;
`;
const SellerChat = styled.div`
  margin-left: auto;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
`;
const PriceBox = styled.div`
  background: #12141f;
  border: 1px solid #1a1d2e;
  border-radius: 14px;
  padding: 20px;
`;
const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
`;
const PriceBoxLabel = styled.div`
  font-size: 11px;
  color: #555a75;
  margin-bottom: 4px;
`;
const PriceInstant = styled.div`
  font-size: 22px;
  font-weight: 800;
  color: #4edea3;
`;
const Divider = styled.div`
  height: 1px;
  background: #1a1d2e;
  margin: 0 0 14px;
`;
const CurrentBidRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`;
const CurrentBid = styled.div`
  font-size: 26px;
  font-weight: 800;
  color: #c0c1ff;
`;
const MinBidNote = styled.div`
  font-size: 11px;
  color: #555a75;
`;
const TimerBox = styled.div`
  text-align: right;
`;
const TimerLabel = styled.div`
  font-size: 11px;
  color: #e63946;
  margin-bottom: 4px;
`;
const TimerVal = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: #e63946;
  font-variant-numeric: tabular-nums;
`;
const BidSection = styled.div`
  background: #12141f;
  border: 1px solid #1a1d2e;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const BidLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #e8eaf0;
`;
const BidInputRow = styled.div`
  display: flex;
  gap: 8px;
`;
const BidInput = styled.input`
  flex: 1;
  background: #090b12;
  border: 1px solid #252840;
  border-radius: 9px;
  padding: 12px 16px;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  outline: none;
  &:focus {
    border-color: #6c5ce7;
  }
  &::placeholder {
    color: #3c4060;
    font-size: 13px;
    font-weight: 400;
  }
`;
const BidError = styled.div`
  font-size: 12px;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
`;
const BidBtns = styled.div`
  display: flex;
  gap: 10px;
`;
const BidBtnPrimary = styled.button`
  flex: 1;
  background: #6c5ce7;
  color: #fff;
  border: none;
  padding: 13px;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    opacity: 0.88;
  }
`;
const BidBtnSecondary = styled.button`
  flex: 1;
  background: rgba(78, 222, 163, 0.1);
  color: #4edea3;
  border: 1px solid rgba(78, 222, 163, 0.3);
  padding: 13px;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    background: rgba(78, 222, 163, 0.18);
  }
`;
const SafeNote = styled.div`
  font-size: 11px;
  color: #3c4060;
  line-height: 1.5;
`;
const BidPanel = styled.div`
  background: #12141f;
  border: 1px solid #1a1d2e;
  border-radius: 14px;
  padding: 18px;
`;
const BidPanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
`;
const BidPanelTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
`;
const LiveTag = styled.span`
  background: rgba(78, 222, 163, 0.1);
  color: #4edea3;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  animation: ${pulse} 2s ease-in-out infinite;
`;
const BidRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: ${(p) => (p.$best ? "rgba(108,92,231,.12)" : "#0d0f1a")};
  border: 1px solid ${(p) => (p.$best ? "rgba(108,92,231,.3)" : "#1a1d2e")};
  margin-bottom: 6px;
`;
const BidAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${(p) => (p.$best ? "#6c5ce7" : "#252840")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
`;
const BidNick = styled.span`
  font-size: 13px;
  font-weight: 600;
  flex: 1;
`;
const BidTime = styled.span`
  font-size: 11px;
  color: #555a75;
`;
const BestTag = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: #6c5ce7;
  background: rgba(108, 92, 231, 0.15);
  padding: 2px 7px;
  border-radius: 4px;
`;
const BidAmt = styled.span`
  font-size: 13px;
  font-weight: 800;
  color: ${(p) => (p.$best ? "#c0c1ff" : "#888ea8")};
`;
const ViewAllBtn = styled.button`
  width: 100%;
  margin-top: 8px;
  background: #0d0f1a;
  border: 1px solid #1a1d2e;
  color: #6c5ce7;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    border-color: #6c5ce7;
  }
`;
const fadeIn = keyframes`from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}`;
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;
const ModalBox = styled.div`
  background: #12141f;
  border: 1px solid #252840;
  border-radius: 16px;
  width: 520px;
  max-width: 95vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.2s ease;
  overflow: hidden;
`;
const ModalHeader = styled.div`
  padding: 20px 20px 16px;
  border-bottom: 1px solid #1a1d2e;
  position: relative;
`;
const ModalTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
`;
const ModalMeta = styled.div`
  font-size: 12px;
  color: #555a75;
  margin-top: 4px;
`;
const ModalClose = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #555a75;
  font-size: 18px;
  cursor: pointer;
  &:hover {
    color: #fff;
  }
`;
const ModalTableWrap = styled.div`
  overflow-y: auto;
  flex: 1;
`;
const ModalTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  thead tr {
    background: #0d0f1a;
  }
  thead th {
    padding: 10px 14px;
    font-size: 11px;
    font-weight: 600;
    color: #555a75;
    text-align: left;
  }
  tbody tr {
    border-bottom: 1px solid #1a1d2e;
    transition: background 0.1s;
  }
  tbody tr:hover {
    background: rgba(108, 92, 231, 0.06);
  }
  tbody tr.best {
    background: rgba(108, 92, 231, 0.1);
  }
  tbody td {
    padding: 12px 14px;
    font-size: 13px;
  }
  tbody td.amount {
    font-weight: 700;
    color: #c0c1ff;
  }
  tbody td.time {
    color: #555a75;
  }
`;
const BidderCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
const Avatar = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
`;
const StatusPill = styled.span`
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  background: ${(p) =>
    p.$type === "best" ? "rgba(108,92,231,.15)" : "rgba(78,222,163,.1)"};
  color: ${(p) => (p.$type === "best" ? "#c0c1ff" : "#4edea3")};
`;
const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-top: 1px solid #1a1d2e;
  font-size: 13px;
  color: #555a75;
  strong {
    color: #e8eaf0;
  }
`;
const CloseBtn = styled.button`
  background: #6c5ce7;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    opacity: 0.88;
  }
`;
