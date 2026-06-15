import { Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";

import MainPage from "./pages/main/MainPage";
import ItemListPage from "./pages/item/ItemListPage";
import ItemDetailPage from "./pages/item/ItemDetailPage";
import ItemNewPage from "./pages/item/ItemNewPage";
import ItemEditPage from "./pages/item/ItemEditPage";
import AuctionListPage from "./pages/auction/AuctionListPage";
import AuctionDetailPage from "./pages/auction/AuctionDetailPage";
import AuctionNewPage from "./pages/auction/AuctionNewPage";
import PaymentPage from "./pages/payment/PaymentPage";
import ChatPage from "./pages/chat/ChatPage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import FindIdPage from "./pages/auth/FindIdPage";
import FindPasswordPage from "./pages/auth/FindPasswordPage";
import OAuthCallbackPage from "./pages/auth/OAuthCallbackPage";
import EmailVerifyPage from "./pages/auth/EmailVerifyPage";
import MyPage from "./pages/mypage/MyPage";
import AdminPage from "./pages/admin/AdminPage";

const Layout = () => (
  <>
    <Navbar />
    <main style={{ minHeight: "calc(100vh - 60px - 120px)" }}>
      <Outlet />
    </main>
    <Footer />
  </>
);

function App() {
  return (
    <Routes>
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      {/* 이메일 인증 링크 — Layout 밖(Navbar/Footer 없어도 무관하나 Layout 안에 넣어도 OK) */}
      <Route path="/verify-email" element={<EmailVerifyPage />} />

      <Route element={<Layout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/items" element={<ItemListPage />} />
        <Route path="/items/:itemId" element={<ItemDetailPage />} />
        <Route path="/auctions" element={<AuctionListPage />} />
        <Route path="/auctions/:auctionId" element={<AuctionDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/find-id" element={<FindIdPage />} />
        <Route path="/reset-password" element={<FindPasswordPage />} />

        <Route
          path="/items/new"
          element={
            <PrivateRoute>
              <ItemNewPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/items/:itemId/edit"
          element={
            <PrivateRoute>
              <ItemEditPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/auctions/new"
          element={
            <PrivateRoute>
              <AuctionNewPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <PrivateRoute>
              <PaymentPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/mypage"
          element={
            <PrivateRoute>
              <MyPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/mypage/wallet"
          element={
            <PrivateRoute>
              <MyPage tab="mileage" />
            </PrivateRoute>
          }
        />

        <Route path="/admin/*" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}

export default App;
