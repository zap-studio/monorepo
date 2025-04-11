import Image from "next/image";
import { Marquee } from "@/components/magicui/marquee";
import { cn } from "@/lib/utils";

interface Review {
  name: string;
  username: string;
  body: string;
  img: string;
}

const reviews: Review[] = [
  {
    name: "Jack",
    username: "@jack",
    body: "I've never seen anything like this before. It's amazing. I love it.",
    img: "https://avatar.vercel.sh/jack",
  },
  {
    name: "Jill",
    username: "@jill",
    body: "I don't know what to say. I'm speechless. This is amazing.",
    img: "https://avatar.vercel.sh/jill",
  },
  {
    name: "John",
    username: "@john",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Jane",
    username: "@jane",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/jane",
  },
  {
    name: "Jenny",
    username: "@jenny",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/jenny",
  },
  {
    name: "James",
    username: "@james",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/james",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

export function TestimonialSection() {
  return (
    <div className="w-full">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center space-y-4 px-4 text-center md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Trusted by developers worldwide
        </h2>
        <p className="text-muted-foreground max-w-[85%] md:text-xl">
          Join thousands of developers who are shipping faster with Zap.ts
        </p>
      </div>

      <div className="relative mt-12 flex w-full flex-col items-center gap-2 overflow-hidden">
        <MarqueeRow reviews={firstRow} />
        <MarqueeRow reviews={secondRow} reverse />
        <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r" />
        <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l" />
      </div>
    </div>
  );
}

function MarqueeRow({
  reviews,
  reverse = false,
}: {
  reviews: Review[];
  reverse?: boolean;
}) {
  return (
    <Marquee pauseOnHover reverse={reverse} className="w-full [--duration:20s]">
      {reviews.map((review) => (
        <ReviewCard key={review.username} {...review} />
      ))}
    </Marquee>
  );
}

function ReviewCard({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) {
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
