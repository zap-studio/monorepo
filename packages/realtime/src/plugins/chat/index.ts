import type { StandardSchemaV1 } from "@standard-schema/spec";
import type {
  ChatEventDefinitions,
  ChatMessagePayload,
  UserPresencePayload,
  UserTypingIndicatorPayload,
} from "./types";

/**
 * Create chat events schema using a Standard Schema library
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import { createChatEventsSchema } from "@zap-studio/realtime/plugins/chat";
 *
 * const ChatEventsSchema = createChatEventsSchema({
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
export function createChatEventsSchema<
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
}): ChatEventDefinitions {
  const messageTypeSchema = schemaBuilder.enum([
    "text",
    "image",
    "file",
    "system",
  ]);

  return {
    message: schemaBuilder.object({
      id: schemaBuilder.string(),
      chatId: schemaBuilder.string(),
      senderId: schemaBuilder.string(),
      senderName: schemaBuilder.string(),
      type: messageTypeSchema,
      content: schemaBuilder.string(),
      replyTo: schemaBuilder.optional(schemaBuilder.string()),
      metadata: schemaBuilder.optional(
        schemaBuilder.record(schemaBuilder.unknown())
      ),
      createdAt: schemaBuilder.number(),
      editedAt: schemaBuilder.optional(schemaBuilder.number()),
    }) as StandardSchemaV1<ChatMessagePayload>,

    messageEdited: schemaBuilder.object({
      id: schemaBuilder.string(),
      chatId: schemaBuilder.string(),
      content: schemaBuilder.string(),
      editedAt: schemaBuilder.number(),
    }) as StandardSchemaV1<{
      id: string;
      chatId: string;
      content: string;
      editedAt: number;
    }>,

    messageDeleted: schemaBuilder.object({
      id: schemaBuilder.string(),
      chatId: schemaBuilder.string(),
    }) as StandardSchemaV1<{ id: string; chatId: string }>,

    userPresence: schemaBuilder.object({
      userId: schemaBuilder.string(),
      userName: schemaBuilder.string(),
      chatId: schemaBuilder.string(),
      online: schemaBuilder.boolean(),
      lastSeen: schemaBuilder.number(),
    }) as StandardSchemaV1<UserPresencePayload>,

    userTyping: schemaBuilder.object({
      userId: schemaBuilder.string(),
      userName: schemaBuilder.string(),
      chatId: schemaBuilder.string(),
      typing: schemaBuilder.boolean(),
    }) as StandardSchemaV1<UserTypingIndicatorPayload>,

    userJoined: schemaBuilder.object({
      userId: schemaBuilder.string(),
      userName: schemaBuilder.string(),
      chatId: schemaBuilder.string(),
    }) as StandardSchemaV1<{
      userId: string;
      userName: string;
      chatId: string;
    }>,

    userLeft: schemaBuilder.object({
      userId: schemaBuilder.string(),
      chatId: schemaBuilder.string(),
    }) as StandardSchemaV1<{ userId: string; chatId: string }>,
  };
}
