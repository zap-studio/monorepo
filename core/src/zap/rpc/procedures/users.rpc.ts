import "server-only";

import { base } from "@/rpc/middlewares";
import { InputGetUserIdFromMailSchema } from "@/zap/schemas/users.schema";
import { getNumberOfUsersService } from "@/zap/services/users/get-number-of-users.service";
import { getUserIdFromMailService } from "@/zap/services/users/get-user-id-from-mail.service";

const getNumberOfUsers = base.handler(getNumberOfUsersService);
const getUserIdFromMail = base
  .input(InputGetUserIdFromMailSchema)
  .handler(getUserIdFromMailService);

export const users = {
  getNumberOfUsers,
  getUserIdFromMail,
};
