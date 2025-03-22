# SEO Optimization

SEO (Search Engine Optimization) helps your website show up better on search engines like Google. Zap.ts makes SEO easy by including the `next-sitemap` package by default. This package automatically creates important files like `robots.txt` and `sitemaps.xml` for your site. In this guide, we’ll show you how to set up and customize SEO in Zap.ts.

## What is `next-sitemap`?

`next-sitemap` is a tool that helps your Next.js app with SEO. It does two main things:

- Creates a `sitemaps.xml` file: This file tells search engines about all the pages on your site so they can index them.
- Creates a `robots.txt` file: This file tells search engines which pages they can or cannot look at.

Zap.ts includes `next-sitemap` by default, so you don’t need to install it yourself. It’s already set up to work when you build your app!

To learn more about `next-sitemap`, check out the [official `next-sitemap` documentation](https://github.com/iamvishnusankar/next-sitemap).

## Set Up Your `SITE_URL`

To make `next-sitemap` work correctly, you need to tell it the URL of your website. This is called the `SITE_URL`. You set this in your `.env.local` file, and `next-sitemap` will use it to create the right links in your `sitemaps.xml` file.

### Step 1: Open `.env.local`

Open the `.env.local` file in the root of your Zap.ts project. If you don’t have this file yet, it will be created when you run `bun run zap:init`.

### Step 2: Add or Update `SITE_URL`

Look for a line that says:

```
SITE_URL=your_site_url_here
```

If it’s not there, add it. Replace `your_site_url_here` with your actual website URL. For example, if your site is live at `https://myawesomeapp.com`, set it like this:

```
SITE_URL=https://myawesomeapp.com
```

If you’re still working on your app locally, you can use a placeholder URL like `https://example.com`. You can change it later when your site goes live.

### Step 3: Check the `next-sitemap` Config

Zap.ts includes a `next-sitemap.config.js` file in the root of your project. This file tells `next-sitemap` how to work. Here’s what it looks like by default:

```javascript
// next-sitemap.config.js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://example.com",
  generateRobotsTxt: true, // Creates a robots.txt file
  // Add more options here if needed
};
```

- `siteUrl`: This uses the `SITE_URL` from your `.env.local`. If `SITE_URL` is not set, it falls back to `https://example.com`.
- `generateRobotsTxt: true`: This tells `next-sitemap` to create a `robots.txt` file.

You don’t need to change this file unless you want to add more options. For example, you can exclude certain pages from your sitemap by adding an `exclude` option:

```javascript
module.exports = {
  siteUrl: process.env.SITE_URL || "https://example.com",
  generateRobotsTxt: true,
  exclude: ["/admin/*"], // Don’t include admin pages in the sitemap
};
```

Check the [next-sitemap docs](https://github.com/iamvishnusankar/next-sitemap#configuration-options) for more options.

## How It Works in Zap.ts

When you build your Zap.ts app with `bun run build`, `next-sitemap` automatically runs and creates the `robots.txt` and `sitemaps.xml` files. These files are saved in the `public/` folder of your project, and Next.js serves them at:

- `https://your-site.com/robots.txt`
- `https://your-site.com/sitemaps.xml`

Search engines like Google will find these files and use them to understand your site better.

### Example

Let’s say your `SITE_URL` is `https://myawesomeapp.com`. After running `bun run build`, your `sitemaps.xml` might look like this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://myawesomeapp.com/</loc>
    <lastmod>2025-03-21</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://myawesomeapp.com/about</loc>
    <lastmod>2025-03-21</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

And your `robots.txt` might look like this:

```
User-agent: *
Disallow: /admin/
Sitemap: https://myawesomeapp.com/sitemaps.xml
```

## Extra SEO Tips for Zap.ts

Here are some more ways to improve your SEO in Zap.ts:

### 1. Add Meta Tags to Your Pages

Meta tags help search engines understand what your pages are about. In Zap.ts, we use the Next.js App Router, so you add meta tags using a `metadata` object in your page files. This is the modern way to set things like the page title, description, and other SEO settings.

#### Example: Add Meta Tags to Your Homepage

In `src/app/page.tsx`, add a `metadata` object to set the title, description, and other SEO tags for your homepage:

```typescript
// src/app/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Awesome App",
  description: "This is my awesome app built with Zap.ts!",
  keywords: ["zap.ts", "next.js", "seo"],
  robots: { index: true, follow: true },
};

export default function Home() {
  return (
    <div>
      <h1>Welcome to My Awesome App</h1>
      <p>This is the homepage.</p>
    </div>
  );
}
```

- `title`: The title of your page (shows up in search results and browser tabs).
- `description`: A short description of your page (shows up in search results).
- `keywords`: Keywords related to your page (optional, less important now but still useful).
- `robots`: Tells search engines if they can index the page (`index: true`) and follow links (`follow: true`).

#### Example: Dynamic Meta Tags for a Blog Post

If you have dynamic pages (like a blog post), you can use the `generateMetadata` function to set meta tags based on the page’s data. For example, in `src/app/blog/[slug]/page.tsx`:

```typescript
// src/app/blog/[slug]/page.tsx
import type { Metadata } from "next";

// Fake function to get blog post data (replace with your actual data fetching)
async function getPost(slug: string) {
  return {
    title: `Blog Post: ${slug}`,
    description: `This is a blog post about ${slug}.`,
  };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.description,
    keywords: ["blog", params.slug, "zap.ts"],
    robots: { index: true, follow: true },
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug); // Fetch the post data again for rendering
  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.description}</p>
    </div>
  );
}
```

- `generateMetadata`: A special function in Next.js App Router that lets you create meta tags dynamically.
- `params.slug`: Gets the `slug` from the URL (e.g., if the URL is `/blog/my-post`, `slug` is `my-post`).
- The meta tags change based on the blog post’s data.

::: tip
You can add more metadata like `openGraph` for social media sharing. Check the [Next.js Metadata docs](https://nextjs.org/docs/app/api-reference/file-conventions/metadata) for more options!
:::

### 2. Use Dynamic Sitemaps (Optional)

If your site has dynamic pages (like blog posts), you can tell `next-sitemap` to include them. Add a `transform` function to your `next-sitemap.config.js`:

```javascript
module.exports = {
  siteUrl: process.env.SITE_URL || "https://example.com",
  generateRobotsTxt: true,
  transform: async (config, path) => {
    // Add custom logic for dynamic pages
    if (path.startsWith("/blog/")) {
      return {
        loc: path,
        changefreq: "weekly",
        priority: 0.7,
        lastmod: new Date().toISOString(),
      };
    }
    return {
      loc: path,
      changefreq: "daily",
      priority: 0.8,
      lastmod: new Date().toISOString(),
    };
  },
};
```

This example sets a different priority and change frequency for blog pages.

### 3. Test Your SEO Setup

After building your app, test your `robots.txt` and `sitemaps.xml` files:

- Open `https://your-site.com/robots.txt` in your browser.
- Open `https://your-site.com/sitemaps.xml` in your browser.
- Use a tool like [Google Search Console](https://search.google.com/search-console) to submit your sitemap to Google.

## Next Steps

Now that your SEO is set up, you can:

- Build your app with `bun run build` to generate the SEO files.
- Deploy your app and test your SEO setup.
- Add more meta tags to your pages for better search results.
- Check the [next-sitemap docs](https://github.com/iamvishnusankar/next-sitemap) for advanced features.

If you need help, ask on [X](https://www.x.com/alexandretrotel/). Happy optimizing! ⚡
