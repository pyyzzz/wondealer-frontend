import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import ItemApi from "../../api/item.api";
import { uploadImageFiles } from "../../utils/firebaseUpload";

import item from "../../img/item.svg";
import gameMoney from "../../img/gamemoney.svg";
import account from "../../img/account.svg";
import imgsc from "../../img/imgsc.svg";
import imgsc2 from "../../img/imgsc2.svg";

const serverListData = {
  lostark: [
    "루페온",
    "카마인",
    "아브렐슈드",
    "카단",
    "아만",
    "실리안",
    "카제로스",
    "니나브",
    "북미",
    "유럽",
  ],
  maple: [
    "스카니아",
    "루나",
    "엘리시움",
    "크로아",
    "베라",
    "오로라",
    "유니온",
    "이노시스",
    "제니스",
    "RED",
    "아케인",
    "노바",
  ],
  dungeon: ["통합서버", "카인", "디레지에", "바칼", "프레이", "시로코", "안톤"],
  lineage: ["데포로쥬", "판도라", "듀크데필", "파푸리온", "린드비오르", "군터"],
  fc: ["서버전체"],
  battle: ["서버전체", "스팀서버", "카카오서버"],
  valorant: ["서버전체"],
  overwatch: ["전체"],
};

const ItemEditPage = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const fileInputRef = useRef(null);

  const [category, setCategory] = useState("item");
  const [gameName, setGameName] = useState("");
  const [serverName, setServerName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    ItemApi.getItem(itemId)
      .then((r) => {
        const d = r.data?.data || r.data;
        setCategory(d.category || "item");
        setGameName(d.gameName || "");
        setServerName(d.serverName || "");
        setQuantity(d.quantity || "");
        setTitle(d.title || "");
        setDescription(d.details || d.description || "");
        setPrice(String(d.price || ""));
        if (d.existingImages?.length) {
          setImages(
            d.existingImages.map((url) => ({ preview: url, file: null })),
          );
        }
      })
      .catch(() => navigate("/items"))
      .finally(() => setLoading(false));
  }, [itemId]); // eslint-disable-line

  // 가격 계산 로직
  const inputPrice = Number(price) || 0;
  const commission = Math.floor(inputPrice * 0.05);
  const finalPrice = inputPrice - commission;

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      alert("이미지는 최대 5장까지만 업로드할 수 있습니다.");
      return;
    }
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (indexToRemove, e) => {
    e.stopPropagation();
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gameName) return alert("게임을 선택해 주세요.");
    if (!serverName) return alert("서버를 선택해 주세요.");
    if (!title.trim()) return alert("물품 제목을 입력해 주세요.");
    if (inputPrice <= 0) return alert("올바른 가격을 입력해 주세요.");

    setError("");
    setSaving(true);

    const updateData = {
      title: title,
      description: description,
      basePrice: Number(inputPrice),
      categoryId: Number(categoryId),
      serverId: serverName ? Number(serverId) : null,
      removedImageIds: [],
    };

    try {
      try {
        const uploadedUrls = await uploadImageFiles(
          images.map((image) => image.file),
          "items",
        );
        if (uploadedUrls.length > 0) {
          console.log("Firebase uploaded image URLs:", uploadedUrls);
        }
      } catch (uploadError) {
        console.warn(
          "이미지 업로드 실패, 이미지 없이 상품을 수정합니다.",
          uploadError,
        );
      }

      await ItemApi.updateItem(itemId, updateData);
      alert("물품 정보 수정이 완료되었습니다!");
      navigate("/mypage");
    } catch (err) {
      setError(err.response?.data?.message || "수정 중 오류 발생");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: "center", padding: "80px", color: "#888da8" }}>
          로딩 중...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderSection>
        <Breadcrumb onClick={() => navigate("/")}>
          MARKET &gt; ITEM EDIT
        </Breadcrumb>
        <PageTitle>판매 등록 수정</PageTitle>
        <PageDesc>
          당신의 소중한 자산을 빠르고 안전하게 판매하세요.
          <br />
          투명한 시세 데이터와 최첨단 보안 거래 시스템을 통해 최적의 거래 경험을
          제공합니다.
        </PageDesc>
      </HeaderSection>

      {/* 카테고리 선택 */}
      <SectionContainer>
        <SectionTitle>
          <span>01</span> 카테고리 선택{" "}
          <span
            style={{ color: "#ef4444", fontSize: "11px", marginLeft: "4px" }}
          >
            (수정 불가)
          </span>
        </SectionTitle>
        <CategoryGroup>
          <Card isActive={category === "item"} isReadOnly={true} onClick={null}>
            <IconWrapper>
              <img src={item} alt="아이템" className="category-icon" />
            </IconWrapper>
            <CardContent>
              <h3>아이템</h3>
              <p>
                무기, 방어구, 장신구 등 게임 내 개별 장비
                <br />
                거래
              </p>
            </CardContent>
            {category === "item" && <CheckBadge>✓</CheckBadge>}
          </Card>
          <Card
            isActive={category === "money"}
            isReadOnly={true}
            onClick={null}
          >
            <IconWrapper>
              <img src={gameMoney} alt="게임머니" className="category-icon" />
            </IconWrapper>
            <CardContent>
              <h3>게임머니</h3>
              <p>골드, 메소, 아데나 등 게임 내 가상 화폐 거래</p>
            </CardContent>
            {category === "money" && <CheckBadge>✓</CheckBadge>}
          </Card>
          <Card
            isActive={category === "account"}
            isReadOnly={true}
            onClick={null}
          >
            <IconWrapper>
              <img src={account} alt="계정" className="category-icon" />
            </IconWrapper>
            <CardContent>
              <h3>계정</h3>
              <p>캐릭터 정보가 포함된 전체 회원 계정 통거래</p>
            </CardContent>
            {category === "account" && <CheckBadge>✓</CheckBadge>}
          </Card>
        </CategoryGroup>
      </SectionContainer>

      {/* 기본 정보 입력 */}
      <SectionContainer>
        <SectionTitle>
          <span>02</span> 기본 정보 입력
        </SectionTitle>
        <RowGrid>
          <FormGroup>
            <label>게임명</label>
            <Select
              value={gameName}
              onChange={(e) => {
                setGameName(e.target.value);
                setServerName("");
              }}
            >
              <option value="">게임을 선택하세요</option>
              <option value="lostark">로스트아크</option>
              <option value="maple">메이플스토리</option>
              <option value="dungeon">던전앤파이터</option>
              <option value="lineage">리니지M</option>
              <option value="fc">FC온라인</option>
              <option value="battle">배틀그라운드</option>
              <option value="valorant">발로란트</option>
              <option value="overwatch">오버워치2</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <label>서버</label>
            <Select
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              disabled={!gameName}
            >
              <option value="">서버를 선택하세요</option>
              {gameName &&
                serverListData[gameName]?.map((server) => (
                  <option key={server} value={server}>
                    {server}
                  </option>
                ))}
            </Select>
          </FormGroup>
        </RowGrid>
      </SectionContainer>

      {/* 물품 상세 정보 */}
      <SectionContainer>
        <SectionTitle>
          <span>03</span> 물품 상세 정보
        </SectionTitle>
        {category === "money" && (
          <FormGroup style={{ marginBottom: "20px" }}>
            <label>거래 게임머니 수량</label>
            <InputWrapper>
              <Input
                type="text"
                placeholder="100,000,000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </InputWrapper>
          </FormGroup>
        )}
        <FormGroup style={{ marginBottom: "20px" }}>
          <label>물품 제목</label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <label>아이템 설명 및 스펙</label>
          <TextArea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormGroup>
      </SectionContainer>

      {/* 가격 설정 + 이미지 등록 */}
      <BottomGrid $single={category === "money"}>
        <SectionContainer style={{ margin: 0 }}>
          <SectionTitle>
            <span>04</span> 가격 설정
          </SectionTitle>
          <PriceBox>
            <PriceRow>
              <label>판매 희망 가격</label>
              <PriceInputWrapper isMoney={category === "money"}>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
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

        {category !== "money" && (
          <SectionContainer style={{ margin: 0 }}>
            <SectionTitle>
              <span>05</span> 이미지 등록
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
                  <img src={imgsc} alt="업로드" className="upload-main-icon" />
                </UploadIcon>
                <UploadTextMain>아이템 스크린샷 업로드</UploadTextMain>
                <UploadTextSub>최대 5장, JPG/PNG 지원</UploadTextSub>
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
                        <img src={imgsc2} alt="슬롯" className="preview-icon" />
                      )}
                    </PreviewSlot>
                  );
                })}
              </PreviewRow>
            </UploadContainer>
          </SectionContainer>
        )}
      </BottomGrid>

      {/* ── 2번 파일: 에러 메시지 표시 ── */}
      {error && <ErrorBox>{error}</ErrorBox>}

      {/* 하단 버튼 */}
      <ButtonGroup>
        <CancelButton type="button" onClick={() => navigate("/")}>
          취소
        </CancelButton>
        <SubmitButton type="button" onClick={handleSubmit} disabled={saving}>
          {saving ? "저장 중..." : "수정하기"}
        </SubmitButton>
      </ButtonGroup>
    </PageContainer>
  );
};

// ── Styled Components ──────────────────────────────────────────────
const PageContainer = styled.div`
  padding: 40px 8%;
  @media (max-width: 768px) {
    padding: 20px 4%;
  }
`;

const CategoryGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const RowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: ${(props) =>
    props.$single ? "1fr" : "repeat(2, 1fr)"};
  gap: 24px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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
    ${(props) => (props.$hasImage ? "var(--outline)" : "var(--border-color)")};
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
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 25px;
  @media (max-width: 600px) {
    flex-direction: column;
    width: 100%;
  }
`;

const CancelButton = styled.button`
  width: 220px;
  @media (max-width: 600px) {
    width: 100%;
  }
`;

const SubmitButton = styled.button`
  width: 220px;
  @media (max-width: 600px) {
    width: 100%;
  }
`;

export default ItemEditPage;
