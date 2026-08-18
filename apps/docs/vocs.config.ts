import { defineConfig } from "vocs/config";

const baseUrl = "https://www.zapstudio.dev";
const ogImageUrl = `${baseUrl}/og.png`;
const gettingStarted = "Getting Started";

export default defineConfig({
  accentColor: "light-dark(hsl(38, 92%, 40%), hsl(43, 96%, 56%))",
  baseUrl,
  description: "Type-safe, framework-agnostic and composable TypeScript libraries for the web.",
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
    { link: "/", text: gettingStarted },
    {
      items: [
        {
          collapsed: true,
          items: [
            { link: "/fetch", text: "Overview" },
            { link: "/fetch/getting-started", text: gettingStarted },
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
            { link: "/fetch/logging", text: "Logging" },
            { link: "/fetch/opentelemetry", text: "OpenTelemetry" },
          ],
          text: "fetch",
        },
        {
          collapsed: true,
          items: [
            { link: "/logger", text: "Overview" },
            { link: "/logger/getting-started", text: gettingStarted },
            { link: "/logger/formats", text: "Output Formats" },
            {
              link: "/logger/runtime-compatibility",
              text: "Runtime Compatibility",
            },
            { link: "/logger/opentelemetry", text: "OpenTelemetry" },
          ],
          text: "logger",
        },
        {
          collapsed: true,
          items: [
            { link: "/monads", text: "Overview" },
            { link: "/monads/getting-started", text: gettingStarted },
            { link: "/monads/result", text: "Result" },
            { link: "/monads/result-async", text: "ResultAsync" },
            { link: "/monads/option", text: "Option" },
            { link: "/monads/pipe", text: "Pipe" },
          ],
          text: "monads",
        },
        {
          collapsed: true,
          items: [
            { link: "/permit", text: "Overview" },
            { link: "/permit/getting-started", text: gettingStarted },
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
            { link: "/permit/scaling-policies", text: "Scaling Policies" },
            { link: "/permit/errors", text: "Error Handling" },
            { link: "/permit/logging", text: "Logging" },
            { link: "/permit/opentelemetry", text: "OpenTelemetry" },
          ],
          text: "permit",
        },
        {
          collapsed: true,
          items: [
            { link: "/retry", text: "Overview" },
            { link: "/retry/getting-started", text: gettingStarted },
            {
              items: [
                { link: "/retry/fixed-delay", text: "FixedDelay" },
                { link: "/retry/linear-backoff", text: "LinearBackoff" },
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
            { link: "/retry/jitter", text: "Jitter" },
            { link: "/retry/custom-policies", text: "Custom Policies" },
            { link: "/retry/errors", text: "Structured Errors" },
            { link: "/retry/logging", text: "Logging" },
            { link: "/retry/opentelemetry", text: "OpenTelemetry" },
          ],
          text: "retry",
        },
        {
          collapsed: true,
          items: [
            { link: "/validation", text: "Overview" },
            { link: "/validation/getting-started", text: gettingStarted },
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
            { link: "/webhooks/getting-started", text: gettingStarted },
            { link: "/webhooks/web-api-native", text: "Web API Native" },
            { link: "/webhooks/type-safe-routing", text: "Type-Safe Routing" },
            { link: "/webhooks/standard-schema", text: "Standard Schema" },
            { link: "/webhooks/verification", text: "Verification" },
            { link: "/webhooks/lifecycle-hooks", text: "Lifecycle Hooks" },
            { link: "/webhooks/logging", text: "Logging" },
            { link: "/webhooks/opentelemetry", text: "OpenTelemetry" },
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
    { link: "/logger", text: "logger" },
    { link: "/monads", text: "monads" },
    { link: "/permit", text: "permit" },
    { link: "/retry", text: "retry" },
    { link: "/validation", text: "validation" },
    { link: "/webhooks", text: "webhooks" },
    { link: "https://github.com/zap-studio/monorepo", text: "GitHub" },
  ],
});
