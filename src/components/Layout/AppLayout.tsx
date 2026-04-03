import React, { ReactNode } from 'react';
import TopNavbar from './TopNavbar';
import ColorBends from '../ui-bits/ColorBends';
import Footer from './Footer';

interface AppLayoutProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (s: string) => void;
}

export default function AppLayout({ children, activeSection, onSectionChange }: AppLayoutProps) {
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
      {canUseWebGL ? <ColorBends colors={["#0ea5e9", "#7c3aed", "#06b6d4"]} /> : (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '100vh', pointerEvents: 'none', zIndex: 0, background: 'linear-gradient(90deg,#071428,#0b1220)' }} />
      )}
      <TopNavbar activeSection={activeSection} onSectionChange={onSectionChange} />

      <main className="pt-24 relative z-10">
        {children}
      </main>
      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <Footer />
      </div>
    </div>
  );
}
