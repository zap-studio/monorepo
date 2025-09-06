import "client-only";

import { polarClient } from "@polar-sh/better-auth";
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

export const betterAuthClient = createAuthClient({
  baseURL: BASE_URL,
  plugins: [
    twoFactorClient(),
    usernameClient(),
    anonymousClient(),
    passkeyClient(),
    adminClient(),
    organizationClient(),
    polarClient(),
  ],
});

export type Session = typeof betterAuthClient.$Infer.Session;
