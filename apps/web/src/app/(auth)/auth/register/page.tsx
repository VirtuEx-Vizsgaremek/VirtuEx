import { Button } from '@/components/ui/button';
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldSeparator,
  FieldDescription
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { register } from '@/lib/actions';
import Link from 'next/link';

export default function Register() {
  return (
    <form className="flex flex-col gap-6" action={register}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your details below to create your account.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
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
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" name="password" type="password" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="password_repeat">Confirm Password</FieldLabel>
          <Input
            id="password_repeat"
            name="password_repeat"
            type="password"
            required
          />
        </Field>
        <Field>
          <Button type="submit">Sign Up</Button>
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
