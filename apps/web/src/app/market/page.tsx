'use client';
import AssetNav from '@/components/AssetNav';
import Chart from '@/components/ShadCnChart';
import TradingView from '@/components/TradingView';
import { useTheme } from '@/contexts/ThemeContext';
import { ChartColorTheme, THEME_NAMES } from '@/lib/chartThemes';
import { Moon, Palette, Pin, Sun, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Market() {
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [isPremium, setIsPremium] = useState(true);
  const [showAssetNav, setShowAssetNav] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);
  const [isAssetNavPinned, setIsAssetNavPinned] = useState(false);
  const [navbarHideTimeout, setNavbarHideTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleNavbarMouseEnter = () => {
    if (navbarHideTimeout) {
      clearTimeout(navbarHideTimeout);
      setNavbarHideTimeout(null);
    }
    setShowNavbar(true);
  };

  const handleNavbarMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowNavbar(false);
    }, 300); // 300ms delay before hiding
    setNavbarHideTimeout(timeout);
  };

  const closeNav = (selected: string) => {
    setSelectedSymbol(selected);
    if (!isAssetNavPinned) {
      setShowAssetNav(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Top hover zone for navbar */}
      <div
        className="fixed top-0 left-0 right-0 h-6 z-40 pointer-events-none"
        onMouseEnter={() => setShowNavbar(true)}
      >
        {/* Subtle indicator bar */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 bg-primary/30 rounded-b-full transition-all duration-300 pointer-events-auto ${
            showNavbar ? 'w-64 h-2.5 bg-primary/50' : 'w-48 h-2'
          }`}
          onMouseEnter={() => setShowNavbar(true)}
        />

        {/* Floating Navbar */}
        <nav
          className={`absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl transition-all duration-300 pointer-events-auto ${
            showNavbar
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-8 pointer-events-none'
          }`}
          onMouseEnter={handleNavbarMouseEnter}
          onMouseLeave={handleNavbarMouseLeave}
        >
          <div className="bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-full px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-6">
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

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Color Theme Selector */}
              <div className="relative group">
                <button
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  title="Change Color Theme"
                >
                  <Palette size={18} />
                </button>
                <div className="absolute right-0 top-12 bg-card border border-border rounded-lg shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[160px]">
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

              {/* Premium Toggle */}
              <button
                onClick={() => setIsPremium(!isPremium)}
                className="px-4 py-2 text-xs bg-primary text-primary-foreground rounded-full hover:bg-primary/80 transition-all"
              >
                {isPremium ? 'Free' : 'Premium'}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Left hover zone for AssetNav */}
      {/* <div
        className="fixed left-0 top-0 bottom-0 w-6 z-110"
        onMouseEnter={() => setShowAssetNav(true)}
        onMouseLeave={() => !isAssetNavPinned && setShowAssetNav(false)}
      > */}
      {/* Subtle indicator bar */}
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-32 bg-primary/30 rounded-r-full transition-all duration-300 hover:w-3 hover:h-48 hover:bg-primary/50 z-30"
        onClick={(prev) => setShowAssetNav(showAssetNav ? false : true)}
      />

      {/* Sliding AssetNav */}
      <div
        className={`${isAssetNavPinned ? 'relative' : 'absolute'} left-0 top-0 bottom-0 w-96 bg-background transition-transform duration-300 z-100 ${
          showAssetNav ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative h-full">
          {/* Close and Pin buttons */}
          <div className="absolute top-4 right-4 z-100 flex gap-2">
            <button
              onClick={() => {
                setShowAssetNav(false);
                setIsAssetNavPinned(false);
              }}
              className="p-2 bg-card hover:bg-muted rounded-full border border-border transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>
            <button
              onClick={() => setIsAssetNavPinned(!isAssetNavPinned)}
              className={`p-2 rounded-full border border-border transition-colors ${
                isAssetNavPinned
                  ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                  : 'bg-card hover:bg-muted'
              }`}
              title={isAssetNavPinned ? 'Unpin' : 'Pin'}
            >
              <Pin size={16} />
            </button>
          </div>

          <AssetNav selectedSymbol={selectedSymbol} onSelectSymbol={closeNav} />
        </div>
      </div>

      {/* Main Chart Area */}
      <div
        className={`flex-1 w-full h-full transition-all duration-300 ${isAssetNavPinned ? 'p-4' : 'p-8'} z-20`}
        onClick={
          showAssetNav && !isAssetNavPinned
            ? () => setShowAssetNav(false)
            : undefined
        }
      >
        {isPremium ? (
          <TradingView
            symbol={selectedSymbol}
            onClearSelection={() => setSelectedSymbol('')}
          />
        ) : (
          <div className="h-full">
            <Chart />
          </div>
        )}
      </div>
    </div>
  );
}
