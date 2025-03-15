import { os } from "@orpc/server";
import { authMiddleware } from "../middlewares";

export const example = os.use(authMiddleware).handler(async ({ context }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const session = context.session;
  return { message: "Hello, World!" };
});
