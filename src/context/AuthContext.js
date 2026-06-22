import { createContext, useContext, useState } from "react";
import Common from "../utils/Common";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("accessToken") !== null,
  );

  const [user, setUser] = useState(() => {
    const nickname = localStorage.getItem("nickname");
    const authority = localStorage.getItem("authority");
    const email = localStorage.getItem("email");
    // ✅ accessToken 있을 때만 user 복원
    const token = localStorage.getItem("accessToken");
    return token && (nickname || email) ? { nickname, authority, email } : null;
  });

  const login = (userData) => {
    Common.setAccessToken(userData.accessToken);
    if (userData.refreshToken) Common.setRefreshToken(userData.refreshToken);

    const nickname = userData.nickname ?? null;
    const email = userData.email ?? null;
    const authority = userData.authority ?? null;

    if (nickname) localStorage.setItem("nickname", nickname);
    if (email) localStorage.setItem("email", email);
    if (authority) localStorage.setItem("authority", authority);

    const nextUser = { nickname, email, authority };

    // ✅ 동기적으로 즉시 반영
    setIsLoggedIn(true);
    setUser(nextUser); // 이게 호출되면 Navbar 즉시 리렌더
  };

  const updateUser = (partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      if (partial.nickname) localStorage.setItem("nickname", partial.nickname);
      if (partial.email) localStorage.setItem("email", partial.email);
      if (partial.authority)
        localStorage.setItem("authority", partial.authority);
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
