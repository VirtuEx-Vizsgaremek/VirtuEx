'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { logout } from '@/lib/actions';
import { type ChartColorTheme, THEME_NAMES } from '@/lib/chartThemes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LogIn,
  LogOut,
  Moon,
  Palette,
  Settings,
  Sun,
  TrendingUp,
  UserPlus,
  Wallet
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type MarketNavbarProps = {
  show: boolean;
  onCloseAction: () => void;
  isLoggedIn?: boolean;
};

export default function MarketNavbar({
  show,
  onCloseAction,
  isLoggedIn = false
}: MarketNavbarProps) {
  const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();
  const isDark = theme === 'dark';
  const pathname = usePathname();
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  // Close the color theme menu when clicking outside of it
  useEffect(() => {
    if (!themeMenuOpen) return;
    const handleClick = (e: Event) => {
      if (
        themeMenuRef.current &&
        !themeMenuRef.current.contains(e.target as Node)
      ) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [themeMenuOpen]);

  function isActive(href: string) {
    return pathname === href;
  }

  const navLinkClass = (href: string) =>
    `text-sm transition-colors ${
      isActive(href)
        ? 'text-primary font-semibold'
        : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <>
      {/* Click-outside overlay to close */}
      {show && (
        <div
          className="fixed inset-0 z-900"
          style={{ pointerEvents: 'auto', background: 'transparent' }}
          onClick={onCloseAction}
          aria-label="Close navbar overlay"
        />
      )}

      <div className="fixed top-0 left-0 right-0 h-6 z-1000 pointer-events-none">
        <nav
          className={`absolute top-4 left-1/2 w-[90%] md:w-[60%] max-w-4xl transition-all duration-300 pointer-events-auto ${
            show
              ? 'opacity-100 -translate-x-1/2'
              : 'opacity-0 translate-x-[50vw] pointer-events-none'
          }`}
        >
          <div className="bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl md:rounded-full px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0">
            {/* ── Left: Logo + Nav links ──────────────────────────────── */}
            <div className="flex items-center justify-between w-full md:w-auto gap-5">
              <Link
                href="/"
                className="text-xl font-bold text-primary shrink-0"
                title="Home"
                onClick={onCloseAction}
              >
                VirtuEx
              </Link>

              <div className="flex items-center gap-4">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/market"
                      className={`flex items-center gap-1 ${navLinkClass('/market')}`}
                      title="Market"
                      onClick={onCloseAction}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Market</span>
                    </Link>
                    <Link
                      href="/wallet"
                      className={`flex items-center gap-1 ${navLinkClass('/wallet')}`}
                      title="Wallet"
                      onClick={onCloseAction}
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      <span>Wallet</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/subscription"
                      className={navLinkClass('/subscription')}
                      title="Premium plans"
                      onClick={onCloseAction}
                    >
                      Premium
                    </Link>
                    <Link
                      href="/about"
                      className={navLinkClass('/about')}
                      title="About Us"
                      onClick={onCloseAction}
                    >
                      About Us
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* ── Right: Actions ──────────────────────────────────────── */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              {/* Dark / light toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Color theme picker */}
              <div className="relative" ref={themeMenuRef}>
                <button
                  onClick={() => setThemeMenuOpen((v) => !v)}
                  className={`p-2 rounded-full transition-colors ${themeMenuOpen ? 'bg-muted' : 'hover:bg-muted'}`}
                  title="Change Color Theme"
                >
                  <Palette size={16} />
                </button>
                {themeMenuOpen && (
                  <div className="absolute right-0 top-11 bg-card border border-border rounded-lg shadow-xl p-1.5 min-w-44 z-[1100]">
                    {(Object.keys(THEME_NAMES) as ChartColorTheme[]).map(
                      (key) => (
                        <button
                          key={key}
                          onClick={() => {
                            setColorTheme(key);
                            setThemeMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            colorTheme === key
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          {THEME_NAMES[key]}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {isLoggedIn ? (
                <>
                  {/* Settings */}
                  <Link href="/profile" onClick={onCloseAction}>
                    <button
                      className="p-2 rounded-full hover:bg-muted transition-colors"
                      title="Settings"
                    >
                      <Settings size={16} />
                    </button>
                  </Link>
                  {/* Log Out */}
                  <form action={logout}>
                    <button
                      type="submit"
                      className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
                      title="Log Out"
                    >
                      <LogOut size={16} />
                    </button>
                  </form>
                </>
              ) : (
                <>
                  {/* Sign Up */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-1.5"
                    asChild
                  >
                    <Link
                      href="/auth/register"
                      title="Create an account"
                      onClick={onCloseAction}
                    >
                      <UserPlus size={14} />
                      Sign Up
                    </Link>
                  </Button>
                  {/* Log In */}
                  <Button size="sm" className="rounded-full gap-1.5" asChild>
                    <Link
                      href="/auth/login"
                      title="Log in to your account"
                      onClick={onCloseAction}
                    >
                      <LogIn size={14} />
                      Log In
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
