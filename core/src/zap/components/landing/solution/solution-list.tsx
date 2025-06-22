import { Check } from "lucide-react";

import { BENEFITS } from "@/zap/data/landing";

export function SolutionList() {
  return (
    <ul className="grid gap-2">
      {BENEFITS.map((solution) => (
        <li
          key={solution}
          className="flex items-center gap-2 text-sm md:text-base"
        >
          <Check className="text-primary h-4 w-4" />
          <span className="text-foreground">{solution}</span>
        </li>
      ))}
    </ul>
  );
}
