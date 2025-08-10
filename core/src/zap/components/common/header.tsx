"use client";

import { useRouter } from "@bprogress/next/app";
import { AlignJustify, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useBodyScrollLock } from "@/hooks/utils/use-body-scroll-lock";
import { cn } from "@/lib/utils";
import { betterAuthClient } from "@/zap/auth/providers/better-auth/client";
import { ZapButton } from "@/zap/components/core";
import { Logo } from "@/zap-old/components/common/logo";
import { MenuLinks } from "@/zap-old/components/common/menu-links";
import { SessionButton } from "@/zap-old/components/common/session-button";

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
  useBodyScrollLock(isOpen);

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
          <ZapButton
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
          </ZapButton>
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

function Logo() {
  return (
    <Link className="flex items-center space-x-2" href="/">
      <span className="inline-block font-bold">Zap.ts ⚡️</span>
    </Link>
  );
}

function SessionButton() {
  const { data: result } = betterAuthClient.useSession();
  const session = result?.session;

  if (session) {
    return (
      <ZapButton asChild size="sm">
        <Link href="/app">Open App</Link>
      </ZapButton>
    );
  }

  return (
    <>
      <ZapButton asChild variant="ghost">
        <Link
          className="text-muted-foreground hover:text-foreground active:text-foreground text-sm font-medium transition-colors"
          href="/login"
        >
          Login
        </Link>
      </ZapButton>

      <ZapButton asChild size="sm">
        <Link href="/register">Get Started</Link>
      </ZapButton>
    </>
  );
}

interface MenuLinksProps {
  onClick?: () => void;
  variant?: "desktop" | "mobile";
}

function MenuLinks({ onClick, variant = "desktop" }: MenuLinksProps) {
  const scrollToSection = useScrollToSection();

  const linkClassName =
    variant === "mobile"
      ? "flex items-center text-2xl font-semibold"
      : "flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground";

  return (
    <>
      {NAV_LINKS.map(({ id, label }) => (
        <button
          className={linkClassName}
          key={id}
          onClick={() => {
            scrollToSection(id);
            onClick?.();
          }}
          type="button"
        >
          {label}
        </button>
      ))}

      {EXTERNAL_LINKS.map(({ href, label }) => (
        <Link className={linkClassName} href={href} key={href}>
          {label}
        </Link>
      ))}
    </>
  );
}

function useScrollToSection(offset = HEADER_HEIGHT) {
  const pathname = usePathname();
  const router = useRouter();

  const scrollToSection = (sectionId: string) => {
    if (pathname !== "/") {
      router.push("/");
      return;
    }

    const section = document.getElementById(sectionId);
    if (section) {
      const position = section.offsetTop - offset;
      window.scrollTo({ top: position, behavior: "smooth" });
    }
  };

  return scrollToSection;
}
