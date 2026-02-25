/**
 * Theme Context Provider
 *
 * Manages application-wide theme state (dark/light mode) and chart color themes.
 * Provides context hooks for consuming components to access and update theme settings.
 *
 * Features:
 * - Dark/light mode toggle with persistent storage
 * - Multiple chart color themes (MIDNIGHT, OCEAN, TOKYO, etc.)
 * - Theme migration for renamed old themes (backward compatibility)
 * - Automatic synchronization with document root classes for CSS-in-JS
 * - Local storage persistence across page reloads
 *
 * Usage:
 * const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();
 *
 * Data Flow:
 * Theme settings -> localStorage + document.documentElement.classList -> CSS variables/colors
 */

'use client';

import {
  CHART_THEMES,
  ChartColorTheme,
  THEME_CSS_CLASSES
} from '@/lib/chartThemes';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';

/**
 * Available theme modes
 */
type Theme = 'light' | 'dark';

/**
 * ThemeContext type definition
 * Provides all theme-related state and setters
 */
interface ThemeContextType {
  // Current theme mode (light or dark)
  theme: Theme;
  // Set theme programmatically (called by toggleTheme)
  setTheme: (theme: Theme) => void;
  // Toggle between light and dark mode
  toggleTheme: () => void;
  // Current chart color theme (MIDNIGHT, OCEAN, TOKYO, etc.)
  colorTheme: ChartColorTheme;
  // Set chart color theme (updates all chart components)
  setColorTheme: (colorTheme: ChartColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [colorTheme, setColorThemeState] =
    useState<ChartColorTheme>('DARK_GRAY');

  useEffect(() => {
    // Read theme from document class (already set by blocking script)
    const isDark = document.documentElement.classList.contains('dark');
    setThemeState(isDark ? 'dark' : 'light');

    // Read color theme from localStorage with migration for old theme names
    const savedColorTheme = localStorage.getItem('colorTheme');

    // Migration map for old theme names
    const migrationMap: Record<string, ChartColorTheme> = {
      MIDNIGHT_PURPLE: 'MIDNIGHT',
      DARK_BLUE: 'BLUE',
      TEAL: 'OCEAN',
      PURPLE: 'TOKYO'
    };

    const migratedTheme = savedColorTheme
      ? ((migrationMap[savedColorTheme] || savedColorTheme) as ChartColorTheme)
      : 'MIDNIGHT';

    // Verify the theme exists in CHART_THEMES, fallback to MIDNIGHT if not
    const validTheme = CHART_THEMES[migratedTheme] ? migratedTheme : 'MIDNIGHT';

    setColorThemeState(validTheme);
    localStorage.setItem('colorTheme', validTheme);

    // Get the base theme class (without 'dark')
    const themeClass = THEME_CSS_CLASSES[validTheme].replace(' dark', '');

    // Apply the theme class
    document.documentElement.className = themeClass;

    // Add 'dark' class if we're in dark mode (use isDark, not theme state)
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const setColorTheme = useCallback((newColorTheme: ChartColorTheme) => {
    setColorThemeState(newColorTheme);
    localStorage.setItem('colorTheme', newColorTheme);

    // Get the base theme class (without 'dark')
    const themeClass = THEME_CSS_CLASSES[newColorTheme].replace(' dark', '');

    // Check if currently in dark mode by reading the DOM
    const isDarkMode = document.documentElement.classList.contains('dark');

    // Set the theme class
    document.documentElement.className = themeClass;

    // Add 'dark' class back if we were in dark mode
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggleTheme, colorTheme, setColorTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
