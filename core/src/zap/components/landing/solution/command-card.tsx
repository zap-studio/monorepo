import { Check, Clipboard } from "lucide-react";
import { useState } from "react";

import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/magicui/terminal";
import { Button } from "@/components/ui/button";

interface CommandCardProps {
  command: string;
  description: string;
}

export function CommandCard({ command, description }: CommandCardProps) {
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
            ✔ &apos;pnpm&apos; has been selected as the package manager.
          </span>
        </AnimatedSpan>

        <AnimatedSpan delay={2000} className="text-green-500">
          <span>✔ Copying core files.</span>
        </AnimatedSpan>

        <AnimatedSpan delay={2500} className="text-green-500">
          <span>✔ Installing dependencies.</span>
        </AnimatedSpan>

        <AnimatedSpan delay={3000} className="text-blue-500">
          <span>✔ Running prettier on the project.</span>
        </AnimatedSpan>

        <TypingAnimation delay={4000} className="text-muted-foreground">
          Success! Project initialization completed.
        </TypingAnimation>
      </Terminal>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
