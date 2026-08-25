import { defineConfig } from "vocs/config";

const baseUrl = "https://www.zapstudio.dev";
const ogImageUrl = `${baseUrl}/og.png`;
const gettingStarted = "Getting Started";
const repoUrl = "https://github.com/zap-studio/monorepo";
const description =
  "Type-safe, framework-agnostic and composable TypeScript libraries for the web.";

const sidebar = [
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
          { link: "/oxfmt", text: "Overview" },
          { link: "/oxfmt/getting-started", text: gettingStarted },
          { link: "/oxfmt/presets", text: "Presets" },
        ],
        text: "oxfmt",
      },
      {
        collapsed: true,
        items: [
          { link: "/oxlint", text: "Overview" },
          { link: "/oxlint/getting-started", text: gettingStarted },
          { link: "/oxlint/presets", text: "Presets" },
          { link: "/oxlint/plugins", text: "Plugins" },
          { link: "/oxlint/anti-slop", text: "Anti-Slop Plugin" },
        ],
        text: "oxlint",
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
          { link: "/react-hooks", text: "Overview" },
          { link: "/react-hooks/getting-started", text: gettingStarted },
          { link: "/react-hooks/sensors", text: "Sensors" },
          { link: "/react-hooks/dom", text: "DOM / Element Interaction" },
          { link: "/react-hooks/input", text: "Input" },
          { link: "/react-hooks/media", text: "Media" },
          { link: "/react-hooks/navigation", text: "History & Navigation" },
          { link: "/react-hooks/network", text: "Network" },
          { link: "/react-hooks/pwa", text: "PWA" },
          { link: "/react-hooks/commerce", text: "Commerce" },
          { link: "/react-hooks/lifecycle", text: "Lifecycle" },
          { link: "/react-hooks/state", text: "State" },
          { link: "/react-hooks/debug", text: "Debug / Observability" },
        ],
        // oxlint-disable-next-line sonarjs/no-duplicate-string -- "react-hooks" is the real npm package/route slug; it's expected to repeat across the sidebar, topNav, and JSON-LD package metadata.
        text: "react-hooks",
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
];

export default defineConfig({
  accentColor: "light-dark(hsl(38, 92%, 40%), hsl(43, 96%, 56%))",
  baseUrl,
  description,
  editLink: {
    link: `${repoUrl}/edit/main/apps/docs/src/pages/:path`,
    text: "Edit on GitHub",
  },
  head: (path) => {
    const siteBaseUrl = "https://www.zapstudio.dev";
    const siteRepoUrl = "https://github.com/zap-studio/monorepo";
    const siteName = "Zap Studio";
    const siteDescription =
      "Type-safe, framework-agnostic and composable TypeScript libraries for the web.";
    const schemaContext = "https://schema.org";
    const ldJsonType = "application/ld+json" as const;

    const toScript = (data: unknown) => ({ innerHTML: JSON.stringify(data), type: ldJsonType });

    const getPackages = () => [
      {
        slug: "fetch",
        name: "@zap-studio/fetch",
        version: "2.1.1",
        description:
          "A type-safe fetch wrapper that validates JSON responses at runtime with any Standard Schema validator.",
      },
      {
        slug: "logger",
        name: "@zap-studio/logger",
        version: "2.0.0",
        description: "A lean logging abstraction with a console implementation.",
      },
      {
        slug: "monads",
        name: "@zap-studio/monads",
        version: "1.0.0",
        description:
          "Result/Option types and Rust-style functional combinators for explicit, type-safe error handling.",
      },
      {
        slug: "oxfmt",
        name: "@zap-studio/oxfmt",
        version: "1.0.0",
        description:
          "A decided oxfmt preset for sorted imports, sorted package.json, and optional Tailwind CSS class sorting.",
      },
      {
        slug: "oxlint",
        name: "@zap-studio/oxlint",
        version: "2.2.1",
        description:
          "Exclusive, single-owner oxlint presets — pick exactly the plugins and framework rules your project needs, nothing implied.",
      },
      {
        slug: "permit",
        name: "@zap-studio/permit",
        version: "2.0.0",
        description:
          "A type-safe, declarative authorization library for TypeScript with Standard Schema validation and composable conditions.",
      },
      {
        slug: "react-hooks",
        name: "@zap-studio/react-hooks",
        version: "1.0.0",
        description:
          "Small, focused, tree-shakeable React hooks — one hook, one subpath, no forced bundle.",
      },
      {
        slug: "retry",
        name: "@zap-studio/retry",
        version: "2.1.1",
        description:
          "Composable retry policies with a built-in runner, structured terminal errors, and AbortSignal cancellation.",
      },
      {
        slug: "validation",
        name: "@zap-studio/validation",
        version: "1.1.1",
        description:
          "Standard Schema utilities and ValidationError helpers for one consistent validation flow across schema libraries.",
      },
      {
        slug: "webhooks",
        name: "@zap-studio/webhooks",
        version: "2.0.0",
        description:
          "Schema-first, type-safe webhook routing built on the standard Web API Request and Response primitives, with runtime-agnostic signature verification support.",
      },
    ];

    const buildOrganizationLd = () => ({
      "@type": "Organization",
      address: { "@type": "PostalAddress", addressCountry: "FR" },
      name: siteName,
      url: siteBaseUrl,
      logo: `${siteBaseUrl}/icon.svg`,
      sameAs: ["https://github.com/zap-studio", siteRepoUrl],
    });

    const buildWebsiteLd = () => ({
      "@type": "WebSite",
      name: siteName,
      description: siteDescription,
      url: `${siteBaseUrl}/`,
      inLanguage: "en",
    });

    const buildFaqLd = () => {
      const question = (name: string, text: string) => ({
        "@type": "Question",
        name,
        acceptedAnswer: { "@type": "Answer", text },
      });

      return {
        "@type": "FAQPage",
        mainEntity: [
          question(
            "What is Zap Studio?",
            "Zap Studio is a collection of type-safe, framework-agnostic, composable, and tree-shakeable TypeScript libraries for the web, covering fetch, logging, retries, validation, webhooks, authorization, monads, React hooks, and lint/format presets.",
          ),
          question(
            "Is Zap Studio free and open source?",
            "Yes. Every package is MIT-licensed and published on GitHub and npm at no cost.",
          ),
          question(
            "What packages does Zap Studio provide?",
            "fetch (type-safe fetch wrapper), logger (logging abstraction), monads (Result/Option types), oxfmt and oxlint (format/lint presets), permit (declarative authorization), react-hooks (tree-shakeable hooks), retry (retry policies), validation (Standard Schema utilities), and webhooks (type-safe webhook routing).",
          ),
          question(
            "Which runtimes does Zap Studio support?",
            "All runtime packages ship standard ESM and target Node.js 18+, Bun 1.0+, Deno 1.42+, Cloudflare Workers, and the latest evergreen browsers.",
          ),
          question(
            "How do I install a Zap Studio package?",
            "Install the package you need from npm, e.g. `npm install @zap-studio/fetch`, then follow the getting-started guide for that package on zapstudio.dev.",
          ),
        ],
      };
    };

    const buildPackageLd = (pkg: ReturnType<typeof getPackages>[number]) => ({
      "@type": "SoftwareApplication",
      name: pkg.name,
      description: pkg.description,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Cross-platform",
      softwareVersion: pkg.version,
      url: `${siteBaseUrl}/${pkg.slug}`,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      codeRepository: `${siteRepoUrl}/tree/main/packages/${pkg.slug}`,
      downloadUrl: `https://www.npmjs.com/package/${pkg.name}`,
      license: `${siteRepoUrl}/blob/main/LICENSE`,
    });

    const buildBreadcrumbLd = (segments: string[]) => {
      const itemListElement = segments.map((segment, index) => {
        const cumulativePath = `/${segments.slice(0, index + 1).join("/")}`;
        const name = segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        return {
          "@type": "ListItem",
          position: index + 2,
          name,
          item: `${siteBaseUrl}${cumulativePath}`,
        };
      });

      return {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteBaseUrl}/` },
          ...itemListElement,
        ],
      };
    };

    const graph: unknown[] = [buildOrganizationLd(), buildWebsiteLd()];

    if (path === "/") graph.push(buildFaqLd());

    const pkg = getPackages().find((p) => path === `/${p.slug}` || path.startsWith(`/${p.slug}/`));
    if (pkg) graph.push(buildPackageLd(pkg));

    const segments = path.split("/").filter(Boolean);
    if (segments.length > 0) graph.push(buildBreadcrumbLd(segments));

    const script: { innerHTML: string; type: "application/ld+json" }[] = [
      toScript({ "@context": schemaContext, "@graph": graph }),
    ];

    return {
      meta: {
        ogImageAlt:
          "Zap Studio — type-safe, framework-agnostic and composable TypeScript libraries for the web.",
        ogImageHeight: 630,
        ogImageType: "image/png",
        ogImageWidth: 1200,
      },
      script,
    };
  },
  iconUrl: "/icon.svg",
  logoUrl: { dark: "/logo-dark.svg", light: "/logo-light.svg" },
  ogImageUrl,
  renderStrategy: "full-static",
  sidebar,
  socials: [{ icon: "github", link: repoUrl }],
  title: "Zap Studio",
  topNav: [
    { link: "/fetch", text: "fetch" },
    { link: "/logger", text: "logger" },
    { link: "/monads", text: "monads" },
    { link: "/oxfmt", text: "oxfmt" },
    { link: "/oxlint", text: "oxlint" },
    { link: "/permit", text: "permit" },
    { link: "/react-hooks", text: "react-hooks" },
    { link: "/retry", text: "retry" },
    { link: "/validation", text: "validation" },
    { link: "/webhooks", text: "webhooks" },
    { link: repoUrl, text: "GitHub" },
  ],
});
