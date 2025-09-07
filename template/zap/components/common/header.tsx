"use client";

import { useRouter } from "@bprogress/next/app";
import { AlignJustify, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { useBodyScrollLock } from "@/hooks/utils/use-body-scroll-lock";
import { isPluginEnabled } from "@/lib/plugins";
import { cn } from "@/lib/utils";
import { SessionButton } from "@/zap/auth/components/session-button";

import { ZapButton } from "../core/button";
import { EXTERNAL_LINKS, HEADER_HEIGHT, NAV_LINKS } from "../data";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  useBodyScrollLock(isOpen);

  const isAuthEnabled = useMemo(() => isPluginEnabled("auth"), []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90",
        isOpen ? ": border-background/95 border-b" : "border-b"
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
            className="font-semibold text-base text-foreground"
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
          {isAuthEnabled && <SessionButton />}
        </div>
      </div>

      {isOpen && (
        <nav className="fixed z-50 flex h-[calc(100vh-4rem)] w-full flex-1 flex-col items-start space-y-2 overflow-y-auto bg-background/95 px-4 py-8 backdrop-blur supports-[backdrop-filter]:bg-background/90">
          <div className="flex flex-col gap-2">
            <span className="font-medium text-muted-foreground text-sm">
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

type MenuLinksProps = {
  onClick?: () => void;
  variant?: "desktop" | "mobile";
};

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
        <Link className={linkClassName} href={{ pathname: href }} key={href}>
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
