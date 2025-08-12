// Système de thème centralisé pour Beriox AI
// Inspiré de Notion avec des tons violets personnalisés

export const theme = {
  // Couleurs principales
  colors: {
    // Palette violette personnalisée
    primary: {
      main: '#5a5fca',
      dark: '#4a4fb5',
      darker: '#3a3f9f',
      light: '#6b70d4',
      lighter: '#8b8fde'
    },
    
    // Tons neutres sombres (style Notion)
    neutral: {
      900: '#0f0f0f',    // Noir profond
      800: '#1a1a1a',    // Sidebar background
      700: '#2a2a2a',    // Éléments sombres
      600: '#404040',    // Bordures sombres
      500: '#666666',    // Texte secondaire
      400: '#8a8a8a',    // Texte désactivé
      300: '#b3b3b3',    // Bordures claires
      200: '#d9d9d9',    // Arrière-plans légers
      100: '#f0f0f0',    // Arrière-plans très légers
      50: '#fafafa'      // Blanc cassé
    },
    
    // États et feedback
    success: '#00d924',
    warning: '#f79009', 
    error: '#df1b41',
    info: '#0570de',
    
    // Arrière-plans
    background: {
      primary: '#ffffff',
      secondary: '#fafafa',
      tertiary: '#f5f5f5',
      dark: '#1a1a1a',
      darker: '#0f0f0f'
    },
    
    // Textes
    text: {
      primary: '#0f0f0f',
      secondary: '#666666',
      tertiary: '#8a8a8a',
      inverse: '#ffffff',
      light: '#b3b3b3'
    }
  },
  
  // Typographie
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
    },
    
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px'
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },
  
  // Espacements
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px'
  },
  
  // Rayons de bordure
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '50%'
  },
  
  // Ombres
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)'
  },
  
  // Transitions
  transitions: {
    fast: '0.15s ease',
    normal: '0.2s ease',
    slow: '0.3s ease'
  },
  
  // Composants spécifiques
  components: {
    // Sidebar style Notion
    sidebar: {
      width: '256px',
      background: '#1a1a1a',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textPrimary: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      textMuted: 'rgba(255, 255, 255, 0.5)',
      hoverBackground: 'rgba(255, 255, 255, 0.05)',
      activeBackground: 'rgba(90, 95, 202, 0.2)',
      activeBorder: '#5a5fca'
    },
    
    // Cartes
    card: {
      background: '#ffffff',
      border: '1px solid #e5e5e5',
      borderRadius: '8px',
      shadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
      hoverShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
    },
    
    // Boutons
    button: {
      primary: {
        background: '#5a5fca',
        backgroundHover: '#4a4fb5',
        color: '#ffffff',
        borderRadius: '6px',
        padding: '12px 24px'
      },
      secondary: {
        background: '#f5f5f5',
        backgroundHover: '#e5e5e5',
        color: '#0f0f0f',
        borderRadius: '6px',
        padding: '12px 24px'
      },
      ghost: {
        background: 'transparent',
        backgroundHover: 'rgba(90, 95, 202, 0.1)',
        color: '#5a5fca',
        borderRadius: '6px',
        padding: '12px 24px'
      }
    },
    
    // Inputs
    input: {
      background: '#ffffff',
      border: '1px solid #d9d9d9',
      borderFocus: '#5a5fca',
      borderRadius: '6px',
      padding: '12px 16px',
      fontSize: '14px'
    },
    
    // Status pills
    status: {
      pending: { background: '#fef3c7', color: '#92400e', border: '#fcd34d' },
      progress: { background: '#dbeafe', color: '#1e40af', border: '#60a5fa' },
      completed: { background: '#d1fae5', color: '#065f46', border: '#34d399' },
      error: { background: '#fee2e2', color: '#991b1b', border: '#f87171' }
    }
  }
}
// Utilitaires pour faciliter l'usage
export const getColor = (path: string) => {
  return path.split('.').reduce((obj: any, key) => obj?.[key], theme.colors)
}
export const getSpacing = (size: keyof typeof theme.spacing) => {
  return theme.spacing[size]
}
export const getTypography = (property: keyof typeof theme.typography, value: string) => {
  return (theme.typography[property] as any)[value]
}
// Styles CSS-in-JS helpers
export const createStyles = {
  card: () => ({
    background: theme.components.card.background,
    border: theme.components.card.border,
    borderRadius: theme.components.card.borderRadius,
    boxShadow: theme.components.card.shadow,
    transition: `box-shadow ${theme.transitions.normal}`,
    '&:hover': {
      boxShadow: theme.components.card.hoverShadow
    }
  }),
  
  button: (variant: 'primary' | 'secondary' | 'ghost' = 'primary') => ({
    background: theme.components.button[variant].background,
    color: theme.components.button[variant].color,
    border: 'none',
    borderRadius: theme.components.button[variant].borderRadius,
    padding: theme.components.button[variant].padding,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    fontFamily: theme.typography.fontFamily.primary,
    cursor: 'pointer',
    transition: `all ${theme.transitions.normal}`,
    '&:hover': {
      background: theme.components.button[variant].backgroundHover
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed'
    }
  }),
  
  input: () => ({
    background: theme.components.input.background,
    border: theme.components.input.border,
    borderRadius: theme.components.input.borderRadius,
    padding: theme.components.input.padding,
    fontSize: theme.components.input.fontSize,
    fontFamily: theme.typography.fontFamily.primary,
    outline: 'none',
    transition: `border-color ${theme.transitions.fast}`,
    '&:focus': {
      borderColor: theme.components.input.borderFocus
    }
  })
}
export default theme