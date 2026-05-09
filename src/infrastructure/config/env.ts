interface EnvConfig {
  apiBaseUrl: string;
  backofficeApiKey: string;
  adminEmail: string;
  adminPassword: string;
  devTools: boolean;
  isProduction: boolean;
}

function read(name: string, fallback = ''): string {
  const value = (import.meta.env as Record<string, string | undefined>)[name];
  return value && value.length > 0 ? value : fallback;
}

export const env: EnvConfig = {
  apiBaseUrl: read('VITE_API_BASE_URL', 'http://localhost:3000/api/v1/backoffice'),
  backofficeApiKey: read('VITE_BACKOFFICE_API_KEY', ''),
  adminEmail: read('VITE_ADMIN_EMAIL', ''),
  adminPassword: read('VITE_ADMIN_PASSWORD', ''),
  devTools: read('VITE_DEV_TOOLS', 'false') === 'true',
  isProduction: import.meta.env.PROD,
};
