interface EnvConfig {
  apiBaseUrl: string;
  backofficeApiKey: string;
  adminEmail: string;
  adminPassword: string;
  devTools: boolean;
  isProduction: boolean;
}

function read(value: string | undefined, fallback = ''): string {
  return value && value.length > 0 ? value : fallback;
}

export const env: EnvConfig = {
  apiBaseUrl: read(import.meta.env.VITE_API_BASE_URL, 'http://localhost:3000/api/v1/backoffice'),
  backofficeApiKey: read(import.meta.env.VITE_BACKOFFICE_API_KEY),
  adminEmail: read(import.meta.env.VITE_ADMIN_EMAIL),
  adminPassword: read(import.meta.env.VITE_ADMIN_PASSWORD),
  devTools: read(import.meta.env.VITE_DEV_TOOLS, 'false') === 'true',
  isProduction: import.meta.env.PROD,
};
