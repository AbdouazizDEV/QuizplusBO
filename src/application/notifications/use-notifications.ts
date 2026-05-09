import { useMutation } from '@tanstack/react-query';
import type {
  BroadcastNotificationInput,
  SendNotificationInput,
} from '@domain/entities/notification';
import { notificationsRepository } from '@infrastructure/repositories/notifications.repository';

export function useSendNotification() {
  return useMutation({
    mutationFn: (input: SendNotificationInput) => notificationsRepository.send(input),
  });
}

export function useBroadcastNotification() {
  return useMutation({
    mutationFn: (input: BroadcastNotificationInput) =>
      notificationsRepository.broadcast(input),
  });
}
