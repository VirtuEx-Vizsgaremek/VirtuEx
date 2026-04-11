'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

type BillingPeriod = 'monthly' | 'yearly';

const PLAN_PRICES: Record<string, number> = {
  Free: 0,
  Standard: 35,
  Pro: 49
};

export function ModifyPlanModal({
  currentCredits,
  currentPlan,
  selectedPlan: initialPlan,
  billingPeriod: initialBillingPeriod,
  isOpen,
  onClose,
  onConfirm,
  onBillingPeriodChange
}: {
  currentCredits: number;
  currentPlan: string;
  selectedPlan?: string;
  billingPeriod?: BillingPeriod;
  isOpen?: boolean;
  onClose?: (open: boolean) => void;
  onConfirm?: (planName: string, billingPeriod: BillingPeriod) => Promise<void>;
  onBillingPeriodChange?: (period: BillingPeriod) => void;
}) {
  const [open, setOpen] = useState(isOpen ?? false);
  const [selectedPlan, setSelectedPlan] = useState(initialPlan ?? currentPlan);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(
    initialBillingPeriod ?? 'monthly'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialPlan) {
      setSelectedPlan(initialPlan);
    }
  }, [initialPlan]);

  useEffect(() => {
    if (initialBillingPeriod) {
      setBillingPeriod(initialBillingPeriod);
    }
  }, [initialBillingPeriod]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) setError(null);
    onClose?.(newOpen);
  };

  const basePrice = PLAN_PRICES[selectedPlan] ?? 0;
  const currentPrice = billingPeriod === 'yearly' ? basePrice * 12 : basePrice;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
                onClick={() => {
                  setBillingPeriod('monthly');
                  onBillingPeriodChange?.('monthly');
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all 
                  ${billingPeriod === 'monthly' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}
                  ${selectedPlan === 'Free' ? 'cursor-not-allowed opacity-50' : 'hover:text-gray-700'}`}
                disabled={selectedPlan === 'Free'}
              >
                Monthly
              </button>
              <button
                onClick={() => {
                  setBillingPeriod('yearly');
                  onBillingPeriodChange?.('yearly');
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all 
                  ${billingPeriod === 'yearly' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}
                  ${selectedPlan === 'Free' ? 'cursor-not-allowed opacity-50' : 'hover:text-gray-700'}`}
                disabled={selectedPlan === 'Free'}
              >
                Yearly
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Yearly bills every 365 days.
            </p>
          </div>

          <div className="pt-4 border-t flex items-center justify-between">
            <span className="text-gray-600">Total to pay now:</span>
            <span className="text-2xl font-extrabold text-gray-900">
              ${currentPrice}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {error && (
            <p className="text-sm text-red-500 mr-auto self-center">{error}</p>
          )}
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white ml-3"
            disabled={loading}
            onClick={async () => {
              if (!onConfirm) return;
              setError(null);
              setLoading(true);
              try {
                await onConfirm(selectedPlan, billingPeriod);
                handleOpenChange(false);
              } catch (e: unknown) {
                setError(
                  e instanceof Error
                    ? e.message
                    : 'Failed to update subscription'
                );
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? 'Updating...' : 'Update Subscription'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
