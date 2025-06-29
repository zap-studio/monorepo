"use server";
import "server-only";

import { Effect } from "effect";

import { db } from "@/db";
import { user } from "@/db/schema";

export const getNumberOfUsersAction = async () => {
  const effect = Effect.gen(function* (_) {
    const numberOfUsers = yield* _(
      Effect.tryPromise({
        try: () => db.$count(user),
        catch: () => new Error("Failed to get number of users"),
      }),
    );
    return numberOfUsers;
  });

  return await Effect.runPromise(effect);
};
