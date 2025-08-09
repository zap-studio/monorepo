"use client";

import Link from "next/link";

import { betterAuthClient } from "@/zap/auth/providers/better-auth/client";
import { ZapButton } from "@/zap/components";

export function SessionButton() {
  const { data: result } = betterAuthClient.useSession();
  const session = result?.session;

  if (session) {
    return (
      <ZapButton asChild size="sm">
        <Link href="/app">Open App</Link>
      </ZapButton>
    );
  }

  return (
    <>
      <ZapButton asChild variant="ghost">
        <Link
          className="text-muted-foreground hover:text-foreground active:text-foreground text-sm font-medium transition-colors"
          href="/login"
        >
          Login
        </Link>
      </ZapButton>

      <ZapButton asChild size="sm">
        <Link href="/register">Get Started</Link>
      </ZapButton>
    </>
  );
}
