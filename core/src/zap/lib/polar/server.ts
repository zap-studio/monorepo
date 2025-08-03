import "server-only";

import { Polar } from "@polar-sh/sdk";

import { SERVER_ENV } from "@/lib/env.server";
import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";

export const polarClient = new Polar({
  accessToken: SERVER_ENV.POLAR_ACCESS_TOKEN,
  // Use 'sandbox' if you're using the Polar Sandbox environment
  // Remember that access tokens, products, etc. are completely separated between environments.
  // Access tokens obtained in Production are for instance not usable in the Sandbox environment.
  server: ZAP_DEFAULT_SETTINGS.PAYMENTS.POLAR?.ENVIRONMENT,
});

export const getActiveProducts = async () => {
  const response = await polarClient.products.list({});
  const products = response.result.items;
  return products.filter((product) => !product.isArchived);
};
