import Link from "next/link";

import { ZapButton } from "@/zap/components/core/button";

import { ZAP_AUTH_CONFIG } from "../zap.plugin.config";

export function _MailVerifiedPage() {
  return (
    <div className="flex min-h-screen items-center px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="w-full space-y-6 text-center">
        <div className="space-y-3">
          <h1 className="animate-bounce font-bold text-4xl text-primary tracking-tighter sm:text-5xl">
            Mail Verified
          </h1>
          <p className="text-muted-foreground">
            Your mail has been verified successfully!
          </p>
        </div>
        <ZapButton asChild variant={"ghost"}>
          <Link href={{ pathname: ZAP_AUTH_CONFIG.LOGIN_URL }}>
            Go to Login
          </Link>
        </ZapButton>
      </div>
    </div>
  );
}
