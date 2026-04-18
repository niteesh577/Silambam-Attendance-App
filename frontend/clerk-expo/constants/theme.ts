import { Platform } from 'react-native';

// ─── Brand Palette ────────────────────────────────────────────────────────────
export const Colors = {
  // Primary — Silambam crimson
  primary:       '#C0392B',
  primaryLight:  '#E74C3C',
  primaryDark:   '#922B21',

  // Accent — gold
  accent:        '#F39C12',
  accentLight:   '#F5B942',

  // Dark surfaces
  background:    '#0F0F14',
  surface:       '#1C1C24',
  surfaceHigh:   '#252530',
  border:        '#2A2A36',
  borderLight:   '#3A3A48',

  // Text
  textPrimary:   '#FFFFFF',
  textSecondary: '#8F9BB3',
  textMuted:     '#5A5A72',

  // Semantic
  success:       '#27AE60',
  warning:       '#F39C12',
  error:         '#E74C3C',
  info:          '#2980B9',

  // Legacy (kept for themed-text / themed-view compatibility)
  light: {
    text:            '#FFFFFF',
    background:      '#0F0F14',
    tint:            '#C0392B',
    icon:            '#8F9BB3',
    tabIconDefault:  '#5A5A72',
    tabIconSelected: '#C0392B',
  },
  dark: {
    text:            '#FFFFFF',
    background:      '#0F0F14',
    tint:            '#C0392B',
    icon:            '#8F9BB3',
    tabIconDefault:  '#5A5A72',
    tabIconSelected: '#C0392B',
  },
} as const;

// ─── Belt Colors ──────────────────────────────────────────────────────────────
export const BeltColors: Record<string, string> = {
  white:  '#F0F0F0',
  yellow: '#F1C40F',
  orange: '#E67E22',
  green:  '#27AE60',
  blue:   '#2980B9',
  red:    '#E74C3C',
  brown:  '#795548',
  black:  '#37474F',
};

export const BeltTextColors: Record<string, string> = {
  white:  '#1A1A1A',
  yellow: '#1A1A1A',
  orange: '#FFFFFF',
  green:  '#FFFFFF',
  blue:   '#FFFFFF',
  red:    '#FFFFFF',
  brown:  '#FFFFFF',
  black:  '#FFFFFF',
};

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────
export const Radius = {
  sm:   6,
  md:   12,
  lg:   18,
  xl:   24,
  full: 9999,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const FontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  24,
  xxxl: 30,
} as const;

export const FontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
  black:    '900' as const,
};

// ─── Fonts ────────────────────────────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans:    'System',
    mono:    'Courier New',
    rounded: 'System',
  },
  default: {
    sans:    'sans-serif',
    mono:    'monospace',
    rounded: 'sans-serif',
  },
  web: {
    sans:    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono:    "SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace",
    rounded: "system-ui, sans-serif",
  },
});

