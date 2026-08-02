import { defineConfig } from "vocs/config";

export default defineConfig({
  accentColor: "light-dark(hsl(38, 92%, 40%), hsl(43, 96%, 56%))",
  description:
    "Framework-agnostic TypeScript packages for typed HTTP, authorization, retries, validation, and webhooks.",
  editLink: {
    link: "https://github.com/zap-studio/monorepo/edit/main/apps/docs/src/pages/:path",
    text: "Edit on GitHub",
  },
  iconUrl: "/icon.svg",
  logoUrl: { dark: "/logo-dark.svg", light: "/logo-light.svg" },
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
            { link: "/fetch/fetch-function", text: "$fetch" },
            { link: "/fetch/api-methods", text: "API Methods" },
            { link: "/fetch/create-fetch", text: "createFetch" },
            { link: "/fetch/validation", text: "Validation" },
            { link: "/fetch/errors", text: "Error Handling" },
          ],
          text: "fetch",
        },
        {
          collapsed: true,
          items: [
            { link: "/permit", text: "Overview" },
            { link: "/permit/creating-policies", text: "Creating Policies" },
            { link: "/permit/policy-rules", text: "Policy Rules" },
            { link: "/permit/conditions", text: "Conditions" },
            { link: "/permit/roles", text: "Role-Based Access Control" },
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
            { link: "/retry/fixed-delay", text: "FixedDelay" },
            { link: "/retry/exponential-backoff", text: "ExponentialBackoff" },
            { link: "/retry/running-policies", text: "Running Policies" },
            { link: "/retry/abort-signal", text: "Abort Signal" },
            { link: "/retry/custom-policies", text: "Custom Policies" },
            { link: "/retry/retry-error", text: "RetryError" },
            { link: "/retry/types", text: "Types" },
          ],
          text: "retry",
        },
        {
          collapsed: true,
          items: [
            { link: "/validation", text: "Overview" },
            { link: "/validation/getting-started", text: "Getting Started" },
            { link: "/validation/concepts", text: "Concepts" },
            { link: "/validation/how-to-validate", text: "How to Validate" },
            {
              link: "/validation/create-validators",
              text: "Create Validators",
            },
            { link: "/validation/is-standard-schema", text: "Schema Guard" },
            { link: "/validation/handling-errors", text: "Handling Errors" },
          ],
          text: "validation",
        },
        {
          collapsed: true,
          items: [
            { link: "/webhooks", text: "Overview" },
            { link: "/webhooks/getting-started", text: "Getting Started" },
            { link: "/webhooks/guides", text: "Guides" },
            { link: "/webhooks/verification", text: "Verification" },
            { link: "/webhooks/lifecycle-hooks", text: "Lifecycle Hooks" },
            { link: "/webhooks/adapters", text: "Adapters" },
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
