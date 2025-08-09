import "server-only";

import { Polar } from "@polar-sh/sdk";

import { SERVER_ENV } from "@/zap/env/server";

export const polarClient = new Polar({
  accessToken: SERVER_ENV.POLAR_ACCESS_TOKEN,
  // Use 'sandbox' if you're using the Polar Sandbox environment
  // Remember that access tokens, products, etc. are completely separated between environments.
  // Access tokens obtained in Production are for instance not usable in the Sandbox environment.
  server: SERVER_ENV.POLAR_ENV,
});
