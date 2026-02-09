"use client"; 

import { Card } from "./ui/card";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, CreditCard, Settings, ShieldCheck, DollarSign } from "lucide-react";

const menuItems = [
  { name: "My Profile", href: "/profile", icon: User },
  { name: "Wallet", href: "/wallet", icon: DollarSign },
  { name: "Subscription", href: "/plan", icon: CreditCard }
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <Card className="shadow-lg border-gray-200 overflow-hidden">
      <nav className="min-h-[85vh] p-4 bg-white">
        <div className="mb-8 px-4 py-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Account Menu
          </h2>
        </div>
        
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? "bg-blue-50 text-blue-600 font-bold shadow-sm" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                    }
                  `}
                >
                  <item.icon size={20} className={isActive ? "text-blue-600" : "text-gray-400"} />
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