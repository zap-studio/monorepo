import "server-only";

import { base } from "@/rpc/middlewares";
import { withRpcHandler } from "@/zap/lib/api/handlers";
import { InputGetUserIdFromMailSchema } from "@/zap/schemas/users.schema";
import { getNumberOfUsersService } from "@/zap/services/users/get-number-of-users.service";
import { getUserIdFromMailService } from "@/zap/services/users/get-user-id-from-mail.service";

const getNumberOfUsers = base.handler(getNumberOfUsersService);
const getUserIdFromMail = base.input(InputGetUserIdFromMailSchema).handler(
  withRpcHandler(async ({ input }) => {
    return await getUserIdFromMailService({ ...input });
  }),
);

export const users = {
  getNumberOfUsers,
  getUserIdFromMail,
};
