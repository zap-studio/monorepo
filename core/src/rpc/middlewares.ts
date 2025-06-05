import { auth } from "@/zap/lib/auth/server";
import { os } from "@orpc/server";

export const base = os
  .$context<{
    headers: Headers;
  }>()
  .errors({
    UNAUTHORIZED: {},
  });

export const authMiddleware = base.middleware(
  async ({ context, next, errors }) => {
    const session = await auth.api.getSession({
      headers: context.headers,
    });

    if (!session) {
      throw errors.UNAUTHORIZED({
        message: "You must be logged in.",
      });
    }

    const result = await next({
      context: {
        session,
        headers: context.headers,
      },
    });

    return result;
  },
);
