# 원딜러 (WonDealer) 프론트엔드

게임 아이템 거래 + 실시간 경매 플랫폼

---

## 시작하기

### 1. 클론 및 패키지 설치

```bash
git clone https://github.com/pyyzzz/wondealer-frontend.git
cd wondealer-frontend
yarn install
```

> 아래 규칙을 지키지 않은 코드는 PR이 반려됩니다.

### 의무 규칙 3가지

**1. 붙여넣기 전 한 줄씩 주석 필수**

- AI가 생성한 코드라도 본인이 설명할 수 있어야 합니다
- 주석을 못 쓴다 = 이해를 못 한 것 = PR 올리면 안 됨

### 2. 환경 변수 설정

팀장에게 `.env` 파일을 받아서 프로젝트 루트에 추가

```
wondealer-frontend/
  .env  ← 여기에 위치
```

### 3. 백엔드 서버 실행 확인

프론트 실행 전 백엔드 서버가 `http://localhost:8111` 에서 실행 중인지 확인

### 4. 개발 서버 실행

```bash
yarn start
```

브라우저에서 `http://localhost:3000`

---

## 폴더 구조

```
src/
  api/            ← API 호출 함수 (도메인별 분리)
  context/        ← 전역 상태 (Auth, Theme)
  utils/          ← 공통 유틸 (Common.js)
  styles/         ← 전역 스타일 (GlobalStyle, theme)
  components/     ← 공통 컴포넌트 (Navbar, Footer, PrivateRoute)
  hooks/          ← 커스텀 훅 (useWebSocket)
  pages/          ← 페이지 컴포넌트 (도메인별 폴더)
    auth/
    main/
    item/
    auction/
    mypage/
    payment/
    chat/
    admin/
```

---

## 브랜치 전략

```
main  ← 배포용 (직접 커밋 금지)
  └── dev  ← 개발 기준점
        └── feature/이름-기능명  ← 개인 작업 브랜치
```

### 작업 순서

```bash
# 1. dev 브랜치에서 내 브랜치 생성
git checkout dev
git pull origin dev
git checkout -b feature/홍길동-auction

# 2. 작업 후 커밋
git add .
git commit -m "feat: 경매 목록 페이지 구현"

# 3. GitHub에 push 후 dev로 PR 요청
git push origin feature/홍길동-auction
```

---

## 기술 스택

| 기술              | 용도                       |
| ----------------- | -------------------------- |
| React             | UI 라이브러리              |
| styled-components | CSS-in-JS 스타일링         |
| axios             | HTTP 요청                  |
| react-router-dom  | 라우팅                     |
| @stomp/stompjs    | WebSocket STOMP 클라이언트 |
| sockjs-client     | SockJS fallback            |

---

## 백엔드 API 주소

`src/utils/Common.js` 의 `API_URL` 참고

```js
API_URL: "http://localhost:8111";
```

---

## WebSocket (STOMP) 사용법

경매 실시간 입찰, 채팅에서 사용.  
`src/hooks/useWebSocket.js` 참고.

```
연결 엔드포인트: ws://localhost:8111/ws
경매 구독: /topic/auction/{auctionId}
채팅 구독: /topic/chat/{chatRoomId}
메시지 전송: /app/auction/{auctionId}/bid
```
