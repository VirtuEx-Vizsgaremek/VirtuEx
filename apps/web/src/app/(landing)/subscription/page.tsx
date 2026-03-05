'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { ModifyPlanModal } from '@/components/planmod';
import { fetchCurrentPlan, type PlanKey } from '@/lib/subscriptionApi';
import SideNav from '@/components/sidenav';

export default function Subscription() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanData, setSelectedPlanData] = useState({
    plan: 'Standard',
    credits: 30
  });
  const [userPlan, setUserPlan] = useState<PlanKey | null>(null);

  useEffect(() => {
    fetchCurrentPlan().then(setUserPlan);
  }, []);

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
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6 md:gap-8">
          {/* Sidebar */}
          <div className="hidden md:block">
            <SideNav />
          </div>

          {/* Main Content */}
          <main className="w-full">
            <section id="pricing" className="relative">
              {/* Title Section */}
              <div className="text-center mb-10 md:mb-12 lt:mb-16">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 text-foreground">
                  Choose Your Plan
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                  Start learning for free, or unlock professional trading
                  features.
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

              {/* FAQ or Additional Info Section */}
              <div className="mt-16 md:mt-20 pt-12 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                      Flexible Billing
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Switch plans anytime. No long-term contracts, cancel
                      whenever you want.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                      Money-Back Guarantee
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Not satisfied? Get a full refund within 30 days of your
                      first purchase.
                    </p>
                  </div>
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
            />
          </main>
        </div>
      </div>
    </div>
  );
}
