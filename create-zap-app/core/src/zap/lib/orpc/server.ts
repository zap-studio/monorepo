import { users } from "@/zap/rpc/procedures/users.rpc";
import { feedback } from "@/zap/rpc/procedures/feedback.rpc";
import { call, DecoratedProcedure } from "@orpc/server";
import { headers } from "next/headers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const callRpc = async <T>(procedure: any): Promise<T> => {
  return (await call(
    procedure,
    {},
    {
      context: {
        headers: await headers(),
      },
    },
  )) as Promise<T>;
};

type OutputType<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends DecoratedProcedure<any, any, any, any, infer R, any, any>
    ? R
    : never;

export const orpcServer = {
  users: {
    getNumberOfUsers: async () =>
      callRpc(users.getNumberOfUsers) as Promise<
        OutputType<typeof users.getNumberOfUsers>
      >,
  },
  feedback: {
    getAverageRating: async () =>
      callRpc(feedback.getAverageRating) as Promise<
        OutputType<typeof feedback.getAverageRating>
      >,
    getUserFeedback: async () =>
      callRpc(feedback.getUserFeedback) as Promise<
        OutputType<typeof feedback.getUserFeedback>
      >,
  },
};
