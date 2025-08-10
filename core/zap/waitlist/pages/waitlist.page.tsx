import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { queryClient } from "@/zap/api/lib/tanstack-query";
import { orpc } from "@/zap/api/providers/orpc/client";
import { orpcServer } from "@/zap/api/providers/orpc/server";
import { AnimatedNumber } from "@/zap/components/misc";

import { AnimateWaitlist, WaitlistForm } from "../components";
import { ZAP_WAITLIST_CONFIG } from "../zap.plugin.config";

export async function _WaitlistPage() {
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
            {ZAP_WAITLIST_CONFIG.SHOW_COUNT && (
              <Badge className="mb-4" variant={"secondary"}>
                <span className="font-semibold">
                  <AnimatedNumber value={waitlistCount} />
                </span>{" "}
                people already joined the waitlist
              </Badge>
            )}

            <h1 className="text-2xl font-semibold">
              {ZAP_WAITLIST_CONFIG.TITLE}
            </h1>
            <p className="text-muted-foreground mb-6 text-base">
              {ZAP_WAITLIST_CONFIG.DESCRIPTION}
            </p>
          </AnimateWaitlist>

          <WaitlistForm />
        </div>
      </div>
    </HydrationBoundary>
  );
}
