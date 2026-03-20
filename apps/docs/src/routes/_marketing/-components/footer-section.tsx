import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { getExternalLinkProps } from "@/lib/utils/links";

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
    heading: "Templates",
    links: [{ label: "Local.ts", href: "/docs/local-ts" }],
  },
  {
    heading: "Packages",
    links: [
      { label: "fetch", href: "/docs/packages/fetch" },
      { label: "permit", href: "/docs/packages/permit" },
      { label: "validation", href: "/docs/packages/validation" },
      { label: "webhooks", href: "/docs/packages/webhooks" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", href: "/docs/getting-started" },
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
    <footer className="border-fd-border relative overflow-hidden border-t">
      <div
        aria-hidden="true"
        className="via-fd-primary/15 pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden select-none"
      >
        <p
          className="text-fd-foreground/10 dark:text-fd-foreground/15 translate-y-[22%] text-center font-serif leading-none font-bold whitespace-nowrap"
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
            className="border-fd-border mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row sm:gap-6"
            style={{ paddingBottom: "clamp(88px, 14vw, 192px)" }}
          >
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <p className="text-fd-muted-foreground text-sm leading-6">Making the web better.</p>
              <p className="text-fd-muted-foreground/40 text-xs leading-5">
                &copy; {new Date().getFullYear()} Alexandre Trotel.
              </p>
            </div>

            <div className="flex items-center gap-5">
              <a
                aria-label="View Zap Studio on GitHub"
                className="text-fd-muted-foreground hover:text-fd-foreground transition-colors duration-200"
                href="https://github.com/zap-studio/monorepo"
                {...getExternalLinkProps("https://github.com/zap-studio/monorepo")}
              >
                <GitHubIcon className="size-4" />
              </a>
              <a
                aria-label="Join Zap Studio on Discord"
                className="text-fd-muted-foreground hover:text-fd-foreground transition-colors duration-200"
                href="https://discord.gg/8Ke3VCjjMf"
                {...getExternalLinkProps("https://discord.gg/8Ke3VCjjMf")}
              >
                <DiscordIcon className="size-4" />
              </a>
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
      <p className="text-fd-foreground/70 mb-2 font-serif text-xs leading-5 tracking-widest uppercase md:mb-4">
        {heading}
      </p>
      <ul className="flex flex-col md:gap-1">
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
  if (external) {
    return (
      <li>
        <a
          className="text-fd-muted-foreground hover:text-fd-foreground block truncate text-xs leading-7 transition-colors duration-200 md:text-sm"
          href={href}
          {...getExternalLinkProps(href)}
        >
          {label}
        </a>
      </li>
    );
  }

  return (
    <li>
      <Link
        className="text-fd-muted-foreground hover:text-fd-foreground block truncate text-xs leading-7 transition-colors duration-200 md:text-sm"
        to={href}
      >
        {label}
      </Link>
    </li>
  );
}
