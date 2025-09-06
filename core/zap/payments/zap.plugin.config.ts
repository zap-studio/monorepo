import { PUBLIC_ENV } from "@/zap/env/public";

import type { PaymentsPluginConfig } from "./zap.plugin.config.types";

// ─────────────────────────────────────────────────────────────
// Product Metadata
// ─────────────────────────────────────────────────────────────
const FEATURES = [
  "Unlimited projects",
  "Unlimited users",
  "Priority support",
  "Access to all features",
  "Early access to new features",
];

const PRODUCT_IDS = {
  sandbox: {
    monthly: "cd396dd5-b6ea-461c-a8de-e97539749480",
    yearly: "d07e65a0-9798-42c8-8f32-eca20d1be230",
  },
  production: {
    monthly: "6e21c61f-b711-4ce5-b925-e4a20871074c",
    yearly: "ad7d7325-3d72-42e5-8164-d4706c513468",
  },
};

export const ZAP_PAYMENTS_CONFIG: PaymentsPluginConfig = {
  YEARLY_DISCOUNT: 20, // in percent
  PRODUCTS_METADATA: {
    free: {
      productId: "",
      slug: "free",
      name: "Free",
      description: "Free plan with limited features",
      price: 0,
      currency: "usd",
      recurringInterval: "one-time",
      features: [
        "Limited projects",
        "Limited users",
        "Community support",
        "Access to basic features",
      ],
    },
    pro: {
      slug: "pro",
      name: "Pro",
      description: "Advanced features for professionals",
      currency: "usd",
      billingOptions: {
        monthly: {
          productId: PRODUCT_IDS[PUBLIC_ENV.POLAR_ENV].monthly,
          price: 20,
          recurringInterval: "month",
        },
        yearly: {
          productId: PRODUCT_IDS[PUBLIC_ENV.POLAR_ENV].yearly,
          price: 192, // 20% discount
          recurringInterval: "year",
        },
      },
      popular: true,
      features: FEATURES,
    },
    enterprise: {
      productId: "",
      slug: "enterprise",
      name: "Enterprise",
      description: "Custom solutions for large organizations",
      price: "Contact us",
      currency: "usd",
      recurringInterval: "one-time",
      contactSales: true,
      features: [
        "Custom projects",
        "Custom users",
        "Dedicated support",
        "Access to all features",
        "Custom SLAs",
        "Custom integrations",
      ],
    },
  },
  POLAR: {
    AUTHENTICATED_USERS_ONLY: true,
    CREATE_CUSTOMER_ON_SIGNUP: true,
    ENVIRONMENT: PUBLIC_ENV.POLAR_ENV,
    PRODUCTS: Object.values(PRODUCT_IDS[PUBLIC_ENV.POLAR_ENV]).map(
      (id, idx) => ({
        productId: id,
        slug: idx === 0 ? "pro-monthly" : "pro-yearly",
      })
    ),
    SUCCESS_URL: "/app/billing/success",
  },
};
