import { useMemo } from 'apos;react'apos;;
import theme, { createStyles } from 'apos;@/styles/theme'apos;;

export const useTheme = () => {
  return useMemo(() => ({
    ...theme,
    styles: createStyles
  }), []);
};

// Hook pour créer des styles inline facilement
export const useStyles = () => {
  const t = useTheme();
  
  return {
    // Layouts
    container: {
      maxWidth: 'apos;1200px'apos;,
      margin: 'apos;0 auto'apos;,
      padding: `0 ${t.spacing.lg}`
    },
    
    flexCenter: {
      display: 'apos;flex'apos;,
      alignItems: 'apos;center'apos;,
      justifyContent: 'apos;center'apos;
    },
    
    flexBetween: {
      display: 'apos;flex'apos;,
      alignItems: 'apos;center'apos;,
      justifyContent: 'apos;space-between'apos;
    },
    
    // Textes
    title: {
      fontSize: t.typography.fontSize['apos;2xl'apos;],
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
      minHeight: 'apos;100vh'apos;,
      background: t.colors.background.secondary,
      fontFamily: t.typography.fontFamily.primary
    },
    
    content: {
      marginLeft: t.components.sidebar.width,
      padding: t.spacing.xl,
      minHeight: 'apos;100vh'apos;
    },
    
    section: {
      background: t.colors.background.primary,
      borderRadius: t.borderRadius.lg,
      padding: t.spacing.xl,
      boxShadow: t.shadows.sm,
      marginBottom: t.spacing.lg
    },
    
    // Status badges
    statusBadge: (status: 'apos;pending'apos; | 'apos;progress'apos; | 'apos;completed'apos; | 'apos;error'apos;) => ({
      display: 'apos;inline-flex'apos;,
      alignItems: 'apos;center'apos;,
      padding: 'apos;4px 12px'apos;,
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
      display: 'apos;grid'apos;,
      gap: t.spacing.lg
    },
    
    gridCols2: {
      gridTemplateColumns: 'apos;repeat(2, 1fr)'apos;
    },
    
    gridCols3: {
      gridTemplateColumns: 'apos;repeat(3, 1fr)'apos;
    },
    
    gridCols4: {
      gridTemplateColumns: 'apos;repeat(4, 1fr)'apos;
    }
  };
};

export default useTheme;
