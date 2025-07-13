import "server-only";

import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { pushNotifications } from "@/zap/db/schema/notifications.sql";
import { auth } from "@/zap/lib/auth/server";

export async function DELETE(req: Request) {
  const effect = Effect.gen(function* (_) {
    const session = yield* _(
      Effect.tryPromise({
        try: () => auth.api.getSession({ headers: req.headers }),
        catch: () => null,
      }),
    );

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    yield* _(
      Effect.tryPromise({
        try: () =>
          db
            .delete(pushNotifications)
            .where(eq(pushNotifications.userId, userId))
            .execute(),
        catch: () => new Error("Failed to unsubscribe from push notifications"),
      }),
    );

    return NextResponse.json({ success: true });
  }).pipe(
    Effect.catchAll(() =>
      Effect.succeed(
        NextResponse.json(
          { message: "Internal server error" },
          { status: 500 },
        ),
      ),
    ),
  );

  return await Effect.runPromise(effect);
}
