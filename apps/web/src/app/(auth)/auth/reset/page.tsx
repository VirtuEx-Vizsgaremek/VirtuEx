import { Button } from '@/components/ui/button';
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldSeparator,
  FieldDescription
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { reset } from '@/lib/actions';
import Link from 'next/link';

export default function Reset() {
  const codeStep = false;

  return (
    <form className="flex flex-col gap-6" action={reset}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to reset your password.
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
        </Field>
        {codeStep && (
          <Field>
            <FieldLabel htmlFor="code">Code</FieldLabel>
            <Input id="code" name="code" type="text" required />
          </Field>
        )}
        <Field>
          <Button type="submit">Send Code</Button>
          <FieldDescription className="text-center">
            Remembered you password?{' '}
            <Link href="/auth/login" className="underline underline-offset-4">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
