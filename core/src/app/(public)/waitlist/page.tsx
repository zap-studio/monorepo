import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { queryClient } from "@/zap/api/lib/tanstack-query";
import { orpc } from "@/zap/api/providers/orpc/client";
import { orpcServer } from "@/zap/api/providers/orpc/server";
import { AnimateWaitlist } from "@/zap/waitlist/components/animate-waitlist";
import { WaitlistForm } from "@/zap/waitlist/components/waitlist-form";
import { AnimatedNumber } from "@/zap-old/components/misc/animated-number";

export const revalidate = 60;

export default async function WaitlistPage() {
  // Prefetch the waitlist count using the server ORPC client
  const waitlistCountKey = orpc.waitlist.getNumberOfPeopleInWaitlist.key();
  await queryClient.prefetchQuery({
    queryKey: waitlistCountKey,
    queryFn: async () => orpcServer.waitlist.getNumberOfPeopleInWaitlist(),
  });

  const dehydratedState = dehydrate(queryClient);
  const waitlistCount = queryClient.getQueryData<number>(waitlistCountKey) ?? 0;

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ModeToggle variant="ghost" />
        </div>

        <div className="mx-auto max-w-md">
          <AnimateWaitlist>
            {ZAP_DEFAULT_SETTINGS.WAITLIST.SHOW_COUNT && (
              <Badge className="mb-4" variant={"secondary"}>
                <span className="font-semibold">
                  <AnimatedNumber value={waitlistCount} />
                </span>{" "}
                people already joined the waitlist
              </Badge>
            )}

            <h1 className="text-2xl font-semibold">
              {ZAP_DEFAULT_SETTINGS.WAITLIST.TITLE}
            </h1>
            <p className="text-muted-foreground mb-6 text-base">
              {ZAP_DEFAULT_SETTINGS.WAITLIST.DESCRIPTION}
            </p>
          </AnimateWaitlist>

          <WaitlistForm />
        </div>
      </div>
    </HydrationBoundary>
  );
}
