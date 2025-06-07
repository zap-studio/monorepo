import {
  adminClient,
  anonymousClient,
  organizationClient,
  passkeyClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { BASE_URL } from "@/zap.config";

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  plugins: [
    twoFactorClient(),
    usernameClient(),
    anonymousClient(),
    passkeyClient(),
    adminClient(),
    organizationClient(),
  ],
});

export type Session = typeof authClient.$Infer.Session;
