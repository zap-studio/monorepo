"use client";

import { Star } from "lucide-react";

import { useAverageRating } from "@/zap/hooks/feedbacks/use-average-rating";
import { useNumberOfUsers } from "@/zap/hooks/users/use-number-of-users";

export function Stats() {
  const { data: ratingsData } = useAverageRating();
  const { data: userCount } = useNumberOfUsers();

  const averageRating = ratingsData?.averageRating ?? 0;
  const totalFeedbacks = ratingsData?.totalFeedbacks ?? 0;
  const numberOfUsers = userCount ?? 0;

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
