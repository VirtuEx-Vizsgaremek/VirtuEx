'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { z } from 'zod';

/**
 * Returns the raw JWT string stored in the `vtx_token` httpOnly cookie,
 * or `null` if the user is not logged in.
 *
 * Use this in Server Components / Server Actions that need to forward the
 * token to the backend API (e.g. trade endpoints).
 */
export const getToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get('vtx_token')?.value ?? null;
};

/**
 * Returns `true` when a `vtx_token` cookie is present.
 * Does NOT validate the JWT signature — use this only for UI gating.
 * The backend will reject an expired / tampered token on the actual request.
 */
export const getIsAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return token !== null;
};

/**
 * Clears the `vtx_token` cookie, effectively logging the user out on the
 * Next.js side. The backend token is stateless (JWT), so no server-side
 * invalidation is needed.
 */
export const logout = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete('vtx_token');
  redirect('/');
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL_SOURCE = process.env.NEXT_PUBLIC_API_URL
  ? 'NEXT_PUBLIC_API_URL'
  : 'default';

export type BillingPeriod = 'monthly' | 'yearly';

export type SubscriptionResponse = {
  id: string;
  plan_id: string;
  plan_name: string;
  monthly_ai_credits: number;
  assets_max: number;
  stop_loss: boolean;
  real_time: boolean;
  trading_view: boolean;
  price: number;
  billing_period: BillingPeriod;
  started_at: string | null;
  expires_at: string | null;
  is_expired: boolean;
  pending_plan_id: string | null;
  pending_plan_name: string | null;
  pending_billing_period: BillingPeriod | null;
  pending_effective_at: string | null;
};

export type ChangeSubscriptionResult = {
  ok: boolean;
  status: number;
  data: SubscriptionResponse | null;
  error: string | number | null;
  message: string | null;
  raw: unknown;
};

let loginBaseUrlLogged = false;

const logLoginBaseUrlOnce = () => {
  if (process.env.NODE_ENV === 'production') return;
  if (loginBaseUrlLogged) return;
  loginBaseUrlLogged = true;

  console.log(`[LOGIN] Using API base URL (${API_URL_SOURCE}):`, API_URL);

  const normalized = API_URL.toLowerCase();
  const isLocal =
    normalized.includes('localhost') || normalized.includes('127.0.0.1');

  if (normalized.includes('192.168.') || !isLocal) {
    console.warn(
      `[LOGIN] WARNING: API base URL is non-local (${API_URL}). This can cause ECONNREFUSED in local dev.`
    );
  }
};

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128)
});

const registerSchema = z
  .object({
    full_name: z.string(),
    username: z.string().min(3).max(32),
    email: z.email(),
    password: z.string().min(8).max(128),
    password_again: z.string().min(8).max(128)
  })
  .refine((data) => data.password === data.password_again, {
    message: "Passwords don't match.",
    path: ['password']
  });

export const register = async (initialState: any, formData: FormData) => {
  const validatedFields = registerSchema.safeParse({
    full_name: formData.get('full_name'),
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
    password_again: formData.get('password_again')
  });

  if (validatedFields.success) {
    const { full_name, username, email, password } = validatedFields.data;
    console.log('[REGISTER] Attempting with:', { full_name, username, email });
    let data: any;

    try {
      const response = await fetch(`${API_URL}/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ full_name, username, email, password })
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: 'Unknown Error' }));
        console.error('[REGISTER] API error:', response.status, error);

        return {
          error: {},
          serverError: error.message
        };
      }

      data = await response.json();
      console.log('[REGISTER] Success! Token received, setting cookie...');
    } catch (e: unknown) {
      console.error('[REGISTER] Catch error:', e);
      return {
        error: {},
        serverError: 'Failed to connect to the server. Please try again.'
      };
    }

    // Set JWT token as httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('vtx_token', data.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(data.expires),
      path: '/'
    });
    console.log('[REGISTER] Cookie set, redirecting...');

    if (data.mfa) {
      console.log('[REGISTER] MFA required, redirecting to 2FA');
      redirect('/auth/2fa');
    }

    console.log('[REGISTER] Redirecting to profile');
    redirect('/profile');

    return {
      error: {},
      serverError: ''
    };
  } else {
    return {
      error: z.treeifyError(validatedFields.error).properties,
      serverError: ''
    };
  }
};

export const login = async (initialState: any, formData: FormData) => {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  });

  if (validatedFields.success) {
    logLoginBaseUrlOnce();
    const { email, password } = validatedFields.data;
    console.log('[LOGIN] Attempting with email:', email, 'API_URL:', API_URL);
    let data: any;

    try {
      const response = await fetch(`${API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: 'Unknown Error' }));
        console.error('[LOGIN] API error:', response.status, error);

        return {
          error: {},
          serverError: error.message
        };
      }

      data = await response.json();
      console.log('[LOGIN] Token received, setting cookie and redirecting');
    } catch (e: unknown) {
      console.error('[LOGIN] Network or parsing error:', e);
      return {
        error: {},
        serverError: 'Failed to connect to the server. Please try again.'
      };
    }

    // Set JWT token as httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('vtx_token', data.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(data.expires),
      path: '/'
    });

    // Redirect after successful login
    if (data.mfa) {
      redirect('/auth/2fa');
    }
    redirect('/profile');

    return {
      error: {},
      serverError: ''
    };
  } else {
    return {
      error: z.treeifyError(validatedFields.error).properties,
      serverError: ''
    };
  }
};

export const getMe = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vtx_token')?.value;

    if (!token) {
      return null;
    }

    const response = await fetch(`${API_URL}/v1/user/@me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return null;
  }
};

export const updateMe = async (
  prevState: any,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> => {
  const fullName = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();

  const cookieStore = await cookies();
  const token = cookieStore.get('vtx_token')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  const payload: { full_name?: string; email?: string } = {};
  if (fullName) payload.full_name = fullName;
  if (email) payload.email = email;

  if (Object.keys(payload).length === 0) {
    return { error: 'No fields to update' };
  }

  try {
    const response = await fetch(`${API_URL}/v1/user/@me`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      console.error('[PROFILE] Update failed:', response.status, err);
      return { error: err?.message || 'Failed to update profile' };
    }

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('[PROFILE] Update request failed:', error);
    return { error: 'Failed to connect to server' };
  }
};

export const deleteMe = async (): Promise<{
  success?: boolean;
  error?: string;
}> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('vtx_token')?.value;

  console.log('[DELETE] Token exists:', !!token, 'API_URL:', API_URL);

  if (!token) {
    return { error: 'Not authenticated' };
  }

  try {
    const response = await fetch(`${API_URL}/v1/user/@me`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('[DELETE] Response status:', response.status);

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      console.error('[PROFILE] Delete failed:', response.status, err);
      return { error: err?.message || 'Failed to delete account' };
    }

    console.log('[PROFILE] Account deleted successfully');

    // Delete the auth cookie after successful deletion
    cookieStore.delete('vtx_token');

    return { success: true };
  } catch (error) {
    console.error('[PROFILE] Delete request failed:', error);
    return { error: 'Failed to connect to server' };
  }
};

export async function reset(formData: FormData): Promise<void> {
  console.log(formData);
}

export const getMyWallet = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('vtx_token')?.value;
  if (!token) throw new Error('Not authenticated');

  const meResponse = await fetch(`${API_URL}/v1/user/@me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (meResponse.status === 401) throw new Error('Not authenticated');
  if (!meResponse.ok) throw new Error('Failed to fetch user');

  const me = await meResponse.json();
  const walletId = me.wallet.toString();

  const response = await fetch(`${API_URL}/v1/wallet/${walletId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (response.status === 401) throw new Error('Not authenticated');
  if (!response.ok) throw new Error('Failed to fetch wallet');

  return response.json();
};

export const getMyWalletHistory = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('vtx_token')?.value;
  if (!token) throw new Error('Not authenticated');

  const meResponse = await fetch(`${API_URL}/v1/user/@me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (meResponse.status === 401) throw new Error('Not authenticated');
  if (!meResponse.ok) throw new Error('Failed to fetch user');

  const me = await meResponse.json();
  const walletId = me.wallet.toString();

  const response = await fetch(`${API_URL}/v1/wallet/${walletId}/history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (response.status === 401) throw new Error('Not authenticated');
  if (!response.ok) throw new Error('Failed to fetch wallet history');

  return response.json();
};

export type TopupResult = {
  ok: boolean;
  status: number;
  data: {
    credited: string;
    balance: string;
    next_topup_at: number;
    token?: string;
  } | null;
  error: string | number | null;
  message: string | null;
  next_topup_at?: number;
  remaining_ms?: number;
  raw: unknown;
};

export const topupMyWallet = async (): Promise<TopupResult> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('vtx_token')?.value;

  if (!token) {
    return {
      ok: false,
      status: 401,
      data: null,
      error: 'Not authenticated',
      message: 'Not authenticated',
      raw: null
    };
  }

  const response = await fetch(`${API_URL}/v1/wallet/@me/topup`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const payload = await response.json().catch(() => null);

  if (response.status === 429) {
    return {
      ok: false,
      status: response.status,
      data: null,
      error: payload?.error ?? null,
      message: payload?.message ?? null,
      next_topup_at: payload?.next_topup_at,
      remaining_ms: payload?.remaining_ms,
      raw: payload
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data: null,
      error: payload?.error ?? null,
      message: payload?.message ?? 'Failed to top up',
      raw: payload
    };
  }

  if (payload?.token) {
    cookieStore.set('vtx_token', payload.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      path: '/'
    });
  }

  return {
    ok: true,
    status: response.status,
    data: payload,
    error: null,
    message: null,
    raw: payload
  };
};

export const getMySubscription = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('vtx_token')?.value;
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_URL}/v1/user/@me/subscription`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  if (response.status === 401) throw new Error('Not authenticated');
  if (!response.ok) throw new Error('Failed to fetch subscription');

  return response.json();
};

export const changeMySubscription = async (
  planName: string,
  billingPeriod: BillingPeriod = 'monthly'
): Promise<ChangeSubscriptionResult> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('vtx_token')?.value;
  if (!token) {
    return {
      ok: false,
      status: 401,
      data: null,
      error: 'Not authenticated',
      message: 'Not authenticated',
      raw: null
    };
  }

  const response = await fetch(`${API_URL}/v1/user/@me/subscription`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ plan_name: planName, billing_period: billingPeriod })
  });
  const payload = await response.json().catch(() => null);
  const error = payload?.error ?? null;
  const message = payload?.message ?? null;
  const ok = response.ok && !error;

  if (ok) {
    revalidatePath('/profile');
    revalidatePath('/subscription');
  }

  return {
    ok,
    status: response.status,
    data: ok ? (payload as SubscriptionResponse) : null,
    error,
    message,
    raw: payload
  };
};
