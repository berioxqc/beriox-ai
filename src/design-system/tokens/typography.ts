export const typography = {
  fontFamily: {
    primary: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif",
    mono: "ui-monospace, SFMono-Regular, 'apos;SF Mono'apos;, Consolas, 'apos;Liberation Mono'apos;, Menlo, monospace",
  },
  
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
    extrabold: 'apos;800'apos;,
  },
  
  lineHeight: {
    tight: 'apos;1.25'apos;,
    normal: 'apos;1.5'apos;,
    relaxed: 'apos;1.75'apos;,
  },
  
  letterSpacing: {
    tight: 'apos;-0.02em'apos;,
    normal: 'apos;0'apos;,
    wide: 'apos;0.025em'apos;,
  },
} as const;

export type TypographyToken = keyof typeof typography;
