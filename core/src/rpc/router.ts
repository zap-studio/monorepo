import 'server-only';

import { example } from '@/rpc/procedures/example.rpc';
import { ai } from '@/zap/ai/rpc/procedures';
import { auth } from '@/zap/auth/rpc/procedures';
import { feedbacks } from '@/zap/feedbacks/rpc/procedures';
import { mails } from '@/zap/mails/rpc/procedures';
import { pwa } from '@/zap/pwa/rpc/procedures';
import { waitlist } from '@/zap/waitlist/rpc/procedures';

export const router = {
  ai,
  auth,
  example,
  feedbacks,
  mails,
  pwa,
  waitlist,
};
