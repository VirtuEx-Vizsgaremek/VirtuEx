/**
 * Conditional Layout Component
 *
 * Layout wrapper that determines which layout to use based on current page.
 * Provides a consistent layout strategy across the application.
 *
 * Layout Rules:
 * - /market page: No navbar, no footer (full-screen chart experience)
 * - All other pages: Navbar + content + footer (standard marketing layout)
 *
 * Purpose:
 * - Market page needs dedicated space for TradingView charts
 * - Home, landing, and feature pages use standard navigation layout
 * - Centralizes layout logic in one component (single source of truth)
 *
 * Usage:
 * Wraps {children} in root layout.tsx to conditionally apply navbar/footer
 */

'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';
import Navbar from './Navbar';

export default function ConditionalLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMarketPage = pathname === '/market';

  if (isMarketPage) {
    // Market page: no navbar, no footer, just the content
    return <>{children}</>;
  }

  // All other pages: normal layout with navbar and footer
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
