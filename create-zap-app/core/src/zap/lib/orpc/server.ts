import { createRouterClient } from "@orpc/server";
import { feedbacks } from "@/zap/rpc/procedures/feedbacks.rpc";
import { users } from "@/zap/rpc/procedures/users.rpc";

const { getAverageRating } = feedbacks;
const { getNumberOfUsers } = users;

export const createOrpcServer = (headers: Headers) => {
  return createRouterClient(
    {
      getAverageRating,
      getNumberOfUsers,
    },
    {
      context: {
        headers,
      },
    },
  );
};
