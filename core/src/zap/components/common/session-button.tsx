"use client";

import Link from "next/link";

import { ZapButton } from "@/components/zap-ui/button";
import { authClient } from "@/zap/lib/auth/client";

export function SessionButton() {
  const session = authClient.useSession();

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
          className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
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
