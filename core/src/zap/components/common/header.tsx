"use client";

import Link from "next/link";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { useDetectDevice } from "@/hooks/utils/use-detect-device";
import { MobileHeader } from "@/zap/components/common/mobile-header";
import { NavLinks } from "@/zap/components/common/nav-links";
import { SessionButton } from "@/zap/components/common/session-button";

export const NAV_LINKS = [
  { id: "hero", label: "Home" },
  { id: "testimonials", label: "Testimonials" },
  { id: "features", label: "Features" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
];

export const HEADER_HEIGHT = 64; // 16 * 4px (Tailwind's h-16)

export const EXTERNAL_LINKS = [{ href: "/blog", label: "Blog" }];

export function Header() {
  const { isMobile } = useDetectDevice();

  if (isMobile) {
    return <MobileHeader />;
  }

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div
        className={
          "mx-auto flex h-16 w-full items-center justify-between space-x-4 px-8"
        }
      >
        <div className="flex gap-10">
          <Link className="flex items-center space-x-2" href="/">
            <span className="inline-block font-bold">Zap.ts ⚡️</span>
          </Link>

          <nav className="flex gap-2">
            <NavLinks />
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <SessionButton />
          </nav>

          <ModeToggle variant={"outline"} />
        </div>
      </div>
    </header>
  );
}
