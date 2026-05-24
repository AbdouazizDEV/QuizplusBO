import type { ChallengeStatus } from '@domain/entities/challenge';

export const CHALLENGE_STATUSES = [
  'pending',
  'accepted',
  'completed',
  'declined',
  'expired',
] as const satisfies readonly ChallengeStatus[];

export const CHALLENGE_STATUS_LABELS: Record<ChallengeStatus, string> = {
  pending: 'En attente',
  accepted: 'Accepté',
  completed: 'Terminé',
  declined: 'Refusé',
  expired: 'Expiré',
};

export const CHALLENGE_STATUS_TONES: Record<
  ChallengeStatus,
  'info' | 'success' | 'warning' | 'danger' | 'neutral'
> = {
  pending: 'info',
  accepted: 'warning',
  completed: 'success',
  declined: 'danger',
  expired: 'neutral',
};
