import { db } from "@/db";
import { base } from "../../../rpc/middlewares";
import { user } from "@/db/schema";

const getNumberOfUsers = base.handler(async () => {
  const numberOfUsers = await db.$count(user);
  return numberOfUsers;
});

export const users = {
  getNumberOfUsers,
};
