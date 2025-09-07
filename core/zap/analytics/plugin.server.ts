import type { ZapServerPlugin } from "@/zap/plugins/types";
import type { AnalyticsServerPluginConfig } from "../plugins/types/analytics.plugin";
import { VercelProvider } from "./providers/vercel.provider";

export function analyticsPlugin(config?: Partial<AnalyticsServerPluginConfig>) {
  return {
    id: "analytics",
    config,
    providers: {
      VercelProvider,
    },
  } satisfies ZapServerPlugin;
}
