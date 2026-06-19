import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── 다크모드 CSS 변수 (기본) ── */
  [data-theme='dark'], :root {
    --bg-primary:             #121317;
    --bg-container-low:      #1a1b20;
    --bg-container:          #1f1f24;
    --bg-container-high:     #292a2e;
    --bg-surface-bright:     #38393e;
    /* item.css / auction.css 호환 */
    --bg-elevated:           #292a2e;

    --text-primary:          #e3e2e8;
    --text-secondary:        #c7c4d7;
    --text-faint:            #908fa0;
    --text-vfaint:           #5a5970;

    --color-primary:         #c0c1ff;
    --color-primary-light:   #c0c1ff;
    --color-primary-container: #8083ff;
    --on-primary:            #1000a9;

    --color-secondary:       #4edea3;
    --color-danger:          #ff516a;
    --color-warning:         #f59e0b;
    --color-error:           #ffb4ab;
    --color-success:         #4edea3;

    --border-color:          #464554;
    --border-light:          #5a596a;
    --border-focus:          #8083ff;
    --outline:               #908fa0;
    --primary:               #c0c1ff;
    --primary-container:     #8083ff;
    --surface-container:     #1f1f24;
    --surface-container-high:#292a2e;
    --surface-bright:        #38393e;
    --on-surface:            #e3e2e8;
    --on-surface-variant:    #c7c4d7;
    --outline-variant:       #464554;
    --on-tertiary-container: #ffffff;
    --rgb-primary:           192, 193, 255;
    --rgb-danger:            255, 81, 106;
  }

  /* ── 라이트모드 CSS 변수 ── */
  [data-theme='light'] {
    --bg-primary:             #f9f9ff;
    --bg-container-low:      #f0f3ff;
    --bg-container:          #e7eeff;
    --bg-container-high:     #dee8ff;
    --bg-surface-bright:     #f9f9ff;
    --bg-elevated:           #dee8ff;

    --text-primary:          #111c2d;
    --text-secondary:        #464554;
    --text-faint:            #767586;
    --text-vfaint:           #aaa9bc;

    --color-primary:         #4648d4;
    --color-primary-light:   #6063ee;
    --color-primary-container: #6063ee;
    --on-primary:            #ffffff;

    --color-secondary:       #006591;
    --color-danger:          #b90538;
    --color-warning:         #d97706;
    --color-error:           #ba1a1a;
    --color-success:         #00845f;

    --border-color:          #c7c4d7;
    --border-light:          #b0aec4;
    --border-focus:          #4648d4;
    --outline:               #767586;
    --primary:               #4648d4;
    --primary-container:     #6063ee;
    --surface-container:     #e7eeff;
    --surface-container-high:#dee8ff;
    --surface-bright:        #f9f9ff;
    --on-surface:            #111c2d;
    --on-surface-variant:    #464554;
    --outline-variant:       #c7c4d7;
    --on-tertiary-container: #ffffff;
    --rgb-primary:           70, 72, 212;
    --rgb-danger:            185, 5, 56;
  }

  body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 16px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  a { color: inherit; text-decoration: none; }
  button { cursor: pointer; border: none; background: none; font-family: inherit; }
  input, textarea, select { font-family: inherit; font-size: inherit; outline: none; }
  img { max-width: 100%; display: block; }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg-container); }
  ::-webkit-scrollbar-thumb { background: var(--outline); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text-secondary); }
  ::selection { background: var(--color-primary); color: var(--on-primary); }
`;

export default GlobalStyle;
