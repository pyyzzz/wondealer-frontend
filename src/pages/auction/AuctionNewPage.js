import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import clock from "../../img/clock.svg";
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

const AuctionNewPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    // 로컬 스토리지에 로그인 토큰이 있는지 확인
    const token = localStorage.getItem("token");

    if (!token) {
      alert("로그인이 필요한 서비스입니다.");
      // 로그인 페이지 경로가 다르면 "/login"을 알맞게 수정
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // 기본 정보 State
  const [gameName, setGameName] = useState("");
  const [serverName, setServerName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // 경매 가격 및 기간 State
  const [buyNowPrice, setBuyNowPrice] = useState(""); // 낙찰가
  const [startPrice, setStartPrice] = useState(""); // 입찰가
  const [duration, setDuration] = useState(24); // 경매 기간 (기본 24시간)
  const [endTime, setEndTime] = useState(""); // 종료 예정 일시

  // 이미지 등록 State
  const [images, setImages] = useState([]);

  // 세 자리마다 콤마를 추가하는 함수
  const formatPrice = (value) => {
    // 숫자 이외의 문자 전부 제거
    const onlyNumber = value.replace(/[^0-9]/g, "");
    if (!onlyNumber) return "";
    // 숫자 세 자리마다 콤마 추가
    return Number(onlyNumber).toLocaleString();
  };

  const handlePriceChange = (value, setter) => {
    const formatted = formatPrice(value); //  콤마 찍힘
    setter(formatted);
  };

  // 경매 기간(duration) 변경 시 종료 예정 시간 계산
  useEffect(() => {
    const calculateEndTime = () => {
      const now = new Date();
      now.setHours(now.getHours() + Number(duration));

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");

      setEndTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    };

    calculateEndTime();
  }, [duration]);

  // 이미지 영역 클릭 시 작동
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 이미지 선택 및 프리뷰 생성
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

    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  // 이미지 개별 삭제
  const handleRemoveImage = (indexToRemove, e) => {
    e.stopPropagation();
    setImages((prevImages) =>
      prevImages.filter((_, idx) => idx !== indexToRemove),
    );
  };

  // 등록하기 제출
  const handleSubmit = (e) => {
    e.preventDefault();

    // 서버 전송 위해 문자열 내부의 콤마 지우고 정수형 숫자로
    const rawStartPrice = Number(startPrice.replace(/[^0-9]/g, ""));
    const rawBuyNowPrice = buyNowPrice
      ? Number(buyNowPrice.replace(/[^0-9]/g, ""))
      : null;

    if (!gameName) return alert("게임을 선택해 주세요.");
    if (!serverName) return alert("서버를 선택해 주세요.");
    if (!title.trim()) return alert("물품 제목을 입력해 주세요.");
    if (!description.trim()) return alert("물품 설명을 입력해 주세요.");
    if (Number(startPrice) <= 0)
      return alert("올바른 시작 입찰가를 입력해 주세요.");

    // 전송할 데이터 구성
    const submitData = {
      gameName,
      serverName,
      title,
      description,
      startPrice: rawStartPrice,
      buyNowPrice: rawBuyNowPrice,
      duration,
      endTime,
      images: images.map((img) => img.file),
    };

    console.log("경매 등록 데이터:", submitData);
    alert("경매 물품 등록이 완료되었습니다!");

    // 마이페이지 등으로 이동 (예시로 설정된 경로)
    navigate("/mypage", { state: { tab: "auction-management" } });
  };

  return (
    <PageContainer>
      <HeaderSection>
        <Breadcrumb onClick={() => navigate("/")}>
          MARKET &gt; AUCTION REGISTRATION
        </Breadcrumb>
        <PageTitle>경매 등록</PageTitle>
        <PageDesc>
          당신의 소중한 자산을 경매를 통해 합리적인 가격에 판매하세요. <br />
          투명한 시세 데이터와 최첨단 보안 거래 시스템을 통해 최적의 거래 경험을
          제공합니다.
        </PageDesc>
      </HeaderSection>

      <form onSubmit={handleSubmit}>
        {/* 기본 정보 입력 */}
        <SectionContainer>
          <SectionTitle>
            <span>01</span> 기본 정보 입력
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
            <span>02</span> 물품 상세 정보
          </SectionTitle>
          <FormGroup style={{ marginBottom: "20px" }}>
            <label>물품 제목</label>
            <Input
              type="text"
              placeholder="예: [S급] 고강화 레전더리 소드 경매합니다"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <label>아이템 설명 및 스펙</label>
            <TextArea
              rows={6}
              placeholder="물품의 상세한 옵션이나 설명을 입력해 주세요. 상세한 설명은 신속한 판매에 도움이 됩니다."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormGroup>
        </SectionContainer>

        {/* 하단 2단 레이아웃 (경매 설정 + 이미지 등록) */}
        <BottomGrid>
          {/* 경매 설정 */}
          <SectionContainer style={{ margin: 0 }}>
            <SectionTitle>
              <span>03</span> 경매 설정
            </SectionTitle>
            <AuctionBox>
              <FormGroup>
                <label>낙찰가</label>
                <PriceInputWrapper>
                  <input
                    type="text"
                    placeholder="0"
                    value={buyNowPrice}
                    onChange={(e) =>
                      handlePriceChange(e.target.value, setBuyNowPrice)
                    }
                  />
                  <span>₩</span>
                </PriceInputWrapper>
              </FormGroup>

              <FormGroup style={{ marginTop: "10px" }}>
                <label>입찰가</label>
                <PriceInputWrapper>
                  <input
                    type="text"
                    placeholder="1,000"
                    value={startPrice}
                    onChange={(e) =>
                      handlePriceChange(e.target.value, setStartPrice)
                    }
                  />
                  <span>₩</span>
                </PriceInputWrapper>
              </FormGroup>

              <FormGroup style={{ marginTop: "10px" }}>
                <label>경매 기간</label>
                <TabButtonGroup>
                  <TabButton
                    type="button"
                    isActive={duration === 24}
                    onClick={() => setDuration(24)}
                  >
                    24시간
                    <br />
                    <span>1일</span>
                  </TabButton>
                  <TabButton
                    type="button"
                    isActive={duration === 72}
                    onClick={() => setDuration(72)}
                  >
                    72시간
                    <br />
                    <span>3일</span>
                  </TabButton>
                  <TabButton
                    type="button"
                    isActive={duration === 168}
                    onClick={() => setDuration(168)}
                  >
                    168시간
                    <br />
                    <span>7일</span>
                  </TabButton>
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

          {/* 이미지 등록 */}
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
        </BottomGrid>

        {/* 최종 조작 버튼 */}
        <ButtonGroup>
          <CancelButton
            type="button"
            onClick={() => navigate("/", { replace: true })}
          >
            취소
          </CancelButton>
          <SubmitButton type="submit">등록하기</SubmitButton>
        </ButtonGroup>
      </form>
    </PageContainer>
  );
};

// ── Styled Components ───────────────────────

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
    color: #8083ff;
    font-size: 13px;
  }
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
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;
  align-items: stretch;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 16px;
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

const TabButtonGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 100%;
`;

const TabButton = styled.button`
  background-color: ${(props) => (props.isActive ? "#6c5ce7" : "#171821")};
  border: 1px solid ${(props) => (props.isActive ? "#6c5ce7" : "#252631")};
  color: ${(props) => (props.isActive ? "#ffffff" : "#a5a8b7")};
  padding: 10px 0;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  text-align: center;
  line-height: 1.4;
  transition: all 0.2s ease;

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
  margin-top: 10px;

  .label {
    font-size: 11px;
    color: #888da8;
    margin: 0 0 4px 0;
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
  margin-top: 10px;
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

export default AuctionNewPage;
