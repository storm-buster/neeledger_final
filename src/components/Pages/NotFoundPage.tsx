import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass, Home } from 'lucide-react';
import { MotionDiv } from '../ui-bits';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <MotionDiv
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg text-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 sm:p-10"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-nee-500 to-nee-600 shadow-lg shadow-nee-500/40">
          <Compass className="w-8 h-8 text-white" aria-hidden="true" />
        </div>

        <p className="text-6xl sm:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-nee-500 to-nee-600 bg-clip-text text-transparent">
          404
        </p>
        <h1 className="mt-3 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          The page you are looking for doesn&apos;t exist or may have moved.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-nee-500 to-nee-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nee-500/40 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nee-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Back to Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white/70 dark:bg-gray-700/60 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 border border-gray-200/70 dark:border-gray-600/60 shadow-sm transition hover:bg-white dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nee-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Go Back
          </button>
        </div>
      </MotionDiv>
    </div>
  );
}
