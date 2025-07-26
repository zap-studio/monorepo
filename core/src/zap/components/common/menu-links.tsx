"use client";

import Link from "next/link";

import { EXTERNAL_LINKS, NAV_LINKS } from "@/zap/components/common/header";
import { useScrollToSection } from "@/zap/hooks/header/use-scroll-to-section";

interface MenuLinksProps {
  onClick?: () => void;
  variant?: "desktop" | "mobile";
}

export function MenuLinks({ onClick, variant = "desktop" }: MenuLinksProps) {
  const scrollToSection = useScrollToSection();

  const linkClassName =
    variant === "mobile"
      ? "flex items-center text-2xl font-semibold"
      : "flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground";

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
