import { auth } from "@/zap/lib/auth/server";
import { db } from "@/db";
import { pushNotifications } from "@/zap/db/schema/notifications.sql";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { Effect } from "effect";

export async function DELETE(req: Request) {
  return Effect.runPromise(
    Effect.gen(function* (_) {
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
          catch: (error) => error,
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
    ),
  );
}
