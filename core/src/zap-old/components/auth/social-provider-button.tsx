"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ZapButton } from "@/components/zap-ui/button";
import { AUTH_ICONS } from "@/data/auth-icons";
import { type Provider, ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { handleClientError } from "@/zap/lib/api/client";
import { AuthenticationError } from "@/zap/lib/api/errors";
import { authClient } from "@/zap/lib/auth/client";

interface SocialProviderButtonProps {
  provider: Provider;
}

export function SocialProviderButton({ provider }: SocialProviderButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSocialLogin = async (provider: Provider) => {
    setLoading(true);

    try {
      const { data, error } = await authClient.signIn.social({
        provider,
        callbackURL: ZAP_DEFAULT_SETTINGS.AUTH.REDIRECT_URL_AFTER_SIGN_IN,
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
      {AUTH_ICONS[provider]}
      {`Login with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`}
    </ZapButton>
  );
}
