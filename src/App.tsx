import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Skeleton } from './components/ui-bits';
import { AuthProvider } from './contexts/AuthContext';
import { SupabaseService } from './lib/supabaseService';
import { Project, Account, ACVA } from './types';
import { mockACVAs } from './data/mockData';
import { demoUserProjects, demoAdminProjects, demoAccounts, demoACVAs, demoStats } from './data/demoData';
import { useAuth } from './contexts/AuthContext';
import RequireAuth from './components/Auth/RequireAuth';
import RequireAdmin from './components/Auth/RequireAdmin';
import UserLayout from './components/Layout/UserLayout';
import AdminLayout from './components/Layout/AdminLayout';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./components/Pages/HomePage'));
const AuthPage = lazy(() => import('./components/Pages/AuthPage'));
const ProjectsPage = lazy(() => import('./components/Pages/ProjectsPage'));
const ProjectDetailsPage = lazy(() => import('./components/Pages/ProjectDetailsPage'));
const KYCPage = lazy(() => import('./components/Pages/KYCPage'));
const ACVAPage = lazy(() => import('./components/Pages/ACVAPage'));
const ValidationPage = lazy(() => import('./components/Pages/ValidationPage'));
const VerificationPage = lazy(() => import('./components/Pages/VerificationPage'));
const XAIPage = lazy(() => import('./components/Pages/XAIPage'));
const MapPage = lazy(() => import('./components/Pages/MapPage'));
const SettingsPage = lazy(() => import('./components/Pages/SettingsPage'));
const SatellitesPage = lazy(() => import('./components/Pages/SatellitesPage'));
const NotFoundPage = lazy(() => import('./components/Pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('./components/Pages/UnauthorizedPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="p-6 space-y-4">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-4 w-96" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
  </div>
);

function AppWrapper() {
  return (
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  );
}

function App() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('projects');
  const { isDemoMode, isAdmin } = useAuth();

  // Synchronize active section with the current URL path
  useEffect(() => {
    const rawPath = location.pathname.replace('/', '') || 'home';
    const cleanSection = rawPath.split('/')[0];
    setActiveSection(cleanSection);
  }, [location.pathname]);

  // Selected project for details page
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Real-time data from Supabase or isolated Demo Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<any>({ totalProjects: 0, totalCarbonRemoved: 0, totalCreditsIssued: 0, totalBufferCredits: 0 });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [acvas, setACVAs] = useState<ACVA[]>(mockACVAs);
  const [, setNotifications] = useState<any[]>([]);

  // Load data: either isolated Demo Data or live Supabase
  useEffect(() => {
    if (isDemoMode) {
      // Use isolated demo data without making any remote Supabase requests
      setProjects(isAdmin ? demoAdminProjects : demoUserProjects);
      setStats(demoStats);
      setAccounts(demoAccounts);
      setACVAs(demoACVAs);
      return;
    }

    const loadAllData = async () => {
      try {
        const [supabaseProjects, supabaseStats] = await Promise.all([
          SupabaseService.getProjects(),
          SupabaseService.getDashboardStats()
        ]);

        setProjects(supabaseProjects);
        setStats(supabaseStats);

        const [userAccounts, userNotifications] = await Promise.all([
          SupabaseService.getUserAccounts(),
          SupabaseService.getNotifications()
        ]);

        setAccounts(userAccounts.map(user => ({
          id: user.id,
          companyName: user.name,
          projects: [],
          kycDocument: user.additional_data?.kycDocument || '',
          accountType: (user.role as 'Project Proponent' | 'Trader') || 'Project Proponent',
          email: user.email,
          registrationDate: user.member_since || '',
          kycStatus: 'Done'
        })) as Account[]);

        setNotifications(userNotifications);
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
        setProjects([]);
        setStats({ totalProjects: 0, totalCarbonRemoved: 0, totalCreditsIssued: 0, totalBufferCredits: 0 });
        setAccounts([]);
      }
    };

    loadAllData();
  }, [isDemoMode, isAdmin]);

  // Handlers for project selection & navigation
  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  const handleAssignACVA = (projectId: string, acvaId: string) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, assigned_acva: acvaId, status: 'under_validation' } : p
    ));
    setACVAs(prev => prev.map(a =>
      a.id === acvaId ? { ...a, projectsAssigned: [...a.projectsAssigned, projectId] } : a
    ));
    if (isDemoMode) {
      alert(`[Demo Mode Simulation]\n\nProject: ${projectId}\nAssigned Validation Agency: ${acvaId}\nStatus: Under Validation\n\n(Database update simulated in memory).`);
    }
  };

  const handleSanctionProject = (projectId: string) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, status: 'under_verification' } : p
    ));
    if (isDemoMode) {
      alert(`[Demo Mode Simulation]\n\nProject: ${projectId}\nStatus: Sanctioned by Admin Board\n\n(Database update simulated in memory).`);
    }
  };

  const handleAssignVerificationACVA = (projectId: string, acvaId: string) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, status: 'verification_in_progress', verification_acva: acvaId, claimed_credits: p.creditsIssued || 500 } : p
    ));
    setACVAs(prev => prev.map(a =>
      a.id === acvaId ? { ...a, projectsAssigned: [...a.projectsAssigned, projectId] } : a
    ));
    if (isDemoMode) {
      alert(`[Demo Mode Simulation]\n\nProject: ${projectId}\nAssigned Verification Agency: ${acvaId}\nStatus: Verification In Progress\n\n(Database update simulated in memory).`);
    }
  };

  const handleReleaseCredits = (projectId: string, credits: number) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, status: 'credits_released', released_credits: credits } : p
    ));
    if (isDemoMode) {
      alert(`[Demo Mode Simulation]\n\nProject: ${projectId}\nReleased: ${credits.toLocaleString()} tCO2e Carbon Credits\nStatus: Credits Released on Ledger\n\n(Database mutation & smart contract token minting simulated in memory).`);
    }
  };

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* =============================================================== */}
        {/* Public Routes (Shared Auth & Status) */}
        {/* =============================================================== */}
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route
          path="/unauthorized"
          element={
            <UserLayout activeSection="unauthorized" onSectionChange={setActiveSection}>
              <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
                <UnauthorizedPage />
              </div>
            </UserLayout>
          }
        />

        {/* =============================================================== */}
        {/* Protected Admin Panel Routes (Requires trusted is_admin = true) */}
        {/* =============================================================== */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Navigate to="/kyc" replace />
            </RequireAdmin>
          }
        />
        <Route
          path="/kyc"
          element={
            <RequireAdmin>
              <AdminLayout activeSection="kyc" onSectionChange={setActiveSection}>
                <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
                  <KYCPage accounts={accounts} />
                </div>
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="/acva"
          element={
            <RequireAdmin>
              <AdminLayout activeSection="acva" onSectionChange={setActiveSection}>
                <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
                  <ACVAPage acvas={acvas} />
                </div>
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="/validation"
          element={
            <RequireAdmin>
              <AdminLayout activeSection="validation" onSectionChange={setActiveSection}>
                <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
                  <ValidationPage projects={projects} acvas={acvas} onSanctionProject={handleSanctionProject} />
                </div>
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="/verification"
          element={
            <RequireAdmin>
              <AdminLayout activeSection="verification" onSectionChange={setActiveSection}>
                <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
                  <VerificationPage
                    projects={projects}
                    acvas={acvas}
                    onAssignVerificationACVA={handleAssignVerificationACVA}
                    onReleaseCredits={handleReleaseCredits}
                  />
                </div>
              </AdminLayout>
            </RequireAdmin>
          }
        />

        {/* =============================================================== */}
        {/* Protected User Panel Routes (Requires active session) */}
        {/* =============================================================== */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <UserLayout activeSection="home" onSectionChange={setActiveSection}>
                <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
                  <HomePage stats={stats} onNavigateToProjects={() => setActiveSection('projects')} />
                </div>
              </UserLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/projects"
          element={
            <RequireAuth>
              <UserLayout activeSection="projects" onSectionChange={setActiveSection}>
                <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
                  <ProjectsPage projects={projects} onSelectProject={handleSelectProject} acvas={acvas} onAssignACVA={handleAssignACVA} />
                </div>
              </UserLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <RequireAuth>
              <UserLayout activeSection="projects" onSectionChange={setActiveSection}>
                <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
                  <ProjectDetailsPage project={selectedProject!} onBack={handleBackToProjects} acvas={acvas} />
                </div>
              </UserLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/map"
          element={
            <RequireAuth>
              <UserLayout activeSection="map" onSectionChange={setActiveSection}>
                <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
                  <MapPage />
                </div>
              </UserLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/xai"
          element={
            <RequireAuth>
              <UserLayout activeSection="xai" onSectionChange={setActiveSection}>
                <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
                  <XAIPage />
                </div>
              </UserLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/satellites"
          element={
            <RequireAuth>
              <UserLayout activeSection="satellites" onSectionChange={setActiveSection}>
                <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
                  <SatellitesPage />
                </div>
              </UserLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <UserLayout activeSection="settings" onSectionChange={setActiveSection}>
                <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
                  <SettingsPage />
                </div>
              </UserLayout>
            </RequireAuth>
          }
        />

        {/* =============================================================== */}
        {/* Catch-all 404 Route */}
        {/* =============================================================== */}
        <Route
          path="*"
          element={
            <UserLayout activeSection="not-found" onSectionChange={setActiveSection}>
              <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
                <NotFoundPage />
              </div>
            </UserLayout>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default AppWrapper;
