import { getServerPluginConfig } from "@/lib/zap.server";
import {
  _SuccessPage,
  type _SuccessPageProps,
} from "@/zap/payments/pages/success.page";

const authConfig = getServerPluginConfig("auth") || {};

export default function SuccessPage({ searchParams }: _SuccessPageProps) {
  return (
    <_SuccessPage
      pluginConfigs={{ auth: authConfig }}
      searchParams={searchParams}
    />
  );
}
