import { ApiError } from '@domain/errors/api-error';
import { env } from '@infrastructure/config/env';

interface Credentials {
  email: string;
  password: string;
}

type SignInResult = { ok: true } | { ok: false; error: ApiError };

/**
 * Vérifie les identifiants admin contre les variables d'environnement.
 * En cas de succès, l'`ApiClient` utilisera automatiquement `VITE_BACKOFFICE_API_KEY`
 * pour signer les requêtes vers le backend NestJS.
 */
export async function signInWithCredentials({ email, password }: Credentials): Promise<SignInResult> {
  const expectedEmail = env.adminEmail.trim().toLowerCase();
  const expectedPassword = env.adminPassword;

  if (!expectedEmail || !expectedPassword) {
    return {
      ok: false,
      error: new ApiError({
        status: 503,
        message:
          "Identifiants admin non configurés (VITE_ADMIN_EMAIL / VITE_ADMIN_PASSWORD).",
      }),
    };
  }

  const submittedEmail = email.trim().toLowerCase();
  if (submittedEmail !== expectedEmail || password !== expectedPassword) {
    return {
      ok: false,
      error: new ApiError({
        status: 401,
        message: 'Email ou mot de passe incorrect.',
      }),
    };
  }

  return { ok: true };
}
