export const siteName = "Zap Studio";
export const siteTitle = "Zap Studio – The higher layer for modern apps";
export const siteDescription =
  "Framework-agnostic TypeScript packages for the features every app needs. Type-safe, tested, zero lock-in.";
export const siteKeywords = [
  "TypeScript",
  "packages",
  "fetch",
  "validation",
  "authorization",
  "permit",
  "Standard Schema",
  "open source",
  "zap studio",
];
const serverSiteUrl = typeof process !== "undefined" ? process.env.SITE_URL : undefined;
const clientSiteUrl = import.meta.env.VITE_SITE_URL;

export const siteUrl = serverSiteUrl ?? clientSiteUrl ?? "https://www.zapstudio.dev";

export function pageTitle(title?: string) {
  return title ? `${title} | ${siteName}` : siteTitle;
}

export function pageMeta(title: string | undefined, description: string, image?: string) {
  return [
    { title: pageTitle(title) },
    { name: "description", content: description },
    { property: "og:title", content: pageTitle(title) },
    { property: "og:description", content: description },
    { property: "twitter:title", content: pageTitle(title) },
    { property: "twitter:description", content: description },
    ...(image
      ? [
          { property: "og:image", content: image },
          { property: "twitter:image", content: image },
        ]
      : []),
  ];
}
