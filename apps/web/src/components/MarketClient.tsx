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
import TradingView from '@/components/PremiumChart';
import FreeChart from '@/components/FreeChart';
import MarketNavbar from '@/components/MarketNavbar';
import { type PlanKey } from '@/lib/subscriptionApi';
import { Lock, PanelLeft, PanelTop, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type Props = {
  isLoggedIn: boolean;
  /** User's subscription plan from the server. Null when not logged in or unknown. */
  plan: PlanKey | null;
};

export default function MarketClient({ isLoggedIn, plan }: Props) {
  // ── State ──────────────────────────────────────────────────────────────────

  /** Currently selected stock symbol for the TradingView chart */
  const [selectedSymbol, setSelectedSymbol] = useState('');

  /** Whether the asset sidebar is visible */
  const [showAssetNav, setShowAssetNav] = useState(false);

  /** Whether the floating navbar is visible */
  const [showNavbar, setShowNavbar] = useState(false);

  /**
   * Chart preview mode for non-logged-in visitors.
   * Logged-in users always see the chart their plan dictates.
   */
  const [previewMode, setPreviewMode] = useState<'free' | 'premium'>('free');

  /** Whether the premium disclaimer overlay is visible. Resets each time the user enters premium preview. */
  const [showPremiumDisclaimer, setShowPremiumDisclaimer] = useState(true);

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
          items-center justify-end border-b border-border bg-background px-3 z-50 gap-2
        "
      >
        {/* Chart preview toggle — only for guests */}
        {!isLoggedIn && (
          <div className="flex items-center gap-1 mr-auto">
            <button
              onClick={() => setPreviewMode('free')}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                previewMode === 'free'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              Free Chart
            </button>
            <button
              onClick={() => {
                setPreviewMode('premium');
                setShowPremiumDisclaimer(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                previewMode === 'premium'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              <Lock size={10} />
              Premium Chart
            </button>
          </div>
        )}

        <button
          onClick={() => setShowNavbar((prev) => !prev)}
          className="p-2 rounded-full border border-border bg-card hover:bg-muted transition-colors"
          title="Toggle navigation menu"
        >
          <PanelTop size={24} />
        </button>
      </div>

      {/* ── Floating Navbar ───────────────────────────────────────────────── */}
      <MarketNavbar
        show={showNavbar}
        onCloseAction={() => setShowNavbar(false)}
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
        freePlan={plan === 'Free'}
      />

      {/* ── Main chart area ───────────────────────────────────────────────── */}
      {/*
        Mobile:  flex-1 so it fills space between top and bottom bar
        Desktop: grid cell row-start-2 col-start-2
      */}
      <div
        className="
          relative flex-1 min-h-0 w-full overflow-hidden transition-all duration-300 z-20
          md:row-start-2 md:col-start-2 md:h-full
        "
        onClick={showAssetNav ? () => setShowAssetNav(false) : undefined}
      >
        {/* Chart selection: Free plan always gets FreeChart; guests use previewMode */}
        {plan === 'Free' || (!isLoggedIn && previewMode === 'free') ? (
          <FreeChart selectedSymbol={selectedSymbol} />
        ) : (
          <TradingView
            symbol={selectedSymbol}
            onClearSelection={() => setSelectedSymbol('')}
          />
        )}

        {/* Premium preview overlay — shown to guests who switch to premium view */}
        {!isLoggedIn && previewMode === 'premium' && showPremiumDisclaimer && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/75 backdrop-blur-sm">
            {/* Close button */}
            <button
              onClick={() => setShowPremiumDisclaimer(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center gap-4 max-w-sm text-center px-6">
              <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
                <Lock size={32} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-1">Premium Feature</h2>
                <p className="text-sm text-muted-foreground">
                  Advanced TradingView charts with real-time data are available
                  on Standard and Pro plans.
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/subscription"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  View Plans
                </Link>
              </div>
            </div>
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

        {/* Chart mode toggle — guests only */}
        {!isLoggedIn && (
          <div className="flex items-center rounded-lg border border-border overflow-hidden text-[10px] font-medium">
            <button
              onClick={() => setPreviewMode('free')}
              className={`px-2.5 py-1.5 transition-colors ${
                previewMode === 'free'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              Free
            </button>
            <button
              onClick={() => {
                setPreviewMode('premium');
                setShowPremiumDisclaimer(true);
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors ${
                previewMode === 'premium'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              <Lock size={8} />
              Pro
            </button>
          </div>
        )}

        {/* Floating navbar toggle */}
        <button
          onClick={() => setShowNavbar((prev) => !prev)}
          className="flex flex-col items-center gap-0.5 p-2 rounded-lg hover:bg-muted transition-colors"
          title="Toggle navigation menu"
        >
          <PanelTop size={20} />
          <span className="text-[10px] text-muted-foreground">Menu</span>
        </button>
      </div>
    </div>
  );
}
