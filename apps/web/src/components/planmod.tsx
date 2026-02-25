'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

const PRICES = {
  Free: { monthly: 0, yearly: 0 },
  Standard: { monthly: 35, yearly: 350 },
  Pro: { monthly: 49, yearly: 490 }
};

export function ModifyPlanModal({
  currentCredits,
  currentPlan,
  isOpen,
  onClose
}: {
  currentCredits: number;
  currentPlan: string;
  isOpen: boolean;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly'
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(currentPlan);
      setBillingCycle('monthly');
    }
  }, [isOpen, currentPlan]);

  const currentPrice =
    PRICES[selectedPlan as keyof typeof PRICES][billingCycle];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Subscription & Credits
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-primary/10 p-4 rounded-lg flex items-center justify-between border border-primary/20">
            <div>
              <p className="text-sm text-primary font-semibold uppercase">
                Current Credits
              </p>
              <p className="text-2xl font-bold text-foreground">
                {currentCredits}
              </p>
            </div>
            <Button size="sm">Buy More</Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground">
              Select Plan
            </Label>
            <select
              className="w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-primary outline-none bg-background text-foreground"
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
            >
              <option value="Free">Free Plan</option>
              <option value="Standard">Standard Plan</option>
              <option value="Pro">Pro Plan</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground">
              Billing Cycle
            </Label>
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all 
                  ${billingCycle === 'monthly' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'}
                  ${selectedPlan === 'Free' ? 'cursor-not-allowed opacity-50' : 'hover:text-foreground'}`}
                disabled={selectedPlan === 'Free'}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all 
                  ${billingCycle === 'yearly' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'}
                  ${selectedPlan === 'Free' ? 'cursor-not-allowed opacity-50' : 'hover:text-foreground'}`}
                disabled={selectedPlan === 'Free'}
              >
                Yearly (Save 15%+)
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <span className="text-muted-foreground">Total to pay now:</span>
            <span className="text-2xl font-extrabold text-foreground">
              ${currentPrice}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button className="ml-3">Update Subscription</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
