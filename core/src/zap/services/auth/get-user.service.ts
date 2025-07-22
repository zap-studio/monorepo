import "server-only";

import { Effect } from "effect";
import { headers } from "next/headers";

import { auth } from "@/zap/lib/auth/server";

export async function getUserService() {
  const effect = Effect.gen(function* (_) {
    const headersList = yield* _(Effect.promise(async () => await headers()));
    const result = yield* _(
      Effect.promise(
        async () => await auth.api.getSession({ headers: headersList }),
      ),
    );

    return result?.user;
  });

  return await Effect.runPromise(effect);
}
