import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Leaf, Award, Shield, ArrowRight } from 'lucide-react';
import { DashboardStats } from '../../types';
import { ColorBends, MotionDiv, MotionH1, MotionP } from '../ui-bits';
import StatsSpark from '../ui-bits/StatsSpark';
import InfoCard from '../ui-bits/InfoCard';
import ThreeAccent from '../ui-bits/ThreeAccent';
import ThreeStrip from '../ui-bits/ThreeStrip';
import ThreeNebula from '../ui-bits/ThreeNebula';

interface HomePageProps {
  stats: DashboardStats;
  onNavigateToProjects: () => void;
}

export default function HomePage({ stats, onNavigateToProjects }: HomePageProps) {
  const navigate = useNavigate();

  const handleNavigateToProjects = () => {
    navigate('/projects');
    onNavigateToProjects();
  };
  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: TrendingUp,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Carbon Removed',
      value: `${stats.totalCarbonRemoved.toLocaleString()} tonnes`,
      icon: Leaf,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Credits Issued',
      value: stats.totalCreditsIssued.toLocaleString(),
      icon: Award,
      color: 'bg-nee-500',
      bgColor: 'bg-nee-50',
      textColor: 'text-nee-700'
    },
    {
      title: 'Buffer Credits',
      value: stats.totalBufferCredits.toLocaleString(),
      icon: Shield,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700'
    }
  ];

  return (
  <div className="min-h-screen bg-gradient-to-br from-nee-50 via-nee-100 to-nee-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
      {/* Animated background */}
      <ColorBends colors={["#667eea", "#764ba2", "#f093fb"]} />
      {/* Nebula banner to enrich site visuals */}
      <div className="absolute inset-x-0 top-0 mt-0 z-[-12] pointer-events-none">
        <ThreeNebula height={420} />
      </div>
      {/* Hero Section */}
      <div className="relative h-96 bg-transparent">
        <div className="absolute inset-0 flex items-center justify-center text-center z-10">
          <div className="max-w-4xl px-6">
            <div className="mx-auto readable-surface hero-panel readable-surface-dark-overlay px-6 py-12 rounded-2xl shadow-2xl">
              <MotionH1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-1 hero-title-solid hero-readable-text tracking-tight relative inline-block">
                NeeLedger
              </MotionH1>
              <div className="mx-auto mt-3 w-48 sm:w-64 md:w-80">
                <span className="hero-underline block" />
              </div>
              <MotionP initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.12 }} className="text-lg sm:text-xl mb-3 leading-relaxed text-white/95">
                Leading the future of carbon credit management through blockchain and AI verification.
              </MotionP>
              <MotionP initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.18 }} className="text-base sm:text-lg opacity-95 leading-relaxed text-white/90">
                Empowering sustainable development by connecting developers with verified carbon removal initiatives worldwide.
              </MotionP>
              <div className="mt-6 flex items-center justify-center gap-4">
                <a href="/projects" className="inline-block">
                  <button className="px-5 py-3 rounded-lg bg-gradient-to-r from-nee-500 to-nee-600 text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform">
                    Explore Projects
                  </button>
                </a>
                <a href="/about" className="inline-block">
                  <button className="px-4 py-2 rounded-lg bg-white/10 dark:bg-white/6 text-white/95 border border-white/8 hover:shadow-sm transition-all">
                    Learn More
                  </button>
                </a>
              </div>
            </div>
            </div>
          </div>
        </div>

      {/* Decorative separator */}
      <div className="section-sep" aria-hidden="true">
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-14">
          <defs>
            <linearGradient id="sepGrad" x1="0%" x2="100%">
              <stop offset="0%" stopColor="rgba(124,58,237,0.06)" />
              <stop offset="50%" stopColor="rgba(6,182,212,0.06)" />
              <stop offset="100%" stopColor="rgba(244,114,182,0.04)" />
            </linearGradient>
          </defs>
          <path d="M0,40 C300,0 900,80 1200,40 L1200,60 L0,60 Z" fill="url(#sepGrad)" />
        </svg>
      </div>

      {/* Statistics Section */}
      <div className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-block stats-panel px-6 py-4 rounded-2xl shadow-md">
              <h2 className="big-stats-heading">Platform Statistics</h2>
              <p className="text-sm sm:text-lg text-white/90">Real-time insights into our carbon credit ecosystem</p>
            </div>
          </div>

          <div className="stats-section-panel mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 stat-grid-wrapper">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <MotionDiv
                  key={index}
                  onClick={handleNavigateToProjects}
                  whileHover={{ translateY: -6 }}
                  whileTap={{ scale: 0.995 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                  className={`stat-card poster cursor-pointer group relative overflow-hidden`}
                >
                  {/* hover image (appears as a soft backdrop on hover) */}
                  <img src={`/stat-cards/stat-${index + 1}.svg`} alt={`${stat.title} visual`} className="stat-hover-img" loading="lazy" />
                  <div className="relative z-10 flex flex-col items-center justify-center px-4">
                    <div className="stat-icon-large">
                      <div className={`${stat.color} w-14 h-14 rounded-lg flex items-center justify-center text-white`}> 
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="stat-number">{stat.value}<span className="ml-1">{typeof stat.value === 'number' ? '+' : ''}</span></div>
                    <div className="stat-label mt-2">{stat.title}</div>
                  </div>

                  <div className="absolute inset-0 pointer-events-none stat-spark">
                    <StatsSpark color={stat.color === 'bg-nee-500' ? '#0ea5e9' : stat.color === 'bg-green-500' ? '#10b981' : stat.color === 'bg-blue-500' ? '#3b82f6' : '#f59e0b'} size={120} />
                  </div>
                </MotionDiv>
              );
            })}
            </div>
          </div>
        </div>
      </div>

      {/* Redesigned Additional Info Section (cards horizontal on md+) */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="readable-surface px-8 py-8 rounded-2xl shadow-2xl">
            <div className="text-center">
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Why Choose NeeLedger?</h3>
              <p className="text-white/90 mb-6">A modern platform that combines secure blockchain ledgers, AI-backed verification, and transparent reporting — built for real climate impact.</p>
            </div>

            {/* Horizontal cards: stack on small, 3 across on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoCard Icon={Shield} title="Blockchain Security" description="Immutable records and transparent transactions powered by smart contracts." accent="bg-nee-600" />
              <InfoCard Icon={Award} title="Verified Credits" description="Rigorous validation and third-party accreditation for each credit." accent="bg-nee-500" />
              <InfoCard Icon={Leaf} title="Measured Impact" description="Satellite monitoring and AI ensure verifiable carbon removal." accent="bg-green-500" />
            </div>

            <div className="mt-6 flex items-center justify-center gap-4">
              <a href="/projects" className="inline-block">
                <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-nee-500 to-nee-600 text-white font-semibold shadow-lg">Explore Projects</button>
              </a>
              <a href="/about" className="inline-block">
                <button className="px-5 py-3 rounded-lg bg-white/8 text-white/95 border border-white/10">How it works</button>
              </a>
            </div>
          </div>

          {/* Accent visual below cards (centered on small) */}
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-sm">
              <ThreeAccent size={320} />
            </div>
          </div>
          {/* Decorative three.js strip to fill space before footer */}
          <div className="mt-6">
            <ThreeStrip height={110} />
          </div>
        </div>
      </section>

    </div>
  );
}