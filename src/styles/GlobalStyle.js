import { createGlobalStyle } from "styled-components";

// CSS 변수 기반 테마 시스템
// 컴포넌트에서 var(--color-primary) 처럼 사용
// 테마 전환 시 data-theme 속성만 바뀌고 컴포넌트 코드는 변경 불필요

const GlobalStyle = createGlobalStyle`
  /* ── Google Fonts ─────────────────────────────────────────── */
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  /* ── CSS 초기화 ────────────────────────────────────────────── */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* ── 다크모드 CSS 변수 ─────────────────────────────────────── */
  [data-theme='dark'], :root {
    --bg-primary:       #121317;
    --bg-container-low: #1a1b20;
    --bg-container:     #1f1f24;
    --bg-container-high:#292a2e;
    --bg-surface-bright:#38393e;

    --text-primary:     #e3e2e8;
    --text-secondary:   #c7c4d7;

    --color-primary:    #c0c1ff;
    --color-primary-container: #8083ff;
    --on-primary:       #1000a9;

    --color-secondary:  #4edea3;
    --color-danger:     #ff516a;
    --color-error:      #ffb4ab;

    --border-color:     #464554;
    --outline:          #908fa0;
  }

  /* ── 라이트모드 CSS 변수 (나중에 추가) ────────────────────── */
  /* [data-theme='light'] {
    --bg-primary:       #f9f9ff;
    --bg-container-low: #f0f3ff;
    --bg-container:     #e7eeff;
    --bg-container-high:#dee8ff;
    --bg-surface-bright:#f9f9ff;

    --text-primary:     #111c2d;
    --text-secondary:   #464554;

    --color-primary:    #4648d4;
    --color-primary-container: #6063ee;
    --on-primary:       #ffffff;

    --color-secondary:  #006591;
    --color-danger:     #b90538;
    --color-error:      #ba1a1a;

    --border-color:     #c7c4d7;
    --outline:          #767586;
  } */

  /* ── body 기본 스타일 ─────────────────────────────────────── */
  body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 16px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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

  /* ── 스크롤바 (다크모드) ────────────────────────────────────── */
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
