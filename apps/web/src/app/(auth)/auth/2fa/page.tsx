'use client';

import { Button } from '@/components/ui/button';
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldSeparator,
  FieldDescription,
  FieldError
} from '@/components/ui/field';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from '@/components/ui/input-otp';
import { Input } from '@/components/ui/input';
import { validateMfa } from '@/lib/actions';
import Link from 'next/link';
import { useActionState } from 'react';

const initialState = {
  error: {} as any,
  serverError: ''
};

const transformErrors = (errors?: string[]) => {
  return errors?.map((error) => ({ message: error }));
};

export default function Reset() {
  const [state, formAction, pending] = useActionState(
    validateMfa,
    initialState
  );

  return (
    <form className="flex flex-col gap-6" action={formAction}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Security Code</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your one-time code to continue.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="code">Code</FieldLabel>
          <InputOTP maxLength={6} name="code">
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <FieldError
            errors={
              state?.error && 'email' in state.error
                ? transformErrors(state.error.code?.errors)
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
            Continue
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
