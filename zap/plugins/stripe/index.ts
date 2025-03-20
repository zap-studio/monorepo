import { registerPlugin, Plugin } from "..";

export const paymentStripePlugin: Plugin = {
  name: "stripe",
  dependencies: ["@better-auth/stripe", "stripe"],
  setup: () => {
    console.log("Payment with Stripe is now enabled!");
  },
};

registerPlugin(paymentStripePlugin);
