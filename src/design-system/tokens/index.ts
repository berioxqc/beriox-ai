export * from './colors';
export * from './typography';
export * from './spacing';

// Système de design unifié
export const designTokens = {
  colors: {
    primary: '#635bff',
    secondary: '#a855f7',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    beriox: {
      orange: '#ff6b35',
      orangeHover: '#e55a2b',
      blue: '#635bff',
      purple: '#a855f7',
      gradient: 'linear-gradient(135deg, #635bff, #a855f7)',
    },
    background: {
      primary: '#ffffff',
      secondary: '#f7f9fc',
      tertiary: '#f8fafc',
    },
    border: {
      light: '#e3e8ee',
      medium: '#d1d5db',
      dark: '#9ca3af',
    },
    text: {
      primary: '#0a2540',
      secondary: '#425466',
      tertiary: '#8898aa',
      inverse: '#ffffff',
      muted: '#6b7280',
    },
  },
  
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  spacing: {
    0: '0',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    32: '128px',
    40: '160px',
    48: '192px',
    56: '224px',
    64: '256px',
  },
  
  borderRadius: {
    none: '0',
    sm: '4px',
    base: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    beriox: '0 4px 6px -1px rgba(99, 91, 255, 0.2)',
    berioxHover: '0 6px 12px -1px rgba(99, 91, 255, 0.3)',
  },
} as const;
