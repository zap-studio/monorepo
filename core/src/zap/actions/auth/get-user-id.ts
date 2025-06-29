import { Effect } from "effect";

import { getSessionAction } from "@/zap/actions/auth/get-session.action";

export const getUserIdAction = async () => {
  const effect = Effect.gen(function* (_) {
    const session = yield* _(Effect.promise(() => getSessionAction()));

    if (!session) {
      return yield* _(Effect.fail(new Error("User not authenticated")));
    }

    return session.user.id;
  });

  return await Effect.runPromise(effect);
};
