/**
 * TradingView Chart Color Themes
 * Centralized theme definitions for consistent chart styling across the application
 */

export type ChartColorTheme =
  | 'MIDNIGHT'
  | 'DARK_GRAY'
  | 'BLUE'
  | 'DARK_BLUE'
  | 'OCEAN'
  | 'TOKYO';

export interface ChartColors {
  background: string;
  textColor: string;
  gridColor: string;
  borderColor: string;
  areaLine: string;
  areaTop: string;
  areaBottom: string;
  candleUp: string;
  candleDown: string;
}

export interface ChartTheme {
  dark: ChartColors;
  light: ChartColors;
}

export const CHART_THEMES: Record<ChartColorTheme, ChartTheme> = {
  MIDNIGHT: {
    // Deep midnight purple theme - rich indigo with subtle purple tones
    dark: {
      background: '#0a0a12', // Very dark purple-gray
      textColor: '#fafafa', // Bright white
      gridColor: 'rgba(255, 255, 255, 0.06)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      areaLine: '#4338ca', // Deep indigo-700
      areaTop: 'rgba(67, 56, 202, 0.3)',
      areaBottom: 'rgba(67, 56, 202, 0.0)',
      candleUp: '#6366f1', // Indigo-500 (price increased - bullish)
      candleDown: '#8b5cf6' // Purple-500 (price decreased - bearish)
    },
    light: {
      background: '#ffffff',
      textColor: '#1f2937',
      gridColor: 'rgba(0, 0, 0, 0.05)',
      borderColor: 'rgba(0, 0, 0, 0.1)',
      areaLine: '#6366f1', // Indigo-500
      areaTop: 'rgba(99, 102, 241, 0.3)',
      areaBottom: 'rgba(99, 102, 241, 0.0)',
      candleUp: '#059669', // Green-600
      candleDown: '#dc2626' // Red-600
    }
  },
  DARK_GRAY: {
    // Neutral dark gray theme - pure grays and blues, no purple tones
    dark: {
      background: '#1a1a1a', // Pure neutral dark gray
      textColor: '#f5f5f5', // Pure white
      gridColor: 'rgba(255, 255, 255, 0.06)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      areaLine: '#3b82f6', // Pure blue-500
      areaTop: 'rgba(59, 130, 246, 0.3)',
      areaBottom: 'rgba(59, 130, 246, 0.0)',
      candleUp: '#10b981', // Green-500
      candleDown: '#ef4444' // Red-500
    },
    light: {
      background: '#ffffff',
      textColor: '#1f2937',
      gridColor: 'rgba(0, 0, 0, 0.05)',
      borderColor: 'rgba(0, 0, 0, 0.1)',
      areaLine: '#6366f1',
      areaTop: 'rgba(99, 102, 241, 0.3)',
      areaBottom: 'rgba(99, 102, 241, 0.0)',
      candleUp: '#059669',
      candleDown: '#dc2626'
    }
  },
  BLUE: {
    // Deep navy blue theme - rich dark blue inspired by premium crypto sites
    dark: {
      background: '#0a1628', // Very dark navy blue
      textColor: '#f0f4ff', // Light blue-tinted white
      gridColor: 'rgba(59, 130, 246, 0.08)',
      borderColor: 'rgba(59, 130, 246, 0.15)',
      areaLine: '#3b82f6', // Blue-500
      areaTop: 'rgba(59, 130, 246, 0.4)',
      areaBottom: 'rgba(59, 130, 246, 0.05)',
      candleUp: '#22c55e', // Green-500
      candleDown: '#ef4444' // Red-500
    },
    light: {
      background: '#ffffff',
      textColor: '#1e293b',
      gridColor: 'rgba(59, 130, 246, 0.08)',
      borderColor: 'rgba(59, 130, 246, 0.15)',
      areaLine: '#2563eb', // Blue-600
      areaTop: 'rgba(37, 99, 235, 0.3)',
      areaBottom: 'rgba(37, 99, 235, 0.0)',
      candleUp: '#16a34a', // Green-600
      candleDown: '#dc2626' // Red-600
    }
  },
  DARK_BLUE: {
    // Deep dark blue theme with bright blue accents
    dark: {
      background: '#010922', // blue-charcoal
      textColor: '#e6f2f9', // link-water
      gridColor: 'rgba(121, 169, 251, 0.1)', // malibu tinted
      borderColor: 'rgba(121, 169, 251, 0.15)', // malibu tinted
      areaLine: '#0255fd', // blue-ribbon
      areaTop: 'rgba(2, 85, 253, 0.4)',
      areaBottom: 'rgba(2, 85, 253, 0.05)',
      candleUp: '#22c55e', // Green-500
      candleDown: '#ef4444' // Red-500
    },
    light: {
      background: '#ffffff',
      textColor: '#010922',
      gridColor: 'rgba(25, 93, 224, 0.1)', // denim tinted
      borderColor: 'rgba(25, 93, 224, 0.2)',
      areaLine: '#195de0', // denim
      areaTop: 'rgba(25, 93, 224, 0.3)',
      areaBottom: 'rgba(25, 93, 224, 0.0)',
      candleUp: '#16a34a', // Green-600
      candleDown: '#dc2626' // Red-600
    }
  },
  OCEAN: {
    // Teal/ocean design - cool teal and cyan tones with dark background
    dark: {
      background: '#0f1419',
      textColor: '#e5e7eb',
      gridColor: 'rgba(20, 184, 166, 0.08)',
      borderColor: 'rgba(20, 184, 166, 0.15)',
      areaLine: '#14b8a6', // Teal-500
      areaTop: 'rgba(20, 184, 166, 0.4)',
      areaBottom: 'rgba(20, 184, 166, 0.05)',
      candleUp: '#10b981', // Green-500
      candleDown: '#ef4444' // Red-500
    },
    light: {
      background: '#ffffff',
      textColor: '#1f2937',
      gridColor: 'rgba(20, 184, 166, 0.08)',
      borderColor: 'rgba(20, 184, 166, 0.15)',
      areaLine: '#0d9488', // Teal-600
      areaTop: 'rgba(13, 148, 136, 0.3)',
      areaBottom: 'rgba(13, 148, 136, 0.0)',
      candleUp: '#059669', // Green-600
      candleDown: '#dc2626' // Red-600
    }
  },
  TOKYO: {
    // Purple/violet gradient design - vibrant Tokyo Night theme
    dark: {
      background: '#1a1625',
      textColor: '#e9d5ff',
      gridColor: 'rgba(167, 139, 250, 0.05)',
      borderColor: 'rgba(167, 139, 250, 0.12)',
      areaLine: '#a855f7', // Purple-500
      areaTop: 'rgba(168, 85, 247, 0.4)',
      areaBottom: 'rgba(168, 85, 247, 0.05)',
      candleUp: '#22d3ee', // Cyan-400
      candleDown: '#f472b6' // Pink-400
    },
    light: {
      background: '#faf5ff',
      textColor: '#581c87',
      gridColor: 'rgba(147, 51, 234, 0.06)',
      borderColor: 'rgba(147, 51, 234, 0.12)',
      areaLine: '#9333ea', // Purple-600
      areaTop: 'rgba(147, 51, 234, 0.3)',
      areaBottom: 'rgba(147, 51, 234, 0.05)',
      candleUp: '#059669', // Green-600
      candleDown: '#dc2626' // Red-600
    }
  }
};

// Theme name display mappings
export const THEME_NAMES: Record<ChartColorTheme, string> = {
  MIDNIGHT: 'Midnight Purple',
  DARK_GRAY: 'Dark Gray',
  BLUE: 'Blue',
  DARK_BLUE: 'Dark Blue',
  OCEAN: 'Teal Ocean',
  TOKYO: 'Tokyo Night'
};

// CSS class mappings for website themes (matches global.css)
export const THEME_CSS_CLASSES: Record<ChartColorTheme, string> = {
  MIDNIGHT: 'midnight dark',
  DARK_GRAY: 'dark',
  BLUE: 'blue dark',
  DARK_BLUE: 'dark-blue dark',
  OCEAN: 'ocean dark',
  TOKYO: 'tokyo dark'
};
