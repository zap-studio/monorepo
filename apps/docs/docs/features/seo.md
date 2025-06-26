# SEO Optimization

Zap.ts is designed with SEO best practices in mind, leveraging Next.js features and the [next-sitemap](https://www.npmjs.com/package/next-sitemap) package to help your app _rank higher_ and be _more discoverable_ with (almost) _no effort_.

## Overview

- **Automatic sitemap generation:** Keep search engines up to date with your latest pages.
- **Meta tags & Open Graph:** Easily configure titles, descriptions, and social sharing images.
- **Performance:** Fast load times and optimized assets for better rankings.
- **Robots.txt:** Control which pages are indexed by search engines.
- **Structured data:** Add JSON-LD for rich results.

## Definitions

- **sitemap.xml:** A [sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview) is a file where you provide information about the pages, videos, and other files on your site, and the relationships between them.

- **robots.txt:** A [robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro) file tells search engine crawlers which pages or files they can or can't request from your site. This helps control indexing and crawling behavior.

## How it works?

### 1. Meta Tags & Open Graph

Meta tags and Open Graph data are set up in your `zap.config.ts` and used throughout your app for consistent SEO.

```ts
// zap.config.ts
export const ZAP_DEFAULT_METADATA: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: BASE_URL,
    siteName: APP_NAME,
    images: [
      {
        url: `${BASE_URL}/og.png`,
        width: 1200,
        height: 630,
        alt: `${APP_NAME} Open Graph Image`,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  // ...other SEO fields
};
```

### 2. Sitemap generation with next-sitemap

Zap.ts uses the [next-sitemap](https://www.npmjs.com/package/next-sitemap) package to automatically generate `sitemap.xml` and `robots.txt` files at build time.

The configuration file is located at `next-sitemap.config.js`.

Update the `siteUrl` and other options to match your deployment domain and SEO needs.

Also, `/sitemap.xml` and `/robots.txt` are generated in the public directory at build time so you don't need to do anything.

### 3. Robots.txt

The generated `robots.txt` file controls which pages search engines can crawl and index.

```txt
# Example robots.txt
User-agent: *
Allow: /

Host: your_site_url_here
Sitemap: your_site_url_here/sitemap.xml
Sitemap: your_site_url_here/server-sitemap-index.xml
```

### 4. Structured Data

You can add [JSON-LD](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data) structured data to your pages for rich search results.

Follow the [Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld) for more details. We recommend to use [schema-dts](https://www.npmjs.com/package/schema-dts) for type-safety.
