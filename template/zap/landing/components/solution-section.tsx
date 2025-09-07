import { Check } from "lucide-react";

import { BENEFITS } from "../data";
import { CommandCard } from "./misc/command-card";

export function SolutionSection() {
  return (
    <div className="w-full px-4 md:px-6">
      <div className="mx-auto grid max-w-5xl gap-10 py-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col justify-center space-y-6">
          <div className="flex flex-col space-y-2">
            <span className="font-medium text-primary text-sm">Solution</span>
            <h2 className="font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl">
              Build applications as fast as a zap
            </h2>
          </div>

          <p className="max-w-[600px] text-muted-foreground md:text-lg">
            Zap.ts is carefully crafted so it includes all the essential tools
            and configurations you need to build production-ready applications
            without the bloat.
          </p>

          <SolutionList />
        </div>

        <CommandCard
          command="npx create-zap-app@latest"
          description="One command sets up your entire project with all the best practices and tools already configured."
        />
      </div>
    </div>
  );
}

function SolutionList() {
  return (
    <ul className="grid gap-2">
      {BENEFITS.map((solution) => (
        <li
          className="flex items-center gap-2 text-sm md:text-base"
          key={solution}
        >
          <Check className="h-4 w-4 text-primary" />
          <span className="text-foreground">{solution}</span>
        </li>
      ))}
    </ul>
  );
}
