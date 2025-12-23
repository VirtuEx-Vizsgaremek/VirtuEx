'use client';

// UI Components and Icons
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport
} from '@/components/ui/navigation-menu';
import Link from 'next/link';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Moon,
  Sun,
  TrendingUp,
  Bot,
  Wallet,
  Check,
  X,
  Github,
  ArrowUpFromDot
} from 'lucide-react';
import { useEffect, useState } from 'react';

//TODO Connect the links to their respective pages

export default function Home() {
  // State for dark mode toggle
  const [isDark, setIsDark] = useState(false);
  // State for floating navbar visibility on scroll
  const [showFloatingNav, setShowFloatingNav] = useState(false);

  // Apply dark mode class to document root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Show floating navbar after scrolling 100px down
  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingNav(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Floating Navbar - Appears on scroll with rounded pill design */}
      <nav
        className={`fixed w-[70%] top-4 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 ${
          showFloatingNav
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-card/95 backdrop-blur-md border border-border shadow-lg rounded-full px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href=""
              className="text-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              Premium
            </Link>
            <Link
              href=""
              className="text-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              About Us
            </Link>
          </div>

          <img
            src="VirtuEx_logo_pfp-bg-gl-cr.svg"
            alt="Logo"
            className="h-10 w-fit absolute left-1/2 -translate-x-1/2"
          />

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full">
              Sign Up
            </Button>
            <Button size="sm" className="rounded-full">
              Log In
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full"
              onClick={() => setIsDark(!isDark)}
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Navbar - Static top navigation bar */}
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="flex justify-between gap-4 m-auto max-w-[85%] px-1 py-3 items-center ">
          <NavigationMenu>
            <NavigationMenuList className="gap-6">
              <NavigationMenuItem>
                <NavigationMenuLink className="text-foreground hover:text-primary transition-colors text-md">
                  <Link href="">Premium</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="text-foreground hover:text-primary transition-colors text-md">
                  <Link href="">About Us</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <img
            src="VirtuEx_logo_pfp-bg-gl-cr.svg"
            alt="Logo"
            className="h-13 w-fit"
          />

          <div className="flex gap-3">
            <Button variant="outline" className="text-md">
              Sign Up
            </Button>
            <Button className="text-md">Log In</Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsDark(!isDark)}
            >
              {isDark ? <Sun /> : <Moon />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Main landing page headline */}
      <main className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Master the Markets <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Without the Risk.
          </span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Trade with live market data in a safe sandbox environment
        </p>
      </main>

      {/* Features Section - Showcase key platform features */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Professional Grade Tools
            </h2>
            <p className="text-muted-foreground">
              Everything you need to simulate a real exchange environment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 bg-card border border-border hover:border-primary transition-colors duration-300 group">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition">
                <TrendingUp className="w-6 h-6" />
              </div>
              <CardHeader className="p-0 mb-3">
                <CardTitle className="text-xl">Real-Time Data</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground">
                  Trade with live market data from CoinMarketCap. Experience the
                  volatility of the real market in a safe sandbox.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 bg-card border border-border hover:border-primary transition-colors duration-300 group">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition">
                <Bot className="w-6 h-6" />
              </div>
              <CardHeader className="p-0 mb-3">
                <CardTitle className="text-xl">AI Trading Assistant</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground">
                  Get simulated market analysis. Use your credits to ask our AI
                  chatbot for strategy advice and trend predictions.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 bg-card border border-border hover:border-primary transition-colors duration-300 group">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition">
                <Wallet className="w-6 h-6" />
              </div>
              <CardHeader className="p-0 mb-3">
                <CardTitle className="text-xl">Smart Wallet</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground">
                  Manage your assets with a realistic wallet integration (Stripe
                  API). Deposit, withdraw, and swap instantly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section - Display subscription plans */}
      <section id="pricing" className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground">
              Start learning for free, or unlock professional trading features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                  <Check className="w-5 h-5 text-green-500 mr-3" /> Basic Chart
                  View
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" /> Spot Trading
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" /> 5 AI Credits
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" /> Max 10
                  Assets
                </li>
                <li className="flex items-center opacity-50">
                  <X className="w-5 h-5 text-red-500 mr-3" /> No Stop-Loss
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Get Started
              </Button>
            </Card>

            {/* Standard Plan - Most Popular */}
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
                  <Check className="w-5 h-5 text-accent mr-3" />
                  Real-time Trading
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3" /> 30 AI Credits
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3" /> 2FA Security
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3" /> Social OAuth
                  Login
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3" />
                  Standard Support
                </li>
              </ul>
              <Button className="w-full shadow-lg">Subscribe Now</Button>
            </Card>

            {/* Professional Plan - Advanced Features */}
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
                  <Check className="w-5 h-5 text-accent mr-3" />
                  <strong>Everything in Standard</strong>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3" />
                  Unlimited Portfolio
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3" />
                  TradingView Charts
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3" />
                  Stop-Loss Function
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3" /> 100 AI Credits
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full hover:border-accent hover:text-accent transition-colors"
              >
                Go Pro
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer Section - Site links and information */}
      <footer className="bg-card py-12 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand & Description */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                {/* <span className="text-xl font-bold text-foreground">
                  Virtu<span className="text-accent">Ex</span>
                </span> */}
                <img
                  src="VirtuEx_logo-bg-gl-cr.svg"
                  alt="Logo"
                  className="h-14 w-fit"
                />
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Master cryptocurrency trading in a risk-free environment with
                real-time market data.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://github.com/VirtuEx-Vizsgaremek/VirtuEx/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Github className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-foreground font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#features"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#wallet"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Wallet
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  >
                    AI Assistant
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-foreground font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Team
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-foreground font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Disclaimer
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom Bar - Copyright & Scroll to Top */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              &copy; 2025 VirtuEx Team. All rights reserved.
            </p>
            <p
              className="text-muted-foreground text-xs justify-center align-center flex flex-col items-center gap-1 cursor-pointer hover:text-primary transition-colors"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <ArrowUpFromDot />
              To the top
            </p>
            <p className="text-muted-foreground text-xs">
              Exam Project 2025. Educational purposes only. Not financial
              advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
