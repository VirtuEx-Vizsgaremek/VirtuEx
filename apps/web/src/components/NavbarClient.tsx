/**
 * NavbarClient Component
 *
 * Client-side navbar that receives `isLoggedIn` from the Navbar server
 * component and renders auth-aware navigation.
 *
 * Guest layout:
 *   Left:   Premium | About Us
 *   Center: Logo
 *   Right:  Sign Up | Log In | Color theme picker | Dark/Light toggle
 *
 * Authenticated layout:
 *   Left:   Market | Wallet
 *   Center: Logo
 *   Right:  Settings (gear icon) | Log Out | Color theme picker | Dark/Light toggle
 *
 * Also renders a floating pill navbar that slides in after scrolling 100 px,
 * and a mobile hamburger drawer.
 *
 * All icon-only buttons have a `title` attribute for native browser tooltips.
 */

'use client';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { type ChartColorTheme, THEME_NAMES } from '@/lib/chartThemes';
import { logout } from '@/lib/actions';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LogOut,
  Menu,
  Moon,
  Palette,
  Settings,
  Sun,
  TrendingUp,
  Wallet,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Props = {
  isLoggedIn: boolean;
};

export default function NavbarClient({ isLoggedIn }: Props) {
  const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();
  const isDark = theme === 'dark';
  const pathname = usePathname();

  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showFloatingThemeMenu, setShowFloatingThemeMenu] = useState(false);

  const themeMenuRef = useRef<HTMLDivElement | null>(null);
  const floatingThemeMenuRef = useRef<HTMLDivElement | null>(null);

  // Show floating navbar after scrolling 100 px
  useEffect(() => {
    const handleScroll = () => setShowFloatingNav(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close theme dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        themeMenuRef.current &&
        !themeMenuRef.current.contains(e.target as Node)
      ) {
        setShowThemeMenu(false);
      }
      if (
        floatingThemeMenuRef.current &&
        !floatingThemeMenuRef.current.contains(e.target as Node)
      ) {
        setShowFloatingThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  // ── Shared helpers ────────────────────────────────────────────────────────

  function isActive(href: string) {
    return pathname === href;
  }

  const navLinkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      isActive(href)
        ? 'text-primary font-semibold'
        : 'text-foreground hover:text-primary'
    }`;

  // ── Shared sub-components ─────────────────────────────────────────────────

  /** Color theme picker dropdown */
  function ThemePicker({
    open,
    setOpen,
    containerRef
  }: {
    open: boolean;
    setOpen: (v: boolean) => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
  }) {
    return (
      <div
        className="relative"
        ref={containerRef as React.RefObject<HTMLDivElement>}
      >
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full"
          onClick={() => setOpen(!open)}
          title="Change color theme"
        >
          <Palette className="w-4 h-4" />
        </Button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-200 py-1">
            {(Object.keys(THEME_NAMES) as ChartColorTheme[]).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setColorTheme(key);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  colorTheme === key
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {THEME_NAMES[key]}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /** Dark / light mode toggle button */
  function ThemeToggle({ size = 'sm' }: { size?: 'sm' | 'default' }) {
    const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <Button
        size="icon"
        variant="ghost"
        className="rounded-full"
        onClick={toggleTheme}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? <Sun className={iconSize} /> : <Moon className={iconSize} />}
      </Button>
    );
  }

  // ── Guest nav links ───────────────────────────────────────────────────────

  const guestLinks = (
    <>
      <Link href="/subscription" className={navLinkClass('/subscription')}>
        Premium
      </Link>
      <Link href="/#about" className={navLinkClass('/#about')}>
        About Us
      </Link>
    </>
  );

  // ── Auth nav links ────────────────────────────────────────────────────────

  const authLinks = (
    <>
      <Link
        href="/market"
        className={`flex items-center gap-1.5 ${navLinkClass('/market')}`}
        title="Market"
      >
        <TrendingUp className="w-4 h-4" />
        <span>Market</span>
      </Link>
      <Link
        href="/wallet"
        className={`flex items-center gap-1.5 ${navLinkClass('/wallet')}`}
        title="Wallet"
      >
        <Wallet className="w-4 h-4" />
        <span>Wallet</span>
      </Link>
    </>
  );

  // ── Guest action buttons ──────────────────────────────────────────────────

  const guestActions = (
    <div className="hidden md:flex items-center gap-2">
      <Button variant="outline" size="sm" className="rounded-full" asChild>
        <Link href="/auth/register">Sign Up</Link>
      </Button>
      <Button size="sm" className="rounded-full" asChild>
        <Link href="/auth/login">Log In</Link>
      </Button>
      <ThemePicker
        open={showThemeMenu}
        setOpen={setShowThemeMenu}
        containerRef={themeMenuRef}
      />
      <ThemeToggle />
    </div>
  );

  // ── Auth action buttons ───────────────────────────────────────────────────

  const authActions = (
    <div className="hidden md:flex items-center gap-1">
      <Link href="/profile" title="Settings">
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </Link>
      <form action={logout}>
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
          title="Log Out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </form>
      <ThemePicker
        open={showThemeMenu}
        setOpen={setShowThemeMenu}
        containerRef={themeMenuRef}
      />
      <ThemeToggle />
    </div>
  );

  // ── Mobile drawer content ─────────────────────────────────────────────────

  const mobileDrawerGuest = (
    <div className="md:hidden border-t border-border bg-card px-4 py-4 flex flex-col gap-3">
      <Link
        href="/subscription"
        className="text-foreground hover:text-primary transition-colors text-sm font-medium py-1"
      >
        Premium
      </Link>
      <Link
        href="/#about"
        className="text-foreground hover:text-primary transition-colors text-sm font-medium py-1"
      >
        About Us
      </Link>
      <div className="border-t border-border pt-3 flex flex-col gap-2">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/auth/register">Sign Up</Link>
        </Button>
        <Button size="sm" className="w-full" asChild>
          <Link href="/auth/login">Log In</Link>
        </Button>
      </div>
      <div className="border-t border-border pt-3">
        <p className="text-xs text-muted-foreground mb-2">Color Theme</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(THEME_NAMES) as ChartColorTheme[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                setColorTheme(key);
                setShowMobileMenu(false);
              }}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                colorTheme === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {THEME_NAMES[key]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const mobileDrawerAuth = (
    <div className="md:hidden border-t border-border bg-card px-4 py-4 flex flex-col gap-3">
      <Link
        href="/market"
        className="flex items-center gap-2 text-foreground hover:text-primary transition-colors text-sm font-medium py-1"
      >
        <TrendingUp className="w-4 h-4" />
        Market
      </Link>
      <Link
        href="/wallet"
        className="flex items-center gap-2 text-foreground hover:text-primary transition-colors text-sm font-medium py-1"
      >
        <Wallet className="w-4 h-4" />
        Wallet
      </Link>
      <Link
        href="/profile"
        className="flex items-center gap-2 text-foreground hover:text-primary transition-colors text-sm font-medium py-1"
      >
        <Settings className="w-4 h-4" />
        Settings
      </Link>
      <div className="border-t border-border pt-3">
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 text-destructive hover:text-destructive/80 transition-colors text-sm font-medium py-1 w-full"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </form>
      </div>
      <div className="border-t border-border pt-3">
        <p className="text-xs text-muted-foreground mb-2">Color Theme</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(THEME_NAMES) as ChartColorTheme[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                setColorTheme(key);
                setShowMobileMenu(false);
              }}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                colorTheme === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {THEME_NAMES[key]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Hamburger icon ────────────────────────────────────────────────────────

  const hamburgerIcon = showMobileMenu ? (
    <X className="w-5 h-5" />
  ) : (
    <Menu className="w-5 h-5" />
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Floating Navbar — appears on scroll ─────────────────────────── */}
      <nav
        className={`fixed w-[92%] md:w-[70%] top-4 left-1/2 -translate-x-1/2 z-60 transition-all duration-300 ${
          showFloatingNav
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-card/95 backdrop-blur-md border border-border shadow-lg rounded-2xl md:rounded-full px-4 md:px-6 py-3 flex justify-between items-center">
          {/* Left links */}
          <div className="hidden md:flex items-center gap-5">
            {isLoggedIn ? (
              <>
                <Link
                  href="/market"
                  className={`flex items-center gap-1.5 ${navLinkClass('/market')}`}
                  title="Market"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Market</span>
                </Link>
                <Link
                  href="/wallet"
                  className={`flex items-center gap-1.5 ${navLinkClass('/wallet')}`}
                  title="Wallet"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Wallet</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/subscription"
                  className={navLinkClass('/subscription')}
                >
                  Premium
                </Link>
                <Link href="/#about" className={navLinkClass('/#about')}>
                  About Us
                </Link>
              </>
            )}
          </div>

          {/* Logo — centered on desktop, left on mobile */}
          <Image
            src="/VirtuEx_logo_pfp-bg-gl-cr.svg"
            alt="VirtuEx"
            width={28}
            height={28}
            className="h-7 w-auto md:absolute md:left-1/2 md:-translate-x-1/2"
          />

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-1">
            {isLoggedIn ? (
              <>
                <Link href="/profile" title="Settings">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
                <form action={logout}>
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  asChild
                >
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
                <Button size="sm" className="rounded-full" asChild>
                  <Link href="/auth/login">Log In</Link>
                </Button>
              </>
            )}
            <ThemePicker
              open={showFloatingThemeMenu}
              setOpen={setShowFloatingThemeMenu}
              containerRef={floatingThemeMenuRef}
            />
            <ThemeToggle />
          </div>

          {/* Mobile: theme + hamburger */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full"
              onClick={() => setShowMobileMenu((v) => !v)}
              title="Toggle menu"
            >
              {hamburgerIcon}
            </Button>
          </div>
        </div>

        {/* Floating mobile drawer */}
        {showMobileMenu && (
          <div className="md:hidden mt-2 bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-lg px-4 py-4 flex flex-col gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/market"
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors text-sm font-medium py-1"
                >
                  <TrendingUp className="w-4 h-4" />
                  Market
                </Link>
                <Link
                  href="/wallet"
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors text-sm font-medium py-1"
                >
                  <Wallet className="w-4 h-4" />
                  Wallet
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors text-sm font-medium py-1"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <div className="border-t border-border pt-2">
                  <form action={logout}>
                    <button
                      type="submit"
                      className="flex items-center gap-2 text-destructive hover:text-destructive/80 transition-colors text-sm font-medium py-1 w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/subscription"
                  className="text-foreground hover:text-primary transition-colors text-sm font-medium py-1"
                >
                  Premium
                </Link>
                <Link
                  href="/#about"
                  className="text-foreground hover:text-primary transition-colors text-sm font-medium py-1"
                >
                  About Us
                </Link>
                <div className="border-t border-border pt-3 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link href="/auth/register">Sign Up</Link>
                  </Button>
                  <Button size="sm" className="w-full" asChild>
                    <Link href="/auth/login">Log In</Link>
                  </Button>
                </div>
              </>
            )}
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-2">Color Theme</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(THEME_NAMES) as ChartColorTheme[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setColorTheme(key);
                      setShowMobileMenu(false);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                      colorTheme === key
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    {THEME_NAMES[key]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Static top Navbar ────────────────────────────────────────────── */}
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="flex justify-between items-center gap-4 mx-auto max-w-[95%] md:max-w-[85%] px-2 md:px-1 py-3">
          {/* Desktop: left nav links */}
          <div className="hidden md:flex items-center gap-6">
            {isLoggedIn ? authLinks : guestLinks}
          </div>

          {/* Mobile: hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setShowMobileMenu((v) => !v)}
            aria-label="Toggle menu"
            title="Toggle menu"
          >
            {hamburgerIcon}
          </button>

          {/* Logo */}
          <Link href="/" title="Home">
            <Image
              src="/VirtuEx_logo_pfp-bg-gl-cr.svg"
              alt="VirtuEx"
              width={40}
              height={40}
              className="h-10 md:h-12 w-auto"
            />
          </Link>

          {/* Desktop: right action buttons */}
          {isLoggedIn ? authActions : guestActions}

          {/* Mobile: theme toggle only */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile drawer — drops below the static navbar */}
        {showMobileMenu && (isLoggedIn ? mobileDrawerAuth : mobileDrawerGuest)}
      </nav>
    </>
  );
}
