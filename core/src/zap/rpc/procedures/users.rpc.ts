import { base } from "@/rpc/middlewares";
import { getNumberOfUsersAction } from "@/zap/actions/users/get-number-of-users.action";

const getNumberOfUsers = base.handler(getNumberOfUsersAction);

export const users = {
  getNumberOfUsers,
};
