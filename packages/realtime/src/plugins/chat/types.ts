import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Chat message type
 */
export type ChatMessageType = "text" | "image" | "file" | "system";

/**
 * Standard chat message payload type
 */
export type ChatMessagePayload = {
  /** Unique message ID */
  id: string;
  /** Chat/room ID */
  chatId: string;
  /** Sender user ID */
  senderId: string;
  /** Sender display name */
  senderName: string;
  /** Message type */
  type: ChatMessageType;
  /** Message content (text or URL for media) */
  content: string;
  /** Optional reply to message ID */
  replyTo?: string;
  /** Optional metadata (e.g., file info, image dimensions) */
  metadata?: Record<string, unknown>;
  /** Creation timestamp */
  createdAt: number;
  /** Edit timestamp */
  editedAt?: number;
};

/**
 * Message edit payload type
 */
export type ChatMessageEditedPayload = {
  /** Message ID */
  id: string;
  /** Chat/room ID */
  chatId: string;
  /** Content */
  content: string;
  /** Edit timestamp */
  editedAt: number;
};

/**
 * Message deleted payload type
 */
export type ChatMessageDeletedPayload = {
  /** Message ID */
  id: string;
  /** Chat/room ID */
  chatId: string;
};

/**
 * User presence payload type
 */
export type UserPresencePayload = {
  /** User ID */
  userId: string;
  /** User display name */
  userName: string;
  /** Chat/room ID */
  chatId: string;
  /** Whether user is online */
  online: boolean;
  /** Last seen timestamp */
  lastSeen: number;
};

/**
 * User typing indicator payload type
 */
export type UserTypingIndicatorPayload = {
  /** User ID */
  userId: string;
  /** User display name */
  userName: string;
  /** Chat/room ID */
  chatId: string;
  /** Whether user is typing */
  typing: boolean;
};

/**
 * User joined payload type
 */
export type UserJoinedPayload = {
  /** User ID */
  userId: string;
  /** User display name */
  userName: string;
  /** Chat/room ID */
  chatId: string;
};

/**
 * User left payload type
 */
export type UserLeftPayload = {
  /** User ID */
  userId: string;
  /** Chat/room ID */
  chatId: string;
};

/**
 * Complete event definitions
 */
export type ChatEventDefinitions = {
  /**
   * Message event definition
   */
  message: StandardSchemaV1<ChatMessagePayload>;
  /**
   * Message edited event definition
   */
  messageEdited: StandardSchemaV1<ChatMessageEditedPayload>;
  /**
   * Message deleted event definition
   */
  messageDeleted: StandardSchemaV1<ChatMessageDeletedPayload>;
  /**
   * User presence event definition
   */
  userPresence: StandardSchemaV1<UserPresencePayload>;
  /**
   * User typing event definition
   */
  userTyping: StandardSchemaV1<UserTypingIndicatorPayload>;
  /**
   * User joined event definition
   */
  userJoined: StandardSchemaV1<UserJoinedPayload>;
  /**
   * User left event definition
   */
  userLeft: StandardSchemaV1<UserLeftPayload>;
};

/**
 * Send message options
 */
export type SendMessageOptions = {
  /**
   * Message type
   * @default "text"
   */
  type?: ChatMessageType;
  /** Reply to message ID */
  replyTo?: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
};
