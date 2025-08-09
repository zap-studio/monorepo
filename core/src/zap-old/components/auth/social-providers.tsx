import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { SocialProviderButton } from "@/zap/components/auth/social-provider-button";

export function SocialProviders() {
  const providers = ZAP_DEFAULT_SETTINGS.AUTH.PROVIDERS;
  return (
    <div className="flex flex-col gap-4">
      {providers.map((provider) => (
        <SocialProviderButton key={provider} provider={provider} />
      ))}
    </div>
  );
}
