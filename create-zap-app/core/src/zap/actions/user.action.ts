"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getUserIdFromMail = async (email: string) => {
  const [userRecord] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (!userRecord) {
    throw new Error("User not found");
  }

  return userRecord.id;
};
