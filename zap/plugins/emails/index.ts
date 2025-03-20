import { registerPlugin, Plugin } from "..";

export const emailResendPlugin: Plugin = {
  name: "emails",
  dependencies: ["resend"],
  setup: () => {
    console.log("Email with Resend is now enabled! ");
  },
};

registerPlugin(emailResendPlugin);
