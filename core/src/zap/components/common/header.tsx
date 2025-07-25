import Link from "next/link";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { NavLinks } from "@/zap/components/common/nav-links";
import { SessionButton } from "@/zap/components/common/session-button";

const NAV_LINKS = [
  { id: "hero", label: "Home" },
  { id: "testimonials", label: "Testimonials" },
  { id: "features", label: "Features" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
];

const EXTERNAL_LINKS = [{ href: "/blog", label: "Blog" }];

export function Navbar() {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div
        className={
          "mx-auto flex h-16 w-full items-center space-x-4 px-4 sm:justify-between sm:space-x-0 md:px-8"
        }
      >
        <div className="flex gap-6 md:gap-10">
          <Link className="flex items-center space-x-2" href="/">
            <span className="inline-block font-bold">Zap.ts ⚡️</span>
          </Link>

          <nav className="hidden gap-2 md:flex">
            <NavLinks externalLinks={EXTERNAL_LINKS} navLinks={NAV_LINKS} />
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <SessionButton />
          </nav>

          <ModeToggle variant={"outline"} />
        </div>
      </div>
    </header>
  );
}
