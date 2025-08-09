import { Marquee } from "@/components/magicui/marquee";
import { ReviewCard } from "@/zap-old/components/landing/testimonials/review-card";
import { TESTIMONIALS } from "@/zap-old/data/landing";

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
