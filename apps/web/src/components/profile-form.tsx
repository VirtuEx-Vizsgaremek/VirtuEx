'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldDescription } from '@/components/ui/field';
import { CardFooter } from '@/components/ui/card';
import { updateMe } from '@/lib/actions';

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    registrationDate: string;
  };
}

const initialState = {
  success: false,
  error: ''
};

export default function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateMe, initialState);

  return (
    <form action={formAction} className="flex flex-col flex-grow">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
        <div className="space-y-4 md:space-y-6">
          <h3 className="text-base md:text-lg font-semibold text-foreground">
            Personal Information
          </h3>

          {state?.success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300">
              Profile updated successfully!
            </div>
          )}

          {state?.error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
              {state.error}
            </div>
          )}

          <Field className="space-y-2">
            <Label className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Name
            </Label>
            <Input
              type="text"
              name="name"
              defaultValue={user.name}
              placeholder="Your Full Name"
              className="w-full px-3 md:px-4 py-2 text-sm md:text-base"
              required
              disabled={pending}
            />
          </Field>

          <Field className="space-y-2">
            <Label className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Email Address
            </Label>
            <Input
              type="email"
              name="email"
              defaultValue={user.email}
              placeholder="email@example.com"
              className="w-full px-3 md:px-4 py-2 text-sm md:text-base"
              required
              disabled={pending}
            />
          </Field>

          <Field className="pt-2 md:pt-4 flex items-center justify-between">
            <Label className="text-xs md:text-sm font-medium text-foreground">
              Registration Date
            </Label>
            <span className="font-mono text-xs md:text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
              {new Date(user.registrationDate).toLocaleDateString('hu-HU')}
            </span>
          </Field>
        </div>

        <div className="space-y-4 md:space-y-6 lg:border-l lg:border-border lg:pl-8 pt-6 lg:pt-0">
          <h3 className="text-base md:text-lg font-semibold text-foreground">
            Security Settings
          </h3>

          <div className="flex flex-col gap-4">
            <div className="p-3 md:p-4 bg-muted rounded-lg border border-border">
              <p className="text-xs md:text-sm text-muted-foreground mb-3">
                Update your password to keep your account secure.
              </p>
              <Button
                type="button"
                className="w-full bg-card border border-border text-foreground hover:bg-muted text-sm md:text-base"
              >
                Change Password
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-xs md:text-sm font-medium text-foreground">
                Two-Factor Authentication
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm md:text-base"
                  type="button"
                >
                  Backup Code
                </Button>
                <Button
                  className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm md:text-base"
                  type="button"
                >
                  Remove 2FA
                </Button>
              </div>
              <FieldDescription>
                <p className="text-xs md:text-sm">
                  Configuring an authenticator app is a good way to add an extra
                  layer of security to your Discord account to make sure that
                  only you have the ability to log in.
                </p>
              </FieldDescription>
            </div>
          </div>
        </div>
      </div>

      <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 pt-4 md:pt-6 border-t border-border px-0">
        <Button
          type="button"
          className="bg-red-50 hover:bg-red-100 text-red-600 border border-transparent hover:border-red-200 px-4 md:px-6 transition-colors order-2 sm:order-1 text-sm md:text-base"
        >
          Delete Account
        </Button>
        <Button
          type="submit"
          disabled={pending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 transition-colors order-1 sm:order-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardFooter>
    </form>
  );
}
