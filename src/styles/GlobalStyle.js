import { createGlobalStyle } from "styled-components";
import { colors } from "./theme";
// CSS 변수 기반 테마 시스템
// 컴포넌트에서 var(--color-primary) 처럼 사용
// 테마 전환 시 data-theme 속성만 바뀌고 컴포넌트 코드는 변경 불필요
const toKebabCase = (str) =>
  str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();

const generateCssVars = (themeColors) => {
  return Object.entries(themeColors)
    .map(([key, value]) => `--${toKebabCase(key)}: ${value};`)
    .join("\n");
};

const GlobalStyle = createGlobalStyle`
  /* ── Google Fonts ─────────────────────────────────────────── */
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  /* ── CSS 초기화 ────────────────────────────────────────────── */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* ── CSS 변수 설정 (자동 생성 + 기존 변수 별칭 매핑) ───────────── */
  :root {
    /* 자동 생성되는 새 변수들 */
    ${generateCssVars(colors.dark)}

    /* 기존 변수 호환성을 위한 별칭(Alias) */
    --bg-primary: var(--background);
    --bg-container-low: var(--surface-container-low);
    --bg-container: var(--surface-container);
    --bg-container-high: var(--surface-container-high);
    --bg-surface-bright: var(--surface-bright);
    --text-primary: var(--on-background);
    --text-secondary: var(--on-surface-variant);
    --color-primary: var(--primary);
    --color-primary-container: var(--primary-container);
    --on-primary: var(--on-primary);
    --color-secondary: var(--secondary);
    --color-danger: var(--error);
    --color-error: var(--error);
    --color-success: var(--success);
    --color-warning: var(--warning);
    --color-accent: var(--accent);
    --on-success: var(--on-success);
    --on-warning: var(--on-warning);
    --on-accent: var(--on-accent);
    --rgb-primary: 192, 193, 255;
    --rgb-danger: 255, 81, 106;
    --rgb-success: 74, 222, 128;
    --border-color: var(--outline-variant);
    --outline: var(--outline);
  }
  [data-theme='light'] {
    /* 자동 생성되는 새 변수들 */
    ${generateCssVars(colors.light)}

    /* 기존 변수 호환성을 위한 별칭(Alias) */
    --bg-primary: var(--background);
    --bg-container-low: var(--surface-container-low);
    --bg-container: var(--surface-container);
    --bg-container-high: var(--surface-container-high);
    --bg-surface-bright: var(--surface-bright);
    --text-primary: var(--on-background);
    --text-secondary: var(--on-surface-variant);
    --color-primary: var(--primary);
    --color-primary-container: var(--primary-container);
    --on-primary: var(--on-primary);
    --color-secondary: var(--secondary);
    --color-danger: var(--error);
    --color-error: var(--error);
    --color-success: var(--success);
    --color-warning: var(--warning);
    --color-accent: var(--accent);
    --on-success: var(--on-success);
    --on-warning: var(--on-warning);
    --on-accent: var(--on-accent);
    --rgb-primary: 70, 72, 212;
    --rgb-danger: 220, 44, 79;
    --rgb-success: 21, 128, 61;
    --border-color: var(--outline-variant);
    --outline: var(--outline);
  }

  /* ── body 기본 스타일 ─────────────────────────────────────── */
  body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 16px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  /* ── 링크 기본 스타일 ─────────────────────────────────────── */
  a {
    color: inherit;
    text-decoration: none;
  }

  /* ── 버튼 기본 스타일 ─────────────────────────────────────── */
  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }

  /* ── 입력 필드 기본 스타일 ───────────────────────────────── */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    outline: none;
  }

  /* ── 이미지 ────────────────────────────────────────────────── */
  img {
    max-width: 100%;
    display: block;
  }

  /* ── 스크롤바 ──────────────────────────────────────────────── */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: var(--bg-container);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--outline);
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }

  /* ── 텍스트 선택 컬러 ─────────────────────────────────────── */
  ::selection {
    background: var(--color-primary);
    color: var(--on-primary);
  }
`;

export default GlobalStyle;
