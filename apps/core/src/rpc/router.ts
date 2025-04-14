import { ai } from "@/zap/rpc/procedures/ai.rpc";
import { example } from "@/zap/rpc/procedures/example.rpc";
import { feedbacks } from "@/zap/rpc/procedures/feedbacks.rpc";
import { users } from "@/zap/rpc/procedures/users.rpc";

export const router = {
  example,
  feedbacks,
  users,
  ai,
};
