"use server";
import "server-only";

import { Effect } from "effect";
import { headers } from "next/headers";

import { auth } from "@/zap/lib/auth/server";

export async function getSessionAction() {
  const effect = Effect.gen(function* (_) {
    const headersList = yield* _(Effect.promise(async () => await headers()));
    return yield* _(
      Effect.promise(
        async () => await auth.api.getSession({ headers: headersList }),
      ),
    );
  });

  return await Effect.runPromise(effect);
}
