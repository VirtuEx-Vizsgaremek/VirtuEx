'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport
} from '@/components/ui/navigation-menu';
import Link from 'next/link';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen">
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="flex justify-between gap-4 m-auto max-w-[85%] px-4 py-3 items-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-6">
              <NavigationMenuItem>
                <NavigationMenuLink className="text-foreground hover:text-primary transition-colors">
                  <Link href="">Premium</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="text-foreground hover:text-primary transition-colors">
                  <Link href="">About Us</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <img src="VirtuEx_logo-bg-gl.svg" alt="Logo" className="h-15" />

          <div className="flex gap-3">
            <Button variant="outline">Sign Up</Button>
            <Button>Log In</Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsDark(!isDark)}
            >
              {isDark ? <Sun /> : <Moon />}
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}
