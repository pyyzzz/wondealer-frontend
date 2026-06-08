import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // localStorage에서 저장된 테마 복원, 없으면 dark 기본값
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  // theme 변경 시 document.body에 data-theme 속성 적용
  // GlobalStyle.js의 CSS 변수가 자동으로 전환됨
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
