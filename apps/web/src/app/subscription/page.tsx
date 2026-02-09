'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { ModifyPlanModal } from '@/components/planmod';

interface ModifyPlanModalProps {
  isOpen: boolean; // Add this line

  onClose: React.Dispatch<React.SetStateAction<boolean>>; // Add this line

  currentPlan: string;

  currentCredits: number;
}

export default function Subscription() {
  // State a modal láthatóságának kezelésére
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State a kiválasztott terv adatainak átadására (hogy a modal tudja, mit mutasson)
  const [selectedPlanData, setSelectedPlanData] = useState({
    plan: 'Standard',
    credits: 30
  });

  // Segédfüggvény a modal megnyitásához a megfelelő adatokkal
  const handleOpenModal = (planName: string, credits: number) => {
    setSelectedPlanData({ plan: planName, credits: credits });
    setIsModalOpen(true);
  };

  return (
    <div>
      {/* Itt hívjuk meg a Modalt.
        Mivel a Dialog komponens (Shadcn/Radix) 'portal'-t használ, 
        technikailag mindegy hol van a DOM-ban, de logikailag itt a legtisztább.
      */}
      <ModifyPlanModal
        isOpen={isModalOpen}
        onClose={setIsModalOpen} // A Dialog automatikusan false-t küld ide bezáráskor
        currentPlan={selectedPlanData.plan}
        currentCredits={selectedPlanData.credits}
      />

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
            {/* STARTER (FREE) CARD */}
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

            {/* STANDARD CARD */}
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
                  <Check className="w-5 h-5 text-accent mr-3" /> Real-time
                  Trading
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
                  <Check className="w-5 h-5 text-accent mr-3" /> Standard
                  Support
                </li>
              </ul>

              {/* Gomb bekötve a modal nyitásához */}
              <Button
                className="w-full shadow-lg"
                onClick={() => handleOpenModal('Standard', 30)}
              >
                Subscribe Now
              </Button>
            </Card>

            {/* PROFESSIONAL CARD */}
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
                  <Check className="w-5 h-5 text-accent mr-3" /> Unlimited
                  Portfolio
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3" /> TradingView
                  Charts
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3" /> Stop-Loss
                  Function
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-accent mr-3" /> 100 AI Credits
                </li>
              </ul>

              {/* Gomb bekötve a modal nyitásához */}
              <Button
                variant="outline"
                className="w-full hover:border-accent hover:text-accent transition-colors"
                onClick={() => handleOpenModal('Pro', 100)}
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
