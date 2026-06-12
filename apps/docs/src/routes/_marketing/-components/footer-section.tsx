import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { getExternalLinkProps } from "@/lib/utils/links";

import { FadeIn } from "./animated";
import { GitHubIcon } from "./icons";

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
      { href: "/docs/packages/fetch", label: "fetch" },
      { href: "/docs/packages/permit", label: "permit" },
      { href: "/docs/packages/retry", label: "retry" },
      { href: "/docs/packages/validation", label: "validation" },
      { href: "/docs/packages/webhooks", label: "webhooks" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: "/docs/getting-started", label: "Documentation" },
      { href: "/llms.txt", label: "llms.txt" },
      { href: "/llms-full.txt", label: "llms-full.txt" },
    ],
  },
  {
    heading: "Community",
    links: [
      {
        external: true,
        href: "https://github.com/zap-studio/monorepo",
        label: "GitHub",
      },
    ],
  },
];

export function FooterSection(): ReactNode {
  return (
    <footer className="relative overflow-hidden border-t border-fd-border">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-fd-primary/15 to-transparent"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden select-none"
      >
        <p
          className="translate-y-[22%] text-center font-serif leading-none font-bold whitespace-nowrap text-fd-foreground/10 dark:text-fd-foreground/15"
          style={{ fontSize: "clamp(48px, 14vw, 200px)" }}
        >
          Zap Studio
        </p>
      </div>

      <div className="relative mx-auto max-w-5xl px-6 pt-12 sm:pt-16">
        <FadeIn delay={0} duration={0.5} y={10}>
          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-10 sm:gap-y-8"
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
            className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-fd-border pt-8 sm:flex-row sm:gap-6"
            style={{ paddingBottom: "clamp(88px, 14vw, 192px)" }}
          >
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <p className="text-sm leading-6 text-fd-muted-foreground">
                Making the web better.
              </p>
              <p className="text-xs leading-5 text-fd-muted-foreground/40">
                &copy; {new Date().getFullYear()} Alexandre Trotel.
              </p>
            </div>

            <div className="flex items-center gap-5">
              <a
                aria-label="View Zap Studio on GitHub"
                className="text-fd-muted-foreground transition-colors duration-200 hover:text-fd-foreground"
                href="https://github.com/zap-studio/monorepo"
                {...getExternalLinkProps(
                  "https://github.com/zap-studio/monorepo"
                )}
              >
                <GitHubIcon className="size-4" />
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
      <p className="mb-2 font-serif text-xs leading-5 tracking-widest text-fd-foreground/70 uppercase md:mb-4">
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
          className="block truncate text-xs leading-7 text-fd-muted-foreground transition-colors duration-200 hover:text-fd-foreground md:text-sm"
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
        className="block truncate text-xs leading-7 text-fd-muted-foreground transition-colors duration-200 hover:text-fd-foreground md:text-sm"
        to={href}
      >
        {label}
      </Link>
    </li>
  );
}
