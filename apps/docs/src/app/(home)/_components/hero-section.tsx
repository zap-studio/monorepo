import type { ReactNode } from "react";

import { FadeIn, PulseGlow } from "./animated";
import { ButtonGroup, PrimaryButton, SecondaryButton } from "./buttons";
import { GitHubIcon } from "./icons";

export function HeroSection(): ReactNode {
  return (
    <section className="relative flex flex-col overflow-hidden border-fd-border border-b sm:min-h-[calc(100svh-var(--fd-nav-height,4rem))]">
      <PulseGlow className="pointer-events-none absolute top-[-50%] left-1/2 size-200 -translate-x-1/2 rounded-full bg-fd-primary/4 blur-[120px] md:size-250" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[10%] right-[-10%] size-125 rounded-full bg-fd-primary/2 blur-[100px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.035) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-fd-background to-transparent"
      />

      <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:py-24 md:py-40">
        <FadeIn delay={0} duration={0.7} y={24}>
          <h1 className="font-serif text-4xl leading-[1.06] -tracking-[0.02em] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
            The higher layer
            <br />
            for{" "}
            <span className="bg-linear-to-r from-fd-primary to-fd-primary/60 bg-clip-text text-transparent italic">
              modern apps
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.15} duration={0.6} y={16}>
          <p className="mx-auto mt-4 max-w-xl text-fd-muted-foreground text-sm leading-6 sm:mt-6 sm:text-base sm:leading-7 md:mt-8 md:text-xl md:leading-8">
            Framework-agnostic TypeScript packages for the features every app
            needs. Type-safe, tested, zero lock-in.
          </p>
        </FadeIn>

        <FadeIn delay={0.28} duration={0.5} y={12}>
          <ButtonGroup className="mt-6 sm:mt-8">
            <PrimaryButton
              className="sm:h-10 sm:px-4 md:h-11 md:px-5"
              href="/docs/packages/fetch"
              size="sm"
              withArrow
            >
              Get Started
            </PrimaryButton>
            <SecondaryButton
              className="sm:h-10 sm:px-4 md:h-11 md:px-5"
              href="https://github.com/zap-studio/monorepo"
              size="sm"
            >
              <GitHubIcon className="size-4" />
              Star on GitHub
            </SecondaryButton>
          </ButtonGroup>
        </FadeIn>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-fd-background to-transparent"
      />
    </section>
  );
}
