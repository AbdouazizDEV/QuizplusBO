import { env } from '../config/env';
import { mapHttpError, mapNetworkError } from './error-mapper';

type JsonBody = unknown;
type QueryParam = string | number | boolean | undefined | null;
type QueryParams = Record<string, QueryParam>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: JsonBody | FormData;
  query?: QueryParams;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  isMultipart?: boolean;
}

function buildUrl(path: string, query?: QueryParams): string {
  const base = env.apiBaseUrl.replace(/\/+$/, '');
  const cleanedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(base + cleanedPath);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function getApiKey(): string {
  return env.backofficeApiKey;
}

async function parseResponse(res: Response): Promise<unknown> {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  try {
    const text = await res.text();
    return text || null;
  } catch {
    return null;
  }
}

export interface ApiSuccess<T> {
  data: T;
  raw: unknown;
}

export class ApiClient {
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, query, signal, headers = {}, isMultipart = false } = options;
    const url = buildUrl(path, query);

    const finalHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...headers,
    };

    const apiKey = getApiKey();
    if (apiKey) finalHeaders['x-api-key'] = apiKey;

    let payload: BodyInit | undefined;
    if (body !== undefined) {
      if (isMultipart && body instanceof FormData) {
        payload = body;
      } else if (body instanceof FormData) {
        payload = body;
      } else {
        finalHeaders['Content-Type'] = 'application/json';
        payload = JSON.stringify(body);
      }
    }

    let res: Response;
    try {
      res = await fetch(url, { method, headers: finalHeaders, body: payload, signal });
    } catch (err) {
      throw mapNetworkError(err);
    }

    const data = await parseResponse(res);

    if (!res.ok) {
      throw mapHttpError(res.status, data);
    }

    return data as T;
  }

  get<T>(path: string, query?: QueryParams | object, signal?: AbortSignal): Promise<T> {
    return this.request<T>(path, { method: 'GET', query: query as QueryParams | undefined, signal });
  }

  post<T>(path: string, body?: JsonBody, query?: QueryParams | object): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body,
      query: query as QueryParams | undefined,
    });
  }

  put<T>(path: string, body?: JsonBody): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body });
  }

  patch<T>(path: string, body?: JsonBody): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  postForm<T>(path: string, form: FormData): Promise<T> {
    return this.request<T>(path, { method: 'POST', body: form, isMultipart: true });
  }
}

export const apiClient = new ApiClient();
