import { cache } from "react";

import { WaitlistSection } from "@/zap/components/waitlist/waitlist-section";
import { orpcServer } from "@/zap/lib/orpc/server";

export const revalidate = 600; // 10 minutes

const getWaitlistCount = cache(async () => {
  return await orpcServer.waitlist.getNumberOfPeopleInWaitlist();
});

export default async function WaitlistPage() {
  const waitlistCount = await getWaitlistCount();
  return <WaitlistSection waitlistCount={waitlistCount} />;
}
