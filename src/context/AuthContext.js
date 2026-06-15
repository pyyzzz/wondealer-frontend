import { createContext, useContext, useState } from "react";
import Common from "../utils/Common";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("accessToken") !== null,
  );

  const [user, setUser] = useState(() => {
    const nickname = localStorage.getItem("nickname");
    return nickname ? { nickname } : null;
  });

  const login = (userData) => {
    Common.setAccessToken(userData.accessToken);
    Common.setRefreshToken(userData.refreshToken);
    if (userData.nickname) Common.setNickname(userData.nickname);
    setIsLoggedIn(true);
    setUser({ nickname: userData.nickname });
  };

  // 프로필 저장 후 닉네임 등 context 반영용
  const updateUser = (partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      if (partial.nickname) localStorage.setItem("nickname", partial.nickname);
      return next;
    });
  };

  const logout = () => {
    Common.clearStorage();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
