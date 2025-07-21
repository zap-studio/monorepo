import { Star } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/zap/lib/orpc/client";

export async function Stats() {
  const [ratings, numberOfUsers] = await Promise.all([
    client.feedbacks.getAverageRating(),
    client.users.getNumberOfUsers(),
  ]);

  if (!ratings || numberOfUsers == null) {
    return null;
  }

  const stars = () => {
    const fullStars = Math.floor(ratings.averageRating);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        className={`h-4 w-4 ${
          i < fullStars ? "fill-primary text-primary" : "text-primary"
        }`}
        key={`star-${
          // biome-ignore lint/suspicious/noArrayIndexKey: no other way to do this
          i
        }`}
      />
    ));
  };

  const ratingText = {
    average: ratings.averageRating.toFixed(1),
    total: ratings.totalFeedbacks,
    users: numberOfUsers.toLocaleString(),
  };

  return (
    <div className="flex items-center justify-center space-x-4 text-sm">
      <div className="hidden items-center md:flex">
        <div className="flex">{stars()}</div>
        <span className="text-muted-foreground ml-2">
          {ratingText.average} ({ratingText.total} rating
          {ratings.totalFeedbacks > 1 ? "s" : ""})
        </span>
      </div>
      <div className="hidden h-4 w-px border-l md:block" />
      <div className="text-muted-foreground">
        Used by {ratingText.users}+ developer
        {numberOfUsers > 1 ? "s" : ""}
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  const skeletonStars = Array.from(
    { length: 5 },
    (_, i) => `skeleton-star-${i}`,
  );

  return (
    <div className="flex animate-pulse items-center justify-center space-x-4 text-sm">
      <div className="hidden items-center space-x-2 md:flex">
        <div className="flex space-x-1">
          {skeletonStars.map((starKey) => (
            <Skeleton className="h-4 w-4 rounded" key={starKey} />
          ))}
        </div>
        <Skeleton className="ml-2 h-4 w-24 rounded" />
      </div>
      <div className="hidden h-4 w-px border-l md:block" />
      <Skeleton className="h-4 w-28 rounded" />
    </div>
  );
}
