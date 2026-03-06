/**
 * Footer Component
 *
 * Application footer displayed on all non-market pages (via ConditionalLayout).
 * Contains branding, navigation links, legal information, and social links.
 *
 * Structure:
 * - Brand section with logo and description
 * - Product links (features, pricing, etc.)
 * - Company information links
 * - Legal links (privacy, terms, etc.)
 * - Newsletter signup section
 * - Social media links
 *
 * Features:
 * - Responsive grid layout (1 column mobile, 4 columns desktop)
 * - GitHub link to project repository
 * - Newsletter subscription form
 * - Links to /market page for getting started
 */

'use client';

import { SiGithub } from '@icons-pack/react-simple-icons';
import { ArrowUpFromDot } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-card py-12 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {/* <span className="text-xl font-bold text-foreground">
                  Virtu<span className="text-accent">Ex</span>
                </span> */}
              <img
                src="VirtuEx_logo-bg-gl-cr.svg"
                alt="Logo"
                className="h-14 w-fit"
              />
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Master cryptocurrency trading in a risk-free environment with
              real-time market data.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/VirtuEx-Vizsgaremek/VirtuEx/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {/* <Github className="w-6 h-6" /> */}
                <SiGithub />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#features"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#wallet"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Wallet
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                >
                  AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Team
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar - Copyright & Scroll to Top */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            &copy; 2025 VirtuEx Team. All rights reserved.
          </p>
          <p
            className="text-muted-foreground text-xs justify-center align-center flex flex-col items-center gap-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ArrowUpFromDot />
            To the top
          </p>
          <p className="text-muted-foreground text-xs">
            Exam Project 2025. Educational purposes only. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
