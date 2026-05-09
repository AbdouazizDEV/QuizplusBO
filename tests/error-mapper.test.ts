import { describe, expect, it } from 'vitest';
import { mapHttpError, mapNetworkError } from '@infrastructure/http/error-mapper';
import { ApiError } from '@domain/errors/api-error';

describe('error-mapper', () => {
  it('mappe un body backend Zod en ApiError avec fieldErrors', () => {
    const body = {
      ok: false,
      error: 'Payload invalide',
      details: {
        formErrors: [],
        fieldErrors: { image_base64: ['String must contain at least 40 character(s)'] },
      },
      status: 400,
    };
    const err = mapHttpError(400, body);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.message).toBe('Payload invalide');
    expect(err.fieldErrors).toEqual(body.details.fieldErrors);
  });

  it('utilise un message par défaut quand body absent', () => {
    const err = mapHttpError(401, null);
    expect(err.status).toBe(401);
    expect(err.message).toMatch(/Clé API/i);
  });

  it('mappe une erreur réseau', () => {
    const err = mapNetworkError(new Error('boom'));
    expect(err.status).toBe(0);
    expect(err.message).toMatch(/joindre le serveur/i);
  });
});
