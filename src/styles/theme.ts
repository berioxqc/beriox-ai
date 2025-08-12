// Système de thème centralisé pour Beriox AI
// Inspiré de Notion avec des tons violets personnalisés

export const theme = {
  // Couleurs principales
  colors: {
    // Palette violette personnalisée
    primary: {
      main: 'apos;#5a5fca'apos;,
      dark: 'apos;#4a4fb5'apos;,
      darker: 'apos;#3a3f9f'apos;,
      light: 'apos;#6b70d4'apos;,
      lighter: 'apos;#8b8fde'apos;
    },
    
    // Tons neutres sombres (style Notion)
    neutral: {
      900: 'apos;#0f0f0f'apos;,    // Noir profond
      800: 'apos;#1a1a1a'apos;,    // Sidebar background
      700: 'apos;#2a2a2a'apos;,    // Éléments sombres
      600: 'apos;#404040'apos;,    // Bordures sombres
      500: 'apos;#666666'apos;,    // Texte secondaire
      400: 'apos;#8a8a8a'apos;,    // Texte désactivé
      300: 'apos;#b3b3b3'apos;,    // Bordures claires
      200: 'apos;#d9d9d9'apos;,    // Arrière-plans légers
      100: 'apos;#f0f0f0'apos;,    // Arrière-plans très légers
      50: 'apos;#fafafa'apos;      // Blanc cassé
    },
    
    // États et feedback
    success: 'apos;#00d924'apos;,
    warning: 'apos;#f79009'apos;, 
    error: 'apos;#df1b41'apos;,
    info: 'apos;#0570de'apos;,
    
    // Arrière-plans
    background: {
      primary: 'apos;#ffffff'apos;,
      secondary: 'apos;#fafafa'apos;,
      tertiary: 'apos;#f5f5f5'apos;,
      dark: 'apos;#1a1a1a'apos;,
      darker: 'apos;#0f0f0f'apos;
    },
    
    // Textes
    text: {
      primary: 'apos;#0f0f0f'apos;,
      secondary: 'apos;#666666'apos;,
      tertiary: 'apos;#8a8a8a'apos;,
      inverse: 'apos;#ffffff'apos;,
      light: 'apos;#b3b3b3'apos;
    }
  },
  
  // Typographie
  typography: {
    fontFamily: {
      primary: 'apos;-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'apos;,
      mono: 'apos;"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'apos;
    },
    
    fontSize: {
      xs: 'apos;12px'apos;,
      sm: 'apos;14px'apos;,
      base: 'apos;16px'apos;,
      lg: 'apos;18px'apos;,
      xl: 'apos;20px'apos;,
      'apos;2xl'apos;: 'apos;24px'apos;,
      'apos;3xl'apos;: 'apos;30px'apos;,
      'apos;4xl'apos;: 'apos;36px'apos;
    },
    
    fontWeight: {
      normal: 'apos;400'apos;,
      medium: 'apos;500'apos;,
      semibold: 'apos;600'apos;,
      bold: 'apos;700'apos;
    },
    
    lineHeight: {
      tight: 'apos;1.25'apos;,
      normal: 'apos;1.5'apos;,
      relaxed: 'apos;1.75'apos;
    }
  },
  
  // Espacements
  spacing: {
    xs: 'apos;4px'apos;,
    sm: 'apos;8px'apos;,
    md: 'apos;16px'apos;,
    lg: 'apos;24px'apos;,
    xl: 'apos;32px'apos;,
    'apos;2xl'apos;: 'apos;48px'apos;,
    'apos;3xl'apos;: 'apos;64px'apos;,
    'apos;4xl'apos;: 'apos;96px'apos;
  },
  
  // Rayons de bordure
  borderRadius: {
    none: 'apos;0'apos;,
    sm: 'apos;4px'apos;,
    md: 'apos;6px'apos;,
    lg: 'apos;8px'apos;,
    xl: 'apos;12px'apos;,
    'apos;2xl'apos;: 'apos;16px'apos;,
    full: 'apos;50%'apos;
  },
  
  // Ombres
  shadows: {
    sm: 'apos;0 1px 2px rgba(0, 0, 0, 0.05)'apos;,
    md: 'apos;0 4px 6px rgba(0, 0, 0, 0.07)'apos;,
    lg: 'apos;0 10px 15px rgba(0, 0, 0, 0.1)'apos;,
    xl: 'apos;0 20px 25px rgba(0, 0, 0, 0.15)'apos;,
    inner: 'apos;inset 0 2px 4px rgba(0, 0, 0, 0.06)'apos;
  },
  
  // Transitions
  transitions: {
    fast: 'apos;0.15s ease'apos;,
    normal: 'apos;0.2s ease'apos;,
    slow: 'apos;0.3s ease'apos;
  },
  
  // Composants spécifiques
  components: {
    // Sidebar style Notion
    sidebar: {
      width: 'apos;256px'apos;,
      background: 'apos;#1a1a1a'apos;,
      borderColor: 'apos;rgba(255, 255, 255, 0.1)'apos;,
      textPrimary: 'apos;#ffffff'apos;,
      textSecondary: 'apos;rgba(255, 255, 255, 0.7)'apos;,
      textMuted: 'apos;rgba(255, 255, 255, 0.5)'apos;,
      hoverBackground: 'apos;rgba(255, 255, 255, 0.05)'apos;,
      activeBackground: 'apos;rgba(90, 95, 202, 0.2)'apos;,
      activeBorder: 'apos;#5a5fca'apos;
    },
    
    // Cartes
    card: {
      background: 'apos;#ffffff'apos;,
      border: 'apos;1px solid #e5e5e5'apos;,
      borderRadius: 'apos;8px'apos;,
      shadow: 'apos;0 2px 4px rgba(0, 0, 0, 0.04)'apos;,
      hoverShadow: 'apos;0 4px 12px rgba(0, 0, 0, 0.08)'apos;
    },
    
    // Boutons
    button: {
      primary: {
        background: 'apos;#5a5fca'apos;,
        backgroundHover: 'apos;#4a4fb5'apos;,
        color: 'apos;#ffffff'apos;,
        borderRadius: 'apos;6px'apos;,
        padding: 'apos;12px 24px'apos;
      },
      secondary: {
        background: 'apos;#f5f5f5'apos;,
        backgroundHover: 'apos;#e5e5e5'apos;,
        color: 'apos;#0f0f0f'apos;,
        borderRadius: 'apos;6px'apos;,
        padding: 'apos;12px 24px'apos;
      },
      ghost: {
        background: 'apos;transparent'apos;,
        backgroundHover: 'apos;rgba(90, 95, 202, 0.1)'apos;,
        color: 'apos;#5a5fca'apos;,
        borderRadius: 'apos;6px'apos;,
        padding: 'apos;12px 24px'apos;
      }
    },
    
    // Inputs
    input: {
      background: 'apos;#ffffff'apos;,
      border: 'apos;1px solid #d9d9d9'apos;,
      borderFocus: 'apos;#5a5fca'apos;,
      borderRadius: 'apos;6px'apos;,
      padding: 'apos;12px 16px'apos;,
      fontSize: 'apos;14px'apos;
    },
    
    // Status pills
    status: {
      pending: { background: 'apos;#fef3c7'apos;, color: 'apos;#92400e'apos;, border: 'apos;#fcd34d'apos; },
      progress: { background: 'apos;#dbeafe'apos;, color: 'apos;#1e40af'apos;, border: 'apos;#60a5fa'apos; },
      completed: { background: 'apos;#d1fae5'apos;, color: 'apos;#065f46'apos;, border: 'apos;#34d399'apos; },
      error: { background: 'apos;#fee2e2'apos;, color: 'apos;#991b1b'apos;, border: 'apos;#f87171'apos; }
    }
  }
};

// Utilitaires pour faciliter l'apos;usage
export const getColor = (path: string) => {
  return path.split('apos;.'apos;).reduce((obj: any, key) => obj?.[key], theme.colors);
};

export const getSpacing = (size: keyof typeof theme.spacing) => {
  return theme.spacing[size];
};

export const getTypography = (property: keyof typeof theme.typography, value: string) => {
  return (theme.typography[property] as any)[value];
};

// Styles CSS-in-JS helpers
export const createStyles = {
  card: () => ({
    background: theme.components.card.background,
    border: theme.components.card.border,
    borderRadius: theme.components.card.borderRadius,
    boxShadow: theme.components.card.shadow,
    transition: `box-shadow ${theme.transitions.normal}`,
    'apos;&:hover'apos;: {
      boxShadow: theme.components.card.hoverShadow
    }
  }),
  
  button: (variant: 'apos;primary'apos; | 'apos;secondary'apos; | 'apos;ghost'apos; = 'apos;primary'apos;) => ({
    background: theme.components.button[variant].background,
    color: theme.components.button[variant].color,
    border: 'apos;none'apos;,
    borderRadius: theme.components.button[variant].borderRadius,
    padding: theme.components.button[variant].padding,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    fontFamily: theme.typography.fontFamily.primary,
    cursor: 'apos;pointer'apos;,
    transition: `all ${theme.transitions.normal}`,
    'apos;&:hover'apos;: {
      background: theme.components.button[variant].backgroundHover
    },
    'apos;&:disabled'apos;: {
      opacity: 0.6,
      cursor: 'apos;not-allowed'apos;
    }
  }),
  
  input: () => ({
    background: theme.components.input.background,
    border: theme.components.input.border,
    borderRadius: theme.components.input.borderRadius,
    padding: theme.components.input.padding,
    fontSize: theme.components.input.fontSize,
    fontFamily: theme.typography.fontFamily.primary,
    outline: 'apos;none'apos;,
    transition: `border-color ${theme.transitions.fast}`,
    'apos;&:focus'apos;: {
      borderColor: theme.components.input.borderFocus
    }
  })
};

export default theme;
