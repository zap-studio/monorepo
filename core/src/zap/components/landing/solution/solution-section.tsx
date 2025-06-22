"use client";

import { CommandCard } from "@/zap/components/landing/solution/command-card";
import { SolutionList } from "@/zap/components/landing/solution/solution-list";

export function SolutionSection() {
  return (
    <div className="w-full px-4 md:px-6">
      <div className="mx-auto grid max-w-5xl gap-10 py-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col justify-center space-y-6">
          <div className="flex flex-col space-y-2">
            <span className="text-primary text-sm font-medium">Solution</span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Build applications as fast as a zap
            </h2>
          </div>
          <p className="text-muted-foreground max-w-[600px] md:text-lg">
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
