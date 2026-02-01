'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

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
