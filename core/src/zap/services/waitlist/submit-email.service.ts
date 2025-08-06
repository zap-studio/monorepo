import "server-only";

import { eq } from "drizzle-orm";

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

  const existing = await db
    .select()
    .from(waitlist)
    .where(eq(waitlist.email, email))
    .limit(1)
    .execute();

  if (existing.length > 0) {
    throw new BadRequestError(
      "This email is already on the waitlist. Please check your inbox for updates.",
    );
  }

  await db.insert(waitlist).values({ email }).execute();

  return {
    success: true,
    message: "Successfully joined the waitlist",
  };
}
