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
 * Uses the dedicated `/v1/user/@me/subscription` endpoint rather than the
 * `@me` join field, which can be unreliable when the subscription relation
 * isn't populated.
 *
 * - Returns `null`    → not logged in (no token)
 * - Returns `"Free"`  → logged in but no subscription record (404) or
 *                        plan name is unrecognised
 * - Returns `"Standard"` / `"Pro"` → active paid subscription
 */
export async function fetchCurrentPlan(): Promise<PlanKey | null> {
  const token = await getToken();
  if (!token) return null; // not authenticated

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  try {
    const res = await fetch(`${API_URL}/v1/user/@me/subscription`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    // 404 = authenticated but no subscription row → Free tier
    if (res.status === 404) return 'Free';
    // 401/403 = token invalid
    if (res.status === 401 || res.status === 403) return null;
    // Other non-2xx = server error → fall back to null (unknown)
    if (!res.ok) return null;

    const data = await res.json();
    return normalisePlanName(data.plan_name) ?? 'Free';
  } catch {
    return null; // network error / API unreachable
  }
}
