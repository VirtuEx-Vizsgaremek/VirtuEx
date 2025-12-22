import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <header><Button>Registration</Button> <Button>Login</Button></header>
    </div>
  );
}
