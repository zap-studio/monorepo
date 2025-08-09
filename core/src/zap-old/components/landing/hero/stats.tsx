import { Star } from "lucide-react";
import { cache } from "react";

import { getAverageRatingService } from "@/zap/feedbacks/services";
import { getNumberOfUsersService } from "@/zap-old/services/users/get-number-of-users.service";

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
