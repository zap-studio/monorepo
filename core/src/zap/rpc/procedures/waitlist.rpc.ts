import "server-only";

import { base } from "@/rpc/middlewares";
import { withRpcHandler } from "@/zap/lib/error-handling/handlers";
import { WaitlistSchema } from "@/zap/schemas/waitlist.schema";
import { getNumberOfPeopleInWaitlistService } from "@/zap/services/waitlist/get-number-of-people-in-waitlist.service";
import { submitWaitlistEmailService } from "@/zap/services/waitlist/submit-email.service";

const getNumberOfPeopleInWaitlist = base.handler(
  withRpcHandler(getNumberOfPeopleInWaitlistService),
);
const submitWaitlistEmail = base
  .input(WaitlistSchema)
  .handler(withRpcHandler(submitWaitlistEmailService));

export const waitlist = {
  getNumberOfPeopleInWaitlist,
  submitWaitlistEmail,
};
