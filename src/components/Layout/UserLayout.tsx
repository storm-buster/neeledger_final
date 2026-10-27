import React, { ReactNode } from 'react';
import UserNavbar from './UserNavbar';
import ColorBends from '../ui-bits/ColorBends';
import Footer from './Footer';
import DemoBanner from '../Common/DemoBanner';
import { useAuth } from '@/contexts/AuthContext';

interface UserLayoutProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (s: string) => void;
}

export default function UserLayout({ children, activeSection, onSectionChange }: UserLayoutProps) {
  const { isDemoMode } = useAuth();
  const canUseWebGL = typeof window !== 'undefined' && (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  })();

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <DemoBanner />
      {canUseWebGL ? (
        <ColorBends colors={["#0ea5e9", "#7c3aed", "#06b6d4"]} />
      ) : (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '100vh', pointerEvents: 'none', zIndex: 0, background: 'linear-gradient(90deg,#071428,#0b1220)' }} />
      )}

      <UserNavbar activeSection={activeSection} onSectionChange={onSectionChange} />

      <main className={`${isDemoMode ? 'pt-28 sm:pt-32' : 'pt-24'} relative z-10 transition-all duration-200`}>
        {children}
      </main>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <Footer />
      </div>
    </div>
  );
}
