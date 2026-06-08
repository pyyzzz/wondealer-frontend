import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// 로그인이 필요한 페이지를 감싸는 컴포넌트
// 미로그인 시 /login으로 리다이렉트
const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
