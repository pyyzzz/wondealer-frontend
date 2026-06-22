import { Routes, Route, Outlet, Navigate } from "react-router-dom";
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
import EmailVerifyPage from "./pages/auth/EmailVerifyPage";
import MyPage from "./pages/mypage/MyPage";
import AdminPage from "./pages/admin/AdminPage";
import LoginSuccess from "./pages/auth/LoginSuccess";
import OAuthCallbackPage from "./pages/auth/OAuthCallbackPage";

const Layout = () => (
  <>
    <Navbar />
    <main style={{ minHeight: "calc(100vh - 60px - 120px)" }}>
      <Outlet />
    </main>
    <Footer />
  </>
);

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  const authority = localStorage.getItem("authority");

  if (!token) return <Navigate to="/login" replace />;
  if (authority !== "ROLE_ADMIN") return <Navigate to="/" replace />;

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login-success" element={<LoginSuccess />} />
      <Route path="/verify-email" element={<EmailVerifyPage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />{" "}
      <Route element={<Layout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/items" element={<ItemListPage />} />
        <Route path="/items/:itemId" element={<ItemDetailPage />} />
        <Route path="/item/:itemId" element={<ItemDetailPage />} />
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
        <Route
          path="/mypage/support"
          element={
            <PrivateRoute>
              <MyPage tab="support" />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
