import {
  ArrowRight,
  Cpu,
  Database,
  Layers,
  Lock,
  Puzzle,
  Stars,
  TerminalSquare,
  Wrench,
  Zap as ZapIcon,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { cache, Suspense } from "react";
import { EmbeddedTweet, TweetNotFound, TweetSkeleton } from "react-tweet";
import { getTweet as _getTweet } from "react-tweet/api";
import { Button } from "@/components/ui/button";
import { testimonials } from "@/data/testimonials";
import { GITHUB_REPO_URL } from "@/data/website";
import { CopyCommand } from "./_components/copy-command";

const sectionClass = "px-6 md:py-16 py-8";
const cardBase = "rounded-xl border bg-card shadow-sm";
const mutedText = "text-fd-muted-foreground";

export default function HomePage() {
  return (
    <main className="relative flex flex-1 flex-col gap-6">
      <section className={`${sectionClass} pt-16 md:pt-24`}>
        <div className="mx-auto max-w-6xl text-center">
          <div className="mb-6 hidden flex-wrap items-center justify-center gap-2 text-sm md:flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-3 py-1">
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
            Choose the plugins you need — Auth, AI, Analytics, Payments, Emails
            — all wired with type safety, edge-ready APIs, and a great DX.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href={{ pathname: "/docs" }}>
                Get started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant={"outline"}>
              <Link href={GITHUB_REPO_URL} rel="noreferrer" target="_blank">
                <Stars className="size-4" />
                Star on GitHub
              </Link>
            </Button>
          </div>

          <div className={`mx-auto mt-10 max-w-3xl ${cardBase} text-left`}>
            <div className="flex items-center gap-2 border-b px-4 py-2 text-fd-muted-foreground text-xs">
              <TerminalSquare className="size-3.5" />
              Quickstart
            </div>
            <CopyCommand command="npx create-zap-app@latest" />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-semibold text-2xl md:text-3xl">
            Everything you need to launch fast
          </h2>
          <p className={`mx-auto mt-2 max-w-2xl text-center ${mutedText}`}>
            Curated plugins and utilities to build apps at lightning speed.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Feature
              desc="Email magic links, OAuth, tokens, and RBAC — all production-ready."
              icon={<Lock className="size-5" />}
              title="Auth & Sessions"
            />
            <Feature
              desc="Stream responses, run tools, and use RAG — no vendor lock-in."
              icon={<Cpu className="size-5" />}
              title="AI toolkit"
            />
            <Feature
              desc="Type-safe APIs and queries across client and server — with your database."
              icon={<Database className="size-5" />}
              title="Drizzle + oRPC"
            />
            <Feature
              desc="Add Analytics, Payments, Emails, Blogs, Feature Flags, and more."
              icon={<Puzzle className="size-5" />}
              title="Composable plugins"
            />
            <Feature
              desc="Feature flags and PostHog integration for cohorts, A/B tests, and more."
              icon={<Layers className="size-5" />}
              title="Marketing tools"
            />
            <Feature
              desc="CLI scaffolding, linting, docs, and ready-to-use recipes."
              icon={<Wrench className="size-5" />}
              title="DX focused"
            />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mx-auto max-w-6xl">
          <h3 className="text-center font-semibold text-2xl">
            Loved by builders
          </h3>

          <div className="mt-8 columns-1 gap-4 [column-fill:_balance] sm:columns-2 lg:columns-3">
            {testimonials.map((t) => (
              <Suspense fallback={<TweetSkeleton />} key={t.id}>
                <TweetComponent id={t.id} />
              </Suspense>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const getTweet = cache(async (id: string) => _getTweet(id));

const TweetComponent = async ({ id }: { id: string }) => {
  try {
    const tweet = await getTweet(id);
    return tweet ? <EmbeddedTweet tweet={tweet} /> : <TweetNotFound />;
  } catch (error) {
    return <TweetNotFound error={error} />;
  }
};

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
    <div
      className={`${cardBase} p-4 transition hover:border-primary hover:shadow-md`}
    >
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
