const siteName = "Zap Studio";
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
const serverSiteUrl =
  typeof process !== "undefined" ? process.env.SITE_URL : undefined;
const clientSiteUrl = import.meta.env.VITE_SITE_URL;

export const siteUrl =
  serverSiteUrl ?? clientSiteUrl ?? "https://www.zapstudio.dev";

function pageTitle(title?: string) {
  return title ? `${title} | ${siteName}` : siteTitle;
}

export function pageMeta(
  title: string | undefined,
  description: string,
  image?: string
) {
  return [
    { title: pageTitle(title) },
    { content: description, name: "description" },
    { content: pageTitle(title), property: "og:title" },
    { content: description, property: "og:description" },
    { content: pageTitle(title), property: "twitter:title" },
    { content: description, property: "twitter:description" },
    ...(image
      ? [
          { content: image, property: "og:image" },
          { content: image, property: "twitter:image" },
        ]
      : []),
  ];
}
