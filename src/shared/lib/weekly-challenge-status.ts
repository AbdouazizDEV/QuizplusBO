import type { WeeklyChallengeStatus } from '@domain/entities/weekly-challenge';

export const WEEKLY_CHALLENGE_STATUSES = ['draft', 'actif', 'termine'] as const satisfies readonly WeeklyChallengeStatus[];

export const WEEKLY_CHALLENGE_STATUS_LABELS: Record<WeeklyChallengeStatus, string> = {
  draft: 'Brouillon',
  actif: 'Publié / Actif',
  termine: 'Terminé',
};

export const WEEKLY_CHALLENGE_STATUS_TONES: Record<
  WeeklyChallengeStatus,
  'info' | 'success' | 'warning' | 'danger' | 'neutral'
> = {
  draft: 'neutral',
  actif: 'success',
  termine: 'info',
};
