import { getToken } from '@/lib/actions';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// ── Types ────────────────────────────────────────────────────────────────────

export interface MeResponse {
  id: string;
  username: string;
  full_name: string;
  email: string;
  bio?: string | null;
  avatar?: string | null;
  wallet: string;
  permissions: number;
  subscription: string;
  subscription_plan: string;
  activated: boolean;
}

export type PlanKey = 'Free' | 'Standard' | 'Pro';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalise a raw plan name from the API to one of the three canonical keys
 * used by the frontend cards. Returns `null` if the name is unrecognised.
 */
export function normalisePlanName(raw: string): PlanKey | null {
  switch (raw.toLowerCase()) {
    case 'free':
    case 'starter':
      return 'Free';
    case 'standard':
      return 'Standard';
    case 'pro':
    case 'professional':
      return 'Pro';
    default:
      return null;
  }
}

// ── API calls ─────────────────────────────────────────────────────────────────

/**
 * Fetch the currently authenticated user's profile from `GET /v1/user/@me`.
 * Reads the JWT from the httpOnly `vtx_token` cookie via the `getToken` server action.
 *
 * @returns The profile data, or `null` when the user is not logged in or the
 *          request fails.
 */
export async function fetchMe(): Promise<MeResponse | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/v1/user/@me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return null;
    return (await res.json()) as MeResponse;
  } catch {
    return null;
  }
}

/**
 * Convenience wrapper: fetch only the current user's canonical plan key.
 *
 * @returns One of `"Free"`, `"Standard"`, `"Pro"`, or `null` when unknown.
 */
export async function fetchCurrentPlan(): Promise<PlanKey | null> {
  const me = await fetchMe();
  if (!me?.subscription_plan) return null;
  return normalisePlanName(me.subscription_plan);
}
