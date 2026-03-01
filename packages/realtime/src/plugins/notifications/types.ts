import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Notification priority levels
 */
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

/**
 * Standard notification payload type
 */
export interface NotificationPayload {
  /** Optional action button text */
  actionText?: string;
  /** Optional URL to navigate to when clicked */
  actionUrl?: string;
  /** Creation timestamp */
  createdAt: number;
  /** Unique notification ID */
  id: string;
  /** Notification message */
  message: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
  /** Priority level */
  priority: NotificationPriority;
  /** Whether the notification has been read */
  read: boolean;
  /** Notification title */
  title: string;
  /** Notification type/category */
  type: string;
  /** User ID to send notification to */
  userId: string;
}

export interface NotificationReadPayload {
  /** Unique notification ID */
  id: string;
  /** User ID to send notification to */
  userId: string;
}

export interface NotificationDismissedPayload {
  /** Unique notification ID */
  id: string;
  /** User ID to send notification to */
  userId: string;
}

export interface NotificationClearedPayload {
  /** User ID to send notification to */
  userId: string;
}

export interface NotificationsEventDefinitions {
  notification: StandardSchemaV1<NotificationPayload>;
  notificationCleared: StandardSchemaV1<NotificationClearedPayload>;
  notificationDismissed: StandardSchemaV1<NotificationDismissedPayload>;
  notificationRead: StandardSchemaV1<NotificationReadPayload>;
}

/**
 * Notification helper options
 */
export interface NotifyUserOptions {
  /** Optional action text */
  actionText?: string;
  /** Optional action URL */
  actionUrl?: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
  /** Priority level */
  priority?: NotificationPriority;
  /** Notification type/category */
  type?: string;
}
