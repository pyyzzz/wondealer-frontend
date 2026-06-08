// 원딜러 디자인 시스템 상수
// design.md (dark) + design.md (light) 기반

export const colors = {
  dark: {
    // 배경
    background:              '#121317',
    surfaceContainerLowest:  '#0d0e12',
    surfaceContainerLow:     '#1a1b20',
    surfaceContainer:        '#1f1f24',
    surfaceContainerHigh:    '#292a2e',
    surfaceContainerHighest: '#343439',
    surfaceBright:           '#38393e',

    // 텍스트
    onSurface:        '#e3e2e8',
    onSurfaceVariant: '#c7c4d7',

    // 포인트 컬러 (바이올렛)
    primary:            '#c0c1ff',
    onPrimary:          '#1000a9',
    primaryContainer:   '#8083ff',

    // 보조 컬러 (그린)
    secondary:          '#4edea3',
    onSecondary:        '#003824',
    secondaryContainer: '#00a572',

    // 위험 컬러 (레드)
    tertiary:           '#ffb2b7',
    tertiaryContainer:  '#ff516a',

    // 에러
    error:          '#ffb4ab',
    errorContainer: '#93000a',

    // 선/구분선
    outline:        '#908fa0',
    outlineVariant: '#464554',
  },

  light: {
    // 배경
    background:              '#f9f9ff',
    surfaceContainerLowest:  '#ffffff',
    surfaceContainerLow:     '#f0f3ff',
    surfaceContainer:        '#e7eeff',
    surfaceContainerHigh:    '#dee8ff',
    surfaceContainerHighest: '#d8e3fb',
    surfaceBright:           '#f9f9ff',

    // 텍스트
    onSurface:        '#111c2d',
    onSurfaceVariant: '#464554',

    // 포인트 컬러 (인디고)
    primary:            '#4648d4',
    onPrimary:          '#ffffff',
    primaryContainer:   '#6063ee',

    // 보조 컬러
    secondary:          '#006591',
    onSecondary:        '#ffffff',
    secondaryContainer: '#39b8fd',

    // 위험 컬러
    tertiary:           '#b90538',
    tertiaryContainer:  '#dc2c4f',

    // 에러
    error:          '#ba1a1a',
    errorContainer: '#ffdad6',

    // 선/구분선
    outline:        '#767586',
    outlineVariant: '#c7c4d7',
  },
};

export const typography = {
  fontPrimary: "'Plus Jakarta Sans', sans-serif",
  fontMono:    "'JetBrains Mono', monospace",

  displayLg:  { size: '48px', weight: 800, lineHeight: '56px', letterSpacing: '-0.02em' },
  headlineLg: { size: '32px', weight: 700, lineHeight: '40px' },
  headlineMd: { size: '24px', weight: 600, lineHeight: '32px' },
  titleMd:    { size: '20px', weight: 600, lineHeight: '28px' },
  bodyBase:   { size: '16px', weight: 400, lineHeight: '24px' },
  labelSm:    { size: '12px', weight: 500, lineHeight: '16px', letterSpacing: '0.05em' },
};

export const radius = {
  sm:   '0.25rem',  // 4px
  base: '0.5rem',   // 8px  (기본)
  md:   '0.75rem',  // 12px
  lg:   '1rem',     // 16px (카드)
  xl:   '1.5rem',   // 24px
  full: '9999px',   // pill
};

export const spacing = {
  base:            '8px',
  containerMargin: '24px',
  gutter:          '16px',
  cardPadding:     '20px',
  sectionGap:      '48px',
};
