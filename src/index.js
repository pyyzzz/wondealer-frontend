import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import GlobalStyle from "./styles/GlobalStyle";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  // GlobalStyle: 전역 CSS 초기화 + CSS 변수 정의
  // ThemeProvider: 다크/라이트 모드 전역 상태
  // AuthProvider: 로그인 상태 전역 관리
  <ThemeProvider>
    <AuthProvider>
      <GlobalStyle />
      <App />
    </AuthProvider>
  </ThemeProvider>
);
