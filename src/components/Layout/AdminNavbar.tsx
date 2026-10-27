import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  UserCheck,
  Shield,
  CheckCircle,
  Verified,
  Settings,
  Bell,
  User,
  Moon,
  Sun,
  X,
  Menu,
  LogOut,
  LayoutGrid
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { mockNotifications } from '../../data/mockData';
import { useAuth } from '@/contexts/AuthContext';

interface AdminNavbarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const adminMenuItems = [
  { id: 'kyc', label: 'KYC', icon: UserCheck, path: '/kyc' },
  { id: 'acva', label: 'ACVA', icon: Shield, path: '/acva' },
  { id: 'validation', label: 'Validation', icon: CheckCircle, path: '/validation' },
  { id: 'verification', label: 'Verification', icon: Verified, path: '/verification' }
];

export default function AdminNavbar({ activeSection, onSectionChange }: AdminNavbarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut, isDemoMode } = useAuth();

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleNavigation = (item: typeof adminMenuItems[0]) => {
    navigate(item.path);
    if (onSectionChange) onSectionChange(item.id);
  };

  const handleSettings = () => {
    navigate('/settings');
    if (onSectionChange) onSectionChange('settings');
  };

  const handleSignOut = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.name || user?.user_metadata?.name || 'Administrator';
  const displayEmail = profile?.email || user?.email || 'admin@neeledger.com';

  return (
    <nav aria-label="Admin navigation" className={`fixed ${isDemoMode ? 'top-8 sm:top-9' : 'top-0'} left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-purple-200/40 dark:border-purple-900/40 shadow-lg transition-all overflow-visible`}>
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo & Admin Branding */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 min-w-0 lg:min-w-[260px]">
            <div className="relative group cursor-pointer" onClick={() => navigate('/kyc')}>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <img
                src="/logo.jpg"
                alt="NeeLedger Admin"
                className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover shadow-xl ring-2 ring-purple-400/50"
              />
            </div>
            <div className="hidden sm:block truncate cursor-pointer" onClick={() => navigate('/kyc')}>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base md:text-lg font-bold leading-tight text-gray-900 dark:text-white">
                  NeeLedger
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white tracking-wide shadow-sm">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium hidden md:block">
                Operations & Verification
              </p>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="hidden lg:flex items-center gap-2 flex-1 justify-center min-w-0 max-w-[650px] px-2">
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id || pathname === item.path;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`group relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-300 flex-shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                      : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md hover:scale-105'
                  }`}
                  title={item.label}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                  )}

                  <Icon className={`relative w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400'} transition-colors`} />
                  <span className={`relative text-xs sm:text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-700 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400'} transition-colors`}>
                    {item.label}
                  </span>

                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              );
            })}
          </div>

          {/* Right Action Icons & Admin Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Switcher to User Marketplace */}
            <button
              onClick={() => navigate('/')}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition-all shadow-sm hover:scale-105"
              title="Switch to User Marketplace"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-nee-600 dark:text-nee-400" />
              <span>User Panel</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="relative group p-2 sm:p-3 bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-110"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
              ) : (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-purple-400 transition-colors" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setNotifOpen((s) => !s); }}
                className="relative group p-2 sm:p-3 bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-110"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors" />
                {mockNotifications.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="font-semibold text-gray-900 dark:text-white">Admin Alerts</span>
                    <button onClick={() => setNotifOpen(false)} className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {mockNotifications.slice(0, 5).map((n) => (
                      <div key={n.id} className="px-4 py-3 border-b last:border-b-0 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{n.message}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{new Date(n.timestamp).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <button
              onClick={handleSettings}
              className="group relative p-2 sm:p-3 bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-110"
              title="System Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setProfileOpen((s) => !s); }}
                className="group flex items-center gap-2 sm:gap-3 pl-2 pr-3 sm:pl-3 sm:pr-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-50 to-white dark:from-gray-800 dark:to-gray-700 hover:from-white hover:to-purple-50 rounded-full transition-all duration-300 hover:shadow-lg border border-purple-200/50 dark:border-purple-800/50"
              >
                <div className="relative">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-purple-500 rounded-full ring-2 ring-white dark:ring-gray-900"></div>
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 leading-tight truncate max-w-[120px]">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold leading-none">
                    Administrator
                  </span>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">{displayName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{displayEmail}</div>
                    <div className="mt-1.5 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      System Administrator
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { setProfileOpen(false); navigate('/'); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <LayoutGrid className="w-4 h-4 text-gray-500" />
                      View User Marketplace
                    </button>
                    <button
                      onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-500" />
                      Admin Settings
                    </button>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 py-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((s) => !s)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="admin-mobile-navigation"
              className="lg:hidden group relative p-2 bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-all duration-300 hover:shadow-lg"
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileOpen && (
        <div
          id="admin-mobile-navigation"
          className="lg:hidden absolute top-full left-0 right-0 max-h-[calc(100vh-4rem)] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-purple-200/40 dark:border-purple-900/40 shadow-2xl p-4"
        >
          <div className="grid grid-cols-2 gap-2 mb-3">
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id || pathname === item.path;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNavigation(item);
                    setMobileOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <button
              onClick={() => {
                setMobileOpen(false);
                navigate('/');
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            >
              <LayoutGrid className="w-4 h-4" />
              Switch to User Panel
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
