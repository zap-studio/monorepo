import { PluginMetadata } from "../../schemas/plugins.schema";

export const emailsPlugin: PluginMetadata = {
  name: "emails",
  dependencies: ["resend", "@react-email/components"],
  available: true,
  env: ["RESEND_API_KEY"],
};
