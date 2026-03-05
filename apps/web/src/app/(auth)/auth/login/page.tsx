'use client';

import { Button } from '@/components/ui/button';
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { login } from '@/lib/actions';
import Link from 'next/link';
import { useActionState } from 'react';
import { ZodError } from 'zod';

const initialState = {
  error: {} as any,
  serverError: ''
};

// Helper to transform error strings to FieldError format
const transformErrors = (errors?: string[]) => {
  return errors?.map((error) => ({ message: error }));
};

export default function Login() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form className="flex flex-col gap-6" action={formAction}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            required
          />
          <FieldError
            errors={
              state?.error && 'email' in state.error
                ? transformErrors(state.error.email?.errors)
                : undefined
            }
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/auth/reset"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required />
          <FieldError
            errors={
              state?.error && 'password' in state.error
                ? transformErrors(state.error.password?.errors)
                : undefined
            }
          />
        </Field>
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-red-500 text-sm text-balance">
            {state.serverError !== '' && state.serverError}
          </p>
        </div>
        <Field>
          <Button type="submit" disabled={pending}>
            Login
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="underline underline-offset-4"
            >
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
