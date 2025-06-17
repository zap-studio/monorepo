import { Effect } from "effect";

import { db } from "@/db";
import { user } from "@/db/schema";

export const getNumberOfUsersAction = async () => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const numberOfUsers = yield* _(
        Effect.tryPromise({
          try: () => db.$count(user),
          catch: (e) => e,
        }),
      );
      return numberOfUsers;
    }),
  );
};
