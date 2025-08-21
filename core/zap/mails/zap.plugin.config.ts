import { NAME } from "@/zap.config";
import { PUBLIC_ENV } from "@/zap/env/public";

import type { MailsPluginConfig } from "./zap.plugin.config.types.js";

export const ZAP_MAILS_CONFIG: MailsPluginConfig = {
  PREFIX: NAME,
  RATE_LIMIT_SECONDS: 60,
  FROM: `${NAME} <${PUBLIC_ENV.ZAP_MAIL}>`,
};
