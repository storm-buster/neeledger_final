import React from 'react';

interface AuthLoadingScreenProps {
  message?: string;
}

export default function AuthLoadingScreen({ message = 'Verifying security credentials...' }: AuthLoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-nee-50 via-nee-100 to-nee-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="relative flex flex-col items-center">
        {/* Glowing aura */}
        <div className="absolute inset-0 bg-gradient-to-r from-nee-500 to-nee-600 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>

        <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50 flex flex-col items-center text-center max-w-sm">
          <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-nee-200 dark:border-gray-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-nee-600 border-t-transparent animate-spin"></div>
            <img
              src="/logo.jpg"
              alt="NeeLedger"
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>

          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            NeeLedger Security
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
