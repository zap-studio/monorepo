"use client";

import { useRouter } from "@bprogress/next/app";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { ZapButton } from "@/components/zap-ui/button";
import { authClient } from "@/zap/lib/auth/client";

const NAV_LINKS = [
  { id: "hero", label: "Home" },
  { id: "testimonials", label: "Testimonials" },
  { id: "features", label: "Features" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
];

const HEADER_HEIGHT = 64; // 16 * 4px (Tailwind's h-16)

const EXTERNAL_LINKS = [{ href: "/blog", label: "Blog" }];

const NAV_BUTTON_CLASSNAME =
  "text-muted-foreground hover:text-foreground flex items-center text-sm font-medium transition-colors";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isPending } = authClient.useSession();
  const session = data?.session;

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
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {session && (
              <ZapButton asChild size="sm">
                <Link href="/app">Open App</Link>
              </ZapButton>
            )}
            {!session && (
              <>
                <ZapButton asChild disabled={isPending} variant="ghost">
                  <Link
                    className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                    href="/login"
                  >
                    Login
                  </Link>
                </ZapButton>

                <ZapButton asChild disabled={isPending} size="sm">
                  <Link href="/register">Get Started</Link>
                </ZapButton>
              </>
            )}
          </nav>

          <ModeToggle variant={"outline"} />
        </div>
      </div>
    </header>
  );
}
