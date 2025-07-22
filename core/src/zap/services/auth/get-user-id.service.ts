import "server-only";

import { Effect } from "effect";

import { getUserService } from "@/zap/services/auth/get-user.service";

export async function getUserIdService() {
  const effect = Effect.gen(function* (_) {
    const user = yield* _(Effect.promise(() => getUserService()));

    if (!user) {
      return yield* _(Effect.fail(new Error("User not authenticated")));
    }

    return user.id;
  });

  return await Effect.runPromise(effect);
}
