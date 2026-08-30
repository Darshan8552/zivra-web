export type NotificationType =
  | "LIKE"
  | "COMMENT"
  | "FOLLOW"
  | "FOLLOW_REQUEST"
  | "FOLLOW_ACCEPTED"
  | "MENTION"
  | "MESSAGE"
  | "STORY_REPLY"
  | "SYSTEM";

export interface NotificationActor {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  isVerified: boolean;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  entityType: string | null;
  entityId: string | null;
  message: string | null;
  actorId: string | null;
  isRead: boolean;
  isFollowingActor: boolean;
  isFollowRequestPending: boolean;
  createdAt: string;
  actor: NotificationActor | null;
}

export interface NotificationsPage {
  items: AppNotification[];
  nextCursor: string | null;
}

export interface UnreadCount {
  count: number;
}
