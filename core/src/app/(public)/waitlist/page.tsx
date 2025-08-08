"use client";

import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { AnimatedNumber } from "@/zap/components/misc/animated-number";
import { AnimateWaitlist } from "@/zap/components/waitlist/animate-waitlist";
import { WaitlistForm } from "@/zap/components/waitlist/waitlist-form";
import { useWaitlist } from "@/zap/hooks/waitlist/use-waitlist";

export default function WaitlistPage() {
  const { waitlistCount } = useWaitlist();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle variant="ghost" />
      </div>

      <div className="mx-auto max-w-md">
        <AnimateWaitlist>
          {ZAP_DEFAULT_SETTINGS.WAITLIST.SHOW_COUNT && (
            <Badge className="mb-4" variant={"secondary"}>
              <span className="font-semibold">
                <AnimatedNumber value={waitlistCount ?? 0} />
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
  );
}
