import "server-only";

import { base } from "@/rpc/middlewares";
import { withRpcHandler } from "@/zap/errors/handlers";

import { WaitlistSchema } from "../../schemas";
import {
  getNumberOfPeopleInWaitlistService,
  submitWaitlistEmailService,
} from "../../services";

const getNumberOfPeopleInWaitlist = base.handler(
  withRpcHandler(getNumberOfPeopleInWaitlistService),
);
const submitWaitlistEmail = base.input(WaitlistSchema).handler(
  withRpcHandler(async ({ input }) => {
    return await submitWaitlistEmailService({ ...input });
  }),
);

export const waitlist = {
  getNumberOfPeopleInWaitlist,
  submitWaitlistEmail,
};
