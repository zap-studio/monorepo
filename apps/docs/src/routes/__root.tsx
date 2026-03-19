import { HeadContent, Link, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import appCss from "@/styles/global.css?url";
import {
  interLatinWghtNormalUrl,
  instrumentSerifLatinItalicUrl,
  instrumentSerifLatinNormalUrl,
} from "@/lib/fonts";
import { siteDescription, siteKeywords, siteTitle, siteUrl } from "@/lib/site";

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

function NotFoundComponent(): ReactNode {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-fd-muted-foreground text-xs uppercase tracking-[0.2em]">404</p>
      <h1 className="font-serif text-4xl">Page not found</h1>
      <p className="max-w-md text-fd-muted-foreground text-sm leading-7">
        The page you requested does not exist or has moved.
      </p>
      <Link
        className="inline-flex items-center justify-center rounded-md border border-fd-primary/80 bg-fd-primary px-5 py-2.5 font-medium text-fd-primary-foreground text-sm"
        to="/"
      >
        Go home
      </Link>
    </main>
  );
}
