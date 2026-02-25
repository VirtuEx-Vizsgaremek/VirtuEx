/**
 * Market Trading Page Component
 *
 * Main page for stock/crypto market data visualization and trading features.
 * Provides layout management for collapsible asset navigation panel, premium chart,
 * and floating control navbar.
 *
 * Features:
 * - Floating navbar with theme toggle and premium/free mode switch
 * - Collapsible AssetNav sidebar that can be pinned to lock position
 * - TradingView chart with real-time data (premium mode)
 * - Responsive design with dynamic layout adjustment when nav is pinned
 * - Chart resizes automatically when layout changes (via ResizeObserver in TradingView)
 *
 * State Management:
 * - selectedSymbol: Currently selected stock for TradingView chart
 * - isAssetNavPinned: Whether sidebar is locked or overlays chart
 * - showAssetNav: Whether sidebar is visible or hidden
 * - showNavbar: Whether top navigation is visible
 * - isPremium: Toggle between advanced TradingView chart and simple chart
 *
 * Layout Behavior:
 * - When AssetNav is unpinned: sidebar overlays chart (absolute positioning)
 * - When AssetNav is pinned: sidebar takes fixed space, chart shifts right (relative positioning)
 * - ResizeObserver in TradingView detects container size changes and resizes chart
 */

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
  // ========== State Management ==========

  // Selected stock symbol for TradingView chart
  // Empty string means no stock selected (showing generated mock data)
  const [selectedSymbol, setSelectedSymbol] = useState('');

  // Toggle between premium TradingView chart and free simple chart
  const [isPremium, setIsPremium] = useState(true);

  // Visibility state for AssetNav sidebar
  // false = hidden (off-screen), true = visible (overlaying or pinned)
  const [showAssetNav, setShowAssetNav] = useState(false);

  // Visibility state for floating navbar at top
  // Controlled by mouse enter/leave with 300ms delay to prevent flickering
  const [showNavbar, setShowNavbar] = useState(false);

  // Pin state for AssetNav sidebar
  // false = overlay mode (absolute positioning, goes off-screen when hidden)
  // true = pinned mode (relative positioning, takes fixed space, chart shifts right)
  // When pinned, chart container uses ResizeObserver to detect size change and resize
  const [isAssetNavPinned, setIsAssetNavPinned] = useState(false);

  // Timeout ID for delayed navbar hiding (prevents flickering on mouse leave)
  const [navbarHideTimeout, setNavbarHideTimeout] =
    useState<NodeJS.Timeout | null>(null);

  // Theme context: provides theme toggle and color theme selector
  const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();
  const isDark = theme === 'dark';

  // ========== Event Handlers ==========

  /**
   * Handle navbar mouse enter - show navbar and clear hide timeout
   * Prevents premature hiding when transitioning from navbar to indicator bar
   */
  const handleNavbarMouseEnter = () => {
    if (navbarHideTimeout) {
      clearTimeout(navbarHideTimeout);
      setNavbarHideTimeout(null);
    }
    setShowNavbar(true);
  };

  /**
   * Handle navbar mouse leave - hide navbar after 300ms delay
   * Delay allows user to move between navbar and indicator bar without flickering
   */
  const handleNavbarMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowNavbar(false);
    }, 300); // 300ms delay before hiding
    setNavbarHideTimeout(timeout);
  };

  /**
   * Close navigation sidebar after selecting a stock
   * Updates selectedSymbol for TradingView component
   * Only closes sidebar if it's not pinned (unpinned = overlay mode)
   *
   * @param selected - Stock symbol selected by user (e.g., "AAPL")
   */
  const closeNav = (selected: string) => {
    setSelectedSymbol(selected);
    // Only hide nav if unpinned (pinned nav stays visible)
    if (!isAssetNavPinned) {
      setShowAssetNav(false);
    }
  };

  return (
    // Main layout container
    // flex: Side-by-side layout for nav (if pinned) and chart
    // h-screen: Full viewport height
    // overflow-hidden: Prevents scrollbars, content managed by components
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

      {/* AssetNav Sidebar */}
      {/* 
        Positioning Strategy:
        - When unpinned (isAssetNavPinned=false): absolute positioning + translate-x transformation
          * Slides in/out of screen on left edge
          * Overlays chart content (z-100 on top)
          * transform: translateX-full when hidden, 0 when shown
        - When pinned (isAssetNavPinned=true): relative positioning
          * Takes fixed w-96 space, pushes chart right via flex layout
          * TradingView's ResizeObserver detects container size change and resizes chart
          * Always visible (no translation)
        - transition-transform: Smooth slide animation during visibility toggle
      */}
      <div
        className={`${isAssetNavPinned ? 'relative' : 'absolute'} left-0 top-0 bottom-0 w-96 bg-background transition-transform duration-300 z-100 ${
          showAssetNav ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative h-full">
          {/* Control Buttons - Always visible in top-right corner */}
          <div className="absolute top-4 right-4 z-100 flex gap-2">
            {/* Close Button */}
            {/* Hides sidebar. If pinned, unpin first to exit pinned mode */}
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

            {/* Pin/Unpin Button */}
            {/* Toggle pinned state - affects layout positioning and chart resizing */}
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

          {/* Stock Selection List */}
          {/* Selected symbol triggers TradingView to fetch real data */}
          <AssetNav selectedSymbol={selectedSymbol} onSelectSymbol={closeNav} />
        </div>
      </div>

      {/* Main Chart Container */}
      {/* 
        Layout Behavior:
        - flex-1: Takes all remaining horizontal space (shrinks when nav pinned)
        - w-full h-full: Fills container
        - transition-all: Smooth padding change when nav pins/unpins
        - onClick handler: Click outside sidebar (when overlaying) closes it
        - TradingView component: Uses ResizeObserver to detect container size changes
          and automatically resizes chart without remounting
      */}
      <div
        className={`flex-1 w-full h-full transition-all duration-300 ${isAssetNavPinned ? 'p-4' : 'p-8'} z-20`}
        onClick={
          showAssetNav && !isAssetNavPinned
            ? () => setShowAssetNav(false)
            : undefined
        }
      >
        {/* Premium Mode: Advanced TradingView Chart */}
        {/* Shows real stock data with OHLC and area charts, crosshair overlays */}
        {isPremium ? (
          <TradingView
            symbol={selectedSymbol}
            onClearSelection={() => setSelectedSymbol('')}
          />
        ) : (
          /* Free Mode: Simple Chart Component */
          <div className="h-full">
            <Chart />
          </div>
        )}
      </div>
    </div>
  );
}
