import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, User, ArrowRightLeft, LogOut, Info } from 'lucide-react';

export default function DemoBanner() {
  const { isDemoMode, isAdmin, enterDemoMode, exitDemoMode } = useAuth();
  const navigate = useNavigate();

  if (!isDemoMode) return null;

  const handleSwitchPersona = () => {
    if (isAdmin) {
      enterDemoMode('user');
      navigate('/');
    } else {
      enterDemoMode('admin');
      navigate('/admin');
    }
  };

  const handleExit = () => {
    exitDemoMode();
    navigate('/login');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-950/95 via-gray-900/95 to-amber-950/95 backdrop-blur-md border-b border-amber-500/30 text-amber-100 text-xs py-2 px-4 shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Indicator & Message */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500 text-gray-950 shadow-sm animate-pulse">
            DEMO MODE
          </span>
          <span className="font-semibold text-amber-200 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            Sample Data Only
          </span>
          <span className="hidden sm:inline text-amber-300/70 border-l border-amber-500/20 pl-2.5">
            Live Supabase mutations & real blockchain transactions are simulated in memory for presentation.
          </span>
        </div>

        {/* Right: Persona Badge & Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Active Persona Tag */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 text-white font-medium text-[11px] border border-white/15">
            {isAdmin ? (
              <>
                <Shield className="w-3 h-3 text-indigo-400" />
                <span>Auditor Admin View</span>
              </>
            ) : (
              <>
                <User className="w-3 h-3 text-emerald-400" />
                <span>Project Proponent View</span>
              </>
            )}
          </span>

          {/* Persona Switch Button */}
          <button
            onClick={handleSwitchPersona}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 hover:text-white border border-amber-500/40 text-[11px] font-medium transition-colors"
            title={isAdmin ? "Switch to Demo Proponent Portal" : "Switch to Demo Admin Portal"}
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>{isAdmin ? 'Switch to User View' : 'Switch to Admin View'}</span>
          </button>

          {/* Exit Demo Button */}
          <button
            onClick={handleExit}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-100 border border-red-500/30 text-[11px] font-medium transition-colors"
            title="Exit Demo Mode and return to Login"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden xs:inline">Exit Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
