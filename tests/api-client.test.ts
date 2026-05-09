import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClient } from '@infrastructure/http/api-client';
import { ApiError } from '@domain/errors/api-error';

const originalFetch = globalThis.fetch;

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('GET injecte le header x-api-key et parse le JSON', async () => {
    const mock = vi.fn(async (_url: unknown, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      expect(headers.get('Accept')).toBe('application/json');
      return jsonResponse(200, { ok: true, items: [{ id: '1' }] });
    });
    globalThis.fetch = mock as unknown as typeof fetch;
    const res = await client.get<{ ok: boolean; items: unknown[] }>('/levels');
    expect(res.ok).toBe(true);
    expect(res.items).toHaveLength(1);
    expect(mock).toHaveBeenCalledOnce();
  });

  it('POST sérialise le body en JSON et pose Content-Type', async () => {
    const mock = vi.fn(async (_url: unknown, init?: RequestInit) => {
      expect(init?.method).toBe('POST');
      expect(init?.body).toBe(JSON.stringify({ a: 1 }));
      const headers = new Headers(init?.headers);
      expect(headers.get('Content-Type')).toBe('application/json');
      return jsonResponse(201, { ok: true, item: { id: 'x' } });
    });
    globalThis.fetch = mock as unknown as typeof fetch;
    const res = await client.post<{ ok: boolean; item: { id: string } }>('/foo', { a: 1 });
    expect(res.item.id).toBe('x');
  });

  it('mappe une erreur HTTP en ApiError', async () => {
    globalThis.fetch = vi.fn(async () =>
      jsonResponse(400, {
        ok: false,
        error: 'Payload invalide',
        details: { fieldErrors: { name: ['Required'] } },
      }),
    ) as unknown as typeof fetch;

    await expect(client.post('/foo', { a: 1 })).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      message: 'Payload invalide',
    });
    try {
      await client.post('/foo', { a: 1 });
    } catch (err) {
      expect(ApiError.is(err)).toBe(true);
      if (ApiError.is(err)) {
        expect(err.fieldErrors).toEqual({ name: ['Required'] });
      }
    }
  });

  it('mappe une erreur réseau', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('offline');
    }) as unknown as typeof fetch;

    await expect(client.get('/levels')).rejects.toMatchObject({ name: 'ApiError', status: 0 });
  });
});
