"use client";

import { useRouter } from "@bprogress/next/app";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  EXTERNAL_LINKS,
  HEADER_HEIGHT,
  NAV_LINKS,
} from "@/zap-old/components/common/header";

interface MenuLinksProps {
  onClick?: () => void;
  variant?: "desktop" | "mobile";
}

export function MenuLinks({ onClick, variant = "desktop" }: MenuLinksProps) {
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
