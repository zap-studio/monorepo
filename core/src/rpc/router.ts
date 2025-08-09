import "server-only";

import { ai } from "@/zap/ai/rpc/procedures";
import { auth } from "@/zap-old/rpc/procedures/auth.rpc";
import { example } from "@/zap-old/rpc/procedures/example.rpc";
import { feedbacks } from "@/zap-old/rpc/procedures/feedbacks.rpc";
import { mails } from "@/zap-old/rpc/procedures/mails.rpc";
import { pushNotifications } from "@/zap-old/rpc/procedures/push-notifications.rpc";
import { users } from "@/zap-old/rpc/procedures/users.rpc";
import { waitlist } from "@/zap-old/rpc/procedures/waitlist.rpc";

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
