import "server-only";

import { getServerPluginConfig } from "@/lib/zap.server";
import { _BillingPage } from "@/zap/payments/pages/billing.page";

const authConfig = getServerPluginConfig("auth") || {};

export default function BillingPage() {
  return <_BillingPage pluginConfigs={{ auth: authConfig }} />;
}
