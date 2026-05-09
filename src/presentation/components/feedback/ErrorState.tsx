import { AlertCircle, RefreshCw } from 'lucide-react';
import { ApiError } from '@domain/errors/api-error';
import { Button } from '../ui/Button';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const message = ApiError.is(error)
    ? error.message
    : error instanceof Error
      ? error.message
      : 'Une erreur est survenue.';
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertCircle className="h-5 w-5" />
      </span>
      <h4 className="text-base font-bold text-foreground">Impossible de charger les données</h4>
      <p className="max-w-md text-sm text-muted">{message}</p>
      {onRetry ? (
        <Button variant="secondary" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={onRetry}>
          Réessayer
        </Button>
      ) : null}
    </div>
  );
}
