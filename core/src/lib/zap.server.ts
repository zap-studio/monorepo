import { analyticsPlugin } from "@/zap/analytics/zap.server";
import { toClient } from "@/zap/plugins/utils";

// Add/remove plugins here
export const zapServerClient = toClient([analyticsPlugin()]);

export type ZapServerClient = typeof zapServerClient;
