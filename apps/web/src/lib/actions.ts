'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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

        return {
          error: {},
          serverError: error.message
        };
      }

      const data = await response.json();

      // Set JWT token as httpOnly cookie
      const cookieStore = await cookies();
      cookieStore.set('vtx_token', data.jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(data.expires),
        path: '/'
      });

      if (data.mfa) {
        redirect('/auth/2fa');
      }

      redirect('/profile');
    } catch (e: unknown) {
      console.error('Register error:', e);
      throw e;
    }

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
    const { email, password } = validatedFields.data;

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

        return {
          error: {},
          serverError: error.message
        };
      }

      const data = await response.json();

      // Set JWT token as httpOnly cookie
      const cookieStore = await cookies();
      cookieStore.set('vtx_token', data.jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(data.expires),
        path: '/'
      });

      if (data.mfa) {
        redirect('/auth/2fa');
      }

      redirect('/profile');
    } catch (e: unknown) {
      console.error('Login error:', e);
      throw e;
    }

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

export const reset = async (initialState: any, formData: FormData) => {
  console.log(formData);
};
