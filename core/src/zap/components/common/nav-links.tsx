"use client";

import { useRouter } from "@bprogress/next/app";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ZapButton } from "@/components/zap-ui/button";

import { EXTERNAL_LINKS, HEADER_HEIGHT, NAV_LINKS } from "./header";

const NAV_BUTTON_CLASSNAME =
  "text-muted-foreground hover:text-foreground flex items-center text-sm font-medium transition-colors";

export function NavLinks() {
  const pathname = usePathname();
  const router = useRouter();

  const scrollToSection = (sectionId: string) => {
    if (pathname !== "/") {
      router.push("/");
      return;
    }

    const section = document.getElementById(sectionId);
    if (section) {
      const elementPosition = section.offsetTop - HEADER_HEIGHT;

      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {NAV_LINKS.map(({ id, label }) => (
        <ZapButton
          className={NAV_BUTTON_CLASSNAME}
          key={id}
          onClick={() => scrollToSection(id)}
          variant="ghost"
        >
          {label}
        </ZapButton>
      ))}

      {EXTERNAL_LINKS.map(({ href, label }) => (
        <ZapButton asChild key={href} variant="ghost">
          <Link
            className="text-muted-foreground hover:text-foreground flex items-center text-sm font-medium transition-colors"
            href={href}
          >
            {label}
          </Link>
        </ZapButton>
      ))}
    </>
  );
}
