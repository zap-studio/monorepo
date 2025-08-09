import "server-only";

import { ai } from "@/zap/ai/rpc/procedures";
import { auth } from "@/zap/auth/rpc/procedures";
import { mails } from "@/zap/mails/rpc/procedures";
import { pwa } from "@/zap/pwa/rpc/procedures";
import { example } from "@/zap-old/rpc/procedures/example.rpc";
import { feedbacks } from "@/zap-old/rpc/procedures/feedbacks.rpc";
import { users } from "@/zap-old/rpc/procedures/users.rpc";
import { waitlist } from "@/zap-old/rpc/procedures/waitlist.rpc";

export const router = {
  ai,
  auth,
  example,
  feedbacks,
  mails,
  pwa,
  users,
  waitlist,
};
