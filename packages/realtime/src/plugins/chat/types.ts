import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Chat message type
 */
export type ChatMessageType = "text" | "image" | "file" | "system";

/**
 * Standard chat message payload type
 */
export interface ChatMessagePayload {
  /** Chat/room ID */
  chatId: string;
  /** Message content (text or URL for media) */
  content: string;
  /** Creation timestamp */
  createdAt: number;
  /** Edit timestamp */
  editedAt?: number;
  /** Unique message ID */
  id: string;
  /** Optional metadata (e.g., file info, image dimensions) */
  metadata?: Record<string, unknown>;
  /** Optional reply to message ID */
  replyTo?: string;
  /** Sender user ID */
  senderId: string;
  /** Sender display name */
  senderName: string;
  /** Message type */
  type: ChatMessageType;
}

/**
 * Message edit payload type
 */
export interface ChatMessageEditedPayload {
  /** Chat/room ID */
  chatId: string;
  /** Content */
  content: string;
  /** Edit timestamp */
  editedAt: number;
  /** Message ID */
  id: string;
}

/**
 * Message deleted payload type
 */
export interface ChatMessageDeletedPayload {
  /** Chat/room ID */
  chatId: string;
  /** Message ID */
  id: string;
}

/**
 * User presence payload type
 */
export interface UserPresencePayload {
  /** Chat/room ID */
  chatId: string;
  /** Last seen timestamp */
  lastSeen: number;
  /** Whether user is online */
  online: boolean;
  /** User ID */
  userId: string;
  /** User display name */
  userName: string;
}

/**
 * User typing indicator payload type
 */
export interface UserTypingIndicatorPayload {
  /** Chat/room ID */
  chatId: string;
  /** Whether user is typing */
  typing: boolean;
  /** User ID */
  userId: string;
  /** User display name */
  userName: string;
}

/**
 * User joined payload type
 */
export interface UserJoinedPayload {
  /** Chat/room ID */
  chatId: string;
  /** User ID */
  userId: string;
  /** User display name */
  userName: string;
}

/**
 * User left payload type
 */
export interface UserLeftPayload {
  /** Chat/room ID */
  chatId: string;
  /** User ID */
  userId: string;
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
   * Message deleted event definition
   */
  messageDeleted: StandardSchemaV1<ChatMessageDeletedPayload>;
  /**
   * Message edited event definition
   */
  messageEdited: StandardSchemaV1<ChatMessageEditedPayload>;
  /**
   * User joined event definition
   */
  userJoined: StandardSchemaV1<UserJoinedPayload>;
  /**
   * User left event definition
   */
  userLeft: StandardSchemaV1<UserLeftPayload>;
  /**
   * User presence event definition
   */
  userPresence: StandardSchemaV1<UserPresencePayload>;
  /**
   * User typing event definition
   */
  userTyping: StandardSchemaV1<UserTypingIndicatorPayload>;
}

/**
 * Send message options
 */
export interface SendMessageOptions {
  /** Optional metadata */
  metadata?: Record<string, unknown>;
  /** Reply to message ID */
  replyTo?: string;
  /**
   * Message type
   * @default "text"
   */
  type?: ChatMessageType;
}
