import type {
  EventDefinitions,
  EventKeys,
  RealtimePlugin,
  ServerEmitter,
} from "../../types";
import type { ChatEventDefinitions, SendMessageOptions } from "./types";

/**
 * Create chat helpers for an emitter
 *
 * @example
 * ```ts
 * import { InMemoryEmitter } from "@zap-studio/realtime/emitters/in-memory";
 * import { createChatHelpers } from "@zap-studio/realtime/plugins/chat/server";
 * import type { ChatEventDefinitions } from "@zap-studio/realtime/plugins/chat/types";
 *
 * const emitter = new InMemoryEmitter<ChatEventDefinitions>();
 * const chat = createChatHelpers(emitter);
 *
 * // Send a message
 * await chat.sendMessage("chat-123", "user-456", "John", "Hello world!");
 *
 * // Update presence
 * await chat.updatePresence("user-456", "John", "chat-123", true);
 *
 * // Send typing indicator
 * await chat.setTyping("user-456", "John", "chat-123", true);
 * ```
 */
export function createChatHelpers<
  TEventDefinitions extends EventDefinitions & ChatEventDefinitions,
>(
  emitter: ServerEmitter<TEventDefinitions>
): {
  sendMessage: (
    chatId: string,
    senderId: string,
    senderName: string,
    content: string,
    options?: SendMessageOptions
  ) => Promise<string>;
  editMessage: (id: string, chatId: string, content: string) => Promise<void>;
  deleteMessage: (id: string, chatId: string) => Promise<void>;
  updatePresence: (
    userId: string,
    userName: string,
    chatId: string,
    online: boolean
  ) => Promise<void>;
  setTyping: (
    userId: string,
    userName: string,
    chatId: string,
    typing: boolean
  ) => Promise<void>;
  joinChat: (userId: string, userName: string, chatId: string) => Promise<void>;
  leaveChat: (userId: string, chatId: string) => Promise<void>;
} {
  return {
    // biome-ignore lint/nursery/useMaxParams: We need to pass all parameters to the function using this API
    async sendMessage(
      chatId: string,
      senderId: string,
      senderName: string,
      content: string,
      options?: SendMessageOptions
    ): Promise<string> {
      const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      await emitter.publish(
        "message" as EventKeys<TEventDefinitions>,
        {
          id,
          chatId,
          senderId,
          senderName,
          type: options?.type ?? "text",
          content,
          replyTo: options?.replyTo,
          metadata: options?.metadata,
          createdAt: Date.now(),
        },
        { channel: `chat:${chatId}` }
      );

      return id;
    },

    async editMessage(
      id: string,
      chatId: string,
      content: string
    ): Promise<void> {
      await emitter.publish(
        "messageEdited" as EventKeys<TEventDefinitions>,
        {
          id,
          chatId,
          content,
          editedAt: Date.now(),
        },
        { channel: `chat:${chatId}` }
      );
    },

    async deleteMessage(id: string, chatId: string): Promise<void> {
      await emitter.publish(
        "messageDeleted" as EventKeys<TEventDefinitions>,
        {
          id,
          chatId,
        },
        { channel: `chat:${chatId}` }
      );
    },

    async updatePresence(
      userId: string,
      userName: string,
      chatId: string,
      online: boolean
    ): Promise<void> {
      await emitter.publish(
        "userPresence" as EventKeys<TEventDefinitions>,
        {
          userId,
          userName,
          chatId,
          online,
          lastSeen: Date.now(),
        },
        { channel: `chat:${chatId}` }
      );
    },

    async setTyping(
      userId: string,
      userName: string,
      chatId: string,
      typing: boolean
    ): Promise<void> {
      await emitter.publish(
        "typing" as EventKeys<TEventDefinitions>,
        {
          userId,
          userName,
          chatId,
          typing,
        },
        { channel: `chat:${chatId}` }
      );
    },

    async joinChat(
      userId: string,
      userName: string,
      chatId: string
    ): Promise<void> {
      await emitter.publish(
        "userJoined" as EventKeys<TEventDefinitions>,
        {
          userId,
          userName,
          chatId,
        },
        { channel: `chat:${chatId}` }
      );
    },

    async leaveChat(userId: string, chatId: string): Promise<void> {
      await emitter.publish(
        "userLeft" as EventKeys<TEventDefinitions>,
        {
          userId,
          chatId,
        },
        { channel: `chat:${chatId}` }
      );
    },
  };
}

/**
 * Create a complete chat plugin
 */
export function createChatPlugin<
  TEventDefinitions extends EventDefinitions & ChatEventDefinitions,
>(
  definitions: TEventDefinitions
): RealtimePlugin<TEventDefinitions> & {
  createHelpers: (
    emitter: ServerEmitter<TEventDefinitions>
  ) => ReturnType<typeof createChatHelpers<TEventDefinitions>>;
  definitions: TEventDefinitions;
} {
  return {
    name: "chat",
    definitions,
    createHelpers: (emitter: ServerEmitter<TEventDefinitions>) =>
      createChatHelpers(emitter),
  };
}
