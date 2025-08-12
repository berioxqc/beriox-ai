import { useMemo } from 'react'
import theme, { createStyles } from '@/styles/theme'
export const useTheme = () => {
  return useMemo(() => ({
    ...theme,
    styles: createStyles
  }), [])
}
// Hook pour créer des styles inline facilement
export const useStyles = () => {
  const t = useTheme()
  return {
    // Layouts
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: `0 ${t.spacing.lg}`
    },
    
    flexCenter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    
    flexBetween: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    
    // Textes
    title: {
      fontSize: t.typography.fontSize['2xl'],
      fontWeight: t.typography.fontWeight.bold,
      color: t.colors.text.primary,
      fontFamily: t.typography.fontFamily.primary,
      margin: 0
    },
    
    subtitle: {
      fontSize: t.typography.fontSize.lg,
      fontWeight: t.typography.fontWeight.semibold,
      color: t.colors.text.primary,
      fontFamily: t.typography.fontFamily.primary,
      margin: 0
    },
    
    body: {
      fontSize: t.typography.fontSize.base,
      fontWeight: t.typography.fontWeight.normal,
      color: t.colors.text.secondary,
      fontFamily: t.typography.fontFamily.primary,
      lineHeight: t.typography.lineHeight.normal,
      margin: 0
    },
    
    caption: {
      fontSize: t.typography.fontSize.sm,
      fontWeight: t.typography.fontWeight.normal,
      color: t.colors.text.tertiary,
      fontFamily: t.typography.fontFamily.primary,
      margin: 0
    },
    
    // Composants communs
    page: {
      minHeight: '100vh',
      background: t.colors.background.secondary,
      fontFamily: t.typography.fontFamily.primary
    },
    
    content: {
      marginLeft: t.components.sidebar.width,
      padding: t.spacing.xl,
      minHeight: '100vh'
    },
    
    section: {
      background: t.colors.background.primary,
      borderRadius: t.borderRadius.lg,
      padding: t.spacing.xl,
      boxShadow: t.shadows.sm,
      marginBottom: t.spacing.lg
    },
    
    // Status badges
    statusBadge: (status: 'pending' | 'progress' | 'completed' | 'error') => ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 12px',
      borderRadius: t.borderRadius.full,
      fontSize: t.typography.fontSize.xs,
      fontWeight: t.typography.fontWeight.medium,
      fontFamily: t.typography.fontFamily.primary,
      background: t.components.status[status].background,
      color: t.components.status[status].color,
      border: `1px solid ${t.components.status[status].border}`
    }),
    
    // Grilles
    grid: {
      display: 'grid',
      gap: t.spacing.lg
    },
    
    gridCols2: {
      gridTemplateColumns: 'repeat(2, 1fr)'
    },
    
    gridCols3: {
      gridTemplateColumns: 'repeat(3, 1fr)'
    },
    
    gridCols4: {
      gridTemplateColumns: 'repeat(4, 1fr)'
    }
  }
}
export default useTheme