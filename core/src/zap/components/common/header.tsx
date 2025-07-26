"use client";

import { useDetectDevice } from "@/hooks/utils/use-detect-device";
import { Logo } from "@/zap/components/common/logo";
import { MenuLinks } from "@/zap/components/common/menu-links";
import { MobileHeader } from "@/zap/components/common/mobile-header";
import { SessionButton } from "@/zap/components/common/session-button";

export const NAV_LINKS = [
  { id: "hero", label: "Home" },
  { id: "testimonials", label: "Testimonials" },
  { id: "features", label: "Features" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
];

export const EXTERNAL_LINKS = [{ href: "/blog", label: "Blog" }];
export const HEADER_HEIGHT = 64; // Tailwind's h-16

export function Header() {
  const { isMobile } = useDetectDevice();

  if (isMobile) {
    return <MobileHeader />;
  }

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-8">
        <div className="flex gap-10">
          <Logo />
          <nav className="flex gap-2">
            <MenuLinks />
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <SessionButton />
        </div>
      </div>
    </header>
  );
}
