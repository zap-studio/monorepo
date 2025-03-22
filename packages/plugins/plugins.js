export const adminDashboardPlugin = {
    name: "admin-dashboard",
    available: {
        drizzle: false,
        prisma: false,
    },
};
export const aiPlugin = {
    name: "ai",
    dependencies: ["ai", "@ai-sdk/react", "@ai-sdk/openai", "@ai-sdk/mistral"],
    available: true,
    env: ["OPENAI_API_KEY", "MISTRAL_API_KEY"],
};
export const blogPlugin = {
    name: "blog",
    available: false,
};
export const drizzlePlugin = {
    name: "drizzle-orm",
    category: "orm",
    dependencies: ["drizzle-orm", "@neondatabase/serverless"],
    available: true,
    env: ["DATABASE_URL"],
};
export const emailsPlugin = {
    name: "emails",
    dependencies: ["resend", "react-email", "@react-email/components"],
    available: true,
    env: ["RESEND_API_KEY"],
};
export const legalPlugin = {
    name: "legal",
    available: true,
};
export const polarPlugin = {
    name: "polar",
    dependencies: ["@polar-sh/better-auth", "@polar-sh/sdk"],
    available: false,
    env: ["POLAR_ACCESS_TOKEN", "POLAR_WEBHOOK_SECRET"],
};
export const prismaPlugin = {
    name: "prisma-orm",
    category: "orm",
    dependencies: ["prisma"],
    available: false,
    env: ["DATABASE_URL"],
};
export const pwaPlugin = {
    name: "pwa",
    dependencies: ["ky", "web-push"],
    available: {
        drizzle: true,
        prisma: false,
    },
};
export const stripePlugin = {
    name: "stripe",
    dependencies: ["@better-auth/stripe", "stripe"],
    available: {
        drizzle: false,
        prisma: false,
    },
    env: ["STRIPE_WEBHOOK_SECRET", "STRIPE_SECRET_KEY"],
};
export const plugins = [
    adminDashboardPlugin,
    aiPlugin,
    blogPlugin,
    drizzlePlugin,
    emailsPlugin,
    legalPlugin,
    polarPlugin,
    prismaPlugin,
    pwaPlugin,
    stripePlugin,
];
