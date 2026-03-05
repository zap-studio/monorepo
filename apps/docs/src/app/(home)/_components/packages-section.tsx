import {
  ArrowRightIcon,
  GlobeIcon,
  LayersIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { FadeIn, StaggerContainer, StaggerItem } from "./animated";

interface PackageCardProps {
  description: string;
  href: string;
  icon: ReactNode;
  name: string;
}

const packages: PackageCardProps[] = [
  {
    icon: <GlobeIcon className="size-5" />,
    name: "fetch",
    description:
      "Type-safe HTTP client with Standard Schema validation, proper error handling, and runtime safety built on native fetch.",
    href: "/docs/packages/fetch",
  },
  {
    icon: <ShieldCheckIcon className="size-5" />,
    name: "permit",
    description:
      "Declarative authorization with composable conditions. Type-safe RBAC and ABAC policies with Standard Schema support.",
    href: "/docs/packages/permit",
  },
  {
    icon: <LayersIcon className="size-5" />,
    name: "validation",
    description:
      "Standard Schema utilities and ValidationError helpers. The shared foundation powering all Zap Studio packages.",
    href: "/docs/packages/validation",
  },
];

export function PackagesSection(): ReactNode {
  return (
    <section className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24 md:py-32">
      <FadeIn delay={0} duration={0.6} y={16}>
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-16">
          <p className="mb-4 font-mono text-fd-muted-foreground text-xs uppercase leading-5 tracking-widest">
            Packages
          </p>

          <h2 className="font-serif text-3xl leading-[1.12] sm:text-4xl md:text-5xl">
            Everything you need, <br className="hidden sm:block" />
            nothing you don&apos;t
          </h2>

          <p className="mt-5 text-fd-muted-foreground text-lg leading-7 md:text-xl md:leading-8">
            Modular packages that work independently or together.
            <br className="hidden sm:block" />
            Install only what you need.
          </p>
        </div>
      </FadeIn>

      <StaggerContainer
        className="grid gap-5 sm:grid-cols-2 sm:gap-6"
        delay={0.15}
        stagger={0.08}
      >
        {packages.map((pkg) => (
          <StaggerItem key={pkg.name}>
            <PackageCard
              description={pkg.description}
              href={pkg.href}
              icon={pkg.icon}
              name={pkg.name}
            />
          </StaggerItem>
        ))}

        <StaggerItem>
          <ComingSoonCard />
        </StaggerItem>
      </StaggerContainer>
    </section>
  );
}

function PackageCard({
  icon,
  name,
  description,
  href,
}: PackageCardProps): ReactNode {
  return (
    <Link className="group block h-full" href={href}>
      <div className="flex h-full flex-col rounded-2xl border border-fd-border bg-fd-card p-6 transition-all duration-300 group-hover:border-fd-primary/30 group-hover:shadow-fd-primary/4 group-hover:shadow-lg sm:p-8">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-fd-accent text-fd-primary transition-colors duration-300 group-hover:bg-fd-primary/15 sm:mb-6 sm:size-12">
          {icon}
        </div>

        <p className="font-mono text-fd-muted-foreground text-xs leading-5 tracking-wide">
          {name}
        </p>

        <p className="mt-2.5 flex-1 text-fd-foreground/90 text-sm leading-6">
          {description}
        </p>

        <div className="mt-6 inline-flex items-center gap-1.5 font-medium text-fd-primary text-sm leading-6 transition-all duration-300 group-hover:gap-2.5">
          Learn more
          <ArrowRightIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

function ComingSoonCard(): ReactNode {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-fd-border border-dashed bg-fd-card/50 p-6 sm:p-8">
      <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-fd-accent text-fd-primary sm:mb-6 sm:size-12">
        <SparklesIcon className="size-5" />
      </div>

      <p className="font-mono text-fd-muted-foreground text-xs leading-5 tracking-wide">
        More coming soon
      </p>

      <p className="mt-2.5 flex-1 text-fd-foreground/90 text-sm leading-6">
        Realtime events, waitlist management, webhook handling, and more — all
        type-safe and framework-agnostic.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {["realtime", "waitlist", "webhooks"].map((label) => (
          <span
            className="rounded-full border border-fd-border/60 bg-fd-accent/50 px-2.5 py-1 font-mono text-[11px] text-fd-muted-foreground leading-4"
            key={label}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
