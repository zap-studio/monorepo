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
  typeof process !== "undefined" && typeof process.env.SITE_URL === "string"
    ? process.env.SITE_URL
    : undefined;
const clientSiteUrl =
  typeof import.meta.env.VITE_SITE_URL === "string"
    ? import.meta.env.VITE_SITE_URL
    : undefined;

export const siteUrl =
  serverSiteUrl ?? clientSiteUrl ?? "https://www.zapstudio.dev";

const pageTitle = (title?: string) =>
  title === undefined ? siteTitle : `${title} | ${siteName}`;

export const pageMeta = (
  title: string | undefined,
  description: string,
  image?: string
) => [
  { title: pageTitle(title) },
  { content: description, name: "description" },
  { content: pageTitle(title), property: "og:title" },
  { content: description, property: "og:description" },
  { content: pageTitle(title), property: "twitter:title" },
  { content: description, property: "twitter:description" },
  ...(image === undefined
    ? []
    : [
        { content: image, property: "og:image" },
        { content: image, property: "twitter:image" },
      ]),
];
