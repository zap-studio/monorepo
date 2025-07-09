"use server";
import "server-only";

import { Effect } from "effect";

import { db } from "@/db";
import { user } from "@/db/schema";

export async function getNumberOfUsersAction() {
  const effect = Effect.gen(function* (_) {
    const numberOfUsers = yield* _(
      Effect.tryPromise({
        try: () => db.$count(user),
        catch: () => new Error("Failed to get number of users"),
      }),
    );
    return numberOfUsers;
  }).pipe(Effect.catchAll(() => Effect.succeed(0)));

  return await Effect.runPromise(effect);
}
