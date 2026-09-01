/**
 * Presets for env vars that a hosting platform sets automatically. Add one
 * to a `createEnvironment` call with `extends`, to type and check a platform's
 * vars along with your own app's vars.
 *
 * Every preset key is optional, with type `string | undefined`. These vars
 * are only present when the app runs on that platform. This package never
 * reads or parses files, so it cannot detect the platform by itself — you
 * choose which presets to use.
 *
 * @module @zap-studio/env/presets
 */

import type { StandardSchemaV1 } from "@zap-studio/validation";

import type { EnvironmentSchema, EnvironmentVariableSchemaMap } from "./types.ts";

/**
 * A Standard Schema that accepts any value, turns it into a `string`, and
 * lets `undefined` pass through unchanged. Platform-set vars are always
 * plain strings when present; presets never check for a specific format,
 * since platforms only promise "some string".
 */
const optionalString = (): StandardSchemaV1<string | undefined, string | undefined> => ({
  "~standard": {
    validate: (value: unknown) => {
      if (value === undefined) {
        // oxlint-disable-next-line sonarjs/no-undefined-assignment -- Standard Schema's `SuccessResult.value` has the schema's `Output` type (here `string | undefined`). `undefined` is a valid "absent" output here, not a mistake.
        return { value: undefined };
      }
      if (typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
        return { value: String(value) };
      }
      return { issues: [{ message: "Expected a string, number, boolean, or undefined." }] };
    },
    vendor: "@zap-studio/env",
    version: 1,
  },
});

const toEnvironmentVariableSchemas = (keys: readonly string[]): EnvironmentVariableSchemaMap => {
  const schemas: EnvironmentVariableSchemaMap = {};
  for (const key of keys) {
    schemas[key] = optionalString();
  }
  return schemas;
};

const preset = (keys: readonly string[]): EnvironmentSchema => ({
  shared: toEnvironmentVariableSchemas(keys),
});

/**
 * Vercel's system environment variables.
 *
 * @see https://vercel.com/docs/environment-variables/system-environment-variables
 */
export const vercel: EnvironmentSchema = preset([
  "VERCEL",
  "VERCEL_ENV",
  "VERCEL_TARGET_ENV",
  "VERCEL_URL",
  "VERCEL_BRANCH_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_REGION",
  "VERCEL_DEPLOYMENT_ID",
  "VERCEL_PROJECT_ID",
  "VERCEL_GIT_PROVIDER",
  "VERCEL_GIT_REPO_SLUG",
  "VERCEL_GIT_REPO_OWNER",
  "VERCEL_GIT_REPO_ID",
  "VERCEL_GIT_COMMIT_REF",
  "VERCEL_GIT_COMMIT_SHA",
  "VERCEL_GIT_COMMIT_MESSAGE",
  "VERCEL_GIT_COMMIT_AUTHOR_LOGIN",
  "VERCEL_GIT_COMMIT_AUTHOR_NAME",
  "VERCEL_GIT_PULL_REQUEST_ID",
]);

/**
 * Netlify's read-only build environment variables.
 *
 * @see https://docs.netlify.com/build/configure-builds/environment-variables/
 */
export const netlify: EnvironmentSchema = preset([
  "NETLIFY",
  "BUILD_ID",
  "CONTEXT",
  "URL",
  "DEPLOY_URL",
  "DEPLOY_PRIME_URL",
  "DEPLOY_ID",
  "SITE_ID",
  "SITE_NAME",
  "REPOSITORY_URL",
  "BRANCH",
  "HEAD",
  "COMMIT_REF",
  "PULL_REQUEST",
  "REVIEW_ID",
]);

/**
 * Render's default environment variables.
 *
 * @see https://render.com/docs/environment-variables
 */
export const render: EnvironmentSchema = preset([
  "RENDER",
  "RENDER_SERVICE_ID",
  "RENDER_SERVICE_NAME",
  "RENDER_SERVICE_TYPE",
  "RENDER_INSTANCE_ID",
  "RENDER_EXTERNAL_URL",
  "RENDER_EXTERNAL_HOSTNAME",
  "RENDER_GIT_COMMIT",
  "RENDER_GIT_BRANCH",
  "RENDER_GIT_REPO_SLUG",
  "RENDER_DISCOVERY_SERVICE",
]);

/**
 * Railway's system environment variables.
 *
 * @see https://docs.railway.com/variables/reference
 */
export const railway: EnvironmentSchema = preset([
  "RAILWAY_PUBLIC_DOMAIN",
  "RAILWAY_PRIVATE_DOMAIN",
  "RAILWAY_PROJECT_NAME",
  "RAILWAY_PROJECT_ID",
  "RAILWAY_ENVIRONMENT_NAME",
  "RAILWAY_ENVIRONMENT_ID",
  "RAILWAY_SERVICE_NAME",
  "RAILWAY_SERVICE_ID",
  "RAILWAY_REPLICA_ID",
  "RAILWAY_DEPLOYMENT_ID",
  "RAILWAY_GIT_COMMIT_SHA",
  "RAILWAY_GIT_COMMIT_MESSAGE",
  "RAILWAY_GIT_BRANCH",
  "RAILWAY_GIT_REPO_NAME",
  "RAILWAY_GIT_REPO_OWNER",
]);

/**
 * Fly.io Machines' runtime environment variables.
 *
 * @see https://fly.io/docs/machines/runtime-environment/
 */
export const fly: EnvironmentSchema = preset([
  "FLY_APP_NAME",
  "FLY_MACHINE_ID",
  "FLY_ALLOC_ID",
  "FLY_REGION",
  "FLY_PUBLIC_IP",
  "FLY_PRIVATE_IP",
  "FLY_IMAGE_REF",
  "FLY_MACHINE_VERSION",
  "FLY_PROCESS_GROUP",
  "FLY_VM_MEMORY_MB",
  "PRIMARY_REGION",
]);

/**
 * Coolify's default environment variables.
 *
 * @see https://coolify.io/docs/knowledge-base/environment-variables
 */
export const coolify: EnvironmentSchema = preset([
  "COOLIFY_FQDN",
  "COOLIFY_URL",
  "COOLIFY_BRANCH",
  "COOLIFY_RESOURCE_UUID",
  "COOLIFY_CONTAINER_NAME",
  "SOURCE_COMMIT",
]);

/**
 * Cloudflare Pages' build environment variables.
 *
 * @see https://developers.cloudflare.com/pages/configuration/build-configuration/
 */
export const cloudflare: EnvironmentSchema = preset([
  "CF_PAGES",
  "CF_PAGES_BRANCH",
  "CF_PAGES_COMMIT_SHA",
  "CF_PAGES_URL",
]);

/**
 * Deno Deploy's context environment variables.
 *
 * @see https://docs.deno.com/deploy/reference/env_vars_and_contexts/
 */
export const denoDeploy: EnvironmentSchema = preset([
  "DENO_DEPLOY",
  "DENO_DEPLOY_ORG_ID",
  "DENO_DEPLOY_ORG_SLUG",
  "DENO_DEPLOY_APP_ID",
  "DENO_DEPLOY_APP_SLUG",
  "DENO_DEPLOY_BUILD_ID",
  "DENO_DEPLOYMENT_ID",
  "DENO_TIMELINE",
]);
