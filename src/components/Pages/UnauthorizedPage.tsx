import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Home } from 'lucide-react';
import { MotionDiv } from '../ui-bits';
import { useAuth } from '../../contexts/AuthContext';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const attemptedPath = (location.state as any)?.attemptedPath || 'Admin Section';

  const handleSignOutAndSwitch = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <MotionDiv
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg text-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 sm:p-10"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 shadow-lg shadow-red-500/30">
          <ShieldAlert className="w-8 h-8 text-white" aria-hidden="true" />
        </div>

        <p className="text-xs uppercase tracking-widest font-bold text-red-600 dark:text-red-400 mb-1">
          403 Forbidden
        </p>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Admin Access Required
        </h1>
        <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
          The requested area (<code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs font-mono text-gray-800 dark:text-gray-200">{attemptedPath}</code>) is restricted to system administrators.
        </p>

        {user && (
          <div className="mt-4 p-3 bg-gray-50/70 dark:bg-gray-900/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-xs text-gray-600 dark:text-gray-400">
            Signed in as: <span className="font-semibold text-gray-900 dark:text-gray-200">{user.email}</span>
            <span className="block mt-0.5 text-gray-500 dark:text-gray-500">
              Role: {profile?.role || 'User'} (Standard Account)
            </span>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-nee-500 to-nee-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nee-500/40 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nee-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Go to User Dashboard
          </button>
          <button
            onClick={handleSignOutAndSwitch}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white/70 dark:bg-gray-700/60 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 border border-gray-200/70 dark:border-gray-600/60 shadow-sm transition hover:bg-white dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nee-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sign in as Admin
          </button>
        </div>
      </MotionDiv>
    </div>
  );
}
