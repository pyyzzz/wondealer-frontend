import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";

// 페이지 컴포넌트 (TODO: 각 담당자가 파일 생성 후 import 활성화)
// 메인, 아이템 목록, 상세
import MainPage from "./pages/main/MainPage";
// import ItemListPage     from "./pages/item/ItemListPage";
// import ItemDetailPage   from "./pages/item/ItemDetailPage";
import ItemNewPage from "./pages/item/ItemNewPage";

// 경매, 결제, 채팅
// import AuctionListPage  from "./pages/auction/AuctionListPage";
// import AuctionDetailPage from "./pages/auction/AuctionDetailPage";
// import AuctionNewPage   from "./pages/auction/AuctionNewPage";
// import PaymentPage      from "./pages/payment/PaymentPage";
// import ChatPage         from "./pages/chat/ChatPage";

// 로그인 회원가입 마이페이지
// import LoginPage        from "./pages/auth/LoginPage";
// import SignUpPage       from "./pages/auth/SignUpPage";
// import MyPage           from "./pages/mypage/MyPage";

// 관리자
// import AdminPage        from "./pages/admin/AdminPage";

// Navbar + Outlet + Footer 공통 레이아웃
// 이 Layout 안에 있는 모든 Route는 Navbar와 Footer가 공통 적용됨
const Layout = () => (
  <>
    <Navbar />
    <main>
      <Outlet /> {/* 현재 URL에 맞는 페이지 컴포넌트가 여기에 렌더링됨 */}
    </main>
    <Footer />
  </>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* ── 공개 페이지 (로그인 불필요) ─────────────────── */}
          <Route path="/" element={<MainPage />} />
          <Route path="/items" element={<div>상품 목록 (TODO)</div>} />
          <Route path="/items/:itemId" element={<div>상품 상세 (TODO)</div>} />

          <Route path="/items/new" element={<ItemNewPage />} />
          <Route path="/auctions" element={<div>경매 목록 (TODO)</div>} />
          <Route
            path="/auctions/:auctionId"
            element={<div>경매 상세 (TODO)</div>}
          />
          <Route path="/login" element={<div>로그인 (TODO)</div>} />
          <Route path="/signup" element={<div>회원가입 (TODO)</div>} />

          {/* ── 인증 필요 페이지 (PrivateRoute 적용) ─────────── */}

          <Route
            path="/items/:itemId/edit"
            element={
              <PrivateRoute>
                <div>판매 수정 (TODO)</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/auctions/new"
            element={
              <PrivateRoute>
                <div>경매 등록 (TODO)</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <PrivateRoute>
                <div>결제 (TODO)</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <div>채팅 (TODO)</div>
              </PrivateRoute>
            }
          />

          {/* ── 마이페이지 ────────────────────────────────────── */}
          <Route
            path="/mypage"
            element={
              <PrivateRoute>
                <div>마이페이지 (TODO)</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/mypage/wallet"
            element={
              <PrivateRoute>
                <div>WonPay (TODO)</div>
              </PrivateRoute>
            }
          />

          {/* ── 관리자 ────────────────────────────────────────── */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute>
                <div>관리자 (TODO)</div>
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
