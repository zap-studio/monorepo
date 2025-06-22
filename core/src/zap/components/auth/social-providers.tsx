import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";

import { SocialProviderButton } from "./social-provider-button";

interface SocialProvidersProps {
  redirectURL: string;
}

export function SocialProviders({ redirectURL }: SocialProvidersProps) {
  const providers = ZAP_DEFAULT_SETTINGS.AUTH.PROVIDERS;
  return (
    <div className="flex flex-col gap-4">
      {providers.map((provider) => (
        <SocialProviderButton
          key={provider}
          provider={provider}
          redirectURL={redirectURL}
        />
      ))}
    </div>
  );
}
