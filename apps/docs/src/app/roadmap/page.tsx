import {
  BadgeCheckIcon,
  BookOpenIcon,
  BrainCircuitIcon,
  PackageIcon,
  RadioIcon,
  UsersIcon,
  WebhookIcon,
} from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/app/(home)/_components/animated";

export const metadata: Metadata = {
  title: "Roadmap — Zap Studio",
  description:
    "See what we're working on next. Follow our progress on packages, templates, and tooling.",
};

type MilestoneStatus = "planned" | "in-progress" | "done";

interface Milestone {
  description: string;
  icon: ReactNode;
  status: MilestoneStatus;
  title: string;
}

const milestones: Milestone[] = [
  {
    icon: <UsersIcon className="size-5" />,
    title: "Contribution Guide",
    description:
      "Write a clear contribution guide to onboard new contributors — covering repo structure, conventions, and how to submit PRs.",
    status: "planned",
  },
  {
    icon: <BookOpenIcon className="size-5" />,
    title: "Documentation Rewrite",
    description:
      "Rewrite the documentation entirely for clarity, completeness, and a better developer experience across all packages.",
    status: "in-progress",
  },
  {
    icon: <BadgeCheckIcon className="size-5" />,
    title: "Release waitlist",
    description:
      "Ship the waitlist package — a type-safe, framework-agnostic utility for managing early-access waitlists.",
    status: "planned",
  },
  {
    icon: <WebhookIcon className="size-5" />,
    title: "Release webhooks",
    description:
      "Ship the webhooks package — handling inbound webhook verification and typed event dispatching.",
    status: "planned",
  },
  {
    icon: <RadioIcon className="size-5" />,
    title: "Release realtime",
    description:
      "Ship the realtime package — lightweight, framework-agnostic real-time event subscriptions built on top of standard primitives.",
    status: "planned",
  },
  {
    icon: <BrainCircuitIcon className="size-5" />,
    title: "Zap.ts v0.1",
    description:
      "Release v0.1 of Zap.ts — an opinionated, AI-first full-stack framework scoped to SaaS, built on top of the Zap Studio package ecosystem.",
    status: "planned",
  },
];

const STATUS_LABELS: Record<MilestoneStatus, string> = {
  planned: "Planned",
  "in-progress": "In progress",
  done: "Done",
};

const STATUS_STYLES: Record<MilestoneStatus, string> = {
  planned: "bg-fd-muted text-fd-muted-foreground",
  "in-progress": "bg-fd-primary/10 text-fd-primary",
  done: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

const STATUS_DOT: Record<MilestoneStatus, string> = {
  planned: "bg-fd-muted-foreground/50",
  "in-progress": "bg-fd-primary animate-pulse",
  done: "bg-emerald-500",
};

export default function RoadmapPage(): ReactNode {
  const inProgress = milestones.filter((m) => m.status === "in-progress");
  const planned = milestones.filter((m) => m.status === "planned");
  const done = milestones.filter((m) => m.status === "done");
  const ordered = [...inProgress, ...planned, ...done];

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden border-fd-border border-b">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 size-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fd-primary/5 blur-[100px] md:size-200"
        />

        <div className="relative mx-auto max-w-3xl px-6 py-16 text-center sm:py-24 md:py-32">
          <FadeIn delay={0} duration={0.6} y={16}>
            <p className="mb-4 font-mono text-fd-muted-foreground text-xs uppercase leading-5 tracking-widest">
              Roadmap
            </p>

            <h1 className="font-serif text-4xl leading-[1.06] -tracking-[0.02em] sm:text-5xl md:text-6xl">
              What we&apos;re{" "}
              <span className="bg-linear-to-r from-fd-primary to-fd-primary/60 bg-clip-text text-transparent italic">
                building next
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-fd-muted-foreground text-sm leading-6 sm:mt-6 sm:text-base sm:leading-7 md:mt-8 md:text-lg md:leading-8">
              A transparent look at what&apos;s coming. Priorities shift, but
              this is where we&apos;re headed.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-24 md:py-32">
        <StaggerContainer className="flex flex-col" delay={0.1} stagger={0.07}>
          {ordered.map((milestone, index) => (
            <StaggerItem key={milestone.title}>
              <MilestoneRow
                isLast={index === ordered.length - 1}
                milestone={milestone}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="border-fd-border border-t bg-fd-card/30">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-24">
          <FadeIn delay={0} duration={0.5} y={10}>
            <PackageIcon className="mx-auto mb-4 size-6 text-fd-primary" />
            <h2 className="font-serif text-2xl leading-[1.12] sm:text-3xl">
              Have an idea?
            </h2>
            <p className="mt-4 text-fd-muted-foreground text-sm leading-6 sm:text-base sm:leading-7">
              Open a discussion or issue on GitHub. We read everything.
            </p>
            <div className="mt-6 sm:mt-8">
              <a
                className="group inline-flex items-center justify-center gap-2 rounded-md border border-fd-primary/80 bg-fd-primary px-5 py-2.5 font-medium text-fd-primary-foreground text-sm leading-none shadow-sm transition-all duration-150 hover:-translate-y-px hover:shadow-md hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background active:translate-y-0 active:shadow-sm active:brightness-95"
                href="https://github.com/zap-studio/monorepo/discussions"
                rel="noopener"
                target="_blank"
              >
                Open a Discussion
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}

function MilestoneRow({
  milestone,
  isLast,
}: {
  milestone: Milestone;
  isLast: boolean;
}): ReactNode {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-fd-border bg-fd-card text-fd-primary shadow-sm">
          {milestone.icon}
        </div>
        {!isLast && <div className="mt-2 w-px flex-1 bg-fd-border" />}
      </div>

      <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-10"}`}>
        <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
          <h3 className="font-serif text-lg leading-none sm:text-xl">
            {milestone.title}
          </h3>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] leading-none ${STATUS_STYLES[milestone.status]}`}
          >
            <span
              className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[milestone.status]}`}
            />
            {STATUS_LABELS[milestone.status]}
          </span>
        </div>
        <p className="mt-2.5 text-fd-muted-foreground text-sm leading-6">
          {milestone.description}
        </p>
      </div>
    </div>
  );
}
