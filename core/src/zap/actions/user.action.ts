"use server";

import { Effect } from "effect";
import { getUserIdFromEmailQuery } from "@/zap/db/queries/emails.query";

export const getUserIdFromMail = async (email: string) => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const records = yield* _(
        Effect.tryPromise({
          try: () => getUserIdFromEmailQuery.execute({ email }),
          catch: (e) => e,
        }),
      );

      const record = records[0];
      if (!record) {
        return yield* _(Effect.fail(new Error("User not found")));
      }

      return record.userId;
    }),
  );
};
