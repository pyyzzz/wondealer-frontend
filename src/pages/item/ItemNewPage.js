import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

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
    "에오스",
    "헬리오스",
    " 챌린저스1",
    "챌린저스2",
    "챌린저스3",
    "챌린저스4",
  ],
  dungeon: [
    "통합서버",
    "카인",
    "디레지에",
    "바칼",
    "프레이",
    "시로코",
    "안톤",
    "카시야스",
    "힐더",
    "스타트",
    "이벤트(시즌)서버",
    "퍼스트-테스트",
    "퍼스트-테스트(1군)",
    "퍼스트-테스트(2군)",
  ],
  lineage: [
    "데포로쥬",
    "판도라",
    "듀크데필",
    "파푸리온",
    "린드비오르",
    "군터",
    "하딘",
    "아툰",
    "케레니스",
    "이실로테",
    "켄라우헬",
    "데스나이트",
    "안타라스",
    "발라카스",
    "사이하",
    "질리언",
    "블루디카",
    "라스타바드",
    "기르타스",
    "그림리퍼",
    "발록",
    "진기르타스",
    "말하는섬",
    "원다우드",
    "글루디오",
    "그레시아",
    "켄트",
    "오렌",
  ],
  fc: ["서버전체"],
  battle: ["서버전체", "스팀서버", "카카오서버"],
  valorant: ["서버전체"],
  overwatch: ["전체"],
};

const ItemNewPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // 파일 인풋 제어용 Ref

  useEffect(() => {
    // 로컬 스토리지에 로그인 토큰이 있는지 확인
    const token = localStorage.getItem("token");

    if (!token) {
      alert("로그인이 필요한 서비스입니다.");
      // 로그인 페이지 경로가 다르면 "/login"을 알맞게 수정
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // 카테고리 상태 관리 (아이템, 게임머니, 계정)
  const [category, setCategory] = useState("item");

  const [gameName, setGameName] = useState(""); // 선택한 게임명
  const [serverName, setServerName] = useState(""); // 선택한 서버명
  const [quantity, setQuantity] = useState(""); // 게임머니 수량
  const [title, setTitle] = useState(""); // 물품제목
  const [description, setDescription] = useState(""); // 물품설명
  const [price, setPrice] = useState(""); // 희망 가격

  // 콤마 제거 후 숫자로 변환하는 함수
  const getRawPrice = (val) => {
    return Number(val.replace(/,/g, "")) || 0; // 모든 콤마를 빈 문자열로 바꾸고 숫자로 변환
  };

  // 가격 입력 시 숫자에 실시간으로 콤마를 넣어줌
  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // 숫자 외의 문자 제거
    if (value === "") {
      setPrice(""); // 지워서 빈 값이 되면 빈 문자열로 초기화 후 리턴
      return;
    }
    const formattedValue = Number(value).toLocaleString(); // 세자리마다 콤마 붙이기
    setPrice(formattedValue); // 콤마 찍힌 문자열을 최종 가격 상태로 저장
  };

  // 업로드된 이미지 리스트 상태 관리 (최대 5장)
  const [images, setImages] = useState([]);

  // 가격 입력 시 최종 정산 금액 및 수수료 자동 계산 (5%)
  const inputPrice = getRawPrice(price); // 콤마 없는 금액 계산
  const commission = Math.floor(inputPrice * 0.05); // 수수로 5% 계산
  const finalPrice = inputPrice - commission; // 입력한 가격에서 수수료 빼서 실제로 가져가는 정산 금액

  // 이미지 클릭 시 input click 이벤트 강제 발생 함수
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 이미지 선택 시 미리보기 처리 핸들러
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // 최대 5장까지만 유지하도록 제한
    if (images.length + files.length > 5) {
      alert("이미지는 최대 5장까지만 업로드할 수 있습니다.");
      return;
    }

    // 파일 객체에 프리뷰 URL을 생성하여 상태에 추가
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  // 등록된 이미지 개별 삭제 핸들러
  const handleRemoveImage = (indexToRemove, e) => {
    e.stopPropagation(); // 부모 클릭 이벤트 전파 차단
    setImages((prevImages) =>
      prevImages.filter((_, idx) => idx !== indexToRemove),
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 필수값 체크
    if (!gameName) return alert("게임을 선택해 주세요.");
    if (!serverName) return alert("서버를 선택해 주세요.");
    if (category === "money" && !quantity)
      return alert("게임머니 수량을 입력해 주세요.");
    if (!title.trim()) return alert("물품 제목을 입력해 주세요.");
    if (!description.trim()) return alert("물품 설명을 입력해 주세요.");
    if (inputPrice <= 0) return alert("올바른 가격을 입력해 주세요.");

    // 서버로 보낼 데이터 객체 구성
    const submitData = {
      category,
      gameName,
      serverName,
      quantity: category === "money" ? quantity : null,
      title,
      description,
      price: inputPrice,
      commission,
      finalPrice,
      images: images.map((img) => img.file),
    };

    console.log("서버로 전송할 데이터:", submitData);
    alert("판매 물품 등록이 완료되었습니다!");

    // 등록 완료 후 MyPage 등록 물품 관리로 이동
    navigate("/mypage", { state: { tab: "registration-management" } });
  };

  return (
    <PageContainer>
      <HeaderSection>
        <Breadcrumb onClick={() => navigate("/")}>
          MARKET &gt; SELL REGISTRATION
        </Breadcrumb>
        <PageTitle>판매 등록</PageTitle>
        <PageDesc>
          당신의 소중한 자산을 빠르고 안전하게 판매하세요. <br />
          투명한 시세 데이터와 최첨단 보안 거래 시스템을 통해 최적의 거래 경험을
          제공합니다.
        </PageDesc>
      </HeaderSection>

      {/* 카테고리 선택 */}
      <SectionContainer>
        <SectionTitle>
          <span>01</span> 카테고리 선택
        </SectionTitle>
        <CategoryGroup>
          <Card
            isActive={category === "item"}
            onClick={() => setCategory("item")}
          >
            <IconWrapper>
              <img src={item} alt="아이템 아이콘" className="category-icon" />
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
            onClick={() => setCategory("money")}
          >
            <IconWrapper>
              <img
                src={gameMoney}
                alt="게임머니 아이콘"
                className="category-icon"
              />
            </IconWrapper>
            <CardContent>
              <h3>게임머니</h3>
              <p>골드, 메소, 아데나 등 게임 내 가상 화폐 거래</p>
            </CardContent>
            {category === "money" && <CheckBadge>✓</CheckBadge>}
          </Card>

          <Card
            isActive={category === "account"}
            onClick={() => setCategory("account")}
          >
            <IconWrapper>
              <img src={account} alt="계정 아이콘" className="category-icon" />
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
                setServerName(""); // 게임이 바뀌면 선택된 서버 초기화
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
            <Select // serverListData와 연동해 자동으로 바뀜
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              disabled={!gameName} // 게임을 먼저 선택 안 하면 비활성화
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

        {/* 게임머니 선택 시에만 렌더링 */}
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
            placeholder={
              category === "money"
                ? "빠른 거래 가능합니다 (스카니아 메소)"
                : category === "account"
                  ? "구매자의 눈길을 끌 수 있는 제목을 입력하세요"
                  : "예: [S급] 고강화 레전더리 소드 판매합니다"
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <label>아이템 설명 및 스펙</label>
          <TextArea
            rows={6}
            placeholder={
              category === "account"
                ? "주요 아이템, 스킬 레벨, 내실 정보 등 상세한 설명을 작성해 주세요."
                : "물품의 상세한 옵션이나 거래 가능 시간을 입력해 주세요. 상세한 설명은 신속한 판매에 도움이 됩니다."
            }
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormGroup>
      </SectionContainer>

      {/* 가격 설정 + 이미지 등록 하단 배치 */}
      <BottomGrid isMoney={category === "money"}>
        {/* 가격 설정 */}
        <SectionContainer style={{ margin: 0 }}>
          <SectionTitle>
            <span>04</span> 가격 설정
          </SectionTitle>
          <PriceBox>
            <PriceRow>
              <label>판매 희망 가격</label>
              <PriceInputWrapper isMoney={category === "money"}>
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

        {/* 이미지 등록 */}
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
                  multiple // 여러 장 선택 가능하도록 설정
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

              {/* 업로드된 이미지 리스트 연동 컴포넌트 */}
              <PreviewRow>
                {[...Array(5)].map((_, i) => {
                  const imgData = images[i];
                  return (
                    <PreviewSlot key={i} hasImage={!!imgData}>
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
                          alt="미리보기 슬롯 아이콘"
                          className="preview-icon"
                        />
                      )}
                    </PreviewSlot>
                  );
                })}
              </PreviewRow>
            </UploadContainer>
          </SectionContainer>
        )}
      </BottomGrid>

      {/* 하단 최종 조작 버튼 */}
      <ButtonGroup>
        <CancelButton type="button" onClick={() => navigate("/")}>
          취소
        </CancelButton>
        <SubmitButton type="button" onClick={handleSubmit}>
          등록하기
        </SubmitButton>
      </ButtonGroup>
    </PageContainer>
  );
};

// ── Styled Components  ───────────────────────

const PageContainer = styled.div`
  background-color: #0b0c10;
  color: #ffffff;
  min-height: 100vh;
  padding: 40px 8%;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    padding: 30px 5%;
  }

  @media (max-width: 768px) {
    padding: 20px 4%;
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
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const PageTitle = styled.h1`
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    font-size: 22px;
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
`;

const CategoryGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const Card = styled.div`
  background-color: ${(props) => (props.isActive ? "#1a1b26" : "#171821")};
  border: 1px solid ${(props) => (props.isActive ? "#6c5ce7" : "#252631")};
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    border-color: #6c5ce7;
    background-color: #1a1b26;
  }
`;

const IconWrapper = styled.div`
  font-size: 20px;
  background-color: #1f202e;
  padding: 10px;
  border-radius: 8px;
  flex-shrink: 0;
`;

const CardContent = styled.div`
  padding-right: 20px;
  h3 {
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 4px;
  }
  p {
    font-size: 11px;
    color: #c7c4d7;
    line-height: 1.4;
  }
`;

const CheckBadge = styled.div`
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  background-color: #6c5ce7;
  color: white;
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

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
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
`;

const Select = styled.select`
  background-color: #171821;
  border: 1px solid #252631;
  border-radius: 6px;
  padding: 12px;
  color: #ffffff;
  font-size: 13px;
  outline: none;
  width: 100%;
`;

const Input = styled.input`
  background-color: #171821;
  border: 1px solid #252631;
  border-radius: 6px;
  padding: 12px;
  color: #ffffff;
  font-size: 13px;
  outline: none;
  width: 100%;
  box-sizing: border-box;

  &::placeholder {
    color: #4e5161;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;

  input {
    width: 100%;
    background-color: #171821;
    border: 1px solid #252631;
    border-radius: 6px;
    padding: 12px 70px 12px 12px;
    color: #ffffff;
    font-size: 13px;
    outline: none;
    box-sizing: border-box;
  }
`;

const TextArea = styled.textarea`
  background-color: #171821;
  border: 1px solid #252631;
  border-radius: 6px;
  padding: 12px;
  color: #ffffff;
  font-size: 13px;
  outline: none;
  resize: none;
  line-height: 1.5;
  width: 100%;
  box-sizing: border-box;

  &::placeholder {
    color: #4e5161;
  }
`;

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: ${(props) =>
    props.isMoney ? "1fr" : "repeat(2, 1fr)"};
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 16px;
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
`;

const PriceInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: #171821;
  border: 1px solid #252631;
  border-radius: 6px;
  padding: 8px 12px;
  width: ${(props) => (props.isMoney ? "30%" : "50%")};
  min-width: 150px;
  @media (max-width: 480px) {
    width: 65%;
  }
  @media (max-width: 768px) {
    width: 50%;
  }

  input {
    background: transparent;
    border: none;
    outline: none;
    color: white;
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
  }
`;

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  border: 1px solid ${(props) => (props.hasImage ? "#4e5161" : "#252631")};
  border-radius: 6px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4e5161;
  font-size: 12px;
  position: relative;
  overflow: hidden;

  /* 실제 업로드된 이미지 스타일 */
  .uploaded-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* 기존 svg 기본 아이콘 스타일 */
  .preview-icon {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
`;

// 이미지 위에 마우스를 올리면 나타날 수 있는 우측 상단 삭제 버튼
const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ef4444;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 25px;
  width: 100%;
`;

const CancelButton = styled.button`
  background-color: #12131a;
  border: 1px solid #252631;
  color: #ffffff;
  padding: 14px 0;
  width: 220px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  @media (max-width: 480px) {
    flex: 1;
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

  @media (max-width: 480px) {
    flex: 1;
  }
`;

export default ItemNewPage;
