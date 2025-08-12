export const colors = {
  // Couleurs primaires
  primary: {
    50: 'apos;#f0f4ff'apos;,
    100: 'apos;#e0e9ff'apos;,
    200: 'apos;#c7d6ff'apos;,
    300: 'apos;#a5b8ff'apos;,
    400: 'apos;#7c93ff'apos;,
    500: 'apos;#635bff'apos;, // Couleur principale Beriox
    600: 'apos;#4f46e5'apos;,
    700: 'apos;#4338ca'apos;,
    800: 'apos;#3730a3'apos;,
    900: 'apos;#312e81'apos;,
  },
  
  // Couleurs secondaires
  secondary: {
    50: 'apos;#fdf4ff'apos;,
    100: 'apos;#fae8ff'apos;,
    200: 'apos;#f5d0fe'apos;,
    300: 'apos;#f0abfc'apos;,
    400: 'apos;#e879f9'apos;,
    500: 'apos;#a855f7'apos;, // Violet Beriox
    600: 'apos;#9333ea'apos;,
    700: 'apos;#7c3aed'apos;,
    800: 'apos;#6b21a8'apos;,
    900: 'apos;#581c87'apos;,
  },
  
  // Couleurs sémantiques
  success: {
    50: 'apos;#f0fdf4'apos;,
    100: 'apos;#dcfce7'apos;,
    200: 'apos;#bbf7d0'apos;,
    300: 'apos;#86efac'apos;,
    400: 'apos;#4ade80'apos;,
    500: 'apos;#22c55e'apos;,
    600: 'apos;#16a34a'apos;,
    700: 'apos;#15803d'apos;,
    800: 'apos;#166534'apos;,
    900: 'apos;#14532d'apos;,
  },
  
  warning: {
    50: 'apos;#fffbeb'apos;,
    100: 'apos;#fef3c7'apos;,
    200: 'apos;#fde68a'apos;,
    300: 'apos;#fcd34d'apos;,
    400: 'apos;#fbbf24'apos;,
    500: 'apos;#f59e0b'apos;,
    600: 'apos;#d97706'apos;,
    700: 'apos;#b45309'apos;,
    800: 'apos;#92400e'apos;,
    900: 'apos;#78350f'apos;,
  },
  
  error: {
    50: 'apos;#fef2f2'apos;,
    100: 'apos;#fee2e2'apos;,
    200: 'apos;#fecaca'apos;,
    300: 'apos;#fca5a5'apos;,
    400: 'apos;#f87171'apos;,
    500: 'apos;#ef4444'apos;,
    600: 'apos;#dc2626'apos;,
    700: 'apos;#b91c1c'apos;,
    800: 'apos;#991b1b'apos;,
    900: 'apos;#7f1d1d'apos;,
  },
  
  // Couleurs neutres
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
  
  // Couleurs spéciales Beriox
  beriox: {
    orange: 'apos;#ff6b35'apos;,
    orangeHover: 'apos;#e55a2b'apos;,
    blue: 'apos;#635bff'apos;,
    purple: 'apos;#a855f7'apos;,
    gradient: 'apos;linear-gradient(135deg, #635bff, #a855f7)'apos;,
  },
  
  // Couleurs de fond
  background: {
    primary: 'apos;#ffffff'apos;,
    secondary: 'apos;#f7f9fc'apos;,
    tertiary: 'apos;#f8fafc'apos;,
    modal: 'apos;rgba(0, 0, 0, 0.5)'apos;,
  },
  
  // Couleurs de bordure
  border: {
    light: 'apos;#e3e8ee'apos;,
    medium: 'apos;#d1d5db'apos;,
    dark: 'apos;#9ca3af'apos;,
  },
  
  // Couleurs de texte
  text: {
    primary: 'apos;#0a2540'apos;,
    secondary: 'apos;#425466'apos;,
    tertiary: 'apos;#8898aa'apos;,
    inverse: 'apos;#ffffff'apos;,
    muted: 'apos;#6b7280'apos;,
  },
} as const;

export type ColorToken = keyof typeof colors;
