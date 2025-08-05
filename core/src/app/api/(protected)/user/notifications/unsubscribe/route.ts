import "server-only";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { pushNotifications } from "@/zap/db/schema/notifications.sql";
import type { Session } from "@/zap/lib/auth/client";
import { auth } from "@/zap/lib/auth/server";

export async function DELETE(req: Request) {
  try {
    let session: Session | null;
    try {
      session = await auth.api.getSession({ headers: req.headers });
    } catch {
      session = null;
    }

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    await db
      .delete(pushNotifications)
      .where(eq(pushNotifications.userId, userId))
      .execute();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
