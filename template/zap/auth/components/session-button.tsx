"use client";
import "client-only";

import Link from "next/link";
import { ZapButton } from "@/zap/components/core/button";
import { DEFAULT_CONFIG } from "@/zap/plugins/config/default";
import type { AuthClientPluginConfig } from "@/zap/plugins/types/auth.plugin";
import { ZAP_CORE_CONFIG } from "@/zap.config";
import { betterAuthClient } from "../providers/better-auth/client";

export function SessionButton(config: Partial<AuthClientPluginConfig>) {
  const { data: result } = betterAuthClient.useSession();
  const session = result?.session;

  if (session) {
    return (
      <ZapButton asChild size="sm">
        <Link href={{ pathname: ZAP_CORE_CONFIG.APP.APP_URL }}>Open App</Link>
      </ZapButton>
    );
  }

  return (
    <>
      <ZapButton asChild variant="ghost">
        <Link
          className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground active:text-foreground"
          href={{ pathname: config.LOGIN_URL ?? DEFAULT_CONFIG.auth.LOGIN_URL }}
        >
          Login
        </Link>
      </ZapButton>

      <ZapButton asChild size="sm">
        <Link
          href={{
            pathname: config.SIGN_UP_URL ?? DEFAULT_CONFIG.auth.SIGN_UP_URL,
          }}
        >
          Get Started
        </Link>
      </ZapButton>
    </>
  );
}
