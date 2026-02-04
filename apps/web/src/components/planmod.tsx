'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
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
