import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles } from 'lucide-react';

/**
 * ProtectedRoute Component
 * Guards routes that require student authentication (e.g. /dashboard).
 * Unauthenticated visitors are automatically redirected to /login.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-forest-900 text-white flex items-center justify-center animate-pulse shadow-md">
          <Sparkles className="w-6 h-6 text-forest-200" />
        </div>
        <p className="text-sm font-semibold text-stone-600">Verifying student session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to /login with the intended return location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
