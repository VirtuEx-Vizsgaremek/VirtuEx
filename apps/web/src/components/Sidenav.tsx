'use client';

import {
  CreditCard,
  DollarSign,
  LogOut,
  Settings,
  ShieldCheck,
  User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card } from './ui/card';

const menuItems = [
  { name: 'My Profile', href: '/profile', icon: User },
  { name: 'Wallet', href: '/wallet', icon: DollarSign },
  { name: 'Subscription', href: '/plan', icon: CreditCard },
  { name: 'Security', href: '/security', icon: ShieldCheck },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Exit', href: '/', icon: LogOut }
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <Card className="shadow-lg border-gray-200 overflow-hidden w-64 mr-8  m-8">
      <nav className="p-4">
        <div className="mb-8 px-4 py-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Account Menu
          </h2>
        </div>

        <ul className="space-y-2">
          {menuItems.map((item, index, array) => {
            const isActive = pathname === item.href;
            const isLast = index === array.length - 1;

            return (
              <li
                key={item.href}
                className={isLast ? 'pt-4 mt-4 border-t border-gray-100' : ''}
              >
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-bold shadow-sm'
                        : isLast
                          ? 'text-red-600 hover:bg-red-50 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                    }
                  `}
                >
                  <item.icon
                    size={20}
                    className={
                      isActive
                        ? 'text-blue-600'
                        : isLast
                          ? 'text-red-500'
                          : 'text-gray-400'
                    }
                  />
                  <span>{item.name}</span>

                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />
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
