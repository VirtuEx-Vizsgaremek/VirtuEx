'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
