import { ArrowRight, ArrowUpRight, Star } from "lucide-react";
import Link from "next/link";
import { cache } from "react";

import { getNumberOfUsersService } from "../../auth/services";
import { ZapButton } from "../../components/core";
import { AnimatedSection, AnimatedText } from "../../components/misc";
import { getAverageRatingService } from "../../feedbacks/services";

const getStatsData = cache(async () => {
  const [{ averageRating, totalFeedbacks }, numberOfUsers] = await Promise.all([
    getAverageRatingService(),
    getNumberOfUsersService(),
  ]);

  return {
    averageRating,
    totalFeedbacks,
    numberOfUsers,
  };
});

export function HeroSection() {
  return (
    <AnimatedSection isNotSection>
      <div className="flex w-full items-center justify-center px-4 pb-32 md:px-6 md:pb-48">
        <div className="mx-auto max-w-4xl space-y-4 text-center">
          <h1 className="text-foreground text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
            Ship <AnimatedText /> with Zap.ts ⚡️
          </h1>

          <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl">
            The ultimate Next.js boilerplate with everything you need to build
            production-ready applications in minutes, not months.
          </p>

          <div className="flex flex-col justify-center gap-2 min-[400px]:flex-row">
            <ZapButton asChild size="lg">
              <Link href="/register">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </ZapButton>

            <ZapButton asChild size="lg" variant="outline">
              <Link
                className="text-foreground"
                href="https://zap-ts.alexandretrotel.org"
                target="_blank"
              >
                View Documentation <ArrowUpRight className="h-4 w-4" />
              </Link>
            </ZapButton>
          </div>

          <Stats />
        </div>
      </div>
    </AnimatedSection>
  );
}

export async function Stats() {
  const { averageRating, totalFeedbacks, numberOfUsers } = await getStatsData();

  const renderStars = () => {
    const fullStars = Math.floor(averageRating);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        className={`h-4 w-4 ${
          i < fullStars ? "fill-primary text-primary" : "text-primary"
        }`}
        key={`star-${i}`}
      />
    ));
  };

  const shouldShowRatings = averageRating > 0 && totalFeedbacks > 0;
  const shouldShowUsers = numberOfUsers > 0;
  const showDivider = shouldShowRatings && shouldShowUsers;

  return (
    <div className="flex items-center justify-center space-x-4 text-sm">
      <div
        className={`hidden items-center transition-opacity duration-300 md:flex ${
          shouldShowRatings ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex">{renderStars()}</div>
        <span className="text-muted-foreground ml-2">
          {averageRating.toFixed(1)} ({totalFeedbacks} rating
          {totalFeedbacks !== 1 ? "s" : ""})
        </span>
      </div>

      <div
        className={`hidden h-4 w-px border-l transition-opacity duration-300 md:block ${
          showDivider ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`text-muted-foreground transition-opacity duration-300 ${
          shouldShowUsers ? "opacity-100" : "opacity-0"
        }`}
      >
        Used by {numberOfUsers.toLocaleString()}+ developer
        {numberOfUsers !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
