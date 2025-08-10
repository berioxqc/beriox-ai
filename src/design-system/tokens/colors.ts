export const colors = {
  // Couleurs primaires
  primary: {
    50: '#f0f4ff',
    100: '#e0e9ff',
    200: '#c7d6ff',
    300: '#a5b8ff',
    400: '#7c93ff',
    500: '#635bff', // Couleur principale Beriox
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  
  // Couleurs secondaires
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#a855f7', // Violet Beriox
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
  
  // Couleurs sémantiques
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Couleurs neutres
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
  
  // Couleurs spéciales Beriox
  beriox: {
    orange: '#ff6b35',
    orangeHover: '#e55a2b',
    blue: '#635bff',
    purple: '#a855f7',
    gradient: 'linear-gradient(135deg, #635bff, #a855f7)',
  },
  
  // Couleurs de fond
  background: {
    primary: '#ffffff',
    secondary: '#f7f9fc',
    tertiary: '#f8fafc',
    modal: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Couleurs de bordure
  border: {
    light: '#e3e8ee',
    medium: '#d1d5db',
    dark: '#9ca3af',
  },
  
  // Couleurs de texte
  text: {
    primary: '#0a2540',
    secondary: '#425466',
    tertiary: '#8898aa',
    inverse: '#ffffff',
    muted: '#6b7280',
  },
} as const;

export type ColorToken = keyof typeof colors;
