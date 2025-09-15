import { getServerPluginConfig } from "@/lib/zap.server";
import { _MailVerifiedPage } from "@/zap/auth/pages/mail-verified.page";

const authConfig = getServerPluginConfig("auth") ?? {};

export default function MailVerifiedPage() {
  return <_MailVerifiedPage pluginConfigs={{ auth: authConfig }} />;
}
