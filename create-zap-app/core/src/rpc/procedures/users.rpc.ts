import { db } from "@/db";
import { base } from "../middlewares";
import { user } from "@/db/schema";

export const users = {
  getNumberOfUsers: base.handler(async () => {
    const numberOfUsers = await db.$count(user);
    return numberOfUsers;
  }),
};
