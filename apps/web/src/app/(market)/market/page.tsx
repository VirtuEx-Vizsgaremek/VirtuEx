/**
 * Market Page — Server Component wrapper
 *
 * Reads the auth state server-side (cookie) and passes it down to
 * MarketClient so the FloatingNavbar can show the correct links
 * without any client-side fetch or flash.
 */

import { getIsAuthenticated } from '@/lib/actions';
import { fetchCurrentPlan, type PlanKey } from '@/lib/subscriptionApi';
import MarketClient from '@/components/MarketClient';

export default async function MarketPage() {
  const [isLoggedIn, plan] = await Promise.all([
    getIsAuthenticated(),
    fetchCurrentPlan().catch(() => null as PlanKey | null)
  ]);
  return <MarketClient isLoggedIn={isLoggedIn} plan={plan} />;
}
