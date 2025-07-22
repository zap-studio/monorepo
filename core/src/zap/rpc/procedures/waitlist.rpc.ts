import "server-only";

import { base } from "@/rpc/middlewares";
import { WaitlistSchema } from "@/zap/schemas/waitlist.schema";
import { getNumberOfPeopleInWaitlistService } from "@/zap/services/waitlist/get-number-of-people-in-waitlist.service";
import { submitWaitlistEmailService } from "@/zap/services/waitlist/submit-email.service";

const getNumberOfPeopleInWaitlist = base.handler(
  getNumberOfPeopleInWaitlistService,
);
const submitWaitlistEmail = base
  .input(WaitlistSchema)
  .handler(submitWaitlistEmailService);

export const waitlist = {
  getNumberOfPeopleInWaitlist,
  submitWaitlistEmail,
};
