import { Check } from "lucide-react";

import { BENEFITS } from "@/zap/landing/data";

export function SolutionList() {
  return (
    <ul className="grid gap-2">
      {BENEFITS.map((solution) => (
        <li
          className="flex items-center gap-2 text-sm md:text-base"
          key={solution}
        >
          <Check className="text-primary h-4 w-4" />
          <span className="text-foreground">{solution}</span>
        </li>
      ))}
    </ul>
  );
}
