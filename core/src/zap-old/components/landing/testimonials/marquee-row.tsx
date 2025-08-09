import { Marquee } from "@/components/magicui/marquee";
import { ReviewCard } from "@/zap/components/landing/testimonials/review-card";
import type { TESTIMONIALS } from "@/zap/data/landing";

interface MarqueeRowProps {
  reviews: typeof TESTIMONIALS;
  reverse?: boolean;
}

export function MarqueeRow({ reviews, reverse = false }: MarqueeRowProps) {
  return (
    <Marquee className="w-full [--duration:20s]" pauseOnHover reverse={reverse}>
      {reviews.map((review) => (
        <ReviewCard key={review.username} {...review} />
      ))}
    </Marquee>
  );
}
