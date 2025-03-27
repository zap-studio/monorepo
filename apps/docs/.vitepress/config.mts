import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Zap.ts ⚡️",
  description: "The boilerplate to build applications as fast as a zap.",
  lang: "en-US",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/docs/introduction/motivation" },
      { text: "Best Practices", link: "/docs/misc/best-practices" },
      {
        text: "The Team",
        link: "/team",
      },
    ],

    search: {
      provider: "local",
    },

    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Why Zap.ts?", link: "/docs/introduction/motivation" },
          { text: "Installation", link: "/docs/introduction/installation" },
          {
            text: "Getting Started",
            link: "/docs/introduction/getting-started",
          },
        ],
      },
      {
        text: "Features & Plugins",
        items: [
          {
            text: "Overview",
            link: "/docs/features/overview",
          },
          { text: "Database", link: "/docs/features/database" },
          { text: "Authentication", link: "/docs/features/authentication" },
          {
            text: "Payments & Subscriptions",
            link: "/docs/features/payments",
          },
          {
            text: "Emails & Notifications",
            link: "/docs/features/notifications",
          },
          {
            text: "Admin Dashboard",
            link: "/docs/features/admin-dashboard",
          },
          {
            text: "UI Components",
            link: "/docs/features/ui",
          },
          {
            text: "State Management",
            link: "/docs/features/state-management",
          },
          {
            text: "API Procedures",
            link: "/docs/features/api",
          },
          {
            text: "Blog & CMS",
            link: "/docs/features/blog",
          },
          {
            text: "AI Features",
            link: "/docs/features/ai",
          },
          {
            text: "Legal Templates",
            link: "/docs/features/legal",
          },
          {
            text: "PWA Support",
            link: "/docs/features/pwa",
          },
          {
            text: "SEO Optimization",
            link: "/docs/features/seo",
          },
        ],
      },
      {
        text: "Deployment",
        items: [
          { text: "Vercel (Recommended)", link: "/docs/deployment/vercel" },
          { text: "Netlify", link: "/docs/deployment/netlify" },
          { text: "Heroku", link: "/docs/deployment/heroku" },
          { text: "AWS", link: "/docs/deployment/aws" },
          {
            text: "Digital Ocean",
            link: "/docs/deployment/digital-ocean",
          },
          {
            text: "Self-Hosted",
            link: "/docs/deployment/self-hosted",
          },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/alexandretrotel/zap.ts" },
      {
        icon: "twitter",
        link: "https://twitter.com/alexandretrotel",
      },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: `Copyright © 2025-present Alexandre Trotel`,
    },

    editLink: {
      pattern: "https://github.com/alexandretrotel/zap.ts-docs/edit/main/:path",
      text: "Edit this page on GitHub",
    },
  },
});
