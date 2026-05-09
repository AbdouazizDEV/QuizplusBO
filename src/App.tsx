import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { ApiError } from '@domain/errors/api-error';
import { ThemeProvider, useTheme } from '@presentation/theme/ThemeProvider';
import { AppRouter } from '@presentation/routes/AppRouter';
import { useAuthStore } from '@application/auth/auth-store';
import { env } from '@infrastructure/config/env';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (ApiError.is(error)) {
          if ([400, 401, 403, 404, 422].includes(error.status)) return false;
        }
        return failureCount < 2;
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

function ToasterPortal() {
  const { theme } = useTheme();
  return (
    <Toaster
      richColors
      theme={theme}
      position="top-right"
      closeButton
      toastOptions={{ className: 'font-sans' }}
    />
  );
}

export function App() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppRouter />
        <ToasterPortal />
        {env.devTools ? <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" /> : null}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
