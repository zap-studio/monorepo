import { auth } from "@/lib/auth";
import { ORPCError, os } from "@orpc/server";

export const authMiddleware = os.middleware(async ({ context, next }) => {
  const session = await auth.api.getSession({
    headers: context.headers,
  });

  if (!session) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "You must be logged in.",
    });
  }

  const result = await next({
    context: {
      session,
    },
  });

  return result;
});
