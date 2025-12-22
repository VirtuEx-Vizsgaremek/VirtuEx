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

export default function Home() {
  return (
    <div>
      <div className="flex justify-between gap-4 m-auto mt-4 p-2">
        <NavigationMenu className="w-full">
          <NavigationMenuList className="w-full">
            <div className="flex justify-self-start gap-4">
              <NavigationMenuItem>
                <NavigationMenuLink>
                  <Link href="">Premium</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink>
                  <Link href="">About Us</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </div>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex justify-self-end gap-4">
          <Button>Sign Up</Button>
          <Button>Log In</Button>
        </div>
      </div>
    </div>
  );
}
