import type {
  EventDefinitions,
  EventKeys,
  RealtimePlugin,
  ServerEmitter,
} from "../../types";
import type { NotificationsEventDefinitions, NotifyUserOptions } from "./types";

/**
 * Create notification helpers for an emitter
 *
 * @example
 * ```ts
 * import { InMemoryEmitter } from "@zap-studio/realtime/emitters/in-memory";
 * import { createNotificationHelpers } from "@zap-studio/realtime/plugins/notifications";
 * import type { NotificationEventDefinitions } from "@zap-studio/realtime/plugins/notifications/types";
 *
 * const emitter = new InMemoryEmitter<NotificationEventDefinitions>();
 * const { notifyUser, markAsRead, dismiss, clearAll } = createNotificationHelpers(emitter);
 *
 * // Send a notification
 * await notifyUser("user-123", "Welcome!", "Thanks for signing up", {
 *   type: "welcome",
 *   priority: "normal",
 * });
 *
 * // Mark as read
 * await markAsRead("notification-id", "user-123");
 * ```
 */
export function createNotificationHelpers<
  TEventDefinitions extends EventDefinitions & NotificationsEventDefinitions,
>(
  emitter: ServerEmitter<TEventDefinitions>
): {
  notifyUser: (
    userId: string,
    title: string,
    message: string,
    options?: NotifyUserOptions
  ) => Promise<string>;
  markAsRead: (id: string, userId: string) => Promise<void>;
  dismiss: (id: string, userId: string) => Promise<void>;
  clearAll: (userId: string) => Promise<void>;
} {
  return {
    async notifyUser(
      userId: string,
      title: string,
      message: string,
      options?: NotifyUserOptions
    ): Promise<string> {
      const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      await emitter.publish(
        "notification" as EventKeys<TEventDefinitions>,
        {
          id,
          userId,
          title,
          message,
          type: options?.type ?? "default",
          priority: options?.priority ?? "normal",
          actionUrl: options?.actionUrl,
          actionText: options?.actionText,
          metadata: options?.metadata,
          read: false,
          createdAt: Date.now(),
        },
        { channel: `user:${userId}` }
      );

      return id;
    },

    async markAsRead(id: string, userId: string): Promise<void> {
      await emitter.publish(
        "notificationRead" as EventKeys<TEventDefinitions>,
        { id, userId },
        { channel: `user:${userId}` }
      );
    },

    async dismiss(id: string, userId: string): Promise<void> {
      await emitter.publish(
        "notificationDismissed" as EventKeys<TEventDefinitions>,
        { id, userId },
        { channel: `user:${userId}` }
      );
    },

    async clearAll(userId: string): Promise<void> {
      await emitter.publish(
        "notificationCleared" as EventKeys<TEventDefinitions>,
        { userId },
        { channel: `user:${userId}` }
      );
    },
  };
}

/**
 * Create a complete notifications plugin
 *
 * @example
 * ```ts
 * import { createNotificationsPlugin } from "@zap-studio/realtime/plugins/notifications/server";
 * import { z } from "zod";
 *
 * const notifications = createNotificationsPlugin({
 *   notificationCleared: z.object({
 *     userId: z.string().uuid(),
 *   }),
 *   // all other event definitions
 * });
 *
 * // Get helper functions
 * const { markAsRead, dismiss, clearAll } = notifications.createHelpers(emitter);
 *
 * // Use helper functions
 * await markAsRead("notificationId", "userId");
 * await dismiss("notificationId", "userId");
 * await clearAll("userId");
 * ```
 */
export function createNotificationsPlugin<
  TEventDefinitions extends EventDefinitions & NotificationsEventDefinitions,
>(
  definitions: TEventDefinitions
): RealtimePlugin<TEventDefinitions> & {
  createHelpers: (
    emitter: ServerEmitter<TEventDefinitions>
  ) => ReturnType<typeof createNotificationHelpers<TEventDefinitions>>;
} {
  return {
    name: "notifications",
    definitions,
    createHelpers: (emitter: ServerEmitter<TEventDefinitions>) =>
      createNotificationHelpers(emitter),
  };
}
