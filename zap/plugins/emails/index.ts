import { PluginMetadata } from "../../schemas/plugins.schema";

export const emailsPlugin: PluginMetadata = {
  name: "emails",
  dependencies: ["resend"],
  available: true,
  env: ["RESEND_API_KEY"],
};
