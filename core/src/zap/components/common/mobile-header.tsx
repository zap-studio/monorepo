"use client";

import { useRouter } from "@bprogress/next/app";
import { AlignJustify, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { EXTERNAL_LINKS, NAV_LINKS } from "./header";

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const scrollToSection = (sectionId: string) => {
    if (pathname !== "/") {
      router.push("/");
      return;
    }

    const section = document.getElementById(sectionId);
    if (section) {
      const elementPosition = section.offsetTop;

      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  if (isOpen) {
    return (
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/90 fixed top-0 z-50 h-screen w-full border-b backdrop-blur">
        <div className="mx-auto flex h-16 w-full items-center justify-between space-x-4 px-4">
          <div className="flex gap-6">
            <Link className="flex items-center space-x-2" href="/">
              <span className="inline-block font-bold">Zap.ts ⚡️</span>
            </Link>
          </div>

          <Button
            className="text-foreground text-base font-semibold"
            onClick={() => setIsOpen(false)}
            variant={"ghost"}
          >
            <X className="h-5 w-5" />
            Menu
          </Button>
        </div>
        <nav className="flex flex-col items-start space-y-2 px-4 py-8">
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground text-sm font-medium">
              Menu
            </span>
            {NAV_LINKS.map((link) => (
              <button
                className="flex items-center space-x-2 text-2xl font-semibold"
                key={link.id}
                onClick={() => {
                  scrollToSection(link.id);
                  setIsOpen(false);
                }}
                type="button"
              >
                {link.label}
              </button>
            ))}
            {EXTERNAL_LINKS.map((link) => (
              <Link
                className="flex items-center space-x-2 text-2xl font-semibold"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div
        className={
          "mx-auto flex h-16 w-full items-center justify-between space-x-4 px-4"
        }
      >
        <div className="flex gap-6">
          <Link className="flex items-center space-x-2" href="/">
            <span className="inline-block font-bold">Zap.ts ⚡️</span>
          </Link>
        </div>

        <Button
          className="text-foreground text-base font-semibold"
          onClick={() => setIsOpen(true)}
          variant={"ghost"}
        >
          <AlignJustify className="h-5 w-5" />
          Menu
        </Button>
      </div>
    </header>
  );
}
