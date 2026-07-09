import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";

import { NotFoundComponent } from "@/components/not-found";
import {
  interLatinWghtNormalUrl,
  instrumentSerifLatinItalicUrl,
  instrumentSerifLatinNormalUrl,
} from "@/lib/fonts";
import { siteDescription, siteKeywords, siteTitle, siteUrl } from "@/lib/site";

import appCss from "@/styles/app.css?url";

const RootComponent = () => (
  <html lang="en">
    <head>
      <HeadContent />
    </head>
    <body className="flex min-h-screen flex-col font-sans antialiased">
      <RootProvider>
        <Outlet />
      </RootProvider>
      <Scripts />
    </body>
  </html>
);

export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    links: [
      { href: appCss, rel: "stylesheet" },
      {
        as: "font",
        crossOrigin: "anonymous",
        href: interLatinWghtNormalUrl,
        rel: "preload",
        type: "font/woff2",
      },
      {
        as: "font",
        crossOrigin: "anonymous",
        href: instrumentSerifLatinNormalUrl,
        rel: "preload",
        type: "font/woff2",
      },
      {
        as: "font",
        crossOrigin: "anonymous",
        href: instrumentSerifLatinItalicUrl,
        rel: "preload",
        type: "font/woff2",
      },
      { href: "/site.webmanifest", rel: "manifest" },
      { href: "/web-app-manifest-192x192.png", rel: "icon", type: "image/png" },
      { href: "/web-app-manifest-192x192.png", rel: "apple-touch-icon" },
    ],
    meta: [
      { charSet: "utf-8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      { title: siteTitle },
      { content: siteDescription, name: "description" },
      { content: siteKeywords.join(", "), name: "keywords" },
      {
        content: "#ffffff",
        media: "(prefers-color-scheme: light)",
        name: "theme-color",
      },
      {
        content: "#0a0a0a",
        media: "(prefers-color-scheme: dark)",
        name: "theme-color",
      },
      { content: "website", property: "og:type" },
      { content: "Zap Studio", property: "og:site_name" },
      { content: siteUrl, property: "og:url" },
      { content: siteTitle, property: "og:title" },
      { content: siteDescription, property: "og:description" },
      { content: "summary_large_image", property: "twitter:card" },
      { content: siteTitle, property: "twitter:title" },
      { content: siteDescription, property: "twitter:description" },
      { content: "@zapstudio", property: "twitter:creator" },
    ],
  }),
  notFoundComponent: NotFoundComponent,
});
