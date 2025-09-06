import "server-only";

import { db } from "@/zap/db/providers/drizzle";
import { BadRequestError, NotFoundError } from "@/zap/errors";

import { getNumberOfPeopleInWaitlistQuery } from "../db/providers/drizzle/queries";
import { waitlist } from "../db/providers/drizzle/schema";

export async function getNumberOfPeopleInWaitlistService() {
  const result = await getNumberOfPeopleInWaitlistQuery.execute();

  if (!result.length) {
    throw new NotFoundError("No waitlist records found");
  }

  const record = result[0];
  return record.count;
}

type SubmitWaitlistEmailService = {
  email: string;
};

export async function submitWaitlistEmailService({
  email,
}: SubmitWaitlistEmailService) {
  const result = await db
    .insert(waitlist)
    .values({ email })
    .onConflictDoNothing({
      target: [waitlist.email],
    })
    .returning({ id: waitlist.id });

  if (!result.length) {
    throw new BadRequestError(
      "This email is already on the waitlist. Please check your inbox for updates."
    );
  }

  return {
    message: "Successfully joined the waitlist",
  };
}
