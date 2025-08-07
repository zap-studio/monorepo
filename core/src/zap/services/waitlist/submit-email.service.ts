import "server-only";

import { db } from "@/db";
import { waitlist } from "@/db/schema";
import { BadRequestError } from "@/zap/lib/api/errors";

interface SubmitWaitlistEmailInput {
  input: {
    email: string;
  };
}

export async function submitWaitlistEmailService({
  input,
}: SubmitWaitlistEmailInput) {
  const email = input.email;

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
