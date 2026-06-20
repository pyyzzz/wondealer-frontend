import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import ItemApi from "../../api/item.api";
import AuctionApi from "../../api/auction.api";
import { uploadImageFiles } from "../../utils/firebaseUpload";

import clock from "../../img/clock.svg";
import imgsc from "../../img/imgsc.svg";
import imgsc2 from "../../img/imgsc2.svg";

const FALLBACK_GAMES = [
  { gameId: 1, gameName: "로스트아크" },
  { gameId: 2, gameName: "메이플스토리" },
];

const FALLBACK_SERVERS = {
  1: [
    { serverId: 1, serverName: "아브렐슈드" },
    { serverId: 2, serverName: "카단" },
    { serverId: 3, serverName: "니나브" },
    { serverId: 4, serverName: "루페온" },
  ],
  2: [
    { serverId: 5, serverName: "리부트" },
    { serverId: 6, serverName: "일반" },
  ],
};

const FALLBACK_CATEGORIES = {
  1: [
    { categoryId: 1, categoryName: "아이템" },
    { categoryId: 2, categoryName: "게임머니" },
    { categoryId: 3, categoryName: "계정" },
    { categoryId: 4, categoryName: "기타" },
  ],
  2: [
    { categoryId: 5, categoryName: "아이템" },
    { categoryId: 6, categoryName: "게임머니" },
    { categoryId: 7, categoryName: "계정" },
    { categoryId: 8, categoryName: "기타" },
  ],
};

const AuctionNewPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const [games, setGames] = useState([]);
  const [servers, setServers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [gameId, setGameId] = useState("");
  const [serverId, setServerId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buyNowPrice, setBuyNowPrice] = useState("");
  const [startPrice, setStartPrice] = useState("");
  const [minBidUnit, setMinBidUnit] = useState("1,000");
  const [duration, setDuration] = useState(24);
  const [endTime, setEndTime] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    ItemApi.getGames()
      .then((r) => {
        const list = r.data?.data ?? r.data ?? [];
        setGames(list.length > 0 ? list : FALLBACK_GAMES);
      })
      .catch(() => setGames(FALLBACK_GAMES));
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

    const fbServers = FALLBACK_SERVERS[Number(gameId)] ?? [];
    const fbCats = FALLBACK_CATEGORIES[Number(gameId)] ?? [];
    setServers(fbServers);
    setCategories(fbCats);

    ItemApi.getGameServers(gameId)
      .then((r) => {
        const l = r.data?.data ?? r.data ?? [];
        if (l.length > 0) setServers(l);
      })
      .catch(() => {});

    ItemApi.getCategories(gameId)
      .then((r) => {
        const l = r.data?.data ?? r.data ?? [];
        if (l.length > 0) setCategories(l);
      })
      .catch(() => {});
  }, [gameId]);

  useEffect(() => {
    const firstCategory = categories[0];
    setCategoryId(
      firstCategory ? String(firstCategory.categoryId ?? firstCategory.id) : "",
    );
  }, [categories]);

  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + Number(duration));
    const pad = (n) => String(n).padStart(2, "0");
    setEndTime(
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
        `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    );
  }, [duration]);

  const formatPrice = (val) => {
    const digits = val.replace(/[^0-9]/g, "");
    return digits ? Number(digits).toLocaleString() : "";
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      alert("이미지는 최대 5장까지만 업로드할 수 있습니다.");
      return;
    }
    setImages((prev) => [
      ...prev,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
    e.target.value = "";
  };

  const handleRemoveImage = (idx, e) => {
    e.stopPropagation();
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!gameId) return setError("게임을 선택해 주세요.");
    if (!categoryId) return setError("카테고리를 선택해 주세요.");
    if (!title.trim()) return setError("물품 제목을 입력해 주세요.");
    if (!description.trim()) return setError("물품 설명을 입력해 주세요.");

    const rawStart = Number(startPrice.replace(/[^0-9]/g, ""));
    if (rawStart <= 0) return setError("올바른 시작 입찰가를 입력해 주세요.");

    setLoading(true);
    try {
      // 백엔드 AuctionCreateReqDto 필드: title, description, categoryId,
      // serverId, startPrice, instantBuyPrice, auctionDays
      // (gameId, minBidUnit은 DTO에 없으므로 전송하지 않음)
      const payload = {
        categoryId: Number(categoryId),
        serverId: serverId ? Number(serverId) : null,
        title: title.trim(),
        description: description.trim(),
        instantBuyPrice: buyNowPrice
          ? Number(buyNowPrice.replace(/[^0-9]/g, ""))
          : null,
        startPrice: rawStart,
        auctionDays: Math.round(duration / 24),
      };

      try {
        const uploadedUrls = await uploadImageFiles(
          images.map((image) => image.file),
          "auctions",
        );
        if (uploadedUrls.length > 0) {
          console.log("Firebase uploaded image URLs:", uploadedUrls);
          payload.imageUrls = uploadedUrls;
        }
      } catch (uploadError) {
        console.warn(
          "이미지 업로드 실패, 이미지 없이 경매를 등록합니다.",
          uploadError,
        );
      }

      await AuctionApi.createAuction(payload);

      alert("경매 물품 등록이 완료되었습니다!");
      navigate("/auctions");
    } catch (err) {
      console.error("경매 등록 오류:", err.response ?? err);
      const msg =
        err.response?.data?.message ??
        err.response?.data?.error ??
        `등록 중 오류가 발생했습니다. (${err.response?.status ?? "네트워크 오류"})`;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <PageContainer>
      <HeaderSection>
        <Breadcrumb onClick={() => navigate("/auctions")}>
          MARKET &gt; AUCTION REGISTRATION
        </Breadcrumb>
        <PageTitle>경매 등록</PageTitle>
        <PageDesc>
          당신의 소중한 자산을 경매를 통해 합리적인 가격에 판매하세요.
          <br />
          투명한 시세 데이터와 안전한 에스크로 거래 시스템을 통해 최적의 거래
          경험을 제공합니다.
        </PageDesc>
      </HeaderSection>

      <form onSubmit={handleSubmit}>
        <SectionContainer>
          <SectionTitle>
            <span>01</span> 기본 정보 입력
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
                disabled={!gameId || servers.length === 0}
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

        <SectionContainer>
          <SectionTitle>
            <span>02</span> 물품 상세 정보
          </SectionTitle>
          <FormGroup style={{ marginBottom: 20 }}>
            <label>물품 제목 *</label>
            <Input
              type="text"
              placeholder="예: [S급] 고강화 레전더리 소드 경매합니다"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <label>아이템 설명 및 스펙 *</label>
            <TextArea
              rows={6}
              placeholder="물품의 상세한 옵션이나 설명을 입력해 주세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormGroup>
        </SectionContainer>

        <BottomGrid>
          <SectionContainer style={{ margin: 0 }}>
            <SectionTitle>
              <span>03</span> 경매 설정
            </SectionTitle>
            <AuctionBox>
              <FormGroup>
                <label>즉시 낙찰가 (선택)</label>
                <PriceInputWrapper>
                  <input
                    type="text"
                    placeholder="0"
                    value={buyNowPrice}
                    onChange={(e) =>
                      setBuyNowPrice(formatPrice(e.target.value))
                    }
                  />
                  <span>₩</span>
                </PriceInputWrapper>
              </FormGroup>
              <FormGroup>
                <label>시작 입찰가 *</label>
                <PriceInputWrapper>
                  <input
                    type="text"
                    placeholder="1,000"
                    value={startPrice}
                    onChange={(e) => setStartPrice(formatPrice(e.target.value))}
                  />
                  <span>₩</span>
                </PriceInputWrapper>
              </FormGroup>
              <FormGroup>
                <label>최소 입찰 단위</label>
                <PriceInputWrapper>
                  <input
                    type="text"
                    placeholder="1,000"
                    value={minBidUnit}
                    onChange={(e) => setMinBidUnit(formatPrice(e.target.value))}
                  />
                  <span>₩</span>
                </PriceInputWrapper>
              </FormGroup>
              <FormGroup>
                <label>경매 기간</label>
                <TabButtonGroup>
                  {[
                    { label: "24시간", sub: "1일", value: 24 },
                    { label: "72시간", sub: "3일", value: 72 },
                    { label: "168시간", sub: "7일", value: 168 },
                  ].map((d) => (
                    <TabButton
                      type="button"
                      key={d.value}
                      $isActive={duration === d.value}
                      onClick={() => setDuration(d.value)}
                    >
                      {d.label}
                      <br />
                      <span>{d.sub}</span>
                    </TabButton>
                  ))}
                </TabButtonGroup>
              </FormGroup>
              <TimeNotice>
                <ClockIcon>
                  <img src={clock} alt="시계" />
                </ClockIcon>
                <div>
                  <p className="label">종료 예정 시간</p>
                  <p className="time">{endTime}</p>
                </div>
              </TimeNotice>
            </AuctionBox>
          </SectionContainer>

          <SectionContainer style={{ margin: 0 }}>
            <SectionTitle>
              <span>04</span> 이미지 등록
            </SectionTitle>
            <UploadContainer>
              <UploadMainZone onClick={handleUploadClick}>
                <HiddenFileInput
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg"
                  multiple
                />
                <UploadIcon>
                  <img
                    src={imgsc}
                    alt="업로드 아이콘"
                    className="upload-main-icon"
                  />
                </UploadIcon>
                <UploadTextMain>아이템 스크린샷 업로드</UploadTextMain>
                <UploadTextSub>
                  최대 5장, JPG/PNG 지원 (장당 10MB 이내)
                </UploadTextSub>
              </UploadMainZone>
              <PreviewRow>
                {[...Array(5)].map((_, i) => {
                  const imgData = images[i];
                  return (
                    <PreviewSlot key={i} $hasImage={!!imgData}>
                      {imgData ? (
                        <>
                          <img
                            src={imgData.preview}
                            alt={`미리보기 ${i + 1}`}
                            className="uploaded-preview"
                          />
                          <RemoveButton
                            onClick={(e) => handleRemoveImage(i, e)}
                          >
                            ×
                          </RemoveButton>
                        </>
                      ) : (
                        <img
                          src={imgsc2}
                          alt="미리보기 슬롯"
                          className="preview-icon"
                        />
                      )}
                    </PreviewSlot>
                  );
                })}
              </PreviewRow>
            </UploadContainer>
          </SectionContainer>
        </BottomGrid>

        {error && <ErrorBox>{error}</ErrorBox>}

        <ButtonGroup>
          <CancelButton type="button" onClick={() => navigate("/auctions")}>
            취소
          </CancelButton>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? "등록 중..." : "등록하기"}
          </SubmitButton>
        </ButtonGroup>
      </form>
    </PageContainer>
  );
};

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
  background-color: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 16px;
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
  @media (max-width: 480px) {
    label {
      font-size: 12px;
      color: var(--text-primary);
    }
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
  @media (max-width: 480px) {
    padding: 10px;
    font-size: 12px;
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
  @media (max-width: 480px) {
    padding: 10px;
    font-size: 12px;
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
  @media (max-width: 480px) {
    padding: 10px;
    font-size: 12px;
  }
`;
const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;
  align-items: stretch;
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 20px;
  }
`;
const AuctionBox = styled.div`
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;
const PriceInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--bg-container-low);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 10px 12px;
  width: 100%;
  box-sizing: border-box;
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
  }
  span {
    color: var(--text-secondary);
    font-size: 13px;
    flex-shrink: 0;
  }
`;
const TabButtonGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 100%;
`;
const TabButton = styled.button`
  background-color: ${(props) =>
    props.$isActive ? "var(--color-primary)" : "var(--bg-container-low)"};
  border: 1px solid
    ${(props) =>
      props.$isActive ? "var(--color-primary)" : "var(--border-color)"};
  color: ${(props) =>
    props.$isActive ? "var(--on-primary)" : "var(--text-secondary)"};
  padding: 10px 0;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  text-align: center;
  line-height: 1.4;
  transition: all 0.2s;
  span {
    font-size: 11px;
    opacity: 0.7;
  }
  &:hover {
    border-color: var(--color-primary);
  }
`;
const TimeNotice = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--bg-container-low);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 12px;
  .label {
    font-size: 11px;
    color: var(--text-secondary);
    margin: 0 0 4px;
  }
  .time {
    font-size: 13px;
    color: var(--color-success);
    font-weight: 600;
    margin: 0;
  }
`;
const ClockIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 20px;
    height: 20px;
  }
`;
const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;
const HiddenFileInput = styled.input`
  display: none;
`;
const UploadMainZone = styled.div`
  border: 1px dashed var(--outline);
  border-radius: 8px;
  padding: 32px 24px;
  background-color: var(--bg-container-low);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex: 1;
  transition: border-color 0.2s;
  &:hover {
    border-color: var(--color-primary);
  }
  @media (max-width: 480px) {
    padding: 24px 16px;
  }
`;
const UploadIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  .upload-main-icon {
    width: 44px;
    height: 44px;
    object-fit: contain;
  }
`;
const UploadTextMain = styled.p`
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
`;
const UploadTextSub = styled.p`
  font-size: 11px;
  color: var(--text-secondary);
`;
const PreviewRow = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
`;
const PreviewSlot = styled.div`
  background-color: var(--bg-container-low);
  border: 1px solid
    ${(props) => (props.hasImage ? "var(--outline)" : "var(--border-color)")};
  border-radius: 6px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  color: var(--outline);
  .uploaded-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .preview-icon {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
`;
const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  &:hover {
    background-color: var(--color-danger);
  }
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
  transition: opacity 0.2s;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    opacity: 0.9;
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

export default AuctionNewPage;
