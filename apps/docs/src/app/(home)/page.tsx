import {
  ArrowRight,
  Cpu,
  Database,
  Layers,
  Lock,
  Puzzle,
  TerminalSquare,
  Wrench,
  Zap as ZapIcon,
} from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { Button } from '@/components/ui/button';

const sectionClass = 'px-6 py-16';
const cardBase = 'rounded-xl border bg-card shadow-sm';
const mutedText = 'text-fd-muted-foreground';

export default function HomePage() {
  return (
    <main className="relative flex-1">
      <BackgroundGlow />

      <section className={`${sectionClass} md:py-24`}>
        <div className="mx-auto max-w-6xl text-center">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-primary">
              <ZapIcon aria-hidden className="size-4" />
              Zap.ts • Modern app starter with type-safe plugins
            </span>
          </div>

          <h1 className="mx-auto max-w-3xl text-balance font-semibold text-4xl tracking-tight md:text-6xl">
            Ship full-stack apps faster with composable plugins
          </h1>
          <p
            className={`mx-auto mt-4 max-w-2xl text-pretty ${mutedText} md:text-lg`}
          >
            Pick the plugins you need — Auth, AI, Analytics, Payments, Emails
            and more — all wired with type safety, edge-ready APIs and great DX.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href="/docs">
                Get started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant={'outline'}>
              <Link
                href="https://github.com/alexandretrotel/zap.ts"
                rel="noreferrer"
                target="_blank"
              >
                Star on GitHub
              </Link>
            </Button>
          </div>

          <div
            className={`mx-auto mt-10 max-w-3xl ${cardBase} text-left transition-all duration-300 hover:scale-105 hover:shadow-lg`}
          >
            <div className="flex items-center gap-2 border-b px-4 py-2 text-fd-muted-foreground text-xs">
              <TerminalSquare className="size-3.5" />
              Quickstart
            </div>
            <pre className="overflow-x-auto px-4 py-3 text-sm">
              <code>npx create-zap-app@latest</code>
            </pre>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-semibold text-2xl md:text-3xl">
            Everything you need to launch
          </h2>
          <p className={`mx-auto mt-2 max-w-2xl text-center ${mutedText}`}>
            A curated set of plugins and utilities with sensible defaults and
            strong typings.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Feature
              desc="Email magic links, OAuth, tokens — production-ready flows."
              icon={<Lock className="size-5" />}
              title="Auth & Sessions"
            />
            <Feature
              desc="Stream responses, tools, RAG hooks — batteries included."
              icon={<Cpu className="size-5" />}
              title="AI toolkit"
            />
            <Feature
              desc="Type-safe APIs and queries across client and server."
              icon={<Database className="size-5" />}
              title="Drizzle + oRPC"
            />
            <Feature
              desc="Enable Analytics, Payments, Emails, Blog, Flags and more."
              icon={<Puzzle className="size-5" />}
              title="Composable plugins"
            />
            <Feature
              desc="Next.js 15 with edge-ready routes and instrumentation."
              icon={<Layers className="size-5" />}
              title="Edge-first"
            />
            <Feature
              desc="CLI scaffolding, linting, docs, and example recipes."
              icon={<Wrench className="size-5" />}
              title="DX focused"
            />
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className={`${cardBase} rounded-2xl p-8`}>
            <h3 className="text-center font-semibold text-2xl">
              Loved by builders
            </h3>
            <div className="relative mt-6 overflow-hidden">
              <GradientOverlay side="left" />
              <GradientOverlay side="right" />
              <div
                className="flex w-max animate-marquee gap-4 hover:[animation-play-state:paused]"
                style={{ ['--marquee-duration' as any]: '35s' }}
              >
                <MarqueeRow />
                <MarqueeRow aria-hidden />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function BackgroundGlow() {
  return (
    <div
      aria-hidden
      className="-z-10 pointer-events-none absolute inset-0 [mask-image:radial-gradient(50%_50%_at_50%_10%,black,transparent_70%)]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent" />
      <div className="-translate-x-1/2 absolute top-10 left-1/2 h-[720px] w-[960px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,197,24,0.4),transparent_60%)] opacity-70 blur-3xl" />
    </div>
  );
}

function GradientOverlay({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 w-12 ${
        side === 'left'
          ? 'left-0 bg-gradient-to-r from-card to-transparent'
          : 'right-0 bg-gradient-to-l from-card to-transparent'
      }`}
    />
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className={`${cardBase} p-4 transition hover:shadow-md`}>
      <div className="flex items-start gap-3">
        <div className="mt-1 rounded-md border bg-secondary p-2 text-primary">
          {icon}
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className={`mt-1 text-sm ${mutedText}`}>{desc}</p>
        </div>
      </div>
    </div>
  );
}

function Testimonial({
  quote,
  author,
  position,
}: {
  quote: string;
  author: string;
  position: string;
}) {
  return (
    <figure className={`${cardBase} p-6`}>
      <blockquote className="text-balance text-lg">“{quote}”</blockquote>
      <figcaption className={`mt-4 text-sm ${mutedText}`}>
        <span className="font-medium text-fd-foreground">{author}</span> —{' '}
        {position}
      </figcaption>
    </figure>
  );
}

function MarqueeRow(props: { 'aria-hidden'?: boolean }) {
  return (
    <div {...props} className="flex items-stretch gap-4 pr-4">
      <Testimonial
        author="Lena Park"
        position="Founder, Orbitly"
        quote="Zap.ts let us ship our MVP in days, not weeks. The plugin system meant we didn’t waste time wiring auth, analytics, or emails."
      />
      <Testimonial
        author="Marco Díaz"
        position="Tech Lead, VerdePay"
        quote="The DX is fantastic — type-safe APIs, clean scaffolding, and docs that don’t get in the way."
      />
      <Testimonial
        author="Sofia Nguyen"
        position="CTO, Nimbly"
        quote="Composable plugins are a game-changer. We toggled features as we grew without rewrites."
      />
      <Testimonial
        author="Ethan Park"
        position="Engineer, Knots"
        quote="Type-safe oRPC and Drizzle made our API layer a breeze. Less boilerplate, more shipping."
      />
    </div>
  );
}
