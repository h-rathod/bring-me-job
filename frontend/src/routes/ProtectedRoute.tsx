import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { getToken } from '../lib/storage';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
