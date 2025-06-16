import { defineConfig } from "vitepress";
import llmstxt from "vitepress-plugin-llms";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	vite: {
		plugins: [llmstxt()],
	},
	title: "Zap.ts ⚡️",
	description: "Build applications as fast as a zap.",
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
				text: "Discussions",
				link: "https://github.com/alexandretrotel/zap.ts/discussions",
				target: "_blank",
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
				text: "Features",
				items: [
					{
						text: "Overview",
						link: "/docs/features/overview",
					},
					{
						text: "Admin Dashboard",
						link: "/docs/features/admin-dashboard",
					},
					{
						text: "Analytics",
						link: "/docs/features/analytics",
					},
					{ text: "Authentication", link: "/docs/features/authentication" },
					{
						text: "Blog & CMS",
						link: "/docs/features/blog",
					},
					{ text: "Database", link: "/docs/features/database" },
					{
						text: "Error Handling",
						link: "/docs/features/error-handling",
					},
					{
						text: "File Storage",
						link: "/docs/features/file-storage",
					},
					{
						text: "Internationalization",
						link: "/docs/features/internationalization",
					},
					{
						text: "Large Language Models (LLMs)",
						link: "/docs/features/llms",
					},
					{
						text: "Legal Pages",
						link: "/docs/features/legal",
					},
					{
						text: "Notifications & Emails",
						link: "/docs/features/notifications",
					},
					{
						text: "Payments & Subscriptions",
						link: "/docs/features/payments",
					},
					{
						text: "Progressive Web App (PWA)",
						link: "/docs/features/pwa",
					},
					{
						text: "SEO Optimization",
						link: "/docs/features/seo",
					},
					{
						text: "State Management",
						link: "/docs/features/state-management",
					},
					{
						text: "Type-Safe API",
						link: "/docs/features/api",
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
				icon: "x",
				link: "https://x.com/alexandretrotel",
			},
		],

		footer: {
			message: "Released under the MIT License.",
			copyright: `Copyright © 2025-present Alexandre Trotel`,
		},

		editLink: {
			pattern:
				"https://github.com/alexandretrotel/zap.ts/edit/main/apps/docs/:path",
			text: "Edit this page on GitHub",
		},
	},
});
