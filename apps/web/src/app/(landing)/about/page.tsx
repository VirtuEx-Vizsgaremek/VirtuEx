import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Shield, TrendingUp, Users } from 'lucide-react';

export const metadata = { title: 'About Us – VirtuEx' };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="container mx-auto px-6 py-16 text-center max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          About{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
            VirtuEx
          </span>
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          VirtuEx is a virtual stock and asset exchange platform built as a
          final-year exam project. Our goal is simple: let anyone practice
          real-market trading without putting a single dollar at risk.
        </p>
      </section>

      {/* Mission */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Our Mission
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-border bg-card">
              <CardContent className="p-0 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Education First</h3>
                  <p className="text-sm text-muted-foreground">
                    We believe financial literacy should be accessible to
                    everyone. VirtuEx provides a hands-on environment to learn
                    how markets, orders, and portfolios work — without the fear
                    of losing real money.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border-border bg-card">
              <CardContent className="p-0 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Real Market Data</h3>
                  <p className="text-sm text-muted-foreground">
                    All price data is sourced from Yahoo Finance, giving you the
                    same figures professional traders see — in real time. There
                    are no artificial price feeds or simulated candles unless
                    you explicitly choose mock mode.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border-border bg-card">
              <CardContent className="p-0 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Zero Financial Risk</h3>
                  <p className="text-sm text-muted-foreground">
                    Every dollar traded on VirtuEx is virtual. Your wallet is
                    funded with simulated USD and you can top it up every 30
                    days. No credit cards, no real money, no risk.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border-border bg-card">
              <CardContent className="p-0 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Built by Students</h3>
                  <p className="text-sm text-muted-foreground">
                    VirtuEx was designed and developed by a small team of
                    software engineering students as a vizsgaremek (graduation
                    project). It reflects the skills and passion we've built
                    throughout our studies.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="container mx-auto px-6 py-16 max-w-3xl text-center">
        <p className="text-muted-foreground text-sm">
          VirtuEx is an educational project. It is not a licensed financial
          service and does not offer real investment products. All trading
          activity on this platform is simulated and carries no real financial
          consequence.
        </p>
      </section>
    </div>
  );
}
