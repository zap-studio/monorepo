/**
 * Policy creation and composition: `createPolicy`, `mergePoliciesEvery`, and
 * `mergePoliciesSome`.
 *
 * @module @zap-studio/permit/policy
 */

import type { StandardSchemaV1 } from "@zap-studio/validation";
import { createStandardValidator } from "@zap-studio/validation";

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
 * Splits a typed `resource:action` permission string into its parts.
 * Returns `null` when the string is malformed (missing/empty part or extra
 * segments) or `resourceType` is not one of `actions`' keys.
 */
const parsePermission = <
  TResources extends Resources,
  TActions extends Actions<TResources>,
  K extends keyof TResources & keyof TActions,
>(
  permission: `${K & string}:${InferAction<TResources, TActions, K> & string}`,
  actions: TActions
): { action: InferAction<TResources, TActions, K>; resourceType: K } | null => {
  const isValidResourceKey = (value: string): value is K & string =>
    Object.keys(actions).includes(value);

  const [resourceTypeValue, actionValue, ...rest] = permission.split(":");
  if (
    resourceTypeValue === undefined ||
    resourceTypeValue.length === 0 ||
    actionValue === undefined ||
    actionValue.length === 0 ||
    rest.length > 0 ||
    !isValidResourceKey(resourceTypeValue)
  ) {
    return null;
  }

  return {
    action: actionValue,
    resourceType: resourceTypeValue,
  };
};

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
  strategy: "every" | "some"
): Policy<TContext, TResources, TActions> => ({
  async can<K extends keyof TResources & keyof TActions>(
    context: TContext,
    permission: `${K & string}:${InferAction<TResources, TActions, K> & string}`,
    resource: InferResource<TResources, K>
  ): Promise<boolean> {
    if (policies.length === 0) {
      return false;
    }

    if (strategy === "every") {
      for (const policy of policies) {
        // oxlint-disable-next-line no-await-in-loop -- "every" must evaluate sequentially to short-circuit on the first deny.
        const allowed = await policy.can(context, permission, resource);
        if (!allowed) {
          return false;
        }
      }
      return true;
    }

    const results = await Promise.all(
      policies.map(
        async (policy) => await policy.can(context, permission, resource)
      )
    );
    return results.some(Boolean);
  },
});

/**
 * Merges multiple policies into one, requiring every policy to allow.
 * If any policy denies, the merged policy denies.
 *
 * @example
 * ```ts
 * const basePolicy = createPolicy({ ... });
 * const adminPolicy = createPolicy({ ... });
 *
 * const merged = mergePoliciesEvery(basePolicy, adminPolicy);
 * // Both policies must allow for the action to be permitted
 * ```
 */
export const mergePoliciesEvery = <
  TContext extends Context,
  TResources extends Resources = Resources,
  TActions extends Actions<TResources> = Actions<TResources>,
>(
  ...policies: Policy<TContext, TResources, TActions>[]
): Policy<TContext, TResources, TActions> =>
  mergePoliciesWithStrategy(policies, "every");

/**
 * Merges multiple policies into one, requiring at least one policy to allow.
 * If every policy denies, the merged policy denies. Policies are evaluated
 * in parallel; every policy is invoked regardless of outcome.
 *
 * @example
 * ```ts
 * const guestPolicy = createPolicy({ ... });
 * const memberPolicy = createPolicy({ ... });
 *
 * const merged = mergePoliciesSome(guestPolicy, memberPolicy);
 * // If either policy allows, the action is permitted
 * ```
 */
export const mergePoliciesSome = <
  TContext extends Context,
  TResources extends Resources = Resources,
  TActions extends Actions<TResources> = Actions<TResources>,
>(
  ...policies: Policy<TContext, TResources, TActions>[]
): Policy<TContext, TResources, TActions> =>
  mergePoliciesWithStrategy(policies, "some");
