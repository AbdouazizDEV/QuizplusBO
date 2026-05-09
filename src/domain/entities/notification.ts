export interface SendNotificationInput {
  user_id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface BroadcastNotificationInput {
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at?: string;
}
