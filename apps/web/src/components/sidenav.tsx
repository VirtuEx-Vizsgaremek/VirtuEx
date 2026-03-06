'use client';

import { Card } from './ui/card';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  CreditCard,
  Settings,
  ShieldCheck,
  DollarSign,
  LogOut
} from 'lucide-react';

const menuItems = [
  { name: 'My Profile', href: '/profile', icon: User },
  { name: 'Wallet', href: '/wallet', icon: DollarSign },
  { name: 'Subscription', href: '/subscription', icon: CreditCard },
  { name: 'Logout', href: '/', icon: LogOut }
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <Card className="shadow-lg border-border bg-card overflow-hidden h-full">
      <nav className="h-full p-4 bg-card">
        <div className="mb-8 px-4 py-2">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Account Menu
          </h2>
        </div>

        <ul className="space-y-2">
          {menuItems.map((item, index, array) => {
            const isActive = pathname === item.href;
            const isLast = index === array.length - 1;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? 'bg-primary/10 text-primary font-bold shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium'
                    }
                  `}
                >
                  <item.icon
                    size={20}
                    className={
                      isActive
                        ? 'text-primary'
                        : isLast
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                    }
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </Card>
  );
}
