import Image from "next/image";

import { cn } from "@/lib/utils";

import { TESTIMONIALS } from "../data";
import { Marquee } from "./magicui/marquee";

const firstRow = TESTIMONIALS.slice(0, TESTIMONIALS.length / 2);
const secondRow = TESTIMONIALS.slice(TESTIMONIALS.length / 2);

export function TestimonialSection() {
  return (
    <div className="w-full">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center space-y-4 px-4 text-center md:px-6">
        <h2 className="font-bold text-3xl tracking-tighter sm:text-4xl md:text-5xl">
          Trusted by developers worldwide
        </h2>

        <p className="max-w-[85%] text-muted-foreground md:text-xl">
          Join thousands of developers who are shipping faster with Zap.ts
        </p>
      </div>

      <div className="relative mt-12 flex w-full flex-col items-center gap-2 overflow-hidden">
        <MarqueeRow reviews={firstRow} />
        <MarqueeRow reverse reviews={secondRow} />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background" />
      </div>
    </div>
  );
}

type MarqueeRowProps = {
  reviews: typeof TESTIMONIALS;
  reverse?: boolean;
};

function MarqueeRow({ reviews, reverse = false }: MarqueeRowProps) {
  return (
    <Marquee className="w-full [--duration:20s]" pauseOnHover reverse={reverse}>
      {reviews.map((review) => (
        <ReviewCard key={review.username} {...review} />
      ))}
    </Marquee>
  );
}

type ReviewCardProps = (typeof TESTIMONIALS)[number];

export function ReviewCard({ img, name, username, body }: ReviewCardProps) {
  return (
    <figure
      className={cn(
        "relative h-full w-64 shrink-0 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05] active:bg-gray-950/[.05]",
        // dark
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.08] dark:active:bg-gray-50/[.12] dark:hover:bg-gray-50/[.12]",
        "transition-colors"
      )}
    >
      <div className="flex items-center gap-3">
        <Image
          alt={`${name}'s avatar`}
          className="rounded-full"
          height="32"
          src={img}
          width="32"
        />

        <div className="flex flex-col">
          <figcaption className="font-semibold text-sm">{name}</figcaption>
          <span className="text-muted-foreground text-xs">{username}</span>
        </div>
      </div>

      <blockquote className="mt-3 text-muted-foreground text-sm">
        {body}
      </blockquote>
    </figure>
  );
}
