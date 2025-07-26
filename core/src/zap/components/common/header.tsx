"use client";

import { AlignJustify, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/zap/components/common/logo";
import { MenuLinks } from "@/zap/components/common/menu-links";
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header
      className={cn(
        "bg-background/95 supports-[backdrop-filter]:bg-background/90 sticky top-0 z-50 w-full backdrop-blur",
        isOpen ? ": border-background/95 border-b" : "border-b",
      )}
    >
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden gap-2 md:flex">
            <MenuLinks />
          </nav>
        </div>

        <div className="flex md:hidden">
          <Button
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="text-foreground text-base font-semibold"
            onClick={() => setIsOpen(!isOpen)}
            variant="ghost"
          >
            Menu
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <AlignJustify className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="hidden flex-1 items-center justify-end space-x-4 md:flex">
          <SessionButton />
        </div>
      </div>

      {isOpen && (
        <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/90 fixed z-50 flex h-[calc(100vh-4rem)] w-full flex-1 flex-col items-start space-y-2 overflow-y-auto px-4 py-8 backdrop-blur">
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground text-sm font-medium">
              Menu
            </span>
            <MenuLinks onClick={() => setIsOpen(false)} variant="mobile" />
          </div>
        </nav>
      )}
    </header>
  );
}
