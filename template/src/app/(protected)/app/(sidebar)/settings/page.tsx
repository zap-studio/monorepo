import "server-only";

import { getServerPluginConfig } from "@/lib/zap.server";
import { getAuthServerDataOrRedirectToLoginService } from "@/zap/auth/services";

const authConfig = getServerPluginConfig("auth") ?? {};

export default async function SettingsPage() {
  await getAuthServerDataOrRedirectToLoginService({ auth: authConfig });

  return null;
}
