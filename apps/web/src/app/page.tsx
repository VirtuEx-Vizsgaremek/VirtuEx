// UI Components and Icons
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Check, TrendingUp, Wallet, X } from 'lucide-react';

//TODO Connect the links to their respective pages

export default function Home() {
  return (
    <div className="min-h-screen">
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
    </div>
  );
}
