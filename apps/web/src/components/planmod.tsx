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
      <DialogContent className="w-[calc(100vw-2rem)] sm:w-[90vw] md:w-full md:max-w-[500px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            Modify Subscription
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Credits Card */}
          <div className="bg-primary/10 p-4 sm:p-5 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-primary/20">
            <div>
              <p className="text-xs sm:text-sm text-primary font-semibold uppercase">
                Current Credits
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                {currentCredits}
              </p>
            </div>
            <Button size="sm" className="w-full sm:w-auto">
              Buy More
            </Button>
          </div>

          {/* Plan Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground">
              Select Plan
            </Label>
            <select
              className="w-full p-2.5 text-sm sm:text-base border border-border rounded-md focus:ring-2 focus:ring-primary outline-none bg-background text-foreground transition-colors"
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
            >
              <option value="Free">Free Plan - $0/month</option>
              <option value="Standard">Standard Plan - $35/month</option>
              <option value="Pro">Pro Plan - $49/month</option>
            </select>
          </div>

          {/* Billing Cycle */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground">
              Billing Cycle
            </Label>
            <div className="flex gap-2 p-1.5 bg-muted rounded-lg">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all 
                  ${billingCycle === 'monthly' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}
                  ${selectedPlan === 'Free' ? 'cursor-not-allowed opacity-50' : ''}`}
                disabled={selectedPlan === 'Free'}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all 
                  ${billingCycle === 'yearly' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}
                  ${selectedPlan === 'Free' ? 'cursor-not-allowed opacity-50' : ''}`}
                disabled={selectedPlan === 'Free'}
              >
                Yearly
                <span className="block text-xs text-muted-foreground">
                  Save 15%+
                </span>
              </button>
            </div>
          </div>

          {/* Price Display */}
          <div className="pt-4 border-t border-border flex items-center justify-between bg-muted/50 p-4 rounded-lg">
            <span className="text-sm sm:text-base text-muted-foreground font-medium">
              Amount Due:
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
              ${currentPrice}
            </span>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button className="w-full sm:w-auto">
            {selectedPlan === 'Free' ? 'Downgrade' : 'Update Subscription'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
('use client');

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';

const PRICES = {
  Free: { monthly: 0, yearly: 0 },
  Standard: { monthly: 35, yearly: 350 },
  Pro: { monthly: 49, yearly: 490 }
};

export function ModifyPlanModal({
  currentCredits,
  currentPlan
}: {
  currentCredits: number;
  currentPlan: string;
}) {
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly'
  );

  const currentPrice =
    PRICES[selectedPlan as keyof typeof PRICES][billingCycle];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-10 py-6 text-lg font-semibold transition-all shadow-md">
          Modify
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Subscription & Credits
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between border border-blue-100">
            <div>
              <p className="text-sm text-blue-600 font-semibold uppercase">
                Current Credits
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {currentCredits}
              </p>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Buy More
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700">
              Select Plan
            </Label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
            >
              <option value="Free">Free Plan</option>
              <option value="Standard">Standard Plan</option>
              <option value="Pro">Pro Plan</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700">
              Billing Cycle
            </Label>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all 
                  ${billingCycle === 'monthly' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}
                  ${selectedPlan === 'Free' ? 'cursor-not-allowed opacity-50' : 'hover:text-gray-700'}`}
                disabled={selectedPlan === 'Free'}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all 
                  ${billingCycle === 'yearly' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}
                  ${selectedPlan === 'Free' ? 'cursor-not-allowed opacity-50' : 'hover:text-gray-700'}`}
                disabled={selectedPlan === 'Free'}
              >
                Yearly (Save 15%+)
              </button>
            </div>
          </div>

          <div className="pt-4 border-t flex items-center justify-between">
            <span className="text-gray-600">Total to pay now:</span>
            <span className="text-2xl font-extrabold text-gray-900">
              ${currentPrice}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white ml-3">
            Update Subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
