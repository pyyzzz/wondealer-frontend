import { createContext, useContext, useState } from "react";
import Common from "../utils/Common";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("accessToken") !== null
  );

  // 새로고침 후에도 유저 정보 유지: localStorage에서 복원
  const [user, setUser] = useState(() => {
    const nickname = localStorage.getItem("nickname");
    return nickname ? { nickname } : null;
  });

  // 로그인 성공 시 호출
  // userData: { accessToken, refreshToken, nickname }
  const login = (userData) => {
    Common.setAccessToken(userData.accessToken);
    Common.setRefreshToken(userData.refreshToken);
    if (userData.nickname) Common.setNickname(userData.nickname);
    setIsLoggedIn(true);
    setUser({ nickname: userData.nickname });
  };

  // 로그아웃 시 호출
  const logout = () => {
    Common.clearStorage();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
