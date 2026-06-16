import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ItemApi from "../../api/item.api";

import item from "../../img/item.svg";
import gameMoney from "../../img/gamemoney.svg";
import account from "../../img/account.svg";

// ✅ 백엔드 실제 DB ID로 맞춤 (GET /api/games 응답 기준)
const FALLBACK_GAMES = [
  { gameId: 1, gameName: "로스트아크" },
  { gameId: 2, gameName: "메이플스토리" },
  { gameId: 3, gameName: "디아블로4" },
  { gameId: 4, gameName: "리그 오브 레전드" },
  { gameId: 5, gameName: "발로란트" },
];

const CATEGORY_META = [
  {
    key: "item",
    src: item,
    alt: "아이템",
    title: "아이템",
    desc: "무기, 방어구, 장신구 등 게임 내 개별 장비 거래",
  },
  {
    key: "money",
    src: gameMoney,
    alt: "게임머니",
    title: "게임머니",
    desc: "골드, 메소, 아데나 등 게임 내 가상 화폐 거래",
  },
  {
    key: "account",
    src: account,
    alt: "계정",
    title: "계정",
    desc: "캐릭터 정보가 포함된 전체 회원 계정 통거래",
  },
];

const ItemNewPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const [uiCategory, setUiCategory] = useState("item");
  const [games, setGames] = useState([]);
  const [servers, setServers] = useState([]);
  const [categories, setCategories] = useState([]);

  const [gameId, setGameId] = useState("");
  const [serverId, setServerId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ✅ 게임 목록 — 백엔드 API 우선, 실패 시 Fallback(숫자 ID)
  useEffect(() => {
    let isMounted = true;
    ItemApi.getGames()
      .then((r) => {
        if (!isMounted) return;
        const list = r.data?.data ?? r.data ?? [];
        setGames(list.length > 0 ? list : FALLBACK_GAMES);
      })
      .catch(() => {
        if (!isMounted) return;
        setGames(FALLBACK_GAMES);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ 게임 선택 시 서버/카테고리 — 백엔드 숫자 ID로 호출
  useEffect(() => {
    if (!gameId) {
      setServers([]);
      setCategories([]);
      setServerId("");
      setCategoryId("");
      return;
    }
    setServerId("");
    setCategoryId("");
    setServers([]);
    setCategories([]);

    let isMounted = true;

    ItemApi.getGameServers(gameId)
      .then((r) => {
        if (!isMounted) return;
        const list = r.data?.data ?? r.data ?? [];
        setServers(list);
      })
      .catch(() => {});

    ItemApi.getCategories(gameId)
      .then((r) => {
        if (!isMounted) return;
        const list = r.data?.data ?? r.data ?? [];
        setCategories(list);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [gameId]);

  const getRawPrice = (val) => Number(String(val).replace(/,/g, "")) || 0;

  const handlePriceChange = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, "");
    setPrice(digits === "" ? "" : Number(digits).toLocaleString());
  };

  const basePrice = getRawPrice(price);
  const commission = Math.floor(basePrice * 0.05);
  const finalPrice = basePrice - commission;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!gameId) return setError("게임을 선택해 주세요.");
    if (!categoryId) return setError("카테고리를 선택해 주세요.");
    if (!title.trim()) return setError("물품 제목을 입력해 주세요.");
    if (!description.trim()) return setError("물품 설명을 입력해 주세요.");
    if (basePrice <= 0) return setError("올바른 가격을 입력해 주세요.");

    // ✅ NaN 방어
    const parsedCategoryId = Number(categoryId);
    const parsedServerId = serverId ? Number(serverId) : null;
    if (isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
      return setError("카테고리를 다시 선택해 주세요.");
    }

    setSaving(true);
    let payload = null;
    try {
      payload = {
        categoryId: parsedCategoryId,
        serverId: parsedServerId,
        basePrice: Number(basePrice),
        title: title.trim(),
        description: description.trim(),
      };

      console.log("🚀 전송 payload:", JSON.stringify(payload, null, 2));

      const response = await ItemApi.createDirectItem(payload);
      console.log("✅ 등록 성공:", response.data);

      alert("판매 물품이 정상 등록되었습니다!");
      setTitle("");
      setDescription("");
      setPrice("");
      navigate("/items");
    } catch (err) {
      console.error("❌ 물품 등록 에러:", err.message);
      console.error(
        "❌ 서버 응답:",
        JSON.stringify(err.response?.data, null, 2),
      );
      console.error("❌ payload:", JSON.stringify(payload, null, 2));
      const msg =
        err.response?.data?.message ??
        err.response?.data?.error ??
        "등록 처리 중 오류가 발생했습니다.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <PageContainer>
      <HeaderSection>
        <Breadcrumb onClick={() => navigate("/")}>
          MARKET &gt; SELL REGISTRATION
        </Breadcrumb>
        <PageTitle>판매 등록</PageTitle>
        <PageDesc>
          당신의 소중한 자산을 빠르고 안전하게 판매하세요.
          <br />
          투명한 시세 데이터와 최첨단 보안 거래 시스템을 통해 최적의 거래 경험을
          제공합니다.
        </PageDesc>
      </HeaderSection>

      <form onSubmit={handleSubmit}>
        {/* 01 카테고리 */}
        <SectionContainer>
          <SectionTitle>
            <span>01</span> 카테고리 선택
          </SectionTitle>
          <CategoryGroup>
            {CATEGORY_META.map((c) => (
              <Card
                key={c.key}
                $isActive={uiCategory === c.key}
                onClick={() => setUiCategory(c.key)}
              >
                <IconWrapper>
                  <img src={c.src} alt={c.alt} className="category-icon" />
                </IconWrapper>
                <CardContent>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </CardContent>
                {uiCategory === c.key && <CheckBadge>✓</CheckBadge>}
              </Card>
            ))}
          </CategoryGroup>
        </SectionContainer>

        {/* 02 기본 정보 */}
        <SectionContainer>
          <SectionTitle>
            <span>02</span> 기본 정보 입력
          </SectionTitle>
          <RowGrid>
            <FormGroup>
              <label>게임명 *</label>
              <Select
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
              >
                <option value="">게임을 선택하세요</option>
                {games.map((g) => (
                  <option key={g.gameId ?? g.id} value={g.gameId ?? g.id}>
                    {g.gameName ?? g.name}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <label>서버</label>
              <Select
                value={serverId}
                onChange={(e) => setServerId(e.target.value)}
                disabled={!gameId}
              >
                <option value="">서버를 선택하세요</option>
                {servers.map((s) => (
                  <option key={s.serverId ?? s.id} value={s.serverId ?? s.id}>
                    {s.serverName ?? s.name}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </RowGrid>
          <FormGroup style={{ marginTop: 20 }}>
            <label>카테고리 *</label>
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={!gameId}
            >
              <option value="">카테고리를 선택하세요</option>
              {categories.map((c) => (
                <option key={c.categoryId ?? c.id} value={c.categoryId ?? c.id}>
                  {c.categoryName ?? c.name}
                </option>
              ))}
            </Select>
          </FormGroup>
        </SectionContainer>

        {/* 03 물품 상세 */}
        <SectionContainer>
          <SectionTitle>
            <span>03</span> 물품 상세 정보
          </SectionTitle>
          <FormGroup style={{ marginBottom: 20 }}>
            <label>물품 제목 *</label>
            <Input
              type="text"
              placeholder={
                uiCategory === "money"
                  ? "빠른 거래 가능합니다 (스카니아 메소)"
                  : uiCategory === "account"
                    ? "구매자의 눈길을 끌 수 있는 제목을 입력하세요"
                    : "예: [S급] 고강화 레전더리 소드 판매합니다"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <label>아이템 설명 및 스펙 *</label>
            <TextArea
              rows={6}
              placeholder={
                uiCategory === "account"
                  ? "주요 아이템, 스킬 레벨, 내실 정보 등 상세한 설명을 작성해 주세요."
                  : "물품의 상세한 옵션이나 거래 가능 시간을 입력해 주세요."
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormGroup>
        </SectionContainer>

        {/* 04 가격 */}
        <SectionContainer>
          <SectionTitle>
            <span>04</span> 가격 설정
          </SectionTitle>
          <PriceBox>
            <PriceRow>
              <label>판매 희망 가격 *</label>
              <PriceInputWrapper>
                <input
                  type="text"
                  placeholder="0"
                  value={price}
                  onChange={handlePriceChange}
                />
                <span>₩</span>
              </PriceInputWrapper>
            </PriceRow>
            <PriceRow className="sub-row">
              <label>거래 수수료 (5%)</label>
              <span className="minus-price">
                -{commission.toLocaleString()} ₩
              </span>
            </PriceRow>
            <PriceRow className="total-row">
              <label>최종 정산 예정 금액</label>
              <span className="total-price">
                {finalPrice.toLocaleString()} ₩
              </span>
            </PriceRow>
          </PriceBox>
        </SectionContainer>

        {error && <ErrorBox>{error}</ErrorBox>}

        <ButtonGroup>
          <CancelButton type="button" onClick={() => navigate("/")}>
            취소
          </CancelButton>
          <SubmitButton type="submit" disabled={saving}>
            {saving ? "저장 중..." : "등록하기"}
          </SubmitButton>
        </ButtonGroup>
      </form>
    </PageContainer>
  );
};

// ── Styled Components ──────────────────────────────────────────
const PageContainer = styled.div`
  background-color: #0b0c10;
  color: #fff;
  min-height: 100vh;
  padding: 40px 8%;
  box-sizing: border-box;
  @media (max-width: 1024px) {
    padding: 30px 5%;
  }
  @media (max-width: 768px) {
    padding: 20px 4%;
  }
  @media (max-width: 480px) {
    padding: 16px 4%;
  }
`;
const HeaderSection = styled.div`
  margin-bottom: 32px;
`;
const Breadcrumb = styled.p`
  font-size: 11px;
  color: #6c5ce7;
  font-weight: bold;
  letter-spacing: 1px;
  margin-bottom: 8px;
  cursor: pointer;
  display: inline-block;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.8;
  }
`;
const PageTitle = styled.h1`
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 12px;
  @media (max-width: 768px) {
    font-size: 20px;
  }
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;
const PageDesc = styled.p`
  font-size: 13px;
  color: #888da8;
  line-height: 1.6;
  max-width: 700px;
  @media (max-width: 768px) {
    font-size: 12px;
  }
  @media (max-width: 480px) {
    font-size: 11px;
    br {
      display: none;
    }
  }
`;
const SectionContainer = styled.div`
  background-color: #12131a;
  border: 1px solid #1f2029;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 16px;
  }
  @media (max-width: 480px) {
    padding: 14px;
    border-radius: 8px;
  }
`;
const SectionTitle = styled.h2`
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  span {
    color: #8083ff;
    font-size: 13px;
  }
  @media (max-width: 480px) {
    font-size: 13px;
    margin-bottom: 14px;
  }
`;
const CategoryGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;
const Card = styled.div`
  background-color: ${(p) => (p.$isActive ? "#1a1b26" : "#171821")};
  border: 1px solid ${(p) => (p.$isActive ? "#6c5ce7" : "#252631")};
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  &:hover {
    border-color: #6c5ce7;
    background-color: #1a1b26;
  }
  @media (max-width: 768px) {
    padding: 14px;
    gap: 12px;
  }
  @media (max-width: 480px) {
    padding: 12px;
    gap: 10px;
  }
`;
const IconWrapper = styled.div`
  background-color: #1f202e;
  padding: 10px;
  border-radius: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  .category-icon {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
  @media (max-width: 480px) {
    padding: 8px;
    .category-icon {
      width: 20px;
      height: 20px;
    }
  }
`;
const CardContent = styled.div`
  padding-right: 24px;
  h3 {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 4px;
  }
  p {
    font-size: 11px;
    color: #c7c4d7;
    line-height: 1.4;
  }
  @media (max-width: 480px) {
    h3 {
      font-size: 13px;
    }
  }
`;
const CheckBadge = styled.div`
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  background-color: #6c5ce7;
  color: #fff;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
`;
const RowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  label {
    font-size: 13px;
    color: #e3e2e8;
  }
  @media (max-width: 480px) {
    label {
      font-size: 12px;
    }
  }
`;
const Select = styled.select`
  background-color: #171821;
  border: 1px solid #252631;
  border-radius: 6px;
  padding: 12px;
  color: #fff;
  font-size: 13px;
  outline: none;
  width: 100%;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  @media (max-width: 480px) {
    padding: 10px;
    font-size: 12px;
  }
`;
const Input = styled.input`
  background-color: #171821;
  border: 1px solid #252631;
  border-radius: 6px;
  padding: 12px;
  color: #fff;
  font-size: 13px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  &::placeholder {
    color: #4e5161;
  }
  @media (max-width: 480px) {
    padding: 10px;
    font-size: 12px;
  }
`;
const TextArea = styled.textarea`
  background-color: #171821;
  border: 1px solid #252631;
  border-radius: 6px;
  padding: 12px;
  color: #fff;
  font-size: 13px;
  outline: none;
  resize: none;
  line-height: 1.5;
  width: 100%;
  box-sizing: border-box;
  &::placeholder {
    color: #4e5161;
  }
  @media (max-width: 480px) {
    padding: 10px;
    font-size: 12px;
  }
`;
const PriceBox = styled.div`
  background-color: #0b0c10;
  border: 1px solid #1f2029;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;
const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  label {
    font-size: 13px;
    color: #a5a8b7;
  }
  &.sub-row {
    border-top: 1px solid #1f2029;
    padding-top: 14px;
    .minus-price {
      color: #ef4444;
      font-size: 13px;
    }
  }
  &.total-row {
    border-top: 1px solid #1f2029;
    padding-top: 14px;
    .total-price {
      color: #10b981;
      font-size: 15px;
      font-weight: 700;
    }
  }
  @media (max-width: 480px) {
    label {
      font-size: 12px;
    }
    &.total-row .total-price {
      font-size: 14px;
    }
  }
`;
const PriceInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: #171821;
  border: 1px solid #252631;
  border-radius: 6px;
  padding: 8px 12px;
  min-width: 150px;
  width: 50%;
  @media (max-width: 768px) {
    width: 55%;
  }
  @media (max-width: 480px) {
    width: 100%;
    min-width: unset;
  }
  input {
    background: transparent;
    border: none;
    outline: none;
    color: #fff;
    width: 100%;
    text-align: right;
    font-size: 14px;
    padding-right: 6px;
    &::-webkit-inner-spin-button {
      display: none;
    }
  }
  span {
    color: #a5a8b7;
    font-size: 13px;
    flex-shrink: 0;
  }
`;
const ErrorBox = styled.div`
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  font-size: 13px;
  color: #ef4444;
  margin-bottom: 24px;
`;
const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  width: 100%;
  padding-bottom: 40px;
  @media (max-width: 480px) {
    gap: 10px;
  }
`;
const CancelButton = styled.button`
  background-color: #12131a;
  border: 1px solid #252631;
  color: #fff;
  padding: 14px 0;
  width: 220px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s;
  &:hover {
    border-color: #6c5ce7;
  }
  @media (max-width: 640px) {
    width: 160px;
  }
  @media (max-width: 480px) {
    flex: 1;
    width: auto;
    padding: 12px 0;
    font-size: 12px;
  }
`;
const SubmitButton = styled.button`
  background-color: #c0c1ff;
  border: none;
  color: #1000a9;
  padding: 14px 0;
  width: 220px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  opacity: ${(p) => (p.disabled ? 0.6 : 1)};
  pointer-events: ${(p) => (p.disabled ? "none" : "auto")};
  transition: opacity 0.2s;
  @media (max-width: 640px) {
    width: 160px;
  }
  @media (max-width: 480px) {
    flex: 1;
    width: auto;
    padding: 12px 0;
    font-size: 12px;
  }
`;

export default ItemNewPage;
