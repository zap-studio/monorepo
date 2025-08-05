import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { waitlist } from "@/db/schema";

interface SubmitWaitlistEmailInput {
  input: {
    email: string;
  };
}

export async function submitWaitlistEmailService({
  input,
}: SubmitWaitlistEmailInput) {
  try {
    const email = input.email;

    const existing = await db
      .select()
      .from(waitlist)
      .where(eq(waitlist.email, email))
      .limit(1)
      .execute();

    if (existing.length > 0) {
      return {
        success: false,
        message: "Email already registered",
      };
    }

    await db.insert(waitlist).values({ email }).execute();

    return {
      success: true,
      message: "Successfully joined the waitlist",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
