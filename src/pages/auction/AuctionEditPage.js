import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import ItemApi from "../../api/item.api";
import AuctionApi from "../../api/auction.api";

import clock from "../../img/clock.svg";
import imgsc from "../../img/imgsc.svg";
import imgsc2 from "../../img/imgsc2.svg";

const AuctionEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // 기존 경매 데이터 로드
  useEffect(() => {
    if (!id) return;
    AuctionApi.getAuction(id)
      .then((r) => {
        const d = r.data?.data ?? r.data ?? {};
        setGameId(d.gameId ?? d.game ?? "");
        setServerId(d.serverId ?? d.gameServer ?? "");
        setCategoryId(d.categoryId ?? d.category ?? "");
        setTitle(d.title ?? "");
        setDescription(d.description ?? "");
        setBuyNowPrice(
          d.buyNowPrice ? Number(d.buyNowPrice).toLocaleString() : "",
        );
        setStartPrice(
          d.startPrice ? Number(d.startPrice).toLocaleString() : "",
        );
        setMinBidUnit(
          d.minBidUnit ? Number(d.minBidUnit).toLocaleString() : "1,000",
        );
      })
      .catch(() => {
        setError("경매 정보를 불러오는 데 실패했습니다.");
      })
      .finally(() => setFetching(false));
  }, [id]);

  // 게임 목록 로드
  useEffect(() => {
    ItemApi.getGames()
      .then((r) => setGames(r.data?.data ?? r.data ?? []))
      .catch(() => setGames([]));
  }, []);

  // 게임 선택 시 서버·카테고리 로드
  useEffect(() => {
    if (!gameId) {
      setServers([]);
      setCategories([]);
      return;
    }
    ItemApi.getGameServers(gameId)
      .then((r) => setServers(r.data?.data ?? r.data ?? []))
      .catch(() => setServers([]));
    ItemApi.getCategories(gameId)
      .then((r) => setCategories(r.data?.data ?? r.data ?? []))
      .catch(() => setCategories([]));
  }, [gameId]);

  // 종료 시간 계산
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
      const payload = {
        gameId,
        serverId: serverId || null,
        categoryId,
        title,
        description,
        buyNowPrice: buyNowPrice
          ? Number(buyNowPrice.replace(/[^0-9]/g, ""))
          : null,
        startPrice: rawStart,
        minBidUnit: Number(minBidUnit.replace(/[^0-9]/g, "")) || 1000,
        durationHours: duration,
      };
      await AuctionApi.updateAuction(id, payload);
      alert("경매 수정이 완료되었습니다!");
      navigate(`/auctions/${id}`);
    } catch (err) {
      const msg =
        err.response?.data?.message ??
        err.response?.data?.error ??
        "수정 중 오류가 발생했습니다.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;
  if (fetching)
    return (
      <PageContainer>
        <div style={{ color: "#888", textAlign: "center", paddingTop: 80 }}>
          불러오는 중...
        </div>
      </PageContainer>
    );

  return (
    <PageContainer>
      <HeaderSection>
        <Breadcrumb onClick={() => navigate("/auctions")}>
          MARKET &gt; AUCTION EDIT
        </Breadcrumb>
        <PageTitle>경매 수정</PageTitle>
        <PageDesc>
          경매 정보를 수정하세요. 단, 이미 입찰이 진행된 경우 일부 항목은 변경이
          제한될 수 있습니다.
        </PageDesc>
      </HeaderSection>

      <form onSubmit={handleSubmit}>
        {/* 01 기본 정보 */}
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

        {/* 02 물품 상세 */}
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

        {/* 03 경매 설정 + 04 이미지 */}
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
                <label>경매 기간 (연장)</label>
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
          <CancelButton
            type="button"
            onClick={() => navigate(`/auctions/${id}`)}
          >
            취소
          </CancelButton>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? "수정 중..." : "수정하기"}
          </SubmitButton>
        </ButtonGroup>
      </form>
    </PageContainer>
  );
};

// ── Styled Components (AuctionNewPage와 동일) ──────────────────
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
  background-color: #0b0c10;
  border: 1px solid #1f2029;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;
const PriceInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: #171821;
  border: 1px solid #252631;
  border-radius: 6px;
  padding: 10px 12px;
  width: 100%;
  box-sizing: border-box;
  input {
    background: transparent;
    border: none;
    outline: none;
    color: #fff;
    width: 100%;
    text-align: right;
    font-size: 14px;
    padding-right: 6px;
  }
  span {
    color: #a5a8b7;
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
  background-color: ${(p) => (p.$isActive ? "#6c5ce7" : "#171821")};
  border: 1px solid ${(p) => (p.$isActive ? "#6c5ce7" : "#252631")};
  color: ${(p) => (p.$isActive ? "#fff" : "#a5a8b7")};
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
    border-color: #6c5ce7;
  }
`;
const TimeNotice = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #171821;
  border: 1px solid #252631;
  border-radius: 6px;
  padding: 12px;
  .label {
    font-size: 11px;
    color: #888da8;
    margin: 0 0 4px;
  }
  .time {
    font-size: 13px;
    color: #10b981;
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
  border: 1px dashed #4e5161;
  border-radius: 8px;
  padding: 32px 24px;
  background-color: #171821;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex: 1;
  &:hover {
    border-color: #6c5ce7;
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
  color: #686b7c;
`;
const PreviewRow = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
`;
const PreviewSlot = styled.div`
  background-color: #171821;
  border: 1px solid ${(p) => (p.$hasImage ? "#4e5161" : "#252631")};
  border-radius: 6px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
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
    background-color: #ef4444;
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
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

export default AuctionEditPage;
