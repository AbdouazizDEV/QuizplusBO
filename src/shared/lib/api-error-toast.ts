import { toast } from 'sonner';
import { ApiError } from '@domain/errors/api-error';

export function toastApiError(err: unknown, fallback = 'Une erreur est survenue.'): void {
  if (ApiError.is(err)) {
    let description: string | undefined;
    if (err.fieldErrors) {
      description = Object.entries(err.fieldErrors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
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
