import Link from "next/link";

import { ZapButton } from "@/zap/components/core/button";
import { DEFAULT_CONFIG } from "@/zap/plugins/config/default";
import type { AuthServerPluginConfig } from "@/zap/plugins/types/auth.plugin";

type MailVerifiedPageProps = {
  pluginConfigs: {
    auth: Partial<AuthServerPluginConfig>;
  };
};

export function _MailVerifiedPage({ pluginConfigs }: MailVerifiedPageProps) {
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
          <Link
            href={{
              pathname:
                pluginConfigs.auth.LOGIN_URL ?? DEFAULT_CONFIG.auth.LOGIN_URL,
            }}
          >
            Go to Login
          </Link>
        </ZapButton>
      </div>
    </div>
  );
}
