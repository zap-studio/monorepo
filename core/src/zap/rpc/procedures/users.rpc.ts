import { base } from "@/rpc/middlewares";
import { getNumberOfUsersAction } from "@/zap/actions/users/get-number-of-users.action";
import { getUserIdFromMailAction } from "@/zap/actions/users/get-user-id-from-mail";
import { InputGetUserIdFromMailSchema } from "@/zap/schemas/users.schema";

const getNumberOfUsers = base.handler(getNumberOfUsersAction);
const getUserIdFromMail = base
  .input(InputGetUserIdFromMailSchema)
  .handler(getUserIdFromMailAction);

export const users = {
  getNumberOfUsers,
  getUserIdFromMail,
};
