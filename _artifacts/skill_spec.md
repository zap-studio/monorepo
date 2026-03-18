# Zap Studio Monorepo — Skill Spec

This monorepo publishes framework-agnostic TypeScript packages for typed HTTP access, policy-based authorization, runtime schema validation, and webhook processing. Skills are package-scoped so agents load focused guidance for the package being implemented.

## Domains

| Domain                          | Description                                                                      | Skills                                |
| ------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------- |
| Typed HTTP access               | Build validated HTTP clients with shared defaults and predictable error handling | zap-fetch-typed-http                  |
| Authorization policy evaluation | Define rules and evaluate decisions across resources/actions                     | zap-permit-policy-authoring           |
| Schema-driven validation        | Validate unknown input using Standard Schema-compatible adapters                 | zap-validation-standard-schema        |
| Webhook ingestion pipeline      | Normalize, verify, validate, and dispatch webhook events                         | zap-webhooks-routing-and-verification |

## Skill Inventory

| Skill                                 | Type | Domain                          | What it covers                                              | Failure modes |
| ------------------------------------- | ---- | ------------------------------- | ----------------------------------------------------------- | ------------- |
| zap-fetch-typed-http                  | core | typed-http-access               | `$fetch`, `api.*`, `createFetch`, defaults and error modes  | 3             |
| zap-permit-policy-authoring           | core | authorization-policy-evaluation | `createPolicy`, rule helpers, role checks, merge strategies | 3             |
| zap-validation-standard-schema        | core | schema-driven-validation        | `standardValidate*`, validator factories, schema guard      | 3             |
| zap-webhooks-routing-and-verification | core | webhook-ingestion-pipeline      | router registration/handling, HMAC verify, adapter contract | 3             |

## Failure Mode Inventory

### zap-fetch-typed-http (3 failure modes)

| #   | Mistake                                         | Priority | Source                      | Cross-skill? |
| --- | ----------------------------------------------- | -------- | --------------------------- | ------------ |
| 1   | Assuming api.get returns raw Response           | HIGH     | packages/fetch/src/index.ts | —            |
| 2   | Ignoring validation result branch               | HIGH     | packages/fetch/src/index.ts | —            |
| 3   | Sending object body without JSON mode awareness | MEDIUM   | packages/fetch/src/utils.ts | —            |

### zap-permit-policy-authoring (3 failure modes)

| #   | Mistake                                       | Priority | Source                       | Cross-skill? |
| --- | --------------------------------------------- | -------- | ---------------------------- | ------------ |
| 1   | Using action not listed in actions map        | HIGH     | packages/permit/src/index.ts | —            |
| 2   | Assuming invalid resource still reaches rules | HIGH     | packages/permit/src/index.ts | —            |
| 3   | Expecting mergePoliciesAny to deny-overrides  | MEDIUM   | packages/permit/src/index.ts | —            |

### zap-validation-standard-schema (3 failure modes)

| #   | Mistake                                            | Priority | Source                           | Cross-skill? |
| --- | -------------------------------------------------- | -------- | -------------------------------- | ------------ |
| 1   | Calling standardValidateSync with async schema     | HIGH     | packages/validation/src/index.ts | —            |
| 2   | Treating throwOnError=false result as parsed value | HIGH     | packages/validation/src/index.ts | —            |
| 3   | Skipping schema guard for unknown schema input     | MEDIUM   | packages/validation/src/index.ts | —            |

### zap-webhooks-routing-and-verification (3 failure modes)

| #   | Mistake                                      | Priority | Source                          | Cross-skill? |
| --- | -------------------------------------------- | -------- | ------------------------------- | ------------ |
| 1   | Registering route with leading slash         | HIGH     | packages/webhooks/src/index.ts  | —            |
| 2   | Parsing JSON before signature verification   | CRITICAL | packages/webhooks/src/verify.ts | —            |
| 3   | Using createHmacVerifier in non-Node runtime | HIGH     | packages/webhooks/src/verify.ts | —            |

## Tensions

| Tension                                         | Skills                                                                 | Agent implication                                                             |
| ----------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Strict validation vs lenient ingestion          | zap-webhooks-routing-and-verification ↔ zap-validation-standard-schema | Agents may reject events that should be quarantined/retried instead           |
| Shared client defaults vs per-request overrides | zap-fetch-typed-http ↔ zap-validation-standard-schema                  | Agents can miss endpoint-specific overrides and produce subtle behavior drift |

## Cross-References

| From                                  | To                             | Reason                                                                      |
| ------------------------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| zap-fetch-typed-http                  | zap-validation-standard-schema | Fetch response validation depends on standardValidate result semantics      |
| zap-permit-policy-authoring           | zap-validation-standard-schema | createPolicy resource checks use validation package behavior                |
| zap-webhooks-routing-and-verification | zap-validation-standard-schema | Router payload validation/issue handling depends on validation result shape |

## Subsystems & Reference Candidates

| Skill                                 | Subsystems                      | Reference candidates |
| ------------------------------------- | ------------------------------- | -------------------- |
| zap-fetch-typed-http                  | —                               | —                    |
| zap-permit-policy-authoring           | —                               | —                    |
| zap-validation-standard-schema        | —                               | —                    |
| zap-webhooks-routing-and-verification | HMAC verify, adapter base class | —                    |

## Recommended Skill File Structure

- Core skills: zap-fetch-typed-http, zap-permit-policy-authoring, zap-validation-standard-schema, zap-webhooks-routing-and-verification
- Framework skills: none (all packages are framework-agnostic)
- Lifecycle skills: none required for minimal v1 scaffold
- Composition skills: no standalone composition skill in v1; linked via cross-references
- Reference files: none required in v1

## Composition Opportunities

| Library                                       | Integration points                          | Composition skill needed? |
| --------------------------------------------- | ------------------------------------------- | ------------------------- |
| @zap-studio/validation + @zap-studio/fetch    | response validation mode and error handling | no                        |
| @zap-studio/validation + @zap-studio/permit   | resource validation before rule evaluation  | no                        |
| @zap-studio/validation + @zap-studio/webhooks | payload validation for registered schemas   | no                        |
