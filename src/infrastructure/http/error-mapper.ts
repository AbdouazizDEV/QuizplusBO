import { ApiError, type FieldErrors } from '@domain/errors/api-error';

interface RawErrorShape {
  ok?: false;
  error?: string;
  message?: string;
  status?: number;
  details?: {
    formErrors?: string[];
    fieldErrors?: FieldErrors;
  };
}

const STATUS_FALLBACK_MESSAGES: Record<number, string> = {
  400: 'Données invalides. Veuillez vérifier les champs.',
  401: 'Clé API invalide ou manquante.',
  403: 'Action non autorisée.',
  404: 'Ressource introuvable.',
  409: 'Conflit avec une ressource existante.',
  422: 'Données invalides.',
  500: 'Erreur serveur. Réessayez dans quelques instants.',
  502: 'Service externe indisponible.',
  503: 'Configuration manquante côté serveur.',
};

export function mapHttpError(status: number, body: unknown): ApiError {
  const data = (body ?? {}) as RawErrorShape;
  const message =
    data.error ||
    data.message ||
    STATUS_FALLBACK_MESSAGES[status] ||
    `Une erreur est survenue (${status}).`;

  return new ApiError({
    status: data.status ?? status,
    message,
    fieldErrors: data.details?.fieldErrors,
    raw: body,
  });
}

export function mapNetworkError(err: unknown): ApiError {
  return new ApiError({
    status: 0,
    message: "Impossible de joindre le serveur. Vérifiez votre connexion ou l'URL d'API.",
    raw: err,
  });
}
