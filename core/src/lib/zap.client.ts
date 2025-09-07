import { analyticsClientPlugin } from "@/zap/analytics/zap.client";
import { toClient } from "@/zap/plugins/utils";

// Add/remove plugins here
export const zapClient = toClient([analyticsClientPlugin()]);

export type ZapClient = typeof zapClient;
