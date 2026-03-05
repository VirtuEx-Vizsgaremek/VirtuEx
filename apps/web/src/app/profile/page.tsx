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

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle
} from '@/components/ui/field';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ModifyPlanModal } from '@/components/planmod';

//Example profile data!
const user = [
  {
    name: 'John Doe',
    id: 12,
    email: 'ex@exa.com',
    password: '3:45',
    premium: true,
    expire: '2024-12-31',
    plan: 'Pro',
    credits: 1500
  }
];

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
            <span className="font-semibold text-green-500">Premium User</span>
            <span className="font-semibold text-gray-500">
              Credits: {user.credits}
            </span>
            <span className="text-sm text-gray-500">
              Expires on: {new Date(user.expire).toLocaleDateString('hu-HU')}
            </span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="userStat">
          <span className="font-semibold text-gray-600">Free User</span>
        </div>
      );
    }
  }

  return (
    <div>
      <div className="max-w-[80vw] mx-auto my-10 px-4">
        <div className="grid grid-cols-[250px_1fr] gap-6">
          <SideNav />

          <main className="grid grid-cols-1 grid-rows-[auto_1fr] text-lg">
            <Card className="w-full col-span-2 shadow-lg border-gray-200 overflow-hidden ">
              <ItemGroup className="px-6">
                {user.map((u) => (
                  <Item key={u.id} asChild role="listitem">
                    <div className="flex items-center gap-8">
                      <ItemMedia className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-gray-50 shadow-sm flex-shrink-0">
                        <Image
                          src={`https://avatar.vercel.sh/${u.id}`}
                          alt={u.name}
                          width={100}
                          height={100}
                          className="object-cover grayscale transition-transform hover:scale-105 duration-300"
                        />
                      </ItemMedia>
                      <ItemContent className="space-y-1">
                        <ItemTitle className="text-4xl font-extrabold text-gray-900 tracking-tight">
                          {u.name}
                        </ItemTitle>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {u.username}
                          </span>
                        </div>
                      </ItemContent>
                      <ItemContent className="ml-auto">
                        {isPremiumUser(u)}
                      </ItemContent>
                    </div>
                  </Item>
                ))}
              </ItemGroup>
            </Card>

            <Card className="flex flex-col shadow-lg border-gray-200 mt-10 w-full  mx-auto">
              <CardHeader className="text-left pb-2 border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Account Details
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col pt-6">
                <form action="" className="flex flex-col flex-grow">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-700">
                        Personal Information
                      </h3>

                      <Field className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          Name
                        </Label>
                        <Input
                          type="text"
                          name="name"
                          defaultValue={user?.[0]?.name}
                          placeholder="Your Full Name"
                          className="w-full px-4 py-2"
                          required
                        />
                      </Field>

                      <Field className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          Email Address
                        </Label>
                        <Input
                          type="email"
                          name="email"
                          defaultValue={user?.[0]?.email}
                          placeholder="email@example.com"
                          className="w-full px-4 py-2"
                          required
                        />
                      </Field>

                      <Field className="pt-4 flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">
                          Registration Date
                        </Label>
                        <span className="font-mono text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                          {new Date(
                            user?.[0]?.registrationDate || Date.now()
                          ).toLocaleDateString('hu-HU')}
                        </span>
                      </Field>
                    </div>

                    <div className="space-y-6 md:border-l md:border-gray-100 md:pl-8">
                      <h3 className="text-lg font-semibold text-gray-700">
                        Security Settings
                      </h3>

                      <div className="flex flex-col gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <p className="text-sm text-gray-500 mb-3">
                            Update your password to keep your account secure.
                          </p>
                          <Button className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                            Change Password
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-700">
                            Two-Factor Authentication
                          </p>
                          <div className="flex flex-col xl:flex-row gap-3">
                            <Button
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                              type="button"
                            >
                              Backup Code
                            </Button>
                            <Button
                              className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                              type="button"
                            >
                              Remove 2FA
                            </Button>
                          </div>
                          <FieldDescription>
                            <p>
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

                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Available Credits
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {user[0].credits}
                    </p>
                  </div>

                  <CardFooter className="flex justify-center mt-auto pt-8 px-0">
                    <ModifyPlanModal
                      currentCredits={user[0].credits}
                      currentPlan={user[0].plan}
                    />
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
