import { toast } from 'sonner';
import { ApiError } from '@domain/errors/api-error';

const FIELD_LABELS: Record<string, string> = {
  title: 'Titre',
  description: 'Description',
  quiz_id: 'Quiz',
  category_id: 'Catégorie',
  status: 'Statut',
  starts_at: 'Date de début',
  ends_at: 'Date de fin',
  reward_text: 'Récompense',
  scheduled_day: 'Jour planifié',
  day_order: 'Ordre du jour',
};

export function toastApiError(err: unknown, fallback = 'Une erreur est survenue.'): void {
  if (ApiError.is(err)) {
    let description: string | undefined;
    if (err.fieldErrors) {
      description = Object.entries(err.fieldErrors)
        .map(([field, messages]) => {
          const label = FIELD_LABELS[field] ?? field;
          return `${label} : ${messages.join(', ')}`;
        })
        .join('\n');
    }
    toast.error(err.message || fallback, { description });
    return;
  }
  if (err instanceof Error) {
    toast.error(err.message || fallback);
    return;
  }
  toast.error(fallback);
}
