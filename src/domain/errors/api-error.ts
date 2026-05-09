export type FieldErrors = Record<string, string[]>;

export interface ApiErrorPayload {
  status: number;
  message: string;
  fieldErrors?: FieldErrors;
  raw?: unknown;
}

export class ApiError extends Error {
  status: number;
  fieldErrors?: FieldErrors;
  raw?: unknown;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.status = payload.status;
    this.fieldErrors = payload.fieldErrors;
    this.raw = payload.raw;
  }

  static is(value: unknown): value is ApiError {
    return value instanceof ApiError;
  }
}
