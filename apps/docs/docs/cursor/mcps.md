# Model Context Protocols (MCPs)

[MCP (Model Context Protocol)](https://docs.cursor.com/context/model-context-protocol) allows **Cursor** to connect AI directly to your services—whether it’s _GitHub for pull requests_, _Supabase for databases_, or _PostHog for analytics_.

This turns the LLM from a passive assistant into an **active agent** that can interact with APIs, services, or CLIs.

## Built-In MCPs

**Zap.ts** comes preconfigured with the most commonly used services to save you setup time. These are defined in the `.cursor/mcp.json` file and require minimal configuration.

Here are the built-in MCPs:

* [ElevenLabs](https://www.elevenlabs.io) — Use realistic text-to-speech directly from your IDE.
* [Firecrawl](https://firecrawl.dev) — Crawl and extract structured data from websites.
* [GitHub](https://github.com) — Automate PRs, issues, and more.
* [Magic by 21st.dev](https://21st.dev/magic) — Secure authentication with a few lines of code.
* [Neon](https://neon.tech) — A modern Postgres platform, optimized for serverless.
* [Notion](https://www.notion.com) — Read and write structured Notion content via the API.
* [Perplexity](https://www.perplexity.ai) — Ask factual questions via API.
* [PostHog](https://posthog.com) — Analyze events, user sessions, and feature flags.
* [Resend](https://resend.com) — Send transactional emails with ease.
* [Sentry](https://sentry.io) — Monitor and manage application errors from inside Cursor.
* [Supabase](https://supabase.com) — Query and mutate your database directly.

:::tip Environment Setup

Many of these integrations rely on **environment variables** for API keys or tokens.

All MCP-related variables follow a naming convention: they are **prefixed with `MCP_`**.

Make sure to define them in your local `.env` file or shell environment.

**Example:**

```txt
MCP_POSTHOG_AUTH_HEADER=Bearer your_posthog_token
MCP_SUPABASE_ACCESS_TOKEN=your_supabase_token
```

:::