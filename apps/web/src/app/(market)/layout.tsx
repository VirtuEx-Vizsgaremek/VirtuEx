import { ThemeProvider } from '@/contexts/ThemeContext';

export default function MarketLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
