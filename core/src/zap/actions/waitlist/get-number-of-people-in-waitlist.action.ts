"use server";
import "server-only";

import { Effect } from "effect";

import { getNumberOfPeopleInWaitlistQuery } from "@/zap/db/queries/waitlist.query";

export const getNumberOfPeopleInWaitlist = async () => {
  const effect = Effect.gen(function* () {
    const result = yield* Effect.tryPromise(() =>
      getNumberOfPeopleInWaitlistQuery.execute(),
    );

    const record = result[0];

    if (!record) {
      return yield* Effect.fail(new Error("No people in waitlist"));
    }

    return record.count;
  });

  return Effect.runPromise(effect);
};
