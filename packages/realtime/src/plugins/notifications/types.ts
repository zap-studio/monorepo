import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Notification priority levels
 */
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

/**
 * Standard notification payload type
 */
export interface NotificationPayload {
  /** Unique notification ID */
  id: string;
  /** User ID to send notification to */
  userId: string;
  /** Notification title */
  title: string;
  /** Notification message */
  message: string;
  /** Notification type/category */
  type: string;
  /** Priority level */
  priority: NotificationPriority;
  /** Optional URL to navigate to when clicked */
  actionUrl?: string;
  /** Optional action button text */
  actionText?: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
  /** Whether the notification has been read */
  read: boolean;
  /** Creation timestamp */
  createdAt: number;
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
  notificationRead: StandardSchemaV1<NotificationReadPayload>;
  notificationDismissed: StandardSchemaV1<NotificationDismissedPayload>;
  notificationCleared: StandardSchemaV1<NotificationClearedPayload>;
}

/**
 * Notification helper options
 */
export interface NotifyUserOptions {
  /** Notification type/category */
  type?: string;
  /** Priority level */
  priority?: NotificationPriority;
  /** Optional action URL */
  actionUrl?: string;
  /** Optional action text */
  actionText?: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}
