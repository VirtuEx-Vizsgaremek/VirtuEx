import Image from 'next/image';
import { redirect } from 'next/navigation';
import SideNav from '@/components/sidenav';
import { getMe } from '@/lib/actions';
import ProfileForm from '@/components/profile-form';

export const dynamic = 'force-dynamic';

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle
} from '@/components/ui/item';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ProfilePage() {
  const userData = await getMe();

  if (!userData) {
    redirect('/auth/login');
  }

  const planName = userData.subscription_plan ?? 'Free';
  const isPremium = Boolean(userData.subscription) && planName !== 'Free';

  const user = [
    {
      id: userData.id,
      name: userData.full_name,
      username: userData.username,
      email: userData.email,
      registrationDate: new Date().toISOString(),
      premium: isPremium,
      expire: '2025-12-31',
      plan: planName,
      credits: 100,
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
              Plan: {user.plan}
            </span>
            <span className="text-xs text-muted-foreground">
              Credits: {user.credits}
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
                <ProfileForm user={user[0]} />
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
