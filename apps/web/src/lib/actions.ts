'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { z } from 'zod';

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

        return {
          error: {},
          serverError: error.message
        };
      }

      data = await response.json();
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

export const login = async (initialState: any, formData: FormData) => {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  });

  if (validatedFields.success) {
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
      }
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

export async function reset(formData: FormData): Promise<void> {
  console.log(formData);
}
