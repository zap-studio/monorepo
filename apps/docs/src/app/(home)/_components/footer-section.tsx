import Link from "next/link";
import type { ReactNode } from "react";

import { FadeIn } from "./animated";
import { DiscordIcon, GitHubIcon } from "./icons";

interface FooterLink {
  external?: boolean;
  href: string;
  label: string;
}

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
  {
    heading: "Packages",
    links: [
      { label: "@zap-studio/fetch", href: "/docs/packages/fetch" },
      { label: "@zap-studio/permit", href: "/docs/packages/permit" },
      { label: "@zap-studio/validation", href: "/docs/packages/validation" },
    ],
  },
  {
    heading: "Templates",
    links: [{ label: "Local.ts", href: "/docs/local-ts" }],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", href: "/docs/packages/fetch" },
      { label: "llms.txt", href: "/llms.txt" },
      { label: "llms-full.txt", href: "/llms-full.txt" },
    ],
  },
  {
    heading: "Community",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/zap-studio/monorepo",
        external: true,
      },
      {
        label: "Discord",
        href: "https://discord.gg/8Ke3VCjjMf",
        external: true,
      },
    ],
  },
];

export function FooterSection(): ReactNode {
  return (
    <footer className="relative overflow-hidden border-fd-border border-t">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-fd-primary/15 to-transparent"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 select-none overflow-hidden"
      >
        <p
          className="translate-y-[22%] whitespace-nowrap text-center font-bold font-serif text-fd-foreground/10 leading-none dark:text-fd-foreground/15"
          style={{ fontSize: "clamp(48px, 14vw, 200px)" }}
        >
          Zap Studio
        </p>
      </div>

      <div className="relative mx-auto max-w-5xl px-6 pt-12 sm:pt-16">
        <FadeIn delay={0} duration={0.5} y={10}>
          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 sm:gap-x-10 sm:gap-y-8"
          >
            {footerColumns.map((column) => (
              <FooterColumnGroup
                heading={column.heading}
                key={column.heading}
                links={column.links}
              />
            ))}
          </nav>
        </FadeIn>

        <FadeIn delay={0.1} duration={0.4} y={8}>
          <div
            className="mt-8 flex flex-col items-center justify-between gap-4 border-fd-border border-t pt-8 sm:flex-row sm:gap-6"
            style={{ paddingBottom: "clamp(88px, 14vw, 192px)" }}
          >
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <p className="text-fd-muted-foreground text-sm leading-6">
                Making the web better.
              </p>
              <p className="text-fd-muted-foreground/40 text-xs leading-5">
                &copy; {new Date().getFullYear()} Alexandre Trotel.
              </p>
            </div>

            <div className="flex items-center gap-5">
              <Link
                aria-label="View Zap Studio on GitHub"
                className="text-fd-muted-foreground transition-colors duration-200 hover:text-fd-foreground"
                href="https://github.com/zap-studio/monorepo"
                rel="noopener"
                target="_blank"
              >
                <GitHubIcon className="size-4" />
              </Link>
              <Link
                aria-label="Join Zap Studio on Discord"
                className="text-fd-muted-foreground transition-colors duration-200 hover:text-fd-foreground"
                href="https://discord.gg/8Ke3VCjjMf"
                rel="noopener"
                target="_blank"
              >
                <DiscordIcon className="size-4" />
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </footer>
  );
}

function FooterColumnGroup({ heading, links }: FooterColumn): ReactNode {
  return (
    <div>
      <p className="mb-4 font-serif text-fd-foreground/70 text-xs uppercase leading-5 tracking-widest">
        {heading}
      </p>
      <ul className="flex flex-col gap-1">
        {links.map((link) => (
          <FooterLinkItem
            external={link.external}
            href={link.href}
            key={link.label}
            label={link.label}
          />
        ))}
      </ul>
    </div>
  );
}

function FooterLinkItem({ href, label, external }: FooterLink): ReactNode {
  return (
    <li>
      <Link
        className="block truncate text-fd-muted-foreground text-sm leading-7 transition-colors duration-200 hover:text-fd-foreground"
        href={href}
        {...(external ? { target: "_blank", rel: "noopener" } : {})}
      >
        {label}
      </Link>
    </li>
  );
}
