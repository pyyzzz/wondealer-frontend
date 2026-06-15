# WONDEALER Frontend

게임 아이템 안전 거래 플랫폼 프론트엔드

## 시작하기

```bash
# 의존성 설치
yarn install

# 개발 서버 실행 (http://localhost:3000)
yarn start

# 프로덕션 빌드
yarn build
```

## 환경 설정

`.env` 파일을 생성하고 아래 값을 설정하세요:

```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_TOSS_CLIENT_KEY=your_key
```

> 개발 환경에서는 `REACT_APP_API_URL`을 비워두면 `package.json`의 `"proxy": "http://localhost:8080"` 설정으로 자동 프록시됩니다.

## 기술 스택

- **React 18** (Create React App)
- **React Router v6**
- **styled-components** — CSS-in-JS 테마 시스템
- **axios** — HTTP 클라이언트 + 토큰 자동 갱신
- **@stomp/stompjs** + **sockjs-client** — 실시간 WebSocket (경매/채팅)
- **lucide-react** — 아이콘

## 주요 기능

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 메인 | `/` | 최신 매물, 게임 랭킹, 공지사항 |
| 아이템 거래 | `/items` | 필터/검색/페이지네이션 |
| 아이템 상세 | `/items/:id` | 구매/채팅 문의 |
| 판매 등록 | `/items/new` | 아이템 등록 (로그인 필요) |
| 경매 | `/auctions` | 실시간 경매 목록 |
| 경매 상세 | `/auctions/:id` | 실시간 입찰/즉시 낙찰 |
| 결제 | `/payment` | 에스크로 결제 프로세스 |
| 채팅 | `/chat` | 1:1 에스크로 채팅 |
| 마이페이지 | `/mypage` | 마일리지, 활동, 물품 관리 |
| 관리자 | `/admin` | 상품/회원 관리 |

## API 연동

- 백엔드 연결: `src/api/` 폴더의 각 API 파일
- JWT 토큰 자동 첨부: `src/api/AxiosInstance.js`
- 토큰 자동 갱신: 401 응답 시 refresh token으로 재발급
- WebSocket: `src/hooks/useWebSocket.js` (STOMP over SockJS)
