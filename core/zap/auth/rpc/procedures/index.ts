import "server-only";

import { authMiddleware, base } from "@/rpc/middlewares";
import { withRpcHandler } from "../../../errors/handlers";
import { InputGetUserIdFromMailSchema } from "../../schemas";
import {
  getNumberOfUsersService,
  getSessionService,
  getUserIdFromMailService,
  getUserIdService,
  isAuthenticatedService,
  isUserAdminService,
} from "../../services";

const isAuthenticated = base.handler(withRpcHandler(isAuthenticatedService));
const getUserId = base
  .use(authMiddleware)
  .handler(withRpcHandler(getUserIdService));
const getSession = base
  .use(authMiddleware)
  .handler(withRpcHandler(getSessionService));
const isUserAdmin = base
  .use(authMiddleware)
  .handler(withRpcHandler(isUserAdminService));
const getNumberOfUsers = base.handler(getNumberOfUsersService);
const getUserIdFromMail = base.input(InputGetUserIdFromMailSchema).handler(
  withRpcHandler(async ({ input }) => {
    return await getUserIdFromMailService({ ...input });
  }),
);

export const auth = {
  getUserId,
  getSession,
  isAuthenticated,
  isUserAdmin,
  getNumberOfUsers,
  getUserIdFromMail,
};
