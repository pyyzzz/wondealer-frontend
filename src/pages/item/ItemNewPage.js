import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ItemApi from "../../api/item.api";

import item from "../../img/item.svg";
import account from "../../img/account.svg";

// ✅ 게임머니 제거 — 아이템, 계정만
const CATEGORY_META = [
  {
    key: "item",
    src: item,
    alt: "아이템",
    title: "아이템",
    desc: "무기, 방어구, 장신구 등 게임 내 개별 장비 거래",
  },
  {
    key: "account",
    src: account,
    alt: "계정",
    title: "계정",
    desc: "캐릭터 정보가 포함된 전체 회원 계정 통거래",
  },
];

const FALLBACK_GAMES = [
  { gameId: 1, gameName: "로스트아크" },
  { gameId: 2, gameName: "메이플스토리" },
  { gameId: 3, gameName: "디아블로4" },
  { gameId: 4, gameName: "리그 오브 레전드" },
  { gameId: 5, gameName: "발로란트" },
];

const MAX_IMAGES = 5;

const ItemNewPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const fileInputRef = useRef(null);

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

  // ✅ 이미지 state
  const [images, setImages] = useState([]); // { file, preview }[]

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

  useEffect(() => {
    if (categories.length === 0) return;
    const indexByUiCategory = { item: 0, account: 1 };
    const nextCategory = categories[indexByUiCategory[uiCategory] ?? 0];
    setCategoryId(
      nextCategory ? String(nextCategory.categoryId ?? nextCategory.id) : "",
    );
  }, [categories, uiCategory]);

  // ✅ 이미지 추가
  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    const remaining = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...toAdd]);
    e.target.value = "";
  };

  // ✅ 이미지 삭제
  const handleImageRemove = (idx) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

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

    const parsedCategoryId = Number(categoryId);
    const parsedServerId = serverId ? Number(serverId) : null;
    if (isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
      return setError("카테고리를 다시 선택해 주세요.");
    }

    setSaving(true);
    try {
      // ✅ 이미지가 있으면 FormData, 없으면 JSON
      let response;
      if (images.length > 0) {
        const formData = new FormData();
        formData.append("categoryId", parsedCategoryId);
        if (parsedServerId) formData.append("serverId", parsedServerId);
        formData.append("basePrice", basePrice);
        formData.append("title", title.trim());
        formData.append("description", description.trim());
        images.forEach((img) => formData.append("images", img.file));
        response = await ItemApi.createDirectItem(formData);
      } else {
        const payload = {
          categoryId: parsedCategoryId,
          serverId: parsedServerId,
          basePrice,
          title: title.trim(),
          description: description.trim(),
        };
        response = await ItemApi.createDirectItem(payload);
      }

      console.log("✅ 등록 성공:", response.data);
      alert("판매 물품이 정상 등록되었습니다!");
      navigate("/items");
    } catch (err) {
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
                uiCategory === "account"
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

        {/* 04 가격 + 05 이미지 — 2컬럼 */}
        <TwoColSection>
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

          {/* 05 이미지 등록 */}
          <SectionContainer>
            <SectionTitle>
              <span>05</span> 이미지 등록
            </SectionTitle>
            <ImageUploadArea>
              {/* 메인 업로드 버튼 */}
              <MainUploadBox
                onClick={() =>
                  images.length < MAX_IMAGES && fileInputRef.current.click()
                }
                $disabled={images.length >= MAX_IMAGES}
              >
                {images.length > 0 ? (
                  <img src={images[0].preview} alt="대표 이미지" />
                ) : (
                  <>
                    <UploadIcon>🖼️</UploadIcon>
                    <UploadText>
                      아이템 스크린샷을 업로드
                      <br />
                      <small>PNG, JPG 지원 (최대 {MAX_IMAGES}장)</small>
                    </UploadText>
                  </>
                )}
              </MainUploadBox>

              {/* 썸네일 목록 */}
              <ThumbnailRow>
                {Array.from({ length: MAX_IMAGES }).map((_, idx) => (
                  <ThumbnailSlot key={idx}>
                    {images[idx] ? (
                      <>
                        <img
                          src={images[idx].preview}
                          alt={`이미지 ${idx + 1}`}
                        />
                        <RemoveBtn
                          type="button"
                          onClick={() => handleImageRemove(idx)}
                        >
                          ×
                        </RemoveBtn>
                      </>
                    ) : (
                      <EmptySlot
                        onClick={() => fileInputRef.current.click()}
                        $disabled={images.length >= MAX_IMAGES}
                      >
                        +
                      </EmptySlot>
                    )}
                  </ThumbnailSlot>
                ))}
              </ThumbnailRow>
            </ImageUploadArea>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleImageAdd}
            />
          </SectionContainer>
        </TwoColSection>

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
  background-color: var(--bg-primary);
  color: var(--text-primary);
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
  color: var(--color-primary);
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
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 700px;
  @media (max-width: 480px) {
    font-size: 11px;
    br {
      display: none;
    }
  }
`;
const SectionContainer = styled.div`
  background-color: var(--bg-container);
  border: 1px solid var(--border-color);
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
    color: var(--color-primary);
    font-size: 13px;
  }
  @media (max-width: 480px) {
    font-size: 13px;
    margin-bottom: 14px;
  }
`;

// ✅ 가격 + 이미지 2컬럼
const TwoColSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 24px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;
const Card = styled.div`
  background-color: ${(p) =>
    p.$isActive ? "var(--bg-container-high)" : "var(--bg-container-low)"};
  border: 1px solid
    ${(p) => (p.$isActive ? "var(--color-primary)" : "var(--border-color)")};
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  &:hover {
    border-color: var(--color-primary);
    background-color: var(--bg-container-high);
  }
  @media (max-width: 480px) {
    padding: 12px;
    gap: 10px;
  }
`;
const IconWrapper = styled.div`
  background-color: var(--bg-container);
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
    color: var(--text-secondary);
    line-height: 1.4;
  }
`;
const CheckBadge = styled.div`
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  background-color: var(--color-primary);
  color: var(--on-primary);
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
    color: var(--text-primary);
  }
`;
const Select = styled.select`
  background-color: var(--bg-container-low);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 12px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  width: 100%;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &:focus {
    border-color: var(--border-focus);
  }
  option {
    background-color: var(--bg-container-low);
    color: var(--text-primary);
  }
`;
const Input = styled.input`
  background-color: var(--bg-container-low);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 12px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  &::placeholder {
    color: var(--outline);
  }
  &:focus {
    border-color: var(--border-focus);
  }
`;
const TextArea = styled.textarea`
  background-color: var(--bg-container-low);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 12px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  resize: none;
  line-height: 1.5;
  width: 100%;
  box-sizing: border-box;
  &::placeholder {
    color: var(--outline);
  }
  &:focus {
    border-color: var(--border-focus);
  }
`;
const PriceBox = styled.div`
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
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
    color: var(--text-secondary);
  }
  &.sub-row {
    border-top: 1px solid var(--border-color);
    padding-top: 14px;
    .minus-price {
      color: var(--color-danger);
      font-size: 13px;
    }
  }
  &.total-row {
    border-top: 1px solid var(--border-color);
    padding-top: 14px;
    .total-price {
      color: var(--color-success);
      font-size: 15px;
      font-weight: 700;
    }
  }
`;
const PriceInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--bg-container-low);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 12px;
  min-width: 150px;
  width: 50%;
  &:focus-within {
    border-color: var(--border-focus);
  }
  input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    width: 100%;
    text-align: right;
    font-size: 14px;
    padding-right: 6px;
    &::-webkit-inner-spin-button {
      display: none;
    }
  }
  span {
    color: var(--text-secondary);
    font-size: 13px;
    flex-shrink: 0;
  }
  @media (max-width: 480px) {
    width: 100%;
    min-width: unset;
  }
`;

// ✅ 이미지 업로드 스타일
const ImageUploadArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const MainUploadBox = styled.div`
  width: 100%;
  height: 160px;
  background-color: var(--bg-container-low);
  border: 2px dashed
    ${(p) => (p.$disabled ? "var(--border-color)" : "var(--color-primary)")};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled ? 0.5 : 1)};
  overflow: hidden;
  transition:
    border-color 0.2s,
    opacity 0.2s;
  &:hover {
    border-color: ${(p) =>
      p.$disabled ? "var(--border-color)" : "var(--color-primary)"};
    opacity: ${(p) => (p.$disabled ? 0.5 : 0.85)};
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
const UploadIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;
const UploadText = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.6;
  small {
    font-size: 11px;
    color: var(--outline);
  }
`;
const ThumbnailRow = styled.div`
  display: flex;
  gap: 8px;
`;
const ThumbnailSlot = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
const RemoveBtn = styled.button`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
`;
const EmptySlot = styled.div`
  width: 100%;
  height: 100%;
  background-color: var(--bg-container-low);
  border: 1px dashed var(--border-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--text-secondary);
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled ? 0.4 : 1)};
`;

const ErrorBox = styled.div`
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  font-size: 13px;
  color: var(--color-danger);
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
  background-color: var(--bg-container);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 14px 0;
  width: 220px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s;
  &:hover {
    border-color: var(--color-primary);
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
  background-color: var(--color-primary);
  border: none;
  color: var(--on-primary);
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
