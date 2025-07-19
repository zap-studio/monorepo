# Blog

Zap.ts includes a powerful blog system built with [MDX](https://nextjs.org/docs/app/guides/mdx) that allows you to write content in Markdown while using React components.

The blog is optimized for SEO with automatic Open Graph image generation and structured data.

## Overview

- **Custom Components:** Reusable React components for enhanced content
- **MDX Support:** Write content in Markdown with embedded React components
- **Performance:** Server-side rendered with optimized loading
- **SEO Optimized:** Automatic Open Graph images and JSON-LD structured data
- **Type Safety:** Zod schemas for blog post metadata validation

## How it works

The blog system uses the same MDX infrastructure as the legal pages, providing a consistent content management experience.

Blog posts are stored as `.mdx` files in the `src/blog/` directory and are automatically processed at build time.

### File Structure

```
src/
├── blog/                    # Blog posts (MDX files)
│   ├── my-first-post.mdx
│   └── another-post.mdx
├── zap/
│   ├── components/blog/     # Blog-specific components
│   │   └── mdx.tsx         # MDX component configuration
│   └── lib/blog/
│       └── utils.ts        # Blog utilities and data fetching
```

## Adding a Blog Post

To create a new blog post, add a `.mdx` file to the `src/blog/` directory with the required frontmatter:

```mdx
---
title: "Your Blog Post Title"
description: "A brief description of your blog post for SEO and previews"
date: "2025-01-15"
author: "Your Name"
image: "https://example.com/featured-image.jpg"  # Optional
---

# Your Blog Post Title

Your content goes here in Markdown format...

## You can use all Markdown features

- Lists
- **Bold text**
- *Italic text*
- [Links](https://example.com)

### Code blocks

```javascript
console.log("Hello, world!");
```

## Post Metadata

### Required Metadata

The frontmatter must include these fields (validated by Zod):

- **`title`** (string): The post title
- **`description`** (string): SEO description and preview text
- **`date`** (string): Publication date in ISO format

### Optional Metadata

- **`author`** (string): Author name
- **`image`** (string): Featured image URL for Open Graph

## SEO Optimization

The blog system includes comprehensive SEO features:

### 1. Open Graph Images

Each blog post automatically generates Open Graph images using the post title. The system uses the `/opengraph-image` route to create dynamic social media previews.

```tsx
// Automatically generated for each post
image: `${BASE_URL}/opengraph-image?title=${post.metadata.title}`
```

### 2. JSON-LD Structured Data

Blog posts include structured data for better search engine understanding:

```tsx
const jsonLd: WithContext<BlogPosting> = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.metadata.title,
  datePublished: post.metadata.date,
  dateModified: post.metadata.date,
  description: post.metadata.description,
  image: post.metadata.image || `${BASE_URL}/opengraph-image?title=${post.metadata.title}`,
  url: `${BASE_URL}/blog/${post.slug}`,
  author: {
    "@type": "Person",
    name: post.metadata.author,
  },
};
```

### 3. Meta Tags

Each post includes proper meta tags for:
- Page title and description
- Open Graph data
- Twitter Card data
- Canonical URLs

## Custom Components

The blog system includes several pre-built components you can use in your MDX files:

### Available Components

- **`<Callout>`**: Info, warning, and error callouts
- **`<YouTube>`**: Embedded YouTube videos
- **`<Table>`**: Data tables with headers and rows
- **`<Image>`**: Optimized images with Next.js Image component

### Using Custom Components

```mdx
---
title: "Example Post"
description: "A post demonstrating custom components"
date: "2025-01-15"
---

# Example Post

<Callout type="info" text="This is an informational callout." />

<Callout type="warning" text="This is a warning callout." />

<Callout type="error" text="This is an error callout." />

<YouTube id="D1GXeSgCn30" />

<Table
  data={{
    headers: ["Feature", "Status"],
    rows: [
      ["MDX Support", "✅"],
      ["SEO Optimization", "✅"],
      ["Custom Components", "✅"],
    ],
  }}
/>
```

### Adding Your Own Components

To add custom components for use in MDX files:

1. **Create your component** in `src/zap/components/blog/`:

```tsx
// src/zap/components/blog/my-component.tsx
export function MyComponent({ text }: { text: string }) {
  return (
    <div className="my-4 p-4 bg-blue-50 border-l-4 border-blue-500">
      {text}
    </div>
  );
}
```

2. **Add it to the MDX components** in `src/zap/components/blog/mdx.tsx`:

```tsx
import { MyComponent } from './my-component';

const components = {
  // ... existing components
  MyComponent,
};
```

3. **Use it in your MDX files**:

```mdx
<MyComponent text="This is my custom component!" />
```

## The Blog Page

The blog page (`/blog`) automatically displays all published posts with:

- Publication date (formatted with relative time)
- Post title and description
- Hover effects and proper linking
- Responsive design

## Tips

- **Use descriptive titles** that work well for both SEO and social sharing
- **Include relevant keywords** in your descriptions for better search visibility
- **Optimize images** before adding them to your posts
- **Test your custom components** thoroughly before publishing
- **Keep your content up to date** and regularly publish new posts
