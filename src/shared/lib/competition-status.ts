import type { CompetitionStatus } from '@domain/entities/competition';

export const COMPETITION_STATUSES = [
  'draft',
  'scheduled',
  'live',
  'completed',
  'cancelled',
] as const satisfies readonly CompetitionStatus[];

export const COMPETITION_STATUS_LABELS: Record<CompetitionStatus, string> = {
  draft: 'Brouillon',
  scheduled: 'Inscriptions ouvertes',
  live: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export const COMPETITION_STATUS_TONES: Record<
  CompetitionStatus,
  'info' | 'success' | 'warning' | 'danger' | 'neutral'
> = {
  draft: 'neutral',
  scheduled: 'info',
  live: 'success',
  completed: 'neutral',
  cancelled: 'danger',
};
