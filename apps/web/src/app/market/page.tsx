'use client';
import Chart from '@/components/ShadCnChart';
import AssetNav from '@/components/AssetNav';
import TradingView from '@/components/TradingView';
import { useState } from 'react';
import { Menu, X, Moon, Sun, Palette } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { THEME_NAMES, ChartColorTheme } from '@/lib/chartThemes';

export default function Market() {
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [isPremium, setIsPremium] = useState(true);
  const [showAssetNav, setShowAssetNav] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);
  const [isAssetNavPinned, setIsAssetNavPinned] = useState(false);

  const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="relative h-screen overflow-hidden bg-background">
      {/* Top hover zone for navbar */}
      <div
        className="fixed top-0 left-0 right-0 h-16 z-40"
        onMouseEnter={() => setShowNavbar(true)}
        onMouseLeave={() => setShowNavbar(false)}
      >
        {/* Subtle indicator bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-primary/30 rounded-b-full transition-all duration-300 hover:h-2 hover:w-48 hover:bg-primary/50" />

        {/* Floating Navbar */}
        <nav
          className={`absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl transition-all duration-300 ${
            showNavbar
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-8 pointer-events-none'
          }`}
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
      <div
        className="fixed left-0 top-0 bottom-0 w-16 z-40"
        onMouseEnter={() => setShowAssetNav(true)}
        onMouseLeave={() => !isAssetNavPinned && setShowAssetNav(false)}
      >
        {/* Subtle indicator bar */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-32 bg-primary/30 rounded-r-full transition-all duration-300 hover:w-2 hover:h-48 hover:bg-primary/50" />

        {/* Sliding AssetNav */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-80 bg-background transition-transform duration-300 ${
            showAssetNav ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="relative h-full">
            {/* Pin/Close button */}
            <button
              onClick={() => {
                setIsAssetNavPinned(!isAssetNavPinned);
                if (isAssetNavPinned) setShowAssetNav(false);
              }}
              className="absolute top-4 right-4 z-10 p-2 bg-card hover:bg-muted rounded-full border border-border transition-colors"
              title={isAssetNavPinned ? 'Unpin' : 'Pin'}
            >
              {isAssetNavPinned ? <X size={16} /> : <Menu size={16} />}
            </button>

            <AssetNav
              selectedSymbol={selectedSymbol}
              onSelectSymbol={setSelectedSymbol}
            />
          </div>
        </div>
      </div>

      {/* Menu button (always visible) */}
      <button
        onClick={() => {
          setShowAssetNav(!showAssetNav);
          setIsAssetNavPinned(!showAssetNav);
        }}
        className="fixed left-4 top-4 z-50 p-3 bg-card hover:bg-muted rounded-full border border-border shadow-lg transition-all hover:scale-110"
        title="Toggle Asset List"
      >
        <Menu size={20} />
      </button>

      {/* Main Chart Area */}
      <div className="w-full h-full p-8">
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
