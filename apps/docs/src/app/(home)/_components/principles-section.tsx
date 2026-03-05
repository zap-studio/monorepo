import { CodeIcon, ShieldCheckIcon, TerminalIcon } from "lucide-react";
import type { ReactNode } from "react";

import { SlideIn, StaggerContainer, StaggerItem } from "./animated";

interface PrincipleProps {
  description: string;
  icon: ReactNode;
  title: string;
}

const principles: PrincipleProps[] = [
  {
    icon: <CodeIcon className="size-5" />,
    title: "Core + Adapters",
    description:
      "Business logic is framework-agnostic. Adapters connect to your stack. Switch from Next.js to Remix without rewriting.",
  },
  {
    icon: <TerminalIcon className="size-5" />,
    title: "Type-safe by default",
    description:
      "Full TypeScript coverage with Standard Schema. Validate at runtime with Zod, Valibot, or ArkType — your choice.",
  },
  {
    icon: <ShieldCheckIcon className="size-5" />,
    title: "Tested extensively",
    description:
      "Comprehensive test coverage ensures reliability. Not toy examples — real solutions built for production.",
  },
];

export function PrinciplesSection(): ReactNode {
  return (
    <section className="relative border-fd-border border-y bg-fd-card/40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-fd-primary/20 to-transparent"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-[10%] size-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fd-primary/3 blur-[80px] md:left-[15%] md:size-100 md:blur-[100px]"
      />

      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:py-24 md:grid-cols-2 md:gap-16 md:py-32 lg:gap-24">
        <SlideIn delay={0} direction="left" duration={0.7}>
          <div className="md:sticky md:top-32 md:self-start">
            <p className="mb-3 font-mono text-fd-muted-foreground text-xs uppercase leading-5 tracking-widest">
              Philosophy
            </p>

            <h2 className="font-serif text-3xl leading-[1.12] sm:text-4xl md:text-5xl">
              Built for the
              <br />
              way you work
            </h2>

            <p className="mt-4 max-w-sm text-base text-fd-muted-foreground leading-7 sm:text-lg md:mt-5 md:text-xl md:leading-8">
              Developer tools should adapt to your stack — not the other way
              around.
            </p>

            <div
              aria-hidden="true"
              className="mt-8 hidden h-px w-16 bg-linear-to-r from-fd-primary/40 to-transparent md:block"
            />
          </div>
        </SlideIn>

        <StaggerContainer
          className="flex flex-col gap-8"
          delay={0.2}
          stagger={0.12}
        >
          {principles.map((principle) => (
            <StaggerItem key={principle.title} y={16}>
              <PrincipleItem
                description={principle.description}
                icon={principle.icon}
                title={principle.title}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-fd-primary/20 to-transparent"
      />
    </section>
  );
}

function PrincipleItem({
  icon,
  title,
  description,
}: PrincipleProps): ReactNode {
  return (
    <div className="flex gap-5">
      <div className="group flex size-12 shrink-0 items-center justify-center rounded-xl bg-fd-accent text-fd-primary transition-colors duration-300 hover:bg-fd-primary/15">
        {icon}
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-base text-fd-foreground leading-6 tracking-tight">
          {title}
        </h3>
        <p className="mt-1.5 text-fd-muted-foreground text-sm leading-6">
          {description}
        </p>
      </div>
    </div>
  );
}
