'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Moon, Sun, Palette } from 'lucide-react';
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
import { useTheme } from '@/contexts/ThemeContext';
import { ChartColorTheme, THEME_NAMES } from '@/lib/chartThemes';

export default function Navbar() {
  // Use theme context instead of local state
  const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();
  const isDark = theme === 'dark';
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // State for floating navbar visibility on scroll
  const [showFloatingNav, setShowFloatingNav] = useState(false);

  // Show floating navbar after scrolling 100px down
  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingNav(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Floating Navbar - Appears on scroll with rounded pill design */}
      <nav
        className={`fixed w-[70%] top-4 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 ${
          showFloatingNav
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-card/95 backdrop-blur-md border border-border shadow-lg rounded-full px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href=""
              className="text-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              Premium
            </Link>
            <Link
              href=""
              className="text-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              About Us
            </Link>
          </div>

          <img
            src="VirtuEx_logo_pfp-bg-gl-cr.svg"
            alt="Logo"
            className="h-10 w-fit absolute left-1/2 -translate-x-1/2"
          />

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full">
              Sign Up
            </Button>
            <Button size="sm" className="rounded-full">
              Log In
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full"
              onClick={toggleTheme}
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Navbar - Static top navigation bar */}
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="flex justify-between gap-4 m-auto max-w-[85%] px-1 py-3 items-center ">
          <NavigationMenu>
            <NavigationMenuList className="gap-6">
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className="text-foreground hover:text-primary transition-colors text-md"
                >
                  <Link href="">Premium</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className="text-foreground hover:text-primary transition-colors text-md"
                >
                  <Link href="">About Us</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <img
            src="VirtuEx_logo_pfp-bg-gl-cr.svg"
            alt="Logo"
            className="h-13 w-fit"
          />

          <div className="flex gap-3">
            <Button variant="outline" className="text-md">
              Sign Up
            </Button>
            <Button className="text-md">Log In</Button>

            {/* Color Theme Selector */}
            <div className="relative">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                title="Change color theme"
              >
                <Palette />
              </Button>
              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    {(Object.keys(THEME_NAMES) as ChartColorTheme[]).map(
                      (themeKey) => (
                        <button
                          key={themeKey}
                          onClick={() => {
                            setColorTheme(themeKey);
                            setShowThemeMenu(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors ${
                            colorTheme === themeKey
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-foreground'
                          }`}
                        >
                          {THEME_NAMES[themeKey]}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Light/Dark Mode Toggle */}
            <Button size="icon" variant="ghost" onClick={toggleTheme}>
              {isDark ? <Sun /> : <Moon />}
            </Button>
          </div>
        </div>
      </nav>
    </>
  );
}
