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
 * - Responsive design: desktop side-icon-bar, mobile bottom bar
 * - Chart resizes automatically when layout changes (via ResizeObserver in TradingView)
 *
 * Responsive Layout:
 * - Mobile   (< md): full-height chart, bottom bar with asset + navbar toggles
 * - Desktop (>= md): left 56 px icon column + top 56 px header row, same as before
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

export default function Market() {
  // ========== State Management ==========

  // Selected stock symbol for TradingView chart
  const [selectedSymbol, setSelectedSymbol] = useState('');

  // Toggle between premium TradingView chart and free simple chart
  const [isPremium, setIsPremium] = useState(true);

  // Sidebar / navbar visibility
  const [showAssetNav, setShowAssetNav] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);

  const closeNav = (selected: string) => {
    setSelectedSymbol(selected);
  };

  return (
    /**
     * Outer wrapper
     * Mobile:  single column, chart fills viewport, bottom bar pinned at bottom
     * Desktop: 56 px left icon column + 56 px top header row
     */
    <div
      className="
      flex flex-col h-screen overflow-hidden bg-background
      md:grid md:grid-cols-[56px_1fr] md:grid-rows-[56px_1fr]
    "
    >
      {/* ── Top header row (desktop only) ──────────────────────────────── */}
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
        >
          <PanelTop size={24} />
        </button>
      </div>

      <FloatingNavbar
        show={showNavbar}
        onClose={() => setShowNavbar(false)}
        isPremium={isPremium}
        onTogglePremium={() => setIsPremium((prev) => !prev)}
      />

      {/* ── Left icon column (desktop only) ────────────────────────────── */}
      <div
        className="
        hidden
        md:flex md:row-start-2 md:col-start-1
        border-r border-border bg-background px-0 py-3 z-40 items-start justify-center
      "
      >
        <button
          onClick={() => setShowAssetNav(!showAssetNav)}
          className="p-2 rounded-full border border-border bg-card hover:bg-muted transition-colors"
        >
          <PanelLeft size={24} />
        </button>
      </div>

      {/* Asset nav sidebar — full-width on mobile, 384 px on desktop */}
      <AssetNav
        selectedSymbol={selectedSymbol}
        onSelectSymbol={closeNav}
        showAssetNav={showAssetNav}
        onClose={() => setShowAssetNav(false)}
      />

      {/* ── Main chart area ─────────────────────────────────────────────── */}
      {/*
        Mobile:  flex-1 so it fills space between top (nothing) and bottom bar
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

      {/* ── Bottom bar (mobile only) ────────────────────────────────────── */}
      <div
        className="
        flex md:hidden
        shrink-0 h-14 border-t border-border bg-background
        items-center justify-around px-4 z-50
      "
      >
        {/* Asset list toggle */}
        <button
          onClick={() => setShowAssetNav(!showAssetNav)}
          className="flex flex-col items-center gap-0.5 p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <PanelLeft size={20} />
          <span className="text-[10px] text-muted-foreground">Assets</span>
        </button>

        {/* Floating navbar toggle */}
        <button
          onClick={() => setShowNavbar((prev) => !prev)}
          className="flex flex-col items-center gap-0.5 p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <PanelTop size={20} />
          <span className="text-[10px] text-muted-foreground">Menu</span>
        </button>

        {/* Premium / Free toggle */}
        <button
          onClick={() => setIsPremium((prev) => !prev)}
          className="flex flex-col items-center gap-0.5 p-2 rounded-lg hover:bg-muted transition-colors"
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
