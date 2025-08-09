import "server-only";

import { db } from "@/db";
import { waitlist } from "@/db/schema";
import { BadRequestError, NotFoundError } from "@/zap/errors";
import { getNumberOfPeopleInWaitlistQuery } from "@/zap/waitlist/db/queries";

export async function getNumberOfPeopleInWaitlistService() {
  const result = await getNumberOfPeopleInWaitlistQuery.execute();

  if (!result.length) {
    throw new NotFoundError("No waitlist records found");
  }

  const record = result[0];
  return record.count;
}

interface SubmitWaitlistEmailService {
  email: string;
}

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
      "This email is already on the waitlist. Please check your inbox for updates.",
    );
  }

  return {
    message: "Successfully joined the waitlist",
  };
}
