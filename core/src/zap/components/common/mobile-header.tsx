"use client";

import { AlignJustify, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/zap/components/common/logo";
import { MenuLinks } from "@/zap/components/common/menu-links";

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);

  if (isOpen) {
    return (
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/90 fixed top-0 z-50 flex h-screen w-full flex-col border-b backdrop-blur">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-4">
          <Logo />
          <Button
            className="text-foreground text-base font-semibold"
            onClick={() => setIsOpen(false)}
            variant="ghost"
          >
            Menu
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col items-start space-y-2 overflow-y-auto px-4 py-8">
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground text-sm font-medium">
              Menu
            </span>
            <MenuLinks onClick={() => setIsOpen(false)} variant="mobile" />
          </div>
        </nav>
      </div>
    );
  }

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4">
        <Logo />
        <Button
          className="text-foreground text-base font-semibold"
          onClick={() => setIsOpen(true)}
          variant="ghost"
        >
          Menu
          <AlignJustify className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
