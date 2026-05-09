import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '@application/auth/auth-store';

export function PrivateRoute({ children }: { children: ReactNode }) {
  const authed = useAuthStore((s) => s.authed);
  const location = useLocation();
  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
