import { HeartIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { DiscordIcon, GitHubIcon } from "../(home)/_components/icons";

export const metadata: Metadata = {
  title: "Sponsors — Zap Studio",
  description:
    "Support Zap Studio by becoming a sponsor. Help keep the project sustainable and actively maintained.",
};

const SPONSOR_LINK = "https://github.com/sponsors/alexandretrotel";

interface Tier {
  emoji: string;
  name: string;
  perks: string[];
  price: string;
  slots: number;
}

const tiers: Tier[] = [
  {
    name: "Bronze",
    emoji: "🥉",
    price: "$5/mo",
    perks: ["Name listed on sponsors page", "Sponsor badge on GitHub"],
    slots: 10,
  },
  {
    name: "Silver",
    emoji: "🥈",
    price: "$20/mo",
    perks: [
      "Everything in Bronze",
      "Small logo on sponsors page",
      "Shout-out on Discord",
    ],
    slots: 6,
  },
  {
    name: "Gold",
    emoji: "🥇",
    price: "$50/mo",
    perks: [
      "Everything in Silver",
      "Medium logo on sponsors page",
      "Logo on README",
      "Priority issue support",
    ],
    slots: 4,
  },
];

export default function SponsorsPage(): ReactNode {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden border-fd-border border-b">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 size-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fd-primary/5 blur-[100px] md:size-200"
        />

        <div className="relative mx-auto max-w-3xl px-6 py-16 text-center sm:py-24 md:py-32">
          <p className="mb-4 font-mono text-fd-muted-foreground text-xs uppercase leading-5 tracking-widest">
            Sponsors
          </p>

          <h1 className="font-serif text-4xl leading-[1.06] -tracking-[0.02em] sm:text-5xl md:text-6xl">
            Backed by the{" "}
            <span className="bg-linear-to-r from-fd-primary to-fd-primary/60 bg-clip-text text-transparent italic">
              community
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-fd-muted-foreground text-sm leading-6 sm:mt-6 sm:text-base sm:leading-7 md:mt-8 md:text-lg md:leading-8">
            Zap Studio is free and open source, licensed under MIT. Sponsors
            help keep the project sustainable, actively maintained, and growing.
          </p>

          <div className="mt-6 flex justify-center sm:mt-8">
            <Link
              className="group inline-flex items-center justify-center gap-2 rounded-md border border-fd-primary/80 bg-fd-primary px-5 py-2.5 font-medium text-fd-primary-foreground text-sm leading-none shadow-sm transition-all duration-150 hover:-translate-y-px hover:shadow-md hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background active:translate-y-0 active:shadow-sm active:brightness-95"
              href={SPONSOR_LINK}
              rel="noopener"
              target="_blank"
            >
              <HeartIcon className="size-4 transition-transform duration-200 group-hover:scale-110" />
              Become a Sponsor
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24 md:py-32">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <h2 className="font-serif text-3xl leading-[1.12] sm:text-4xl md:text-5xl">
            Sponsorship tiers
          </h2>
          <p className="mt-4 text-fd-muted-foreground text-sm leading-6 sm:text-base sm:leading-7">
            Choose a tier that works for you. Every contribution matters.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3 sm:gap-6">
          {tiers.map((tier) => (
            <TierCard key={tier.name} tier={tier} />
          ))}
        </div>
      </section>

      <section className="border-fd-border border-t bg-fd-card/30">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 h-px bg-linear-to-r from-transparent via-fd-primary/20 to-transparent"
        />

        <div className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-24">
          <h2 className="font-serif text-2xl leading-[1.12] sm:text-3xl">
            Not ready to sponsor?
          </h2>
          <p className="mt-4 text-fd-muted-foreground text-sm leading-6 sm:text-base sm:leading-7">
            You can still help by starring the repo, reporting issues, or
            spreading the word. Every bit of support counts.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-md border border-fd-border bg-fd-background px-5 py-2.5 font-medium text-fd-foreground text-sm leading-none shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-fd-primary/30 hover:bg-fd-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background active:translate-y-0 active:shadow-sm"
              href="https://github.com/zap-studio/monorepo"
              rel="noopener"
              target="_blank"
            >
              <GitHubIcon className="size-4" />
              Star on GitHub
            </Link>

            <Link
              className="inline-flex items-center justify-center gap-2 rounded-md border border-fd-border bg-fd-background px-5 py-2.5 font-medium text-fd-foreground text-sm leading-none shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-fd-primary/30 hover:bg-fd-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background active:translate-y-0 active:shadow-sm"
              href="https://discord.gg/8Ke3VCjjMf"
              rel="noopener"
              target="_blank"
            >
              <DiscordIcon className="size-4" />
              Join Discord
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function TierCard({ tier }: { tier: Tier }): ReactNode {
  return (
    <div className="flex flex-col rounded-2xl border border-fd-border bg-fd-card/60 p-6 transition-all duration-300 hover:border-fd-primary/20 hover:shadow-fd-primary/3 hover:shadow-lg sm:p-8">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="text-xl">{tier.emoji}</span>
        <h3 className="font-serif text-lg leading-none sm:text-xl">
          {tier.name}
        </h3>
      </div>

      <p className="mb-5 font-mono text-base text-fd-primary leading-none tracking-tight">
        {tier.price}
      </p>

      <ul className="mb-6 flex flex-1 flex-col gap-2">
        {tier.perks.map((perk) => (
          <li
            className="flex items-start gap-2 text-fd-muted-foreground text-sm leading-6"
            key={perk}
          >
            <span className="mt-2 block size-1.5 shrink-0 rounded-full bg-fd-primary/50" />
            {perk}
          </li>
        ))}
      </ul>

      <div className="mb-5">
        <p className="mb-3 font-mono text-fd-muted-foreground/50 text-xs uppercase leading-5 tracking-wider">
          {tier.slots} {tier.slots === 1 ? "slot" : "slots"} available
        </p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: tier.slots }, (_, i) => (
            <PlaceholderAvatar key={`${tier.name}-${i}`} />
          ))}
        </div>
      </div>

      <Link
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-md border border-fd-border bg-fd-background px-4 py-2.5 font-medium text-fd-foreground text-sm leading-none shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-fd-primary/30 hover:bg-fd-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background active:translate-y-0 active:shadow-sm"
        href={SPONSOR_LINK}
        rel="noopener"
        target="_blank"
      >
        <HeartIcon className="size-4" />
        Sponsor
      </Link>
    </div>
  );
}

function PlaceholderAvatar(): ReactNode {
  return (
    <div className="group flex size-12 items-center justify-center rounded-full border border-fd-border/50 border-dashed bg-fd-card/40 transition-all duration-300 hover:border-fd-primary/20 hover:bg-fd-card/70 sm:size-14">
      <HeartIcon className="size-4 text-fd-muted-foreground/25 transition-colors duration-300 group-hover:text-fd-primary/40" />
    </div>
  );
}
