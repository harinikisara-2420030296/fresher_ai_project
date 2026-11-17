import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-2xl bg-[#121216] flex items-center justify-center shadow-lg mb-4 animate-bounce">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polygon points="12 2 2 8.5 2 15.5 12 22 22 15.5 22 8.5 12 2" />
          </svg>
        </div>
        <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Verifying Fresher.AI session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

