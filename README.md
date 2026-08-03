# Zap Studio

[![CI](https://github.com/zap-studio/monorepo/actions/workflows/ci.yml/badge.svg)](https://github.com/zap-studio/monorepo/actions/workflows/ci.yml) [![codecov](https://codecov.io/gh/zap-studio/monorepo/graph/badge.svg?branch=main)](https://codecov.io/gh/zap-studio/monorepo) [![License](https://img.shields.io/github/license/zap-studio/monorepo)](https://github.com/zap-studio/monorepo/blob/main/LICENSE)

Type-safe, framework-agnostic and composable TypeScript libraries for the web.

Documentation: [zapstudio.dev](https://www.zapstudio.dev)

## Packages

| Package | Description | Badges |
| --- | --- | --- |
| `@zap-studio/fetch` | Type-safe fetch wrapper with runtime schema validation | [![npm](https://img.shields.io/npm/v/%40zap-studio%2Ffetch?label=npm)](https://www.npmjs.com/package/@zap-studio/fetch) [![jsr](https://img.shields.io/jsr/v/%40zap-studio%2Ffetch?label=jsr)](https://jsr.io/@zap-studio/fetch) [![downloads](https://img.shields.io/npm/dm/%40zap-studio%2Ffetch?label=downloads)](https://www.npmjs.com/package/@zap-studio/fetch) [![bundle size](https://img.shields.io/bundlephobia/minzip/%40zap-studio%2Ffetch?label=size)](https://bundlephobia.com/package/@zap-studio/fetch) |
| `@zap-studio/permit` | Declarative authorization policies with Standard Schema support | [![npm](https://img.shields.io/npm/v/%40zap-studio%2Fpermit?label=npm)](https://www.npmjs.com/package/@zap-studio/permit) [![jsr](https://img.shields.io/jsr/v/%40zap-studio%2Fpermit?label=jsr)](https://jsr.io/@zap-studio/permit) [![downloads](https://img.shields.io/npm/dm/%40zap-studio%2Fpermit?label=downloads)](https://www.npmjs.com/package/@zap-studio/permit) [![bundle size](https://img.shields.io/bundlephobia/minzip/%40zap-studio%2Fpermit?label=size)](https://bundlephobia.com/package/@zap-studio/permit) |
| `@zap-studio/retry` | Composable retry policies with fixed and exponential backoff | [![npm](https://img.shields.io/npm/v/%40zap-studio%2Fretry?label=npm)](https://www.npmjs.com/package/@zap-studio/retry) [![jsr](https://img.shields.io/jsr/v/%40zap-studio%2Fretry?label=jsr)](https://jsr.io/@zap-studio/retry) [![downloads](https://img.shields.io/npm/dm/%40zap-studio%2Fretry?label=downloads)](https://www.npmjs.com/package/@zap-studio/retry) [![bundle size](https://img.shields.io/bundlephobia/minzip/%40zap-studio%2Fretry?label=size)](https://bundlephobia.com/package/@zap-studio/retry) |
| `@zap-studio/validation` | Standard Schema utilities and `ValidationError` helpers | [![npm](https://img.shields.io/npm/v/%40zap-studio%2Fvalidation?label=npm)](https://www.npmjs.com/package/@zap-studio/validation) [![jsr](https://img.shields.io/jsr/v/%40zap-studio%2Fvalidation?label=jsr)](https://jsr.io/@zap-studio/validation) [![downloads](https://img.shields.io/npm/dm/%40zap-studio%2Fvalidation?label=downloads)](https://www.npmjs.com/package/@zap-studio/validation) [![bundle size](https://img.shields.io/bundlephobia/minzip/%40zap-studio%2Fvalidation?label=size)](https://bundlephobia.com/package/@zap-studio/validation) |
| `@zap-studio/webhooks` | Type-safe webhook router with verification and lifecycle hooks | [![npm](https://img.shields.io/npm/v/%40zap-studio%2Fwebhooks?label=npm)](https://www.npmjs.com/package/@zap-studio/webhooks) [![jsr](https://img.shields.io/jsr/v/%40zap-studio%2Fwebhooks?label=jsr)](https://jsr.io/@zap-studio/webhooks) [![downloads](https://img.shields.io/npm/dm/%40zap-studio%2Fwebhooks?label=downloads)](https://www.npmjs.com/package/@zap-studio/webhooks) [![bundle size](https://img.shields.io/bundlephobia/minzip/%40zap-studio%2Fwebhooks?label=size)](https://bundlephobia.com/package/@zap-studio/webhooks) |

## Runtime Support

All packages ship standard ESM and target Node.js >= 18, Bun >= 1.0, Deno >= 1.42, Cloudflare Workers, and the latest evergreen browsers. See the [documentation](https://www.zapstudio.dev) for package-specific details.
