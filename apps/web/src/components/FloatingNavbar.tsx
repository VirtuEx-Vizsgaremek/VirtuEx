'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { type ChartColorTheme, THEME_NAMES } from '@/lib/chartThemes';
import { Moon, Palette, Sun } from 'lucide-react';
import Link from 'next/link';

type FloatingNavbarProps = {
  show: boolean;
  onCloseAction: () => void;
  isPremium: boolean;
  onTogglePremiumAction: () => void;
};

export default function FloatingNavbar({
  show,
  onCloseAction,
  isPremium,
  onTogglePremiumAction
}: FloatingNavbarProps) {
  const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      {show && (
        <div
          className="fixed inset-0 z-900"
          style={{ pointerEvents: 'auto', background: 'transparent' }}
          onClick={onCloseAction}
          aria-label="Close navbar overlay"
        />
      )}
      <div
        className="fixed top-0 left-0 right-0 h-6 z-1000 pointer-events-none"
        onMouseEnter={() => {}}
      >
        <nav
          className={`absolute top-4 left-1/2 w-[90%] md:w-[50%] max-w-6xl transition-all duration-300 pointer-events-auto ${
            show
              ? 'opacity-100 -translate-x-1/2'
              : 'opacity-0 translate-x-[50vw] pointer-events-none'
          }`}
        >
          <div className="bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl md:rounded-full px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0">
            <div className="flex items-center justify-between w-full md:w-auto gap-6">
              <Link href="/" className="text-xl font-bold text-primary">
                VirtuEx
              </Link>
              <div className="flex gap-4">
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/market"
                  className="text-sm text-foreground font-semibold"
                >
                  Market
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div className="relative group">
                <button
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  title="Change Color Theme"
                >
                  <Palette size={18} />
                </button>
                <div className="absolute right-0 top-12 bg-card border border-border rounded-lg shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-40">
                  {(Object.keys(THEME_NAMES) as ChartColorTheme[]).map(
                    (themeKey) => (
                      <button
                        key={themeKey}
                        onClick={() => setColorTheme(themeKey)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          colorTheme === themeKey
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {THEME_NAMES[themeKey]}
                      </button>
                    )
                  )}
                </div>
              </div>

              <button
                onClick={onTogglePremiumAction}
                className="px-4 py-2 text-xs bg-primary text-primary-foreground rounded-full hover:bg-primary/80 transition-all"
              >
                {isPremium ? 'Free' : 'Premium'}
              </button>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
