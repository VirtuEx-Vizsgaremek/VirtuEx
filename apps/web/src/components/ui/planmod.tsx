"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export function ModifyPlanModal({ userPlan }: { userPlan: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-10 py-6 text-lg font-semibold transition-all shadow-md"
        >
          Modify
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modify Plan Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="plan">Plan Type</Label>
            <Input id="plan" defaultValue={userPlan} />
          </div>
          <p className="text-sm text-gray-500">
            Change your subscription plan type as needed.
            Note: Changes to your plan will take effect from the next billing cycle.
          </p>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={() => setOpen(false)}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}