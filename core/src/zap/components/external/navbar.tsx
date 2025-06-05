"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useRouter } from "nextjs-toploader/app";
import { usePathname } from "next/navigation";
import { authClient } from "@/zap/lib/auth/client";

const navLinks = [
  { id: "hero", label: "Home" },
  { id: "testimonials", label: "Testimonials" },
  { id: "features", label: "Features" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = authClient.useSession();
  const session = data?.session;

  const scrollToSection = (sectionId: string) => {
    if (pathname !== "/") {
      router.push("/");
      return;
    }

    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const navButtonClass =
    "text-muted-foreground hover:text-foreground flex items-center text-sm font-medium transition-colors";

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full items-center space-x-4 px-4 sm:justify-between sm:space-x-0 md:px-8">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold">Zap.ts ⚡️</span>
          </Link>

          <nav className="hidden gap-2 md:flex">
            {navLinks.map(({ id, label }) => (
              <Button
                key={id}
                variant="ghost"
                onClick={() => scrollToSection(id)}
                className={navButtonClass}
              >
                {label}
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {session && (
              <Button size="sm" asChild>
                <Link href="/app">Open App</Link>
              </Button>
            )}
            {!session && (
              <>
                <Button variant="ghost" asChild>
                  <Link
                    href="/login"
                    className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                </Button>

                <Button size="sm" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </nav>

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
