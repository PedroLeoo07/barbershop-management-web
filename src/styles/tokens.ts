// Design Tokens - Sistema de Design Premium para Barbearia

export const colors = {
  // Cores Primárias
  primary: {
    graphite: '#1A1A1A',      // Preto Grafite Principal
    darkGray: '#2D2D2D',      // Cinza Escuro
    mediumGray: '#4A4A4A',    // Cinza Médio
    lightGray: '#A8A8A8',     // Cinza Claro
  },
  
  // Cores de Destaque
  accent: {
    gold: '#D4AF37',          // Dourado Fosco
    goldHover: '#E5C158',     // Dourado Hover
    goldDisabled: '#9B8A3F',  // Dourado Disabled
  },
  
  // Cores Neutras
  neutral: {
    white: '#F5F5F5',         // Branco Suave
    offWhite: '#E8E8E8',      // Off-White
    border: '#3A3A3A',        // Bordas
    divider: '#2A2A2A',       // Divisores
  },
  
  // Estados
  status: {
    success: '#4CAF50',       // Verde Sucesso
    error: '#F44336',         // Vermelho Erro
    warning: '#FF9800',       // Laranja Aviso
    info: '#2196F3',          // Azul Info
  },
  
  // Overlays
  overlay: {
    dark: 'rgba(26, 26, 26, 0.9)',
    medium: 'rgba(26, 26, 26, 0.7)',
    light: 'rgba(26, 26, 26, 0.5)',
  },
} as const;

export const typography = {
  // Família de Fontes
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    display: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", "Courier New", monospace',
  },
  
  // Tamanhos
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },
  
  // Pesos
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Altura de Linha
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '2.5rem',  // 40px
  '3xl': '3rem',    // 48px
  '4xl': '4rem',    // 64px
  '5xl': '6rem',    // 96px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  gold: '0 0 20px rgba(212, 175, 55, 0.3)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

export const transitions = {
  fast: '150ms ease-in-out',
  base: '300ms ease-in-out',
  slow: '500ms ease-in-out',
} as const;

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
  ultrawide: '1536px',
} as const;

// Exportando tema completo
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
} as const;

export type Theme = typeof theme;
