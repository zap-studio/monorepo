import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";

import { NotFoundComponent } from "@/components/not-found";
import {
  interLatinWghtNormalUrl,
  instrumentSerifLatinItalicUrl,
  instrumentSerifLatinNormalUrl,
} from "@/lib/fonts";
import { siteDescription, siteKeywords, siteTitle, siteUrl } from "@/lib/site";

import appCss from "@/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: siteTitle },
      { name: "description", content: siteDescription },
      { name: "keywords", content: siteKeywords.join(", ") },
      { name: "theme-color", media: "(prefers-color-scheme: light)", content: "#ffffff" },
      { name: "theme-color", media: "(prefers-color-scheme: dark)", content: "#0a0a0a" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Zap Studio" },
      { property: "og:url", content: siteUrl },
      { property: "og:title", content: siteTitle },
      { property: "og:description", content: siteDescription },
      { property: "twitter:card", content: "summary_large_image" },
      { property: "twitter:title", content: siteTitle },
      { property: "twitter:description", content: siteDescription },
      { property: "twitter:creator", content: "@zapstudio" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preload",
        href: interLatinWghtNormalUrl,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: instrumentSerifLatinNormalUrl,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: instrumentSerifLatinItalicUrl,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "icon", href: "/web-app-manifest-192x192.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/web-app-manifest-192x192.png" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
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
}
