import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isPluginEnabled } from "@/lib/plugins";
import { cn } from "@/lib/utils";
import { ZAP_LEGAL_CONFIG } from "@/zap/legal/zap.plugin.config";
import type { AuthServerPluginConfig } from "@/zap/plugins/types/auth.plugin";
import { SocialProviderButton } from "../components/social-provider-button";

type AuthPageProps = {
  title: string;
  description?: string;
  form: React.ReactNode;
  bottomText: {
    label: string;
    linkText: string;
    linkHref: string;
  };
  pluginConfigs: { auth: Partial<AuthServerPluginConfig> };
};

const isLegalEnabled = isPluginEnabled("legal");

export function _AuthPage({
  title,
  description,
  form,
  bottomText,
  pluginConfigs,
}: AuthPageProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/50 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          className="flex items-center gap-2 self-center font-medium"
          href="/"
        >
          Zap.ts ⚡️
        </Link>

        <div className="flex flex-col gap-6">
          <Card className="border shadow-none">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{title}</CardTitle>
              {!!pluginConfigs.auth.ENABLE_SOCIAL_PROVIDER && description && (
                <CardDescription>{description}</CardDescription>
              )}
            </CardHeader>

            <CardContent>
              <div className="grid gap-6">
                {!!pluginConfigs.auth.ENABLE_SOCIAL_PROVIDER && (
                  <>
                    <SocialProviders pluginConfigs={pluginConfigs} />
                    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
                      <span className="relative z-10 bg-card px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </>
                )}

                {form}

                <div className="text-center text-sm">
                  {bottomText.label}{" "}
                  <Link
                    className="underline underline-offset-4"
                    href={{ pathname: bottomText.linkHref }}
                  >
                    {bottomText.linkText}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLegalEnabled && <PolicyLinks />}
        </div>
      </div>
    </div>
  );
}

type SocialProvidersProps = {
  pluginConfigs: { auth: Partial<AuthServerPluginConfig> };
};

function SocialProviders({ pluginConfigs }: SocialProvidersProps) {
  const providers = pluginConfigs.auth.PROVIDERS;

  if (!providers || providers.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {providers.map((provider) => (
        <SocialProviderButton
          key={provider}
          pluginConfigs={pluginConfigs}
          provider={provider}
        />
      ))}
    </div>
  );
}

function PolicyLinks({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "text-balance text-center text-muted-foreground text-xs [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary [&_a]:active:text-primary",
        className
      )}
    >
      By clicking continue, you agree to our{" "}
      <Link href={{ pathname: ZAP_LEGAL_CONFIG.TERMS_OF_SERVICE_URL }}>
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link href={{ pathname: ZAP_LEGAL_CONFIG.PRIVACY_POLICY_URL }}>
        Privacy Policy
      </Link>
      .
    </div>
  );
}
