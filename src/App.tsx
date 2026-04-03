import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import { Skeleton } from './components/ui-bits';
import { AuthProvider } from './contexts/AuthContext';
import { SupabaseService } from './lib/supabaseService';
import { Project, Account, ACVA } from './types';
import { mockACVAs } from './data/mockData';

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

  // Add state to hold selected project for details page
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Add state for real-time data from Supabase
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<any>({ totalProjects: 0, totalCarbonRemoved: 0, totalCreditsIssued: 0, totalBufferCredits: 0 });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [acvas, setACVAs] = useState<ACVA[]>(mockACVAs);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Load real-time data from Supabase
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [supabaseProjects, supabaseStats] = await Promise.all([
          SupabaseService.getProjects(),
          SupabaseService.getDashboardStats()
        ]);
        
        // Always use Supabase data (no mock fallback)
        setProjects(supabaseProjects);
        setStats(supabaseStats);

        // Load other data types
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
        // On error, set empty arrays instead of mock data
        setProjects([]);
        setStats({ totalProjects: 0, totalCarbonRemoved: 0, totalCreditsIssued: 0, totalBufferCredits: 0 });
        setAccounts([]);

      }
    };

    loadAllData();

    // Subscribe to real-time updates
    const projectsSubscription = SupabaseService.subscribeToProjects((updatedProjects) => {
      setProjects(updatedProjects);
    });

    const evidenceSubscription = SupabaseService.subscribeToEvidence((updatedEvidence) => {
      // Update notifications when new evidence is added
      setNotifications(prev => [
        {
          id: Date.now().toString(),
          type: 'evidence',
          message: 'New evidence uploaded',
          count: updatedEvidence.length,
          timestamp: new Date().toISOString()
        },
        ...prev
      ]);
    });

    const usersSubscription = SupabaseService.subscribeToUsers((updatedUsers) => {
      setAccounts(updatedUsers.map(user => ({
        id: user.id,
        companyName: user.name,
        projects: [],
        kycDocument: user.additional_data?.kycDocument || '',
        accountType: user.role || 'Project Proponent',
        email: user.email,
        registrationDate: user.member_since || '',
        kycStatus: 'Done'
      })));
    });

    return () => {
      projectsSubscription?.unsubscribe();
      evidenceSubscription?.unsubscribe();
      usersSubscription?.unsubscribe();
    };
  }, []);

  // Sync activeSection with current path
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/projects')) {
      setActiveSection('projects');
    } else if (path.startsWith('/satellites')) {
      setActiveSection('satellites');
    } else if (path.startsWith('/map')) {
      setActiveSection('map');
    } else if (path.startsWith('/kyc')) {
      setActiveSection('kyc');
    } else if (path.startsWith('/acva')) {
      setActiveSection('acva');
    } else if (path.startsWith('/validation')) {
      setActiveSection('validation');
    } else if (path.startsWith('/verification')) {
      setActiveSection('verification');
    } else if (path.startsWith('/xai')) {
      setActiveSection('xai');
    } else if (path.startsWith('/settings')) {
      setActiveSection('settings');
    } else if (path === '/' || path === '/home') {
      setActiveSection('home');
    }
  }, [location]);



  // Handler to select project and navigate to details page
  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setActiveSection('projectDetails');
  };

  // Handler to go back to projects list
  const handleBackToProjects = () => {
    setSelectedProject(null);
    setActiveSection('projects');
  };



  // Handler to assign an ACVA to a project
  const handleAssignACVA = (projectId: string, acvaId: string) => {
    // Update project status to 'under_validation'
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, status: 'under_validation', assigned_acva: acvaId } : p
    ));
    // Update ACVA's assigned projects list
    setACVAs(prev => prev.map(a => 
      a.id === acvaId ? { ...a, projectsAssigned: [...a.projectsAssigned, projectId] } : a
    ));
  };

  // Handler to sanction a project (move from validation to verification)
  const handleSanctionProject = (projectId: string) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, status: 'under_verification' } : p
    ));
  };

  // Handler to assign a verification ACVA (must differ from validation ACVA)
  const handleAssignVerificationACVA = (projectId: string, acvaId: string) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, status: 'verification_in_progress', verification_acva: acvaId, claimed_credits: p.creditsIssued || 500 } : p
    ));
    setACVAs(prev => prev.map(a =>
      a.id === acvaId ? { ...a, projectsAssigned: [...a.projectsAssigned, projectId] } : a
    ));
  };

  // Handler to release credits after admin reviews both reports
  const handleReleaseCredits = (projectId: string, credits: number) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, status: 'credits_released', released_credits: credits } : p
    ));
  };

  return (
    <AppLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<AuthPage mode="login" />} />
                <Route path="/signup" element={<AuthPage mode="signup" />} />
                <Route path="/" element={<HomePage stats={stats} onNavigateToProjects={() => setActiveSection('projects')} />} />
                <Route path="/projects" element={<ProjectsPage projects={projects} onSelectProject={handleSelectProject} acvas={acvas} onAssignACVA={handleAssignACVA} />} />
                <Route path="/projects/:projectId" element={<ProjectDetailsPage project={selectedProject!} onBack={handleBackToProjects} acvas={acvas} />} />
                <Route path="/kyc" element={<KYCPage accounts={accounts} />} />
                <Route path="/acva" element={<ACVAPage acvas={acvas} />} />
                <Route path="/validation" element={<ValidationPage projects={projects} acvas={acvas} onSanctionProject={handleSanctionProject} />} />
                <Route path="/verification" element={
                  <VerificationPage projects={projects} acvas={acvas} onAssignVerificationACVA={handleAssignVerificationACVA} onReleaseCredits={handleReleaseCredits} />
                } />
                <Route path="/xai" element={<XAIPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/satellites" element={<SatellitesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Suspense>

        </div>
    </AppLayout>
  );
}

export default AppWrapper;