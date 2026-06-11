import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import ItemApi from "../../api/item.api";
import AuctionApi from "../../api/auction.api";

function AuctionNewPage() {
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [servers, setServers] = useState([]);

  const [selectedGame, setSelectedGame] = useState("");
  const [selectedServer, setSelectedServer] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // 경매
  const [buyNowPrice, setBuyNowPrice] = useState(""); // 낙찰가
  const [startPrice, setStartPrice] = useState(""); // 입찰가
  const [duration, setDuration] = useState(24); // 경매 기간 (기본 24시간)
  const [endTime, setEndTime] = useState(""); // 종료 예정 일시 표시용

  // 이미지 등록
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  // 초기 게임 목록 로드
  useEffect(() => {
    ItemApi.getGames()
      .then((res) => setGames(res.data || []))
      .catch((err) => console.error("게임 목록 로드 실패:", err));
  }, []);

  // 2. 서버 목록
  useEffect(() => {
    if (selectedGame) {
      ItemApi.getGameServers(selectedGame)
        .then((res) => setServers(res.data || []))
        .catch((err) => console.error("서버 목록 로드 실패:", err));
    } else {
      setServers([]);
    }
  }, [selectedGame]);

  // 경매 기간(duration) 변경 시 종료 예정 시간 계산 (현재 시간 + duration 시간)
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
    // 사용자가 기간 클릭 시 즉시 반영되도록 트리거 처리
  }, [duration]);

  // 이미지 등록
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert("이미지는 최대 5장까지 업로드 가능합니다.");
      return;
    }

    setImages((prev) => [...prev, ...files]);

    // 프리뷰 생성
    const filePreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...filePreviews]);
  };

  // 등록하기 버튼 클릭
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !selectedGame ||
      !selectedServer ||
      !title ||
      !description ||
      !startPrice
    ) {
      alert("필수 입력 사항을 모두 채워주세요.");
      return;
    }

    // FormData 생성
    const formData = new FormData();
    formData.append("gameId", selectedGame);
    formData.append("serverId", selectedServer);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("startPrice", startPrice);
    formData.append("duration", duration);

    // 이미지 추가
    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      await AuctionApi.createAuction(formData);
      alert("경매가 성공적으로 등록되었습니다!");
      navigate("/auction"); // 경매 목록 페이지 이동
    } catch (error) {
      console.error("경매 등록 에러:", error);
      alert("경매 등록에 실패했습니다.");
    }
  };

  return (
    <PageContainer>
      <Breadcrumb>
        MARKET &gt; <span>SELL REGISTRATION</span>
      </Breadcrumb>
      <Title>경매 등록</Title>
      <SubTitle>
        당신의 소중한 자산을 빠르고 안전하게 판매하세요. 투명한 시세 데이터와
        최첨단 보안 거래 시스템을 통해 최적의 거래 경험을 제공합니다.
      </SubTitle>

      <Form onSubmit={handleSubmit}>
        {/* 기본 정보 입력 */}
        <SectionTitle>
          <span>01</span> 기본 정보 입력
        </SectionTitle>
        <Row>
          <FormGroup>
            <label>게임명</label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
            >
              <option value="">게임을 선택하세요</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </FormGroup>
          <FormGroup>
            <label>서버</label>
            <select
              value={selectedServer}
              onChange={(e) => setSelectedServer(e.target.value)}
              disabled={!selectedGame}
            >
              <option value="">서버를 선택하세요</option>
              {servers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormGroup>
        </Row>

        {/* 물품 상세 정보 */}
        <SectionTitle>
          <span>02</span> 물품 상세 정보
        </SectionTitle>
        <FormGroup>
          <label>물품 제목</label>
          <input
            type="text"
            placeholder="예: [S급] 고강화 레전더리 소드 판매합니다"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <label>아이템 설명 및 스펙</label>
          <textarea
            placeholder="물품의 상세한 옵션이나 설명을 입력해 주세요. 상세한 설명은 신속한 판매에 도움이 됩니다."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormGroup>

        {/* 경매 설정 + 이미지 등록 */}
        <TwoColumnRow>
          {/* 경매 설정 */}
          <Column>
            <SectionTitle>
              <span>03</span> 경매 설정
            </SectionTitle>
            <FormGroup>
              <label>낙찰가</label>
              <InputWrapper>
                <input
                  type="number"
                  placeholder="0"
                  value={buyNowPrice}
                  onChange={(e) => setBuyNowPrice(e.target.value)}
                />
                <Unit>M</Unit>
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <label>입찰가</label>
              <InputWrapper>
                <input
                  type="number"
                  placeholder="1,000"
                  value={startPrice}
                  onChange={(e) => setStartPrice(e.target.value)}
                />
                <Unit>M</Unit>
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <label>경매 기간</label>
              <ButtonGroup>
                <TabButton
                  type="button"
                  active={duration === 24}
                  onClick={() => setDuration(24)}
                >
                  24시간
                  <br />
                  <span>1일</span>
                </TabButton>
                <TabButton
                  type="button"
                  active={duration === 72}
                  onClick={() => setDuration(72)}
                >
                  72시간
                  <br />
                  <span>3일</span>
                </TabButton>
                <TabButton
                  type="button"
                  active={duration === 168}
                  onClick={() => setDuration(168)}
                >
                  168시간
                  <br />
                  <span>7일</span>
                </TabButton>
              </ButtonGroup>
            </FormGroup>

            <TimeNotice>
              <ClockIcon>🕒</ClockIcon>
              <div>
                <p className="label">종료 예정 시간</p>
                <p className="time">{endTime}</p>
              </div>
            </TimeNotice>
          </Column>

          {/* 이미지 등록 */}
          <Column>
            <SectionTitle>
              <span>04</span> 이미지 등록
            </SectionTitle>
            <ImageUploadBox>
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <UploadLabel htmlFor="file-upload">
                <UploadIcon>📁</UploadIcon>
                <p>아이템 스크린샷 업로드</p>
                <span>최대 5장, JPG/PNG 지원 (장당 10MB 이내)</span>
              </UploadLabel>
            </ImageUploadBox>

            <PreviewGrid>
              {[...Array(5)].map((_, index) => (
                <PreviewSlot key={index}>
                  {previews[index] ? (
                    <img src={previews[index]} alt={`preview-${index}`} />
                  ) : (
                    <EmptyIcon>🖼️</EmptyIcon>
                  )}
                </PreviewSlot>
              ))}
            </PreviewGrid>
          </Column>
        </TwoColumnRow>

        {/* 취소, 등록하기 버튼 */}
        <BottomButtonGroup>
          <CancelButton type="button" onClick={() => navigate(-1)}>
            취소
          </CancelButton>
          <SubmitButton type="submit">등록하기</SubmitButton>
        </BottomButtonGroup>
      </Form>
    </PageContainer>
  );
}

export default AuctionNewPage;

/* ── Styled Components ────────────────────────────────────────── */
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #0d0e12;
  color: #ffffff;
  font-family: "Inter", sans-serif;

  @media (max-width: 1024px) {
    padding: 30px 5%;
  }

  @media (max-width: 768px) {
    padding: 20px 4%;
  }
`;

const Breadcrumb = styled.div`
  font-size: 12px;
  color: #656874;
  margin-bottom: 10px;
  letter-spacing: 1px;
  span {
    color: #8a92b2;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    font-size: 22px;
  }
`;

const SubTitle = styled.p`
  font-size: 14px;
  color: #9aa1b9;
  line-height: 1.6;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    font-size: 12px;
    margin-bottom: 24px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 30px;

  @media (max-width: 768px) {
    gap: 20px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;

  span {
    color: #5c62ec;
    font-size: 16px;
    font-weight: 700;
  }
  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 10px;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 20px;
  background: #14161d;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #1e222d;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }
`;

const TwoColumnRow = styled.div`
  display: flex;
  gap: 30px;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const Column = styled.div`
  flex: 1;
  background: #14161d;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #1e222d;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  margin-bottom: 20px;

  label {
    font-size: 14px;
    color: #9aa1b9;
  }

  input[type="text"],
  select,
  textarea {
    background: #1a1d26;
    border: 1px solid #282d3d;
    border-radius: 6px;
    padding: 14px;
    color: #fff;
    font-size: 14px;
    outline: none;
    transition: border 0.2s;

    &:focus {
      border-color: #5c62ec;
    }
  }

  textarea {
    height: 150px;
    resize: none;
    line-height: 1.5;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  input {
    width: 100%;
    background: #1a1d26;
    border: 1px solid #282d3d;
    border-radius: 6px;
    padding: 14px 40px 14px 14px;
    color: #fff;
    font-size: 14px;
    outline: none;
    text-align: right;

    &:focus {
      border-color: #5c62ec;
    }
  }
`;

const Unit = styled.span`
  position: absolute;
  right: 15px;
  color: #656874;
  font-size: 14px;
  font-weight: 600;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const TabButton = styled.button`
  flex: 1;
  background: ${(props) =>
    props.active ? "rgba(92, 98, 236, 0.15)" : "#1a1d26"};
  border: 1px solid ${(props) => (props.active ? "#5c62ec" : "#282d3d")};
  border-radius: 6px;
  padding: 12px;
  color: ${(props) => (props.active ? "#5c62ec" : "#9aa1b9")};
  font-size: 14px;
  cursor: pointer;
  text-align: center;
  font-weight: 600;

  span {
    font-size: 11px;
    color: ${(props) => (props.active ? "#5c62ec" : "#656874")};
    font-weight: 400;
  }
  @media (max-width: 480px) {
    font-size: 12px;
    padding: 10px 4px;
  }
`;

const TimeNotice = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #1d212c;
  padding: 14px;
  border-radius: 6px;
  margin-top: 10px;

  .label {
    font-size: 11px;
    color: #656874;
    margin: 0;
  }
  .time {
    font-size: 13px;
    color: #9aa1b9;
    font-weight: 500;
    margin: 2px 0 0 0;
  }
`;

const ClockIcon = styled.div`
  font-size: 18px;
  color: #5c62ec;
`;

const ImageUploadBox = styled.div`
  background: #1a1d26;
  border: 1px dashed #282d3d;
  border-radius: 6px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 20px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UploadLabel = styled.label`
  cursor: pointer;
  p {
    font-size: 14px;
    font-weight: 500;
    margin: 10px 0 4px 0;
  }
  span {
    font-size: 12px;
    color: #656874;
  }
  @media (max-width: 480px) {
    span {
      font-size: 11px;
    }
  }
`;

const UploadIcon = styled.div`
  font-size: 28px;
  color: #656874;
`;

const PreviewGrid = styled.div`
  display: flex;
  gap: 10px;
`;

const PreviewSlot = styled.div`
  width: calc(20% - 8px);
  aspect-ratio: 1;
  background: #1a1d26;
  border: 1px solid #282d3d;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const EmptyIcon = styled.div`
  font-size: 16px;
  color: #282d3d;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const BottomButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;

  @media (max-width: 480px) {
    justify-content: center;
    gap: 10px;
  }
`;

const CancelButton = styled.button`
  background: #14161d;
  border: 1px solid #282d3d;
  color: #9aa1b9;
  padding: 14px 40px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #1a1d26;
  }

  @media (max-width: 480px) {
    flex: 1;
    padding: 14px 0;
    font-size: 14px;
  }
`;

const SubmitButton = styled.button`
  background: #5c62ec;
  border: none;
  color: #fff;
  padding: 14px 50px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #4a50d9;
  }
  @media (max-width: 480px) {
    flex: 1;
    padding: 14px 0;
    font-size: 14px;
  }
`;
