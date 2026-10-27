import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  FolderOpen,
  MapPin,
  Brain,
  Satellite,
  Settings,
  Bell,
  User,
  Moon,
  Sun,
  X,
  Menu,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { mockNotifications } from '../../data/mockData';
import { useAuth } from '@/contexts/AuthContext';

interface UserNavbarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const userMenuItems = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'projects', label: 'Projects', icon: FolderOpen, path: '/projects' },
  { id: 'map', label: 'Map', icon: MapPin, path: '/map' },
  { id: 'xai', label: 'XAI', icon: Brain, path: '/xai' },
  { id: 'satellites', label: 'Satellites', icon: Satellite, path: '/satellites' }
];

export default function UserNavbar({ activeSection, onSectionChange }: UserNavbarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, isAdmin, signOut, isDemoMode } = useAuth();

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Allow Escape to close the mobile menu
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

  const handleNavigation = (item: typeof userMenuItems[0]) => {
    navigate(item.path);
    onSectionChange(item.id);
  };

  const handleSettings = () => {
    navigate('/settings');
    onSectionChange('settings');
  };

  const handleSignOut = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.name || user?.user_metadata?.name || 'User';
  const displayEmail = profile?.email || user?.email || 'user@neeledger.com';
  const roleLabel = profile?.role || 'Project Proponent';

  return (
    <nav aria-label="User navigation" className={`fixed ${isDemoMode ? 'top-8 sm:top-9' : 'top-0'} left-0 right-0 z-40 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 shadow-lg transition-all overflow-visible`}>
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo & Portal Identity */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 min-w-0 lg:min-w-[240px]">
            <div className="relative group cursor-pointer" onClick={() => navigate('/')}>
              <div className="absolute inset-0 bg-gradient-to-r from-nee-500 to-nee-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <img
                src="/logo.jpg"
                alt="NeeLedger"
                className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover shadow-xl ring-2 ring-white/50"
              />
            </div>
            <div className="hidden sm:block truncate cursor-pointer" onClick={() => navigate('/')}>
              <h1 className="text-sm sm:text-base md:text-lg font-bold leading-tight text-nee-800 dark:text-white">
                NeeLedger
              </h1>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium hidden md:block">
                Carbon Marketplace
              </p>
            </div>
          </div>

          {/* User Navigation Links */}
          <div className="hidden lg:flex items-center gap-1.5 flex-1 justify-center min-w-0 max-w-[700px] px-2">
            {userMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id || pathname === item.path;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 flex-shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-nee-500 to-nee-600 text-white shadow-lg shadow-nee-500/50 scale-105'
                      : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md hover:scale-105'
                  }`}
                  title={item.label}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-nee-400 to-nee-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  )}

                  <Icon className={`relative w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300 group-hover:text-nee-600 dark:group-hover:text-nee-400'} transition-colors`} />
                  <span className={`relative text-xs sm:text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-700 dark:text-gray-200 group-hover:text-nee-600 dark:group-hover:text-nee-400'} transition-colors`}>
                    {item.label}
                  </span>

                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              );
            })}
          </div>

          {/* Right Action Icons & Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="relative group p-2 sm:p-3 bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-110"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-nee-600 transition-colors" />
              ) : (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-nee-400 transition-colors" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setNotifOpen((s) => !s); }}
                className="relative group p-2 sm:p-3 bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-110"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-white group-hover:text-nee-600 dark:group-hover:text-nee-300 transition-colors" />
                {mockNotifications.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="font-semibold text-gray-900 dark:text-white">Notifications</span>
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
              className={`group relative p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                activeSection === 'settings'
                  ? 'bg-gradient-to-r from-nee-500 to-nee-600 text-white shadow-lg shadow-nee-500/50'
                  : 'bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg'
              }`}
            >
              <Settings className={`relative w-4 h-4 sm:w-5 sm:h-5 ${activeSection === 'settings' ? 'text-white' : 'text-gray-600 dark:text-gray-300 group-hover:text-nee-600 dark:group-hover:text-nee-400'} transition-colors`} />
            </button>

            {/* Profile Menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setProfileOpen((s) => !s); }}
                className="group flex items-center gap-2 sm:gap-3 pl-2 pr-3 sm:pl-3 sm:pr-4 py-1.5 sm:py-2 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 hover:from-white hover:to-gray-50 dark:hover:from-gray-700 dark:hover:to-gray-800 rounded-full transition-all duration-300 hover:shadow-lg border border-gray-200/50 dark:border-gray-600/50"
              >
                <div className="relative">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-nee-500 to-nee-700 rounded-full flex items-center justify-center shadow-md">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-gray-900"></div>
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 leading-tight truncate max-w-[120px]">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">
                    {roleLabel}
                  </span>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">{displayName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{displayEmail}</div>
                    <div className="mt-1.5 inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-nee-50 dark:bg-nee-900/30 text-nee-600 dark:text-nee-400 border border-nee-200 dark:border-nee-800">
                      {roleLabel}
                    </div>
                  </div>

                  <div className="py-1">
                    {/* Switch to Admin if user has admin privileges */}
                    {isAdmin && (
                      <button
                        onClick={() => { setProfileOpen(false); navigate('/admin'); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-nee-600 dark:text-nee-400 hover:bg-nee-50 dark:hover:bg-nee-900/20 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-nee-500" />
                        Admin Panel
                      </button>
                    )}
                    <button
                      onClick={() => { setProfileOpen(false); navigate('/settings'); onSectionChange('settings'); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile & Settings
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
              aria-controls="user-mobile-navigation"
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
          id="user-mobile-navigation"
          className="lg:hidden absolute top-full left-0 right-0 max-h-[calc(100vh-4rem)] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 shadow-2xl p-4"
        >
          <div className="grid grid-cols-2 gap-2 mb-3">
            {userMenuItems.map((item) => {
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
                      ? 'bg-gradient-to-r from-nee-500 to-nee-600 text-white shadow-lg'
                      : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {isAdmin && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate('/admin');
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-nee-50 dark:bg-nee-900/30 text-nee-600 dark:text-nee-400 border border-nee-200 dark:border-nee-800"
              >
                <ShieldCheck className="w-4 h-4" />
                Switch to Admin Panel
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
