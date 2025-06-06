import { auth } from "@/zap/lib/auth/server";
import { db } from "@/db";
import { pushNotifications } from "@/zap/db/schema/notifications.sql";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    // Get current user
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Delete the subscription
    await db
      .delete(pushNotifications)
      .where(eq(pushNotifications.userId, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to unsubscribe from push notifications:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
