"use client";

import { useRouter } from "@bprogress/next/app";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ZapButton } from "@/components/zap-ui/button";

const HEADER_HEIGHT = 64; // 16 * 4px (Tailwind's h-16)
const NAV_BUTTON_CLASSNAME =
  "text-muted-foreground hover:text-foreground flex items-center text-sm font-medium transition-colors";

interface NavLink {
  id: string;
  label: string;
}

interface ExternalLink {
  href: string;
  label: string;
}

interface NavLinksClientProps {
  navLinks: NavLink[];
  externalLinks: ExternalLink[];
}

export function NavLinksClient({
  navLinks,
  externalLinks,
}: NavLinksClientProps) {
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
      {navLinks.map(({ id, label }) => (
        <ZapButton
          className={NAV_BUTTON_CLASSNAME}
          key={id}
          onClick={() => scrollToSection(id)}
          variant="ghost"
        >
          {label}
        </ZapButton>
      ))}
      {externalLinks.map(({ href, label }) => (
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
