import "server-only";

import { Effect } from "effect";

import { getUserService } from "./get-user.service";

export async function isUserAdminService() {
  const effect = Effect.gen(function* (_) {
    const user = yield* _(Effect.promise(() => getUserService()));

    if (!user) {
      return false;
    }

    return false; // FIXME: Implement actual admin check logic
  });

  return await Effect.runPromise(effect);
}
