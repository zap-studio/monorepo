import type { StandardSchemaV1 } from "@standard-schema/spec";
import type {
  NotificationPayload,
  NotificationsEventDefinitions,
} from "./types";

/**
 * Create notification events schema using a Standard Schema library
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import { createNotificationEventsSchema } from "@zap-studio/realtime/plugins/notifications";
 *
 * const NotificationEvents = createNotificationEventsSchema({
 *   object: z.object,
 *   string: () => z.string(),
 *   number: () => z.number(),
 *   boolean: () => z.boolean(),
 *   enum: z.enum,
 *   optional: <T extends z.ZodType>(schema: T) => schema.optional(),
 *   record: <T extends z.ZodType>(schema: T) => z.record(z.string(), schema),
 *   unknown: () => z.unknown(),
 * });
 * ```
 */
export function createNotificationEventsSchema<
  TString extends StandardSchemaV1<string>,
  TNumber extends StandardSchemaV1<number>,
  TBoolean extends StandardSchemaV1<boolean>,
  TUnknown extends StandardSchemaV1<unknown>,
>(schemaBuilder: {
  object: <T extends Record<string, StandardSchemaV1>>(
    shape: T
  ) => StandardSchemaV1<{ [K in keyof T]: StandardSchemaV1.InferOutput<T[K]> }>;
  string: () => TString;
  number: () => TNumber;
  boolean: () => TBoolean;
  enum: <T extends readonly [string, ...string[]]>(
    values: T
  ) => StandardSchemaV1<T[number]>;
  optional: <T extends StandardSchemaV1>(
    schema: T
  ) => StandardSchemaV1<StandardSchemaV1.InferOutput<T> | undefined>;
  record: <T extends StandardSchemaV1>(
    schema: T
  ) => StandardSchemaV1<Record<string, StandardSchemaV1.InferOutput<T>>>;
  unknown: () => TUnknown;
}): NotificationsEventDefinitions {
  const prioritySchema = schemaBuilder.enum([
    "low",
    "normal",
    "high",
    "urgent",
  ]);

  return {
    notification: schemaBuilder.object({
      id: schemaBuilder.string(),
      userId: schemaBuilder.string(),
      title: schemaBuilder.string(),
      message: schemaBuilder.string(),
      type: schemaBuilder.string(),
      priority: prioritySchema,
      actionUrl: schemaBuilder.optional(schemaBuilder.string()),
      actionText: schemaBuilder.optional(schemaBuilder.string()),
      metadata: schemaBuilder.optional(
        schemaBuilder.record(schemaBuilder.unknown())
      ),
      read: schemaBuilder.boolean(),
      createdAt: schemaBuilder.number(),
    }) as StandardSchemaV1<NotificationPayload>,

    notificationRead: schemaBuilder.object({
      id: schemaBuilder.string(),
      userId: schemaBuilder.string(),
    }) as StandardSchemaV1<{ id: string; userId: string }>,

    notificationDismissed: schemaBuilder.object({
      id: schemaBuilder.string(),
      userId: schemaBuilder.string(),
    }) as StandardSchemaV1<{ id: string; userId: string }>,

    notificationCleared: schemaBuilder.object({
      userId: schemaBuilder.string(),
    }) as StandardSchemaV1<{ userId: string }>,
  };
}
