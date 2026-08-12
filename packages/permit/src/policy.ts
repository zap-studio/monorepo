/**
 * Policy creation and composition: `createPolicy`, `mergePolicies`, and
 * `mergePoliciesAny`.
 *
 * @module @zap-studio/permit/policy
 */

import type { StandardSchemaV1 } from "@zap-studio/validation";
import { createStandardValidator } from "@zap-studio/validation";

import { parsePermission } from "./_helpers.js";
import { PolicyError } from "./errors.js";
import type {
  Actions,
  Context,
  InferAction,
  InferResource,
  PermitConfig,
  Policy,
  Resources,
} from "./types.js";

/**
 * Creates a type-safe policy from resource schemas, actions, and rules.
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import { createPolicy, allow, deny, when } from "@zap-studio/permit";
 * import type { Resources, Actions } from "@zap-studio/permit/types";
 *
 * // Define resource schemas
 * const resources = {
 *   post: z.object({
 *     id: z.string(),
 *     authorId: z.string(),
 *     visibility: z.enum(["public", "private"]),
 *   }),
 *   comment: z.object({
 *     id: z.string(),
 *     postId: z.string(),
 *     authorId: z.string(),
 *   }),
 * } satisfies Resources;
 *
 * // Define actions per resource
 * const actions = {
 *   post: ["read", "write", "delete"],
 *   comment: ["read", "write"],
 * } as const satisfies Actions<typeof resources>;
 *
 * // Define context type
 * type AppContext = { user: { id: string; role: string } };
 *
 * // Create the policy
 * const policy = createPolicy<AppContext>({
 *   resources,
 *   actions,
 *   rules: {
 *     post: {
 *       read: when((ctx, action, resource) => resource.visibility === "public"),
 *       write: when((ctx, action, resource) => ctx.user.id === resource.authorId),
 *       delete: deny(),
 *     },
 *     comment: {
 *       read: allow(),
 *       write: when((ctx, action, resource) => ctx.user.id === resource.authorId),
 *     },
 *   },
 * });
 *
 * // Check permissions
 * const post = { id: "1", authorId: "user-1", visibility: "public" as const };
 * await policy.can(ctx, "post:read", post); // true
 * await policy.can(ctx, "post:write", post); // depends on ctx.user.id
 * ```
 */
export const createPolicy = <
  TContext extends Context,
  TResources extends Resources = Resources,
  TActions extends Actions<TResources> = Actions<TResources>,
>(
  config: PermitConfig<TContext, TResources, TActions>
): Policy<TContext, TResources, TActions> => {
  const { rules, resources, actions } = config;
  const validators = new Map<
    keyof TResources,
    (input: unknown) => Promise<StandardSchemaV1.Result<unknown>>
  >();

  const getValidatedResource = async <K extends keyof TResources>(
    resourceType: K,
    resource: InferResource<TResources, K>
  ): Promise<InferResource<TResources, K> | null> => {
    const validator = validators.get(resourceType);
    if (validator === undefined) {
      return null;
    }
    try {
      const result = await validator(resource);
      if (result.issues) {
        return null;
      }
      return result.value;
    } catch (error) {
      console.warn(
        `Resource validation failed for ${String(resourceType)}: ${String(error)}`
      );
      return null;
    }
  };

  const hasAllowedAction = <K extends keyof TResources & keyof TActions>(
    resourceType: K,
    action: InferAction<TResources, TActions, K>
  ): boolean => actions[resourceType]?.includes(action) ?? false;

  const evaluatePolicy = <K extends keyof TResources & keyof TActions>(
    context: TContext,
    resourceType: K,
    action: InferAction<TResources, TActions, K>,
    resource: InferResource<TResources, K>
  ): boolean => {
    const policyFn = rules[resourceType]?.[action];
    if (policyFn === undefined) {
      return false;
    }

    try {
      return policyFn(context, action, resource) === "allow";
    } catch (error) {
      console.warn(
        `Policy evaluation error for ${String(resourceType)}.${action}: ${String(error)}`
      );
      return false;
    }
  };

  for (const key of Object.keys(resources) as (keyof TResources)[]) {
    const schema = resources[key];
    if (schema === undefined) {
      throw new PolicyError(`Missing schema for resource: ${String(key)}`);
    }
    const validator = createStandardValidator(schema);
    validators.set(key, async (input: unknown) => await validator(input));
  }

  return {
    async can<K extends keyof TResources & keyof TActions>(
      context: TContext,
      permission: `${K & string}:${InferAction<TResources, TActions, K> & string}`,
      resource: InferResource<TResources, K>
    ): Promise<boolean> {
      const parsedPermission = parsePermission<TResources, TActions, K>(
        permission,
        actions
      );
      if (parsedPermission === null) {
        return false;
      }

      const { action, resourceType } = parsedPermission;
      if (!hasAllowedAction(resourceType, action)) {
        return false;
      }

      const validatedResource = await getValidatedResource(
        resourceType,
        resource
      );
      if (validatedResource === null) {
        return false;
      }

      return evaluatePolicy(context, resourceType, action, validatedResource);
    },
  };
};

const mergePoliciesWithStrategy = <
  TContext extends Context,
  TResources extends Resources = Resources,
  TActions extends Actions<TResources> = Actions<TResources>,
>(
  policies: Policy<TContext, TResources, TActions>[],
  strategy: "allow-overrides" | "deny-overrides"
): Policy<TContext, TResources, TActions> => ({
  async can<K extends keyof TResources & keyof TActions>(
    context: TContext,
    permission: `${K & string}:${InferAction<TResources, TActions, K> & string}`,
    resource: InferResource<TResources, K>
  ): Promise<boolean> {
    if (policies.length === 0) {
      return false;
    }
    for (const policy of policies) {
      // oxlint-disable-next-line no-await-in-loop -- Policies must evaluate sequentially to preserve short-circuit semantics.
      const allowed = await policy.can(context, permission, resource);

      if (strategy === "allow-overrides" && allowed) {
        return true;
      }
      if (strategy === "deny-overrides" && !allowed) {
        return false;
      }
    }
    return strategy === "deny-overrides";
  },
});

/**
 * Merges multiple policies into one using "deny-overrides" strategy.
 * If any policy denies, the merged policy denies. All must allow for the result to allow.
 *
 * @example
 * ```ts
 * const basePolicy = createPolicy({ ... });
 * const adminPolicy = createPolicy({ ... });
 *
 * const merged = mergePolicies(basePolicy, adminPolicy);
 * // Both policies must allow for the action to be permitted
 * ```
 */
export const mergePolicies = <
  TContext extends Context,
  TResources extends Resources = Resources,
  TActions extends Actions<TResources> = Actions<TResources>,
>(
  ...policies: Policy<TContext, TResources, TActions>[]
): Policy<TContext, TResources, TActions> =>
  mergePoliciesWithStrategy(policies, "deny-overrides");

/**
 * Merges multiple policies into one using "allow-overrides" strategy.
 * If any policy allows, the merged policy allows. All must deny for the result to deny.
 *
 * @example
 * ```ts
 * const guestPolicy = createPolicy({ ... });
 * const memberPolicy = createPolicy({ ... });
 *
 * const merged = mergePoliciesAny(guestPolicy, memberPolicy);
 * // If either policy allows, the action is permitted
 * ```
 */
export const mergePoliciesAny = <
  TContext extends Context,
  TResources extends Resources = Resources,
  TActions extends Actions<TResources> = Actions<TResources>,
>(
  ...policies: Policy<TContext, TResources, TActions>[]
): Policy<TContext, TResources, TActions> =>
  mergePoliciesWithStrategy(policies, "allow-overrides");
