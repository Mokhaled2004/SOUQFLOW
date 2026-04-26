/**
 * SouqFlow Color Palette
 * Centralized color configuration for the entire platform
 * Green-based theme with Emerald, Teal, and Lime accents
 * Change colors here and they'll update everywhere
 */

export const colors = {
  // Primary Brand Colors - Emerald Green
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#10B981', // Main brand color - Emerald Green
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // Secondary Colors - Teal (Flow/Connectivity)
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#06B6D4', // Teal - Flow accent
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },

  // Success Colors - Lime Green (Energy/CTAs)
  success: {
    50: '#f7fee7',
    100: '#ecfccf',
    200: '#d9f99d',
    300: '#bfef45',
    400: '#a3e635',
    500: '#84CC16', // Lime Green - Energy & CTAs
    600: '#65a30d',
    700: '#4d7c0f',
    800: '#3f6212',
    900: '#365314',
  },

  // Warning Colors - Warm Amber (Secondary CTAs)
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Warm Amber - Secondary accent
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Error Colors
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

  // Neutral/Gray Colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Semantic Colors
  text: {
    primary: '#171717', // neutral-900
    secondary: '#525252', // neutral-600
    tertiary: '#a3a3a3', // neutral-400
    light: '#fafafa', // neutral-50
  },

  background: {
    primary: '#ffffff',
    secondary: '#fafafa', // neutral-50
    tertiary: '#f5f5f5', // neutral-100
  },

  border: {
    light: '#e5e5e5', // neutral-200
    default: '#d4d4d4', // neutral-300
    dark: '#a3a3a3', // neutral-400
  },

  // Shadows
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
};

// Export individual color groups for easier access
export const brandColors = colors.primary;
export const accentColors = colors.secondary;
export const semanticColors = {
  text: colors.text,
  background: colors.background,
  border: colors.border,
};
