import Link from "next/link";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { ZapButton } from "@/zap/components";

export default function MailVerifiedPage() {
  return (
    <div className="flex min-h-screen items-center px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="w-full space-y-6 text-center">
        <div className="space-y-3">
          <h1 className="text-primary animate-bounce text-4xl font-bold tracking-tighter sm:text-5xl">
            Mail Verified
          </h1>
          <p className="text-muted-foreground">
            Your mail has been verified successfully!
          </p>
        </div>
        <ZapButton asChild variant={"ghost"}>
          <Link href={ZAP_DEFAULT_SETTINGS.AUTH.LOGIN_URL}>Go to Login</Link>
        </ZapButton>
      </div>
    </div>
  );
}
