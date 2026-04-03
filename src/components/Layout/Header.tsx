import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Menu } from 'lucide-react';
import NotificationBell from './NotificationBell';
 

interface HeaderProps {
  onToggleSidebar?: () => void;
  collapsed?: boolean;
  onNavigate?: (section: string) => void;
}

export default function Header({ onToggleSidebar, collapsed = false, onNavigate }: HeaderProps) {
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate('/settings');
    if (onNavigate) onNavigate('settings');
  };
  
  return (
  <header className="bg-white shadow-sm border-b border-nee-50 w-full">
  <div className={`${collapsed ? 'ml-20' : 'ml-64'} max-w-full w-auto px-6 py-4 flex items-center justify-between transition-all duration-300`}>
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md hover:bg-nee-50 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-6 h-6 text-nee-800" />
          </button>
          <img src="/logo.jpg" alt="NeeLedger logo" className="w-12 h-12 rounded-md object-cover shadow-sm" />
          <div>
            <h2 className="text-2xl font-bold text-nee-900 leading-tight">Dashboard Overview</h2>
            <p className="text-nee-700 text-sm">Manage carbon credit projects and verification processes</p>
          </div>
        </div>
        
          <div className="flex items-center space-x-4">
          <NotificationBell />
          
          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <button onClick={handleSettingsClick} className="p-2 text-nee-700 hover:text-nee-700 hover:bg-nee-50 rounded-lg transition-colors" title="Settings">
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 bg-nee-100 rounded-lg px-3 py-2">
              <User className="w-5 h-5 text-nee-700" />
              <span className="text-nee-800 font-medium text-sm">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}