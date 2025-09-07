"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ZapButton } from "@/zap/components/core/button";
import { AuthenticationError } from "@/zap/errors";
import { handleClientError } from "@/zap/errors/client";

import { betterAuthClient } from "../providers/better-auth/client";
import { ZAP_AUTH_CONFIG } from "../zap.plugin.config";
import type { Provider } from "../zap.plugin.config.types";
import { PROVIDER_ICONS } from "./provider-icons";

type SocialProviderButtonProps = {
  provider: Provider;
};

export function SocialProviderButton({ provider }: SocialProviderButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSocialLogin = async (_provider: Provider) => {
    setLoading(true);

    try {
      const { data, error } = await betterAuthClient.signIn.social({
        provider: _provider,
        callbackURL: ZAP_AUTH_CONFIG.REDIRECT_URL_AFTER_SIGN_IN,
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
