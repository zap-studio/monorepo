import { authMiddleware, base } from "@/rpc/middlewares";

export const example = base.use(authMiddleware).handler(async ({ context }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const session = context.session;
  return { message: "Hello, World!" };
});
