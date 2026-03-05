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
import { register } from '@/lib/actions';
import Link from 'next/link';
import { useActionState } from 'react';

const initialState = {
  error: {} as any,
  serverError: ''
};

// Helper to transform error strings to FieldError format
const transformErrors = (errors?: string[]) => {
  return errors?.map((error) => ({ message: error }));
};

export default function Register() {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <form className="flex flex-col gap-6" action={formAction}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your details below to create your account.
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="full_name">Full Name</FieldLabel>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            placeholder="John Doe"
            required
          />
          <FieldError
            errors={
              state?.error && 'full_name' in state.error
                ? transformErrors(state.error.full_name?.errors)
                : undefined
            }
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="john"
            required
          />
          <FieldError
            errors={
              state?.error && 'username' in state.error
                ? transformErrors(state.error.username?.errors)
                : undefined
            }
          />
        </Field>

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
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" name="password" type="password" required />
          <FieldError
            errors={
              state?.error && 'password' in state.error
                ? transformErrors(state.error.password?.errors)
                : undefined
            }
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password_again">Confirm Password</FieldLabel>
          <Input
            id="password_again"
            name="password_again"
            type="password"
            required
          />
          <FieldError
            errors={
              state?.error && 'password_again' in state.error
                ? transformErrors(state.error.password_again?.errors)
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
            {pending ? 'Creating Account...' : 'Sign Up'}
          </Button>
          <FieldDescription className="text-center">
            Already have an account?{' '}
            <Link href="/auth/login" className="underline underline-offset-4">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
