import { defineConfig } from "vocs/config";

const baseUrl = "https://www.zapstudio.dev";
const ogImageUrl = `${baseUrl}/og.png`;

export default defineConfig({
  accentColor: "light-dark(hsl(38, 92%, 40%), hsl(43, 96%, 56%))",
  baseUrl,
  description:
    "Type-safe, framework-agnostic and composable TypeScript libraries for the web.",
  editLink: {
    link: "https://github.com/zap-studio/monorepo/edit/main/apps/docs/src/pages/:path",
    text: "Edit on GitHub",
  },
  head: {
    meta: {
      ogImageAlt:
        "Zap Studio — type-safe, framework-agnostic and composable TypeScript libraries for the web.",
      ogImageHeight: 630,
      ogImageType: "image/png",
      ogImageWidth: 1200,
    },
  },
  iconUrl: "/icon.svg",
  logoUrl: { dark: "/logo-dark.svg", light: "/logo-light.svg" },
  ogImageUrl,
  renderStrategy: "full-static",
  sidebar: [
    { link: "/", text: "Getting Started" },
    {
      items: [
        {
          collapsed: true,
          items: [
            { link: "/fetch", text: "Overview" },
            { link: "/fetch/getting-started", text: "Getting Started" },
            { link: "/fetch/raw-fetch-mode", text: "Raw Fetch Mode" },
            {
              link: "/fetch/validated-fetch-mode",
              text: "Validated Fetch Mode",
            },
            { link: "/fetch/api-methods", text: "API Methods" },
            { link: "/fetch/create-fetch", text: "createFetch" },
            { link: "/fetch/json-convenience", text: "JSON Convenience" },
            { link: "/fetch/validation", text: "Validation" },
            { link: "/fetch/errors", text: "Error Handling" },
          ],
          text: "fetch",
        },
        {
          collapsed: true,
          items: [
            { link: "/permit", text: "Overview" },
            { link: "/permit/getting-started", text: "Getting Started" },
            {
              link: "/permit/declarative-policies",
              text: "Declarative Policies",
            },
            {
              link: "/permit/standard-schema",
              text: "Standard Schema Support",
            },
            { link: "/permit/roles", text: "Role-Based Access Control" },
            { link: "/permit/conditions", text: "Conditions" },
            { link: "/permit/merging-policies", text: "Merging Policies" },
            { link: "/permit/errors", text: "Error Handling" },
          ],
          text: "permit",
        },
        {
          collapsed: true,
          items: [
            { link: "/retry", text: "Overview" },
            { link: "/retry/getting-started", text: "Getting Started" },
            {
              items: [
                { link: "/retry/fixed-delay", text: "FixedDelay" },
                {
                  link: "/retry/exponential-backoff",
                  text: "ExponentialBackoff",
                },
              ],
              text: "Built-in Policies",
            },
            { link: "/retry/running-policies", text: "Shared Runner" },
            { link: "/retry/non-throw-mode", text: "Non-throw Mode" },
            { link: "/retry/abort-signal", text: "Cancellation" },
            { link: "/retry/custom-policies", text: "Custom Policies" },
            { link: "/retry/errors", text: "Structured Errors" },
          ],
          text: "retry",
        },
        {
          collapsed: true,
          items: [
            { link: "/validation", text: "Overview" },
            { link: "/validation/getting-started", text: "Getting Started" },
            { link: "/validation/async-validation", text: "Async Validation" },
            {
              link: "/validation/synchronous-validation",
              text: "Synchronous Validation",
            },
            {
              link: "/validation/create-validators",
              text: "Create Validators",
            },
            { link: "/validation/errors", text: "Errors" },
            {
              link: "/validation/runtime-schema-detection",
              text: "Runtime Schema Detection",
            },
          ],
          text: "validation",
        },
        {
          collapsed: true,
          items: [
            { link: "/webhooks", text: "Overview" },
            { link: "/webhooks/getting-started", text: "Getting Started" },
            { link: "/webhooks/web-api-native", text: "Web API Native" },
            { link: "/webhooks/type-safe-routing", text: "Type-Safe Routing" },
            { link: "/webhooks/standard-schema", text: "Standard Schema" },
            { link: "/webhooks/verification", text: "Verification" },
            { link: "/webhooks/lifecycle-hooks", text: "Lifecycle Hooks" },
          ],
          text: "webhooks",
        },
      ],
      text: "Packages",
    },
  ],
  socials: [{ icon: "github", link: "https://github.com/zap-studio/monorepo" }],
  title: "Zap Studio",
  topNav: [
    { link: "/fetch", text: "fetch" },
    { link: "/permit", text: "permit" },
    { link: "/retry", text: "retry" },
    { link: "/validation", text: "validation" },
    { link: "/webhooks", text: "webhooks" },
    { link: "https://github.com/zap-studio/monorepo", text: "GitHub" },
  ],
});
