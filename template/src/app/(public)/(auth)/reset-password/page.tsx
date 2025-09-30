import { getServerPluginConfig } from "@/lib/zap.server";
import { _ResetPasswordPage } from "@/zap/auth/pages/reset-password.page";

const authConfig = getServerPluginConfig("auth") || {};

export default function ResetPasswordPage() {
  return <_ResetPasswordPage pluginConfigs={{ auth: authConfig }} />;
}
