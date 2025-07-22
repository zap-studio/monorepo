import "server-only";

import { Effect } from "effect";

import { getSessionService } from "@/zap/services/auth/get-session.service";

export async function isAuthenticatedService() {
  const effect = Effect.gen(function* (_) {
    const session = yield* _(Effect.promise(() => getSessionService()));

    if (!session) {
      return false;
    }

    return true;
  });

  return await Effect.runPromise(effect);
}
