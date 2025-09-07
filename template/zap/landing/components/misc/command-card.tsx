"use client";

import { Check, Clipboard } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { AnimatedSpan, Terminal, TypingAnimation } from "../magicui/terminal";

type CommandCardProps = {
  command: string;
  description: string;
};

const COPY_TIMEOUT = 2000;

export function CommandCard({ command, description }: CommandCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_TIMEOUT);
  };

  return (
    <div className="hidden h-fit space-y-4 rounded-xl border bg-background p-6 md:block">
      <Terminal className="rounded-md border shadow-sm">
        <div className="flex items-center justify-between">
          <code className="whitespace-nowrap text-muted-foreground text-sm">
            {command}
          </code>

          <Button
            className="ml-4"
            onClick={handleCopy}
            size="icon"
            variant="ghost"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Clipboard className="h-4 w-4" />
            )}
          </Button>
        </div>

        <AnimatedSpan className="text-green-500" delay={1500}>
          <span>
            ✔ &apos;bun&apos; has been selected as the package manager.
          </span>
        </AnimatedSpan>

        <AnimatedSpan className="text-green-500" delay={2000}>
          <span>✔ Copying core files.</span>
        </AnimatedSpan>

        <AnimatedSpan className="text-green-500" delay={2500}>
          <span>✔ Installing dependencies.</span>
        </AnimatedSpan>

        <AnimatedSpan className="text-blue-500" delay={3000}>
          <span>✔ Running `biome format` on the project.</span>
        </AnimatedSpan>

        <TypingAnimation className="text-muted-foreground" delay={4000}>
          Success! Project initialization completed.
        </TypingAnimation>
      </Terminal>

      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
