import Image from "next/image";

import { cn } from "@/lib/utils";
import type { TESTIMONIALS } from "@/zap/data/landing";

type ReviewCardProps = (typeof TESTIMONIALS)[number];

export function ReviewCard({ img, name, username, body }: ReviewCardProps) {
  return (
    <figure
      className={cn(
        "relative h-full w-64 shrink-0 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.08] dark:hover:bg-gray-50/[.12]",
        "transition-colors",
      )}
    >
      <div className="flex items-center gap-3">
        <Image
          className="rounded-full"
          width="32"
          height="32"
          alt={`${name}'s avatar`}
          src={img}
        />
        <div className="flex flex-col">
          <figcaption className="text-sm font-semibold">{name}</figcaption>
          <span className="text-muted-foreground text-xs">{username}</span>
        </div>
      </div>
      <blockquote className="text-muted-foreground mt-3 text-sm">
        {body}
      </blockquote>
    </figure>
  );
}
