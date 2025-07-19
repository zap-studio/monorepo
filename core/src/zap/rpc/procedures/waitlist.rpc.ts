import "server-only";

import { base } from "@/rpc/middlewares";
import { getNumberOfPeopleInWaitlistAction } from "@/zap/actions/waitlist/get-number-of-people-in-waitlist.action";
import { submitWaitlistEmailAction } from "@/zap/actions/waitlist/submit-email.action";
import { WaitlistSchema } from "@/zap/schemas/waitlist.schema";

const getNumberOfPeopleInWaitlist = base.handler(
  getNumberOfPeopleInWaitlistAction,
);
const submitWaitlistEmail = base
  .input(WaitlistSchema)
  .handler(submitWaitlistEmailAction);

export const waitlist = {
  getNumberOfPeopleInWaitlist,
  submitWaitlistEmail,
};
