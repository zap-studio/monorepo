import type { ReactNode } from "react";

import { FadeIn } from "./animated";
import { ButtonGroup, PrimaryButton, SecondaryButton } from "./buttons";
import { DiscordIcon } from "./icons";

const trustSignals = {
  row1: ["Open Source", "Zero Lock-in", "TypeScript Native"],
  row2: ["Standard Schema", "Tree-shakeable", "ESM First", "JSR Compatible"],
} as const;

export function CTASection(): ReactNode {
  return (
    <section className="relative overflow-hidden border-fd-border border-y bg-fd-card/60">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 size-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fd-primary/5 blur-[100px] md:size-200"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[20%] right-[-5%] size-75 rounded-full bg-fd-primary/3 blur-[80px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-size-[24px_24px] dark:bg-[radial-gradient(circle,rgba(255,255,255,0.02)_1px,transparent_1px)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-fd-primary/25 to-transparent"
      />

      <div className="relative mx-auto max-w-3xl px-6 py-16 text-center sm:py-24 md:py-40">
        <FadeIn delay={0} duration={0.7} y={20}>
          <h2 className="font-serif text-3xl leading-[1.12] -tracking-[0.01em] sm:text-4xl md:text-5xl">
            Ready to build{" "}
            <span className="bg-linear-to-r from-fd-primary to-fd-primary/60 bg-clip-text text-transparent italic">
              faster
            </span>
            ?
          </h2>
        </FadeIn>

        <FadeIn delay={0.12} duration={0.6} y={14}>
          <p className="mx-auto mt-4 max-w-md text-base text-fd-muted-foreground leading-7 sm:mt-5 sm:text-lg md:text-xl md:leading-8">
            Get started in minutes. Fully documented, fully typed, fully tested.
          </p>
        </FadeIn>

        <FadeIn delay={0.24} duration={0.5} y={10}>
          <ButtonGroup className="mt-8 justify-center">
            <PrimaryButton href="/docs/packages/fetch" size="hero" withArrow>
              Read the Docs
            </PrimaryButton>

            <SecondaryButton href="https://discord.gg/8Ke3VCjjMf" size="hero">
              <DiscordIcon className="size-4" />
              Join the Community
            </SecondaryButton>
          </ButtonGroup>
        </FadeIn>

        <FadeIn delay={0.36} duration={0.4} y={6}>
          <div className="mt-8 flex flex-col items-center gap-1.5 font-mono text-fd-muted-foreground/40 text-xs leading-5">
            <p>{trustSignals.row1.join(" · ")}</p>
            <p>{trustSignals.row2.join(" · ")}</p>
          </div>
        </FadeIn>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-fd-primary/25 to-transparent"
      />
    </section>
  );
}
