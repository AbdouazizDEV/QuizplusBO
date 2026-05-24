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
  404: 'Élément introuvable.',
  409: 'Conflit avec une ressource existante.',
  422: 'Données invalides.',
  500: 'Erreur serveur. Réessayez dans quelques instants.',
  502: 'Service externe indisponible.',
  503: 'Configuration manquante côté serveur.',
};

const ERROR_MESSAGE_OVERRIDES: Record<string, string> = {
  'Challenge hebdomadaire introuvable': 'Élément introuvable.',
  'Competition introuvable': 'Élément introuvable.',
};

const FIELD_LABELS: Record<string, string> = {
  title: 'Le titre',
  description: 'La description',
  quiz_id: 'Le quiz',
  category_id: 'La catégorie',
  status: 'Le statut',
  starts_at: 'La date de début',
  ends_at: 'La date de fin',
  reward_text: 'La récompense',
  scheduled_day: 'Le jour planifié',
  day_order: "L'ordre du jour",
  type: 'Le type',
};

function translateFieldErrors(fieldErrors: FieldErrors): FieldErrors {
  const translated: FieldErrors = {};
  for (const [field, messages] of Object.entries(fieldErrors)) {
    const label = FIELD_LABELS[field] ?? field;
    translated[field] = messages.map((msg) => {
      if (msg.includes('Required') || msg.includes('requis')) return `${label} est requis.`;
      if (msg.includes('invalid') || msg.includes('invalide')) return `${label} est invalide.`;
      return msg;
    });
  }
  return translated;
}

function resolveMessage(status: number, rawMessage?: string): string {
  if (rawMessage && ERROR_MESSAGE_OVERRIDES[rawMessage]) {
    return ERROR_MESSAGE_OVERRIDES[rawMessage];
  }
  if (status === 404) return 'Élément introuvable.';
  if (status === 409) {
    const lower = rawMessage?.toLowerCase() ?? '';
    if (lower.includes('quiz') || lower.includes('planifi') || lower.includes('duplicate')) {
      return 'Ce quiz est déjà planifié pour ce challenge.';
    }
    return rawMessage ?? 'Conflit avec une ressource existante.';
  }
  return rawMessage ?? STATUS_FALLBACK_MESSAGES[status] ?? `Une erreur est survenue (${status}).`;
}

export function mapHttpError(status: number, body: unknown): ApiError {
  const data = (body ?? {}) as RawErrorShape;
  const message = resolveMessage(status, data.error || data.message);
  const fieldErrors = data.details?.fieldErrors
    ? translateFieldErrors(data.details.fieldErrors)
    : undefined;

  return new ApiError({
    status: data.status ?? status,
    message,
    fieldErrors,
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
