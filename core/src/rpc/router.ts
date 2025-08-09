import "server-only";

import { ai } from "@/zap/rpc/procedures/ai.rpc";
import { auth } from "@/zap/rpc/procedures/auth.rpc";
import { example } from "@/zap/rpc/procedures/example.rpc";
import { feedbacks } from "@/zap/rpc/procedures/feedbacks.rpc";
import { mails } from "@/zap/rpc/procedures/mails.rpc";
import { pushNotifications } from "@/zap/rpc/procedures/push-notifications.rpc";
import { users } from "@/zap/rpc/procedures/users.rpc";
import { waitlist } from "@/zap/rpc/procedures/waitlist.rpc";

export const router = {
  ai,
  auth,
  example,
  feedbacks,
  mails,
  pushNotifications,
  users,
  waitlist,
};
