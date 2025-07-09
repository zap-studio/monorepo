"use server";
import "server-only";

import { Effect } from "effect";

import { getSessionAction } from "@/zap/actions/auth/get-session.action";

export async function isUserAdminAction() {
  const effect = Effect.gen(function* (_) {
    const session = yield* _(Effect.promise(() => getSessionAction()));

    if (!session) {
      return false;
    }

    return session.user.role === "admin";
  });

  return await Effect.runPromise(effect);
}
