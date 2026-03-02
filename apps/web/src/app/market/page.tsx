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
import FloatingNavbar from '@/components/FloatingNavbar';
import { PanelLeft, PanelTop } from 'lucide-react';
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

  const [showNavbar, setShowNavbar] = useState(false);

  /**
   * Close navigation sidebar after selecting a stock
   * Updates selectedSymbol for TradingView component
   * Only closes sidebar if it's not pinned (unpinned = overlay mode)
   *
   * @param selected - Stock symbol selected by user (e.g., "AAPL")
   */
  const closeNav = (selected: string) => {
    setSelectedSymbol(selected);
  };

  return (
    <div className="grid h-screen grid-cols-[56px_1fr] grid-rows-[56px_1fr] overflow-hidden bg-background">
      <div className="col-span-2 row-start-1 flex items-center justify-end border-b border-border bg-background px-3 z-50">
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

      <div className="row-start-2 col-start-1 border-r border-border bg-background p-3 z-40">
        <button
          onClick={() => setShowAssetNav(!showAssetNav)}
          className="p-2 rounded-full border border-border bg-card hover:bg-muted transition-colors"
        >
          <PanelLeft size={24} />
        </button>
      </div>

      <AssetNav
        selectedSymbol={selectedSymbol}
        onSelectSymbol={closeNav}
        showAssetNav={showAssetNav}
        onClose={() => setShowAssetNav(false)}
      />
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
        className="row-start-2 col-start-2 w-full h-full min-h-0 overflow-hidden transition-all duration-300 z-20"
        onClick={showAssetNav ? () => setShowAssetNav(false) : undefined}
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
