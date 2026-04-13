/**
 * Home Page / Landing Page
 *
 * Main landing page for VirtuEx application.
 * Showcases platform features and guides users to key actions.
 *
 * Sections:
 * 1. Hero - Eye-catching headline with value proposition
 * 2. Features - Card-based feature highlights
 * 3. Pricing - Pricing tiers and subscription options
 * 4. CTA - Call-to-action to get started on /market page
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, Check, TrendingUp, Wallet, X } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16 text-center max-w-5xl">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Master the Markets <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
            Without the Risk.
          </span>
        </h1>
        <p className="text-muted-foreground text-base md:text-xl mb-8 max-w-2xl mx-auto">
          Trade with live market data in a safe sandbox environment
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/market"
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg"
          >
            Start Trading
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-3 rounded-full border border-border text-foreground font-semibold text-sm hover:bg-muted transition-all"
          >
            Learn More
          </a>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Professional Grade Tools
            </h2>
            <p className="text-muted-foreground">
              Everything you need to simulate a real exchange environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Real-Time Data */}
            <Card className="p-8 bg-card border border-border hover:border-primary transition-colors duration-300 group">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition">
                <TrendingUp className="w-6 h-6" />
              </div>
              <CardHeader className="p-0 mb-3">
                <CardTitle className="text-xl">Real-Time Data</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground">
                  Trade with live market data powered by Yahoo Finance.
                  Experience the volatility of real stocks and assets in a
                  completely safe sandbox environment.
                </p>
              </CardContent>
            </Card>

            {/* TradingView Charts */}
            <Card className="p-8 bg-card border border-border hover:border-primary transition-colors duration-300 group">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition">
                <BarChart2 className="w-6 h-6" />
              </div>
              <CardHeader className="p-0 mb-3">
                <CardTitle className="text-xl">TradingView Charts</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground">
                  Analyse the market with professional-grade TradingView charts.
                  Switch between area and candlestick views, explore historical
                  price data, and practice reading patterns like a pro.
                </p>
              </CardContent>
            </Card>

            {/* Smart Wallet */}
            <Card className="p-8 bg-card border border-border hover:border-primary transition-colors duration-300 group">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition">
                <Wallet className="w-6 h-6" />
              </div>
              <CardHeader className="p-0 mb-3">
                <CardTitle className="text-xl">Smart Wallet</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground">
                  Manage a multi-asset virtual wallet with realistic precision.
                  Top up your USD balance, hold multiple assets, track every
                  transaction, and swap between positions instantly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground">
              Start learning for free, or unlock professional trading features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {/* Free Starter Plan */}
            <Card className="p-8 bg-card border border-border flex flex-col">
              <div className="mb-4">
                <span className="text-muted-foreground text-sm uppercase tracking-wider">
                  Starter
                </span>
                <div className="text-3xl font-bold mt-2 text-foreground">
                  Free
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-foreground">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                  Basic Area Chart
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                  Paper Trading Simulation
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 shrink-0" />3
                  Sample Assets
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                  Max 10 Assets in Wallet
                </li>
                <li className="flex items-center opacity-50">
                  <X className="w-5 h-5 text-red-500 mr-3 shrink-0" />
                  No TradingView Charts
                </li>
                <li className="flex items-center opacity-50">
                  <X className="w-5 h-5 text-red-500 mr-3 shrink-0" />
                  No Real-time Market Data
                </li>
              </ul>
              <Link href="/market">
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </Link>
            </Card>

            {/* Standard Plan */}
            <Card className="p-8 bg-card border-2 border-primary relative flex flex-col">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                POPULAR
              </div>
              <div className="mb-4">
                <span className="text-primary text-sm uppercase tracking-wider">
                  Standard
                </span>
                <div className="text-3xl font-bold mt-2 text-foreground">
                  $35
                  <span className="text-lg text-muted-foreground font-normal">
                    /mo
                  </span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-foreground">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3 shrink-0" />
                  TradingView Advanced Charts
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3 shrink-0" />
                  Real-time Market Data
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3 shrink-0" />
                  Up to 50 Assets in Wallet
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3 shrink-0" />
                  Buy, Sell &amp; Exchange Orders
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3 shrink-0" />
                  {/* 2FA Account Security  */}
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3 shrink-0" />
                  Standard Support
                </li>
              </ul>
              <Link href="/subscription">
                <Button className="w-full shadow-lg">Subscribe Now</Button>
              </Link>
            </Card>

            {/* Professional Plan */}
            <Card className="p-8 bg-card border border-border flex flex-col">
              <div className="mb-4">
                <span className="text-accent text-sm uppercase tracking-wider">
                  Professional
                </span>
                <div className="text-3xl font-bold mt-2 text-foreground">
                  $49
                  <span className="text-lg text-muted-foreground font-normal">
                    /mo
                  </span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-foreground">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3 shrink-0" />
                  <strong>Everything in Standard</strong>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3 shrink-0" />
                  Unlimited Assets in Wallet
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3 shrink-0" />
                  Advanced Chart Indicators
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3 shrink-0" />
                  Stop-Loss Orders
                  <span className="ml-2 text-xs text-muted-foreground font-medium px-1.5 py-0.5 rounded bg-muted border border-border">
                    Soon
                  </span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3 shrink-0" />
                  Trade History Export
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3 shrink-0" />
                  24/7 Priority Support
                </li>
              </ul>
              <Link href="/subscription">
                <Button
                  variant="outline"
                  className="w-full hover:border-accent hover:text-accent transition-colors"
                >
                  Go Pro
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
