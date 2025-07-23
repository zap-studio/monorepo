import "server-only";

import { Effect, pipe } from "effect";

import { db } from "@/db";
import { user } from "@/db/schema";
import { DatabaseFetchError } from "@/lib/effect";

const fetchNumberOfUsers = Effect.tryPromise({
  try: () => db.$count(user),
  catch: () =>
    new DatabaseFetchError({ message: "Failed to fetch number of users" }),
});

export async function getNumberOfUsersService() {
  const program = pipe(
    fetchNumberOfUsers,
    Effect.map((count) => count),
    Effect.catchAll(() => Effect.succeed(0)),
  );

  return await Effect.runPromise(program);
}
