import { Marquee } from "@/components/magicui/marquee";
import { TESTIMONIALS } from "@/zap/landing/data";
import { ReviewCard } from "@/zap-old/components/landing/testimonials/review-card";

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
