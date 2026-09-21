# zap.ts docs — page to source mapping

Source root: `../../../zap.ts` (sibling clone of the zap.ts starter kit).
Every page below names the files that must be read before it is written.
No page states an API, env var, script or path that is not in its sources.

Batch column: `inline` = written in the main session; `agent` = delegated
to a subagent with the template page and the source paths.

## Top level

| Page | Sources | Batch |
| --- | --- | --- |
| `index.mdx` | `README.md`, `LICENSE.md`, `package.json` | inline |
| `quickstart.mdx` | `README.md`, `docker-compose.yml`, root `package.json` scripts | inline |
| `tech-stack.mdx` | `pnpm-workspace.yaml` catalog, every `packages/*/package.json` | inline |
| `project-structure.mdx` | `pnpm-workspace.yaml`, `apps/`, `packages/`, `tooling/` trees | inline |
| `troubleshooting.mdx` | `docker-compose.yml`, `.env.schema`, `AGENTS.md` | inline |

## `concepts/`

| Page | Sources | Batch |
| --- | --- | --- |
| `effect.mdx` | `packages/database/src`, `packages/mail/src/index.ts`, `packages/storage/src/index.ts` | inline |
| `conventions.mdx` | `AGENTS.md`, `oxlint.config.ts`, `oxfmt.config.ts`, `lefthook.yml` | inline |

## `guides/`

| Page | Sources | Batch |
| --- | --- | --- |
| `local-development.mdx` | `docker-compose.yml`, `README.md`, root scripts | inline |
| `environment.mdx` | `.env.schema`, `apps/*/.env.schema`, `packages/environment` | inline |
| `dependencies.mdx` | `pnpm-workspace.yaml`, `AGENTS.md` dependencies section | inline |
| `adding-a-package.mdx` | `tooling/tsconfig`, an existing small package as the model | inline |
| `testing.mdx` | `vitest.config.ts`, `tooling/testing/src/database.ts`, `apps/web` e2e | inline |
| `internationalization.mdx` | `apps/web` + `apps/marketing` `project.inlang`, `i18n:compile` script | inline |
| `deployment.mdx` | every `apps/*/wrangler.jsonc`, `deploy:*` root scripts | inline |
| `going-to-production.mdx` | all `.env.schema` files, `packages/billing/src/mode.ts` | inline |
| `agents.mdx` | `AGENTS.md`, `CLAUDE.md` | inline |

## `apps/`

| Page | Sources | Batch |
| --- | --- | --- |
| `web.mdx` | `apps/web/**` | agent A |
| `marketing.mdx` | `apps/marketing/**` | agent A |
| `admin.mdx` | `apps/admin/**` | agent A |
| `api.mdx` | `apps/api/**` | agent B |
| `emails.mdx` | `apps/emails/**` | agent B |
| `docs.mdx` | `apps/docs/**` | agent B |

## `packages/`

| Page | Sources | Batch |
| --- | --- | --- |
| `database.mdx` | `packages/database/**` | agent C |
| `authentication.mdx` | `packages/authentication/**` | agent C |
| `authorization.mdx` | `packages/authorization/**` | agent C |
| `billing.mdx` | `packages/billing/**` (8 providers) | template, inline |
| `mail.mdx` | `packages/mail/**`, `apps/emails` | agent D |
| `storage.mdx` | `packages/storage/**` | agent D |
| `queues.mdx` | `packages/queues`, `queues-cloudflare`, `queues-vercel` | agent D |
| `ai.mdx` | `packages/ai/**` | agent E |
| `analytics.mdx` | `packages/analytics/**` | agent E |
| `flags.mdx` | `packages/flags/**` | agent E |
| `observability.mdx` | `packages/observability/**` | agent F |
| `environment.mdx` | `packages/environment/**` | agent F |
| `ui.mdx` | `packages/ui/**` | agent F |
| `tanstack-start.mdx` | `packages/tanstack-start/**` | agent F |

## `recipes/`

| Page | Sources | Batch |
| --- | --- | --- |
| `add-a-feature.mdx` | `packages/database/src/schema`, `apps/api`, `apps/web` | inline |
| `custom-oauth-provider.mdx` | `packages/authentication/src/auth.ts` | inline |
| `swap-a-provider.mdx` | `packages/billing/src/*`, `packages/storage`, `packages/mail` | inline |
| `self-host.mdx` | `docker-compose.yml`, `.env.schema` | inline |

## Counts

39 pages. 20 delegated across 6 agent batches, 19 inline.

## Known source drift to resolve while writing

- `AGENTS.md` says `createTestDatabase()` comes from `@zap-ts/test-database`.
  The real package is `@zap-ts/testing`, export `./database`. Docs follow the
  code; `AGENTS.md` needs a separate fix in the zap.ts repo.

## Routing

Section folders are plain directories, not route groups. A parenthesised
folder is stripped from the URL, which would collide `guides/environment`
with `packages/environment`. Plain folders namespace them:

- `content/guides/testing.mdx` -> `/guides/testing`
- `content/packages/billing.mdx` -> `/packages/billing`
- `content/apps/web.mdx` -> `/apps/web`
