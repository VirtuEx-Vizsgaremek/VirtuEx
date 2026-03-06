'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Check,
  X,
  Zap,
  ShieldCheck,
  RefreshCcw,
  HeadphonesIcon
} from 'lucide-react';
import { ModifyPlanModal } from '@/components/planmod';
import { normalisePlanName, type PlanKey } from '@/lib/subscriptionApi';
import { getMySubscription, changeMySubscription } from '@/lib/actions';
import SideNav from '@/components/sidenav';

export default function Subscription() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanData, setSelectedPlanData] = useState({
    plan: 'Standard',
    credits: 30
  });
  const [userPlan, setUserPlan] = useState<PlanKey | null>(null);

  useEffect(() => {
    getMySubscription()
      .then((sub) => setUserPlan(normalisePlanName(sub.plan_name)))
      .catch((err) => {
        if (err.message === 'Not authenticated') {
          router.push('/auth/login');
        }
      });
  }, [router]);

  const handleConfirmPlan = async (planName: string) => {
    await changeMySubscription(planName);
    setUserPlan(normalisePlanName(planName));
    router.refresh();
  };

  const handleSelectPlan = (planName: string) => {
    const creditMap: Record<string, number> = {
      Free: 5,
      Standard: 30,
      Pro: 100
    };
    setSelectedPlanData({
      plan: planName,
      credits: creditMap[planName] || 0
    });
    setIsModalOpen(true);
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-full md:max-w-[80vw] mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Header with optional sidebar toggle for mobile */}
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6 md:gap-8 items-stretch">
          {/* Sidebar */}
          <div className="self-stretch">
            <SideNav />
          </div>

          {/* Main Content */}
          <main className="w-full">
            <section id="pricing" className="relative">
              {/* Title Section */}
              <div className="text-center mb-10 md:mb-12 lt:mb-16">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary border border-primary/30 bg-primary/10 rounded-full px-4 py-1 mb-4">
                  Pricing
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 text-foreground">
                  Choose Your Plan
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                  Start trading for free, or unlock professional features when
                  you&apos;re ready to grow.
                </p>
              </div>

              {/* Plans Grid - Fully Responsive */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 w-full">
                {/* Free Plan */}
                <Card className="p-6 md:p-8 bg-card border flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-lg border-border">
                  <div className="mb-4 pt-2">
                    <span className="text-muted-foreground text-sm uppercase tracking-wider font-semibold">
                      Starter
                    </span>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl md:text-4xl font-bold text-foreground">
                        Free
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Perfect for beginners
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-foreground">
                        Basic Chart View
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-foreground">
                        Spot Trading
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-foreground">
                        5 AI Credits/month
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-foreground">
                        Max 10 Assets
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-5 h-5 text-red-500/50 flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-muted-foreground opacity-60">
                        Stop-Loss Function
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-5 h-5 text-red-500/50 flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-muted-foreground opacity-60">
                        24/7 Priority Support
                      </span>
                    </li>
                  </ul>

                  <Button
                    variant="outline"
                    onClick={() => handleSelectPlan('Free')}
                    disabled={userPlan === 'Free'}
                    className="w-full transition-all"
                  >
                    {userPlan === 'Free' ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </Card>

                {/* Standard Plan - POPULAR */}
                <Card className="p-6 md:p-8 bg-card border-2 border-primary flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                    {userPlan === 'Standard' ? 'CURRENT PLAN' : 'POPULAR'}
                  </div>

                  <div className="mb-4 pt-2">
                    <span className="text-primary text-sm uppercase tracking-wider font-semibold">
                      Standard
                    </span>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl md:text-4xl font-bold text-foreground">
                        $35
                      </span>
                      <span className="text-base md:text-lg text-muted-foreground font-normal">
                        /month
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      For active traders
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-foreground">
                        Everything in Free
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-foreground">
                        Real-time Trading
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-foreground">
                        30 AI Credits/month
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-foreground">
                        2FA Security
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-foreground">
                        Social OAuth Login
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-foreground">
                        Standard Support
                      </span>
                    </li>
                  </ul>

                  <Button
                    className="w-full shadow-lg"
                    disabled={userPlan === 'Standard'}
                    onClick={() => handleSelectPlan('Standard')}
                  >
                    {userPlan === 'Standard' ? 'Current Plan' : 'Subscribe Now'}
                  </Button>
                </Card>

                {/* Pro Plan */}
                <Card className="p-6 md:p-8 bg-card border flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-lg border-border">
                  <div className="mb-4 pt-2">
                    <span className="text-accent text-sm uppercase tracking-wider font-semibold">
                      Professional
                    </span>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl md:text-4xl font-bold text-foreground">
                        $49
                      </span>
                      <span className="text-base md:text-lg text-muted-foreground font-normal">
                        /month
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      For serious traders
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-foreground">
                        <strong>Everything in Standard</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-foreground">
                        Unlimited Portfolio
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-foreground">
                        TradingView Charts
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-foreground">
                        Stop-Loss Function
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-foreground">
                        100 AI Credits/month
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-foreground">
                        24/7 Priority Support
                      </span>
                    </li>
                  </ul>

                  <Button
                    variant="outline"
                    className="w-full hover:border-accent hover:text-accent transition-colors"
                    disabled={userPlan === 'Pro'}
                    onClick={() => handleSelectPlan('Pro')}
                  >
                    {userPlan === 'Pro' ? 'Current Plan' : 'Go Pro'}
                  </Button>
                </Card>
              </div>

              {/* Feature highlights */}
              <div className="mt-16 md:mt-20 pt-12 border-t border-border">
                <p className="text-center text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-8">
                  Everything you need, nothing you don&apos;t
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-5 flex flex-col gap-3 border-border bg-card hover:border-primary/40 transition-colors duration-200">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <RefreshCcw className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm mb-1">
                        Flexible Billing
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Switch or cancel anytime. No lock-in contracts, no
                        hidden fees.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-5 flex flex-col gap-3 border-border bg-card hover:border-primary/40 transition-colors duration-200">
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm mb-1">
                        30-Day Guarantee
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Not satisfied? Get a full refund within 30 days of your
                        first payment.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-5 flex flex-col gap-3 border-border bg-card hover:border-primary/40 transition-colors duration-200">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm mb-1">
                        Instant Upgrade
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        New features and credits activate immediately after
                        switching plans.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-5 flex flex-col gap-3 border-border bg-card hover:border-primary/40 transition-colors duration-200">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <HeadphonesIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm mb-1">
                        Priority Support
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Pro subscribers get 24/7 dedicated support with faster
                        response times.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            {/* Modal */}
            <ModifyPlanModal
              isOpen={isModalOpen}
              onClose={setIsModalOpen}
              currentPlan={userPlan || 'Free'}
              selectedPlan={selectedPlanData.plan}
              currentCredits={selectedPlanData.credits}
              onConfirm={handleConfirmPlan}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
