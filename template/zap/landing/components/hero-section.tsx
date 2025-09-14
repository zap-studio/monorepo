import { ArrowRight, ArrowUpRight, Star } from "lucide-react";
import Link from "next/link";
import { cache } from "react";

import { isPluginEnabled } from "@/lib/plugins";
import type { ZapServerPluginInstance } from "@/lib/zap.server";
import { getNumberOfUsersService } from "@/zap/auth/services";
import { ZapButton } from "@/zap/components/core/button";
import { AnimatedSection } from "@/zap/components/misc/animated-section";
import { AnimatedText } from "@/zap/components/misc/animated-text";
import { getAverageRatingService } from "@/zap/feedbacks/services";
import { DEFAULT_CONFIG } from "@/zap/plugins/config/default";

type getStatsDataParams = {
  isAuthPluginEnabled: boolean;
};

const getStatsData = cache(
  async ({ isAuthPluginEnabled }: getStatsDataParams) => {
    try {
      const isFeedbacksEnabled = isPluginEnabled("feedbacks");

      const promises: Promise<unknown>[] = [];

      if (isFeedbacksEnabled) {
        promises.push(getAverageRatingService());
      } else {
        promises.push(Promise.resolve({ averageRating: 0, totalFeedbacks: 0 }));
      }

      if (isAuthPluginEnabled) {
        promises.push(getNumberOfUsersService());
      } else {
        promises.push(Promise.resolve(0));
      }

      const [ratingData, numberOfUsers] = await Promise.all(promises);

      const { averageRating, totalFeedbacks } = isFeedbacksEnabled
        ? (ratingData as { averageRating: number; totalFeedbacks: number })
        : { averageRating: 0, totalFeedbacks: 0 };

      return {
        averageRating,
        totalFeedbacks,
        numberOfUsers: isAuthPluginEnabled ? (numberOfUsers as number) : 0,
        isFeedbacksEnabled,
        isAuthEnabled: isAuthPluginEnabled,
      };
    } catch {
      return {
        averageRating: 0,
        totalFeedbacks: 0,
        numberOfUsers: 0,
        isFeedbacksEnabled: false,
        isAuthEnabled: false,
      };
    }
  }
);

type HeroSectionProps = {
  authPlugin: ZapServerPluginInstance<"auth">;
  isAuthPluginEnabled: boolean;
};

export function HeroSection({
  authPlugin,
  isAuthPluginEnabled,
}: HeroSectionProps) {
  return (
    <AnimatedSection isNotSection>
      <div className="flex w-full items-center justify-center px-4 pb-32 md:px-6 md:pb-48">
        <div className="mx-auto max-w-4xl space-y-4 text-center">
          <h1 className="font-bold text-3xl text-foreground tracking-tighter sm:text-5xl xl:text-6xl/none">
            Ship <AnimatedText /> with Zap.ts ⚡️
          </h1>

          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            The ultimate Next.js boilerplate with everything you need to build
            production-ready applications in minutes, not months.
          </p>

          <div className="flex flex-col justify-center gap-2 min-[400px]:flex-row">
            <ZapButton asChild size="lg">
              <Link
                href={{
                  pathname:
                    authPlugin.config?.SIGN_UP_URL ??
                    DEFAULT_CONFIG.auth.SIGN_UP_URL,
                }}
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </ZapButton>

            <ZapButton asChild size="lg" variant="outline">
              <Link
                className="text-foreground"
                href="https://zap-ts.zapstudio.dev"
                target="_blank"
              >
                View Documentation <ArrowUpRight className="h-4 w-4" />
              </Link>
            </ZapButton>
          </div>

          <Stats isAuthPluginEnabled={isAuthPluginEnabled} />
        </div>
      </div>
    </AnimatedSection>
  );
}

type StatsProps = {
  isAuthPluginEnabled: boolean;
};

export async function Stats({ isAuthPluginEnabled }: StatsProps) {
  const {
    averageRating,
    totalFeedbacks,
    numberOfUsers,
    isFeedbacksEnabled,
    isAuthEnabled,
  } = await getStatsData({ isAuthPluginEnabled });

  const renderStars = () => {
    const fullStars = Math.floor(averageRating);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        className={`h-4 w-4 ${
          i < fullStars ? "fill-primary text-primary" : "text-primary"
        }`}
        key={`star-${i}-${fullStars}`}
      />
    ));
  };

  const shouldShowRatings =
    isFeedbacksEnabled && averageRating > 0 && totalFeedbacks > 0;
  const shouldShowUsers = isAuthEnabled && numberOfUsers > 0;
  const showDivider = shouldShowRatings && shouldShowUsers;

  const hasAnyStats = shouldShowRatings || shouldShowUsers;
  if (!hasAnyStats) {
    return null;
  }

  return (
    <div className="hidden items-center justify-center space-x-4 text-sm md:flex">
      {shouldShowRatings && (
        <div className="flex items-center">
          <div className="flex">{renderStars()}</div>
          <span className="ml-2 text-muted-foreground">
            {averageRating.toFixed(1)} ({totalFeedbacks} rating
            {totalFeedbacks !== 1 ? "s" : ""})
          </span>
        </div>
      )}

      {showDivider && <div className="h-4 w-px border-l" />}

      {shouldShowUsers && (
        <div className="text-muted-foreground">
          Used by {numberOfUsers.toLocaleString()}+ developer
          {numberOfUsers !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
