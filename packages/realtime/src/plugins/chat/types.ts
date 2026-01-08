import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Chat message type
 */
export type ChatMessageType = "text" | "image" | "file" | "system";

/**
 * Standard chat message payload type
 */
export interface ChatMessagePayload {
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
}

/**
 * Message edit payload type
 */
export interface ChatMessageEditedPayload {
  /** Message ID */
  id: string;
  /** Chat/room ID */
  chatId: string;
  /** Content */
  content: string;
  /** Edit timestamp */
  editedAt: number;
}

/**
 * Message deleted payload type
 */
export interface ChatMessageDeletedPayload {
  /** Message ID */
  id: string;
  /** Chat/room ID */
  chatId: string;
}

/**
 * User presence payload type
 */
export interface UserPresencePayload {
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
}

/**
 * User typing indicator payload type
 */
export interface UserTypingIndicatorPayload {
  /** User ID */
  userId: string;
  /** User display name */
  userName: string;
  /** Chat/room ID */
  chatId: string;
  /** Whether user is typing */
  typing: boolean;
}

/**
 * User joined payload type
 */
export interface UserJoinedPayload {
  /** User ID */
  userId: string;
  /** User display name */
  userName: string;
  /** Chat/room ID */
  chatId: string;
}

/**
 * User left payload type
 */
export interface UserLeftPayload {
  /** User ID */
  userId: string;
  /** Chat/room ID */
  chatId: string;
}

/**
 * Complete event definitions
 */
export interface ChatEventDefinitions {
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
}

/**
 * Send message options
 */
export interface SendMessageOptions {
  /**
   * Message type
   * @default "text"
   */
  type?: ChatMessageType;
  /** Reply to message ID */
  replyTo?: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}
