import Link from "next/link";

import { LatestBlogPosts } from "@/zap/blog/components";

import { ThemeSwitcher } from "./theme-switcher";

const LEGAL_LINKS = [
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/cookie-policy", label: "Cookie Policy" },
];

export function Footer() {
  return (
    <footer className="bg-background w-full border-t px-4 md:px-8">
      <div className="mx-auto max-w-6xl py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Link className="flex items-center space-x-2" href="/">
                <span className="inline-block font-bold">Zap.ts ⚡️</span>
              </Link>
            </div>

            <p className="text-muted-foreground text-sm leading-loose">
              &copy; {new Date().getFullYear()} Zap.ts. All rights reserved.
            </p>

            <div className="flex flex-wrap gap-4">
              {LEGAL_LINKS.map((link) => (
                <Link
                  className="text-muted-foreground text-sm underline-offset-4 hover:underline active:underline"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <ThemeSwitcher />
          </div>

          <LatestBlogPosts />
        </div>
      </div>
    </footer>
  );
}
