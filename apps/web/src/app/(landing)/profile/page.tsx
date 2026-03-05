import Image from 'next/image';
import SideNav from '@/components/sidenav';

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle
} from '@/components/ui/item';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldDescription } from '@/components/ui/field';

export default function ProfilePage() {
  // Mock user data - in the future this will be fetched via API (e.g., getUser())
  const user = [
    {
      id: 1,
      name: 'John Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      registrationDate: '2024-01-15T10:30:00Z',
      premium: true,
      expire: '2025-12-31',
      plan: 'Pro',
      credits: 1500,
      password: 'hashed_password_here'
    }
  ];

  function isPremiumUser(user: any) {
    if (user.premium) {
      return (
        <div className="userStat">
          <div className="grid grid-col-2">
            <span className="text-sm md:text-base font-semibold text-green-500">
              Premium User
            </span>
            <span className="text-xs md:text-sm font-semibold text-muted-foreground">
              Credits: {user.credits}
            </span>
            <span className="text-xs text-muted-foreground">
              Expires on: {new Date(user.expire).toLocaleDateString('hu-HU')}
            </span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="userStat">
          <span className="text-sm md:text-base font-semibold text-muted-foreground">
            Free User
          </span>
        </div>
      );
    }
  }

  return (
    <div>
      <div className="max-w-[95vw] lg:max-w-[80vw] mx-auto my-4 md:my-10 px-2 md:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-4 lg:gap-6">
          <div className="hidden lg:block">
            <SideNav />
          </div>

          <main className="grid grid-cols-1 grid-rows-[auto_1fr] text-base md:text-lg">
            <Card className="w-full col-span-2 shadow-lg border-border bg-card overflow-hidden">
              <ItemGroup className="px-4 md:px-6">
                {user.map((u) => (
                  <Item key={u.id} asChild role="listitem">
                    <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-8 py-2 md:py-0">
                      <ItemMedia className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full overflow-hidden border-4 border-muted shadow-sm flex-shrink-0">
                        <Image
                          src={`https://avatar.vercel.sh/${u.id}`}
                          alt={u.name}
                          width={100}
                          height={100}
                          className="object-cover grayscale transition-transform hover:scale-105 duration-300"
                        />
                      </ItemMedia>
                      <ItemContent className="space-y-1 text-center md:text-left">
                        <ItemTitle className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                          {u.name}
                        </ItemTitle>
                        <div className="flex items-center justify-center md:justify-start gap-2">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {u.username}
                          </span>
                        </div>
                      </ItemContent>
                      <ItemContent className="md:ml-auto">
                        {isPremiumUser(u)}
                      </ItemContent>
                    </div>
                  </Item>
                ))}
              </ItemGroup>
            </Card>

            <Card className="flex flex-col shadow-lg border-border bg-card mt-6 md:mt-10 w-full mx-auto">
              <CardHeader className="text-left pb-2 border-b border-border px-4 md:px-6">
                <CardTitle className="text-xl md:text-2xl font-bold text-foreground">
                  Account Details
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col pt-4 md:pt-6 px-4 md:px-6">
                <form action="" className="flex flex-col flex-grow">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
                    <div className="space-y-4 md:space-y-6">
                      <h3 className="text-base md:text-lg font-semibold text-foreground">
                        Personal Information
                      </h3>

                      <Field className="space-y-2">
                        <Label className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Name
                        </Label>
                        <Input
                          type="text"
                          name="name"
                          defaultValue={user?.[0]?.name}
                          placeholder="Your Full Name"
                          className="w-full px-3 md:px-4 py-2 text-sm md:text-base"
                          required
                        />
                      </Field>

                      <Field className="space-y-2">
                        <Label className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Email Address
                        </Label>
                        <Input
                          type="email"
                          name="email"
                          defaultValue={user?.[0]?.email}
                          placeholder="email@example.com"
                          className="w-full px-3 md:px-4 py-2 text-sm md:text-base"
                          required
                        />
                      </Field>

                      <Field className="pt-2 md:pt-4 flex items-center justify-between">
                        <Label className="text-xs md:text-sm font-medium text-foreground">
                          Registration Date
                        </Label>
                        <span className="font-mono text-xs md:text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                          {new Date(
                            user?.[0]?.registrationDate || Date.now()
                          ).toLocaleDateString('hu-HU')}
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
                          <Button className="w-full bg-card border border-border text-foreground hover:bg-muted text-sm md:text-base">
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
                              Configuring an authenticator app is a good way to
                              add an extra layer of security to your Discord
                              account to make sure that only you have the
                              ability to log in.
                            </p>
                          </FieldDescription>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 pt-4 md:pt-6 border-t border-border px-0">
                    <Button className="bg-red-50 hover:bg-red-100 text-red-600 border border-transparent hover:border-red-200 px-4 md:px-6 transition-colors order-2 sm:order-1 text-sm md:text-base">
                      Delete Account
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 transition-colors order-1 sm:order-2 text-sm md:text-base"
                    >
                      Save Changes
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
// Half acc display
// Change pass dialog
// Acc delete dialog
