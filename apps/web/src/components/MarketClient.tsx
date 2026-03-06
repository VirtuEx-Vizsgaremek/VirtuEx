/**
 * MarketClient Component
 *
 * Client-side logic for the Market page. Receives `isLoggedIn` from the
 * server component wrapper (page.tsx) so the FloatingNavbar can render
 * auth-aware links without any client-side fetch or flash.
 *
 * Features:
 * - Floating navbar with theme toggle, premium/free mode switch, and nav links
 * - Collapsible AssetNav sidebar that can be pinned to lock position
 * - TradingView chart with real-time data (premium mode)
 * - Responsive design: desktop side-icon-bar, mobile bottom bar
 * - Chart resizes automatically when layout changes (via ResizeObserver in TradingView)
 *
 * Responsive Layout:
 * - Mobile   (< md): full-height chart, bottom bar with asset + navbar toggles
 * - Desktop (>= md): left 56 px icon column + top 56 px header row
 *
 * State Management:
 * - selectedSymbol: Currently selected stock for TradingView chart
 * - showAssetNav:   Whether asset sidebar is visible
 * - showNavbar:     Whether floating navbar is visible
 * - isPremium:      Toggle between advanced TradingView chart and simple chart
 */

'use client';

import AssetNav from '@/components/AssetNav';
import Chart from '@/components/ShadCnChart';
import TradingView from '@/components/TradingView';
import FloatingNavbar from '@/components/FloatingNavbar';
import { BarChart2, PanelLeft, PanelTop } from 'lucide-react';
import { useState } from 'react';

type Props = {
  isLoggedIn: boolean;
};

export default function MarketClient({ isLoggedIn }: Props) {
  // ── State ──────────────────────────────────────────────────────────────────

  /** Currently selected stock symbol for the TradingView chart */
  const [selectedSymbol, setSelectedSymbol] = useState('');

  /** Toggle between premium (TradingView) and free (simple) chart */
  const [isPremium, setIsPremium] = useState(true);

  /** Whether the asset sidebar is visible */
  const [showAssetNav, setShowAssetNav] = useState(false);

  /** Whether the floating navbar is visible */
  const [showNavbar, setShowNavbar] = useState(false);

  const handleSelectSymbol = (selected: string) => {
    setSelectedSymbol(selected);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    /**
     * Outer wrapper
     * Mobile:  single column — chart fills viewport, bottom bar pinned at bottom
     * Desktop: 56 px left icon column + 56 px top header row
     */
    <div
      className="
        flex flex-col h-screen overflow-hidden bg-background
        md:grid md:grid-cols-[56px_1fr] md:grid-rows-[56px_1fr]
      "
    >
      {/* ── Top header row (desktop only) ────────────────────────────────── */}
      <div
        className="
          hidden
          md:flex md:col-span-2 md:row-start-1
          items-center justify-end border-b border-border bg-background px-3 z-50
        "
      >
        <button
          onClick={() => setShowNavbar((prev) => !prev)}
          className="p-2 rounded-full border border-border bg-card hover:bg-muted transition-colors"
          title="Toggle navigation menu"
        >
          <PanelTop size={24} />
        </button>
      </div>

      {/* ── Floating Navbar ───────────────────────────────────────────────── */}
      <FloatingNavbar
        show={showNavbar}
        onCloseAction={() => setShowNavbar(false)}
        isPremium={isPremium}
        onTogglePremiumAction={() => setIsPremium((prev) => !prev)}
        isLoggedIn={isLoggedIn}
      />

      {/* ── Left icon column (desktop only) ──────────────────────────────── */}
      <div
        className="
          hidden
          md:flex md:row-start-2 md:col-start-1
          border-r border-border bg-background px-0 py-3 z-40
          items-start justify-center
        "
      >
        <button
          onClick={() => setShowAssetNav((prev) => !prev)}
          className="p-2 rounded-full border border-border bg-card hover:bg-muted transition-colors"
          title="Toggle asset list"
        >
          <PanelLeft size={24} />
        </button>
      </div>

      {/* ── Asset nav sidebar — full-width on mobile, 384 px on desktop ───── */}
      <AssetNav
        selectedSymbol={selectedSymbol}
        onSelectSymbol={handleSelectSymbol}
        showAssetNav={showAssetNav}
        onClose={() => setShowAssetNav(false)}
      />

      {/* ── Main chart area ───────────────────────────────────────────────── */}
      {/*
        Mobile:  flex-1 so it fills space between top and bottom bar
        Desktop: grid cell row-start-2 col-start-2
      */}
      <div
        className="
          flex-1 min-h-0 w-full overflow-hidden transition-all duration-300 z-20
          md:row-start-2 md:col-start-2 md:h-full
        "
        onClick={showAssetNav ? () => setShowAssetNav(false) : undefined}
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

      {/* ── Bottom bar (mobile only) ──────────────────────────────────────── */}
      <div
        className="
          flex md:hidden
          shrink-0 h-14 border-t border-border bg-background
          items-center justify-around px-4 z-50
        "
      >
        {/* Asset list toggle */}
        <button
          onClick={() => setShowAssetNav((prev) => !prev)}
          className="flex flex-col items-center gap-0.5 p-2 rounded-lg hover:bg-muted transition-colors"
          title="Toggle asset list"
        >
          <PanelLeft size={20} />
          <span className="text-[10px] text-muted-foreground">Assets</span>
        </button>

        {/* Floating navbar toggle */}
        <button
          onClick={() => setShowNavbar((prev) => !prev)}
          className="flex flex-col items-center gap-0.5 p-2 rounded-lg hover:bg-muted transition-colors"
          title="Toggle navigation menu"
        >
          <PanelTop size={20} />
          <span className="text-[10px] text-muted-foreground">Menu</span>
        </button>

        {/* Premium / Free chart toggle */}
        <button
          onClick={() => setIsPremium((prev) => !prev)}
          className="flex flex-col items-center gap-0.5 p-2 rounded-lg hover:bg-muted transition-colors"
          title={
            isPremium ? 'Switch to Simple chart' : 'Switch to Advanced chart'
          }
        >
          <BarChart2 size={20} />
          <span className="text-[10px] text-muted-foreground">
            {isPremium ? 'Advanced' : 'Simple'}
          </span>
        </button>
      </div>
    </div>
  );
}
