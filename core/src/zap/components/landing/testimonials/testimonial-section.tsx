import { MarqueeRow } from "@/zap/components/landing/testimonials/marquee-row";
import { TESTIMONIALS } from "@/zap/data/landing";

const firstRow = TESTIMONIALS.slice(0, TESTIMONIALS.length / 2);
const secondRow = TESTIMONIALS.slice(TESTIMONIALS.length / 2);

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
