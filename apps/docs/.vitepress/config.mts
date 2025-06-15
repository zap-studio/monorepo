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
				text: "Contributors",
				link: "/contributors",
			},
			{
				text: "Demo",
				link: "https://demo.zap-ts.alexandretrotel.org",
				target: "_blank",
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
					{ text: "Deployment", link: "/docs/introduction/deployment" },
				],
			},
			{
				text: "Concepts",
				items: [
					{
						text: "Overview",
						link: "/docs/concepts/overview",
					},
					{
						text: "Admin Dashboard",
						link: "/docs/concepts/admin-dashboard",
					},
					{
						text: "AI Features",
						link: "/docs/concepts/ai",
					},
					{
						text: "Analytics",
						link: "/docs/concepts/analytics",
					},
					{
						text: "API Procedures",
						link: "/docs/concepts/api",
					},
					{ text: "Authentication", link: "/docs/concepts/authentication" },
					{
						text: "Blog & CMS",
						link: "/docs/concepts/blog",
					},
					{ text: "Database", link: "/docs/concepts/database" },
					{
						text: "Internationalization",
						link: "/docs/concepts/internationalization",
					},
					{
						text: "Legal Pages",
						link: "/docs/concepts/legal",
					},
					{
						text: "Notifications & Emails",
						link: "/docs/concepts/notifications",
					},
					{
						text: "Payments & Subscriptions",
						link: "/docs/concepts/payments",
					},
					{
						text: "Progressive Web App (PWA)",
						link: "/docs/concepts/pwa",
					},
					{
						text: "SEO Optimization",
						link: "/docs/concepts/seo",
					},
					{
						text: "State Management",
						link: "/docs/concepts/state-management",
					},
				],
			},
			{
				text: "Cursor IDE",
				items: [
					{
						text: "Overview",
						link: "/docs/cursor/overview",
					},
					{
						text: "Custom Rules",
						link: "/docs/cursor/custom-rules",
					},
					{
						text: "Model Context Protocols (MCPs)",
						link: "/docs/cursor/mcps",
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
