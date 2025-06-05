"use client";

import { useState } from "react";
import { Check, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/magicui/terminal";

const features = [
  "Authentication with BetterAuth",
  "Database with Drizzle & PostgreSQL",
  "Styling with Tailwind CSS",
  "Type-safe API routes with oRPC",
  "Plugins for everything",
];

export function SolutionSection() {
  return (
    <div className="w-full px-4 md:px-6">
      <div className="mx-auto grid max-w-5xl gap-10 py-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col justify-center space-y-6">
          <div className="flex flex-col space-y-2">
            <span className="text-primary text-sm font-medium">Solution</span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              The boilerplate to build applications as fast as a zap
            </h2>
          </div>
          <p className="text-muted-foreground max-w-[600px] md:text-lg">
            Zap.ts is carefully crafted so it includes all the essential tools
            and configurations you need to build production-ready applications
            without the bloat.
          </p>
          <FeatureList />
        </div>

        <CommandCard
          command="bunx create-zap-app@latest"
          description="One command sets up your entire project with all the best practices and tools already configured."
        />
      </div>
    </div>
  );
}

function FeatureList() {
  return (
    <ul className="grid gap-2">
      {features.map((feature) => (
        <li
          key={feature}
          className="flex items-center gap-2 text-sm md:text-base"
        >
          <Check className="text-primary h-4 w-4" />
          <span className="text-foreground">{feature}</span>
        </li>
      ))}
    </ul>
  );
}

function CommandCard({
  command,
  description,
}: {
  command: string;
  description: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-background hidden h-fit space-y-4 rounded-xl border p-6 md:block">
      <Terminal className="rounded-md border shadow-sm">
        <div className="flex items-center justify-between">
          <code className="text-muted-foreground text-sm whitespace-nowrap">
            {command}
          </code>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="ml-4"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Clipboard className="h-4 w-4" />
            )}
          </Button>
        </div>

        <AnimatedSpan delay={1500} className="text-green-500">
          <span>
            ✔ &apos;bun&apos; has been selected as the package manager.
          </span>
        </AnimatedSpan>

        <AnimatedSpan delay={2000} className="text-green-500">
          <span>✔ Copying core files.</span>
        </AnimatedSpan>

        <AnimatedSpan delay={2500} className="text-green-500">
          <span>✔ Installing dependencies.</span>
        </AnimatedSpan>

        <AnimatedSpan delay={3000} className="text-green-500">
          <span>✔ Running prettier on the project.</span>
        </AnimatedSpan>

        <AnimatedSpan delay={3500} className="text-blue-500">
          <span>ℹ Added &apos;ai&apos; plugin.</span>
        </AnimatedSpan>

        <TypingAnimation delay={4000} className="text-muted-foreground">
          Success! Project initialization completed.
        </TypingAnimation>
      </Terminal>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
