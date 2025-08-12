export * from 'apos;./colors'apos;;
export * from 'apos;./typography'apos;;
export * from 'apos;./spacing'apos;;

// Système de design unifié
export const designTokens = {
  colors: {
    primary: 'apos;#635bff'apos;,
    secondary: 'apos;#a855f7'apos;,
    success: 'apos;#22c55e'apos;,
    warning: 'apos;#f59e0b'apos;,
    error: 'apos;#ef4444'apos;,
    neutral: {
      50: 'apos;#f8fafc'apos;,
      100: 'apos;#f1f5f9'apos;,
      200: 'apos;#e2e8f0'apos;,
      300: 'apos;#cbd5e1'apos;,
      400: 'apos;#94a3b8'apos;,
      500: 'apos;#64748b'apos;,
      600: 'apos;#475569'apos;,
      700: 'apos;#334155'apos;,
      800: 'apos;#1e293b'apos;,
      900: 'apos;#0f172a'apos;,
    },
    beriox: {
      orange: 'apos;#ff6b35'apos;,
      orangeHover: 'apos;#e55a2b'apos;,
      blue: 'apos;#635bff'apos;,
      purple: 'apos;#a855f7'apos;,
      gradient: 'apos;linear-gradient(135deg, #635bff, #a855f7)'apos;,
    },
    background: {
      primary: 'apos;#ffffff'apos;,
      secondary: 'apos;#f7f9fc'apos;,
      tertiary: 'apos;#f8fafc'apos;,
    },
    border: {
      light: 'apos;#e3e8ee'apos;,
      medium: 'apos;#d1d5db'apos;,
      dark: 'apos;#9ca3af'apos;,
    },
    text: {
      primary: 'apos;#0a2540'apos;,
      secondary: 'apos;#425466'apos;,
      tertiary: 'apos;#8898aa'apos;,
      inverse: 'apos;#ffffff'apos;,
      muted: 'apos;#6b7280'apos;,
    },
  },
  
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif",
    fontSize: {
      xs: 'apos;12px'apos;,
      sm: 'apos;14px'apos;,
      base: 'apos;16px'apos;,
      lg: 'apos;18px'apos;,
      xl: 'apos;20px'apos;,
      'apos;2xl'apos;: 'apos;24px'apos;,
      'apos;3xl'apos;: 'apos;30px'apos;,
      'apos;4xl'apos;: 'apos;36px'apos;,
      'apos;5xl'apos;: 'apos;48px'apos;,
    },
    fontWeight: {
      normal: 'apos;400'apos;,
      medium: 'apos;500'apos;,
      semibold: 'apos;600'apos;,
      bold: 'apos;700'apos;,
    },
  },
  
  spacing: {
    0: 'apos;0'apos;,
    1: 'apos;4px'apos;,
    2: 'apos;8px'apos;,
    3: 'apos;12px'apos;,
    4: 'apos;16px'apos;,
    5: 'apos;20px'apos;,
    6: 'apos;24px'apos;,
    8: 'apos;32px'apos;,
    10: 'apos;40px'apos;,
    12: 'apos;48px'apos;,
    16: 'apos;64px'apos;,
    20: 'apos;80px'apos;,
    24: 'apos;96px'apos;,
    32: 'apos;128px'apos;,
    40: 'apos;160px'apos;,
    48: 'apos;192px'apos;,
    56: 'apos;224px'apos;,
    64: 'apos;256px'apos;,
  },
  
  borderRadius: {
    none: 'apos;0'apos;,
    sm: 'apos;4px'apos;,
    base: 'apos;6px'apos;,
    md: 'apos;8px'apos;,
    lg: 'apos;12px'apos;,
    xl: 'apos;16px'apos;,
    'apos;2xl'apos;: 'apos;24px'apos;,
    full: 'apos;9999px'apos;,
  },
  
  shadows: {
    none: 'apos;none'apos;,
    sm: 'apos;0 1px 2px 0 rgba(0, 0, 0, 0.05)'apos;,
    base: 'apos;0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'apos;,
    md: 'apos;0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'apos;,
    lg: 'apos;0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'apos;,
    xl: 'apos;0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'apos;,
    'apos;2xl'apos;: 'apos;0 25px 50px -12px rgba(0, 0, 0, 0.25)'apos;,
    beriox: 'apos;0 4px 6px -1px rgba(99, 91, 255, 0.2)'apos;,
    berioxHover: 'apos;0 6px 12px -1px rgba(99, 91, 255, 0.3)'apos;,
  },
} as const;
