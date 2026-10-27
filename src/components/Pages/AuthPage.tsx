import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BusinessAccountType } from '../../types';
import { Eye, EyeOff, Mail, Lock, User, Briefcase, AlertCircle, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { isDemoModeAllowed } from '../../config/demo';

interface AuthPageProps {
  mode?: 'login' | 'signup';
}

export default function AuthPage({ mode = 'login' }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<BusinessAccountType>('Project Developer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { signUp, signIn, clearAuthError, enterDemoMode } = useAuth();
  const navigate = useNavigate();
  const demoAllowed = isDemoModeAllowed();

  const handleDemoSelect = (persona: 'user' | 'admin') => {
    enterDemoMode(persona);
    setRedirecting(true);
    if (persona === 'admin') {
      setSuccessMessage('Entering Demo Admin Portal (MRV Auditor view)...');
      setTimeout(() => navigate('/admin'), 300);
    } else {
      setSuccessMessage('Entering Demo User Portal (Project Proponent view)...');
      setTimeout(() => navigate('/'), 300);
    }
  };

  const handleInputChange = () => {
    if (error) setError('');
    clearAuthError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isLogin) {
        // Authenticate and obtain trusted role from public.users
        const result = await signIn(email, password);
        setRedirecting(true);

        // Role-based redirection:
        // Trusted admin -> /admin
        // Standard user -> /
        if (result.isAdmin) {
          setSuccessMessage('Admin credentials verified. Redirecting to Admin Panel...');
          setTimeout(() => {
            navigate('/admin');
          }, 400);
        } else {
          setSuccessMessage('Signed in successfully. Redirecting to User Panel...');
          setTimeout(() => {
            navigate('/');
          }, 400);
        }
      } else {
        await signUp(email, password, name, role);
        setRedirecting(true);
        setSuccessMessage('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 500);
      }
    } catch (err: any) {
      setRedirecting(false);
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMessage('');
    clearAuthError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nee-50 via-nee-100 to-nee-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-nee-500 to-nee-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <img
                src="/logo.jpg"
                alt="Neeledger Carbon Credit Marketplace"
                className="relative w-16 h-16 rounded-2xl object-cover shadow-xl ring-2 ring-white/50"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Neeledger Carbon Credit Marketplace
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLogin ? 'Welcome back! Please sign in to your account.' : 'Create your account to get started.'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field for signup */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      handleInputChange();
                    }}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nee-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    handleInputChange();
                  }}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nee-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    handleInputChange();
                  }}
                  required
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nee-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Business Account Type field for signup */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Type
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as BusinessAccountType)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nee-500 focus:border-transparent"
                  >
                    <option value="Project Developer">Project Developer</option>
                    <option value="Project Proponent">Project Proponent</option>
                    <option value="Trader">Trader</option>
                  </select>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-600 dark:text-red-400 text-sm leading-relaxed">{error}</p>
              </div>
            )}

            {/* Success / Redirecting message */}
            {successMessage && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-emerald-700 dark:text-emerald-300 text-sm leading-relaxed">{successMessage}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || redirecting}
              className="w-full py-3 px-4 bg-gradient-to-r from-nee-500 to-nee-600 text-white font-semibold rounded-lg shadow-lg hover:from-nee-600 hover:to-nee-700 focus:outline-none focus:ring-2 focus:ring-nee-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading || redirecting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {redirecting ? 'Redirecting...' : isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
              )}
            </button>
          </form>

          {/* Toggle between login and signup */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={toggleMode}
                className="ml-1 text-nee-600 dark:text-nee-400 hover:text-nee-700 dark:hover:text-nee-300 font-semibold transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* KYC Documents link for signup */}
          {!isLogin && (
            <div className="mt-4 text-center">
              <a
                href="/kyc"
                className="text-nee-600 dark:text-nee-400 hover:text-nee-700 dark:hover:text-nee-300 font-semibold transition-colors"
              >
                Upload KYC Documents →
              </a>
            </div>
          )}

          {/* Safe Local Demo Mode Options for Hackathon Preview */}
          {demoAllowed && (
            <div className="mt-6 pt-5 border-t border-gray-200/80 dark:border-gray-700/80">
              <div className="text-center mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                  Presentation / Demo Preview
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Evaluate both panels instantly with sample MRV data (Supabase connection not required).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDemoSelect('user')}
                  disabled={loading || redirecting}
                  className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-150 active:scale-[0.98]"
                  title="Explore User Panel as Project Proponent"
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span>Demo User Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoSelect('admin')}
                  disabled={loading || redirecting}
                  className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-150 active:scale-[0.98]"
                  title="Explore Admin Panel as Auditor"
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>Demo Admin Preview</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
