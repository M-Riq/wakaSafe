import type { Id, Notification } from '@wakasafe/domain';

// M7 notifications — in-app first, FCM later behind the client NotificationService (ADR-0007).

export type NotificationInput = Omit<Notification, 'id' | 'createdAt' | 'readAt'>;

export interface NotificationRepository {
  /** Newest first. */
  list(userId: Id): Promise<Notification[]>;
  countUnread(userId: Id): Promise<number>;
  markAsRead(input: { userId: Id; notificationId: Id }): Promise<void>;
  markAllAsRead(userId: Id): Promise<void>;
  /** Simulates a push notification in the demo. */
  push(input: NotificationInput): Promise<Notification>;
}
