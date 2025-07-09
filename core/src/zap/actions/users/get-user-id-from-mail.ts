"use server";
import "server-only";

import { Effect } from "effect";

import { getUserIdFromMailQuery } from "@/zap/db/queries/emails.query";

interface GetUserIdFromMailActionProps {
  input: {
    email: string;
  };
}

export async function getUserIdFromMailAction({
  input,
}: GetUserIdFromMailActionProps) {
  const effect = Effect.gen(function* (_) {
    const email = input.email;

    const records = yield* _(
      Effect.tryPromise({
        try: () => getUserIdFromMailQuery.execute({ email }),
        catch: () => new Error("Failed to get user ID from mail"),
      }),
    );

    const record = records[0];
    if (!record) {
      return yield* _(Effect.fail(new Error("User not found")));
    }

    return record.userId;
  });

  return await Effect.runPromise(effect);
}
