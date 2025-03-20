import { registerPlugin, Plugin } from "..";

export const paymentPolarPlugin: Plugin = {
  name: "polar",
  dependencies: ["@polar-sh/better-auth", "@polar-sh/sdk"],
  setup: () => {
    console.log("Payment with Polar is now enabled!");
  },
};

registerPlugin(paymentPolarPlugin);
