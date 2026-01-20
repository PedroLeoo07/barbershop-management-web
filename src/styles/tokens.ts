// Design Tokens - Sistema de Design Premium para Barbearia

export const colors = {
  // Cores Primárias Premium
  primary: {
    graphite: '#0A0A0A',      // Preto Grafite Profundo
    darkGray: '#1A1A1A',      // Cinza Escuro Premium
    mediumGray: '#2D2D2D',    // Cinza Médio
    lightGray: '#A8A8A8',     // Cinza Claro
  },
  
  // Paleta Bronze/Cobre/Dourado Premium
  accent: {
    bronze: '#CD7F32',        // Bronze
    gold: '#D4AF37',          // Dourado Fosco
    roseGold: '#B76E79',      // Rose Gold
    goldHover: '#E8C468',     // Dourado Hover
    goldDisabled: '#8B7935',  // Dourado Disabled
  },
  
  // Gradientes Premium
  gradients: {
    primary: 'linear-gradient(135deg, #CD7F32 0%, #D4AF37 50%, #E8C468 100%)',
    dark: 'linear-gradient(180deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 26, 0.85) 100%)',
    card: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%)',
    overlay: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
  },
  
  // Cores Neutras
  neutral: {
    white: '#FAFAFA',         // Branco Premium
    offWhite: '#F0F0F0',      // Off-White
    border: '#2A2A2A',        // Bordas
    divider: '#1A1A1A',       // Divisores
  },
  
  // Estados
  status: {
    success: '#4CAF50',       // Verde Sucesso
    error: '#F44336',         // Vermelho Erro
    warning: '#FF9800',       // Laranja Aviso
    info: '#2196F3',          // Azul Info
  },
  
  // Overlays Premium
  overlay: {
    dark: 'rgba(10, 10, 10, 0.92)',
    medium: 'rgba(10, 10, 10, 0.75)',
    light: 'rgba(10, 10, 10, 0.5)',
  },
} as const;

export const typography = {
  // Família de Fontes Premium
  fontFamily: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    display: '"Playfair Display", "Georgia", serif',
    mono: '"JetBrains Mono", "SF Mono", Monaco, "Cascadia Code", monospace',
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
  sm: '0 2px 8px rgba(0, 0, 0, 0.4)',
  md: '0 4px 16px rgba(0, 0, 0, 0.5)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.6)',
  xl: '0 12px 48px rgba(0, 0, 0, 0.7)',
  gold: '0 0 24px rgba(212, 175, 55, 0.3), 0 4px 16px rgba(212, 175, 55, 0.2)',
  goldHover: '0 0 32px rgba(212, 175, 55, 0.5), 0 8px 24px rgba(212, 175, 55, 0.3)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
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
