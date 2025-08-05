import "server-only";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { pushNotifications } from "@/zap/db/schema/notifications.sql";
import { auth } from "@/zap/lib/auth/server";
import { withApiHandler } from "@/zap/lib/error-handling/handlers";

export const DELETE = withApiHandler(async (req: Request) => {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  await db
    .delete(pushNotifications)
    .where(eq(pushNotifications.userId, userId))
    .execute();

  return NextResponse.json({ success: true });
});
