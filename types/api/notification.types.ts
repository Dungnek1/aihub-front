export interface NotificationEvent {
  id: string;
  type: string;
  actorId: string;
  objectType: string;
  objectId: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  html: string;
  createdAt: string;
  isRead: boolean;
  isSeen: boolean;
  event: NotificationEvent;
  title?: string;
  message?: string;
}


