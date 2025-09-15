"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ZapButton } from "@/zap/components/core/button";
import { AuthenticationError } from "@/zap/errors";
import { handleClientError } from "@/zap/errors/client";
import type {
  AuthClientPluginConfig,
  Provider,
} from "@/zap/plugins/types/auth.plugin";
import { betterAuthClient } from "../providers/better-auth/client";
import { PROVIDER_ICONS } from "./provider-icons";

type SocialProviderButtonProps = {
  provider: Provider;
  pluginConfigs: { auth: Partial<AuthClientPluginConfig> };
};

export function SocialProviderButton({
  provider,
  pluginConfigs,
}: SocialProviderButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSocialLogin = async (_provider: Provider) => {
    setLoading(true);

    try {
      const { data, error } = await betterAuthClient.signIn.social({
        provider: _provider,
        callbackURL: pluginConfigs.auth.REDIRECT_URL_AFTER_SIGN_IN,
      });

      if (error) {
        throw new AuthenticationError("Login failed. Please try again.");
      }

      if (data) {
        toast.success("Login successful!");
      } else {
        throw new AuthenticationError("Login failed. Please try again.");
      }
    } catch (error) {
      handleClientError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ZapButton
      className="w-full gap-2"
      loading={loading}
      loadingText="Logging in..."
      onClick={() => handleSocialLogin(provider)}
      variant="outline"
    >
      {PROVIDER_ICONS[provider]}
      {`Login with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`}
    </ZapButton>
  );
}
