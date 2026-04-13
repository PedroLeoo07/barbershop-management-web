// Design Tokens - Sistema de Design Premium Enterprise para Barbearia

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

  // Cores Secundárias Luxo
  secondary: {
    deepBronze: '#8B5A2B',    // Bronze Profundo
    lightBronze: '#D2B48C',   // Bronze Claro
    champagne: '#F5E6D3',     // Champagne
    platinum: '#E5E4E2',      // Platinum
  },

  // Cores Terciárias Premium
  tertiary: {
    emerald: '#2D5016',       // Esmeralda Escura
    sapphire: '#0F3460',      // Safira
    burgundy: '#5C2E3A',      // Vinho
    slate: '#3A3F47',         // Ardósia
  },

  // Gradientes Premium Expandidos
  gradients: {
    primary: 'linear-gradient(135deg, #CD7F32 0%, #D4AF37 50%, #E8C468 100%)',
    primaryReverse: 'linear-gradient(315deg, #E8C468 0%, #D4AF37 50%, #CD7F32 100%)',
    goldBronze: 'linear-gradient(135deg, #D4AF37 0%, #CD7F32 100%)',
    bronzeRoseGold: 'linear-gradient(135deg, #CD7F32 0%, #B76E79 100%)',
    roseGoldChampagne: 'linear-gradient(135deg, #B76E79 0%, #F5E6D3 100%)',
    darkLuxo: 'linear-gradient(180deg, rgba(10, 10, 10, 0.98) 0%, rgba(15, 52, 96, 0.15) 50%, rgba(10, 10, 10, 0.98) 100%)',
    darkLuxoEmerald: 'linear-gradient(180deg, rgba(10, 10, 10, 0.98) 0%, rgba(45, 80, 22, 0.1) 50%, rgba(10, 10, 10, 0.98) 100%)',
    dark: 'linear-gradient(180deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 26, 0.85) 100%)',
    card: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%)',
    cardElevated: 'linear-gradient(135deg, rgba(30, 30, 30, 0.98) 0%, rgba(18, 18, 18, 0.95) 100%)',
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
    darkHeavy: 'rgba(10, 10, 10, 0.96)',
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
  // Sombras Base
  sm: '0 2px 8px rgba(0, 0, 0, 0.4)',
  md: '0 4px 16px rgba(0, 0, 0, 0.5)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.6)',
  xl: '0 12px 48px rgba(0, 0, 0, 0.7)',

  // Elevação Premium (z-index visual)
  elevation1: '0 2px 4px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.2)',
  elevation2: '0 4px 6px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.25)',
  elevation3: '0 6px 12px rgba(0, 0, 0, 0.2), 0 8px 20px rgba(0, 0, 0, 0.35)',
  elevation4: '0 8px 16px rgba(0, 0, 0, 0.25), 0 12px 32px rgba(0, 0, 0, 0.45)',

  // Sombras Ouro Premium
  gold: '0 0 24px rgba(212, 175, 55, 0.3), 0 4px 16px rgba(212, 175, 55, 0.2)',
  goldHover: '0 0 32px rgba(212, 175, 55, 0.5), 0 8px 24px rgba(212, 175, 55, 0.3)',
  goldGlow: '0 0 16px rgba(212, 175, 55, 0.4), 0 0 32px rgba(212, 175, 55, 0.2)',
  goldGlowStrong: '0 0 24px rgba(212, 175, 55, 0.6), 0 0 48px rgba(212, 175, 55, 0.3)',

  // Sombras Internas Premium
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
  innerLight: 'inset 0 1px 2px rgba(255, 255, 255, 0.05)',
  innerDeep: 'inset 0 4px 8px rgba(0, 0, 0, 0.4)',

  // Sombras Coloridas
  successGlow: '0 0 20px rgba(76, 175, 80, 0.3), 0 4px 12px rgba(76, 175, 80, 0.15)',
  errorGlow: '0 0 20px rgba(244, 67, 54, 0.3), 0 4px 12px rgba(244, 67, 54, 0.15)',
  warningGlow: '0 0 20px rgba(255, 152, 0, 0.3), 0 4px 12px rgba(255, 152, 0, 0.15)',
  infoGlow: '0 0 20px rgba(33, 150, 243, 0.3), 0 4px 12px rgba(33, 150, 243, 0.15)',
} as const;

export const transitions = {
  // Timing Functions Profissionais
  fast: '150ms ease-in-out',
  base: '300ms ease-in-out',
  slow: '500ms ease-in-out',

  // Easing Functions Avançadas
  cubic: '300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  cubicFast: '150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  cubicSlow: '500ms cubic-bezier(0.4, 0.0, 0.2, 1)',

  // Easing Functions Spring
  spring: '350ms cubic-bezier(0.16, 1, 0.3, 1)',
  springFast: '250ms cubic-bezier(0.16, 1, 0.3, 1)',

  // Easing Functions Smooth
  smooth: '300ms ease-out',
  smoothFast: '150ms ease-out',
  smoothSlow: '500ms ease-out',
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

export const glassmorphism = {
  // Glass Effect Premium
  light: 'background: rgba(26, 26, 26, 0.4); backdrop-filter: blur(12px) saturate(180%);',
  medium: 'background: rgba(26, 26, 26, 0.6); backdrop-filter: blur(16px) saturate(180%);',
  heavy: 'background: rgba(26, 26, 26, 0.8); backdrop-filter: blur(20px) saturate(180%);',
  ultralight: 'background: rgba(26, 26, 26, 0.2); backdrop-filter: blur(8px) saturate(150%);',

  // Com border premium
  lightBorder: 'background: rgba(26, 26, 26, 0.4); backdrop-filter: blur(12px) saturate(180%); border: 1px solid rgba(212, 175, 55, 0.1);',
  mediumBorder: 'background: rgba(26, 26, 26, 0.6); backdrop-filter: blur(16px) saturate(180%); border: 1px solid rgba(212, 175, 55, 0.15);',
  heavyBorder: 'background: rgba(26, 26, 26, 0.8); backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(212, 175, 55, 0.2);',
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
  glassmorphism,
} as const;

export type Theme = typeof theme;
