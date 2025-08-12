export const spacing = {
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
} as const;

export const borderRadius = {
  none: 'apos;0'apos;,
  sm: 'apos;4px'apos;,
  base: 'apos;6px'apos;,
  md: 'apos;8px'apos;,
  lg: 'apos;12px'apos;,
  xl: 'apos;16px'apos;,
  'apos;2xl'apos;: 'apos;24px'apos;,
  full: 'apos;9999px'apos;,
} as const;

export const shadows = {
  none: 'apos;none'apos;,
  sm: 'apos;0 1px 2px 0 rgba(0, 0, 0, 0.05)'apos;,
  base: 'apos;0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'apos;,
  md: 'apos;0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'apos;,
  lg: 'apos;0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'apos;,
  xl: 'apos;0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'apos;,
  'apos;2xl'apos;: 'apos;0 25px 50px -12px rgba(0, 0, 0, 0.25)'apos;,
  inner: 'apos;inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'apos;,
  beriox: 'apos;0 4px 6px -1px rgba(99, 91, 255, 0.2)'apos;,
  berioxHover: 'apos;0 6px 12px -1px rgba(99, 91, 255, 0.3)'apos;,
} as const;

export type SpacingToken = keyof typeof spacing;
export type BorderRadiusToken = keyof typeof borderRadius;
export type ShadowToken = keyof typeof shadows;
