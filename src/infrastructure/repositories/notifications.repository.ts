import type {
  BroadcastNotificationInput,
  NotificationItem,
  SendNotificationInput,
} from '@domain/entities/notification';
import type { NotificationsRepository } from '@domain/ports/repositories';
import { apiClient } from '../http/api-client';
import { Endpoints } from '../http/endpoints';

interface SendResp {
  ok: boolean;
  item: NotificationItem;
}
interface BroadcastResp {
  ok: boolean;
  inserted: number;
}

export class HttpNotificationsRepository implements NotificationsRepository {
  async send(input: SendNotificationInput): Promise<NotificationItem> {
    const res = await apiClient.post<SendResp>(Endpoints.notifications.send, input);
    return res.item;
  }
  async broadcast(input: BroadcastNotificationInput): Promise<{ inserted: number }> {
    const res = await apiClient.post<BroadcastResp>(Endpoints.notifications.broadcast, input);
    return { inserted: res.inserted ?? 0 };
  }
}

export const notificationsRepository: NotificationsRepository =
  new HttpNotificationsRepository();
