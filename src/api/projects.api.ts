import { supabase } from '../lib/supabase';
import { SupabaseService } from '../lib/supabaseService';
import { Project, DashboardStats } from '../types';
import { isDemoModeAllowed, getStoredDemoPersona } from '../config/demo';
import { demoAdminProjects, demoUserProjects, demoStats } from '../data/demoData';

export interface ProjectRecord {
  id: string;
  name?: string;
  description?: string;
  user_id?: string;
  status?: string;
  coordinates?: string;
  state_name?: string;
  country?: string;
  created_at?: string;
  claimed_credits?: number;
  released_credits?: number;
  bufferCredits?: number;
  riskAssessment?: string;
  assigned_acva?: string;
  verification_acva?: string;
  additional_data?: Record<string, any>;
  documents?: Array<{ file_name: string }>;
  images?: string[];
  [key: string]: any;
}

export const projectsApi = {
  /**
   * Fetches all projects. In Demo Mode, returns isolated sample projects.
   */
  getProjects: async (): Promise<ProjectRecord[]> => {
    if (isDemoModeAllowed() && getStoredDemoPersona()) {
      const persona = getStoredDemoPersona();
      return (persona === 'admin' ? demoAdminProjects : demoUserProjects) as unknown as ProjectRecord[];
    }
    return SupabaseService.getProjects();
  },

  /**
   * Fetches a single project by its primary key ID
   */
  getProjectById: async (projectId: string): Promise<ProjectRecord | null> => {
    // If in demo mode or querying a sample demo project, resolve from isolated local demo data
    if (projectId.startsWith('PRJ-DEMO') || (isDemoModeAllowed() && getStoredDemoPersona())) {
      const demoMatch = demoAdminProjects.find(p => p.id === projectId);
      if (demoMatch) {
        return demoMatch as unknown as ProjectRecord;
      }
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error(`[projectsApi] Error fetching project ${projectId}:`, error);
      throw error;
    }

    return data as ProjectRecord;
  },

  /**
   * Generates or retrieves the public URL for a project document.
   * If the input is already an absolute HTTP(S) URL, it is returned directly.
   * Otherwise, the public URL is resolved from the 'project-documents' Supabase storage bucket.
   */
  getProjectDocumentPublicUrl: (docPath: string): string => {
    if (!docPath) return '';
    if (docPath.startsWith('http://') || docPath.startsWith('https://')) {
      return docPath;
    }
    const { data } = supabase.storage.from('project-documents').getPublicUrl(docPath);
    return data.publicUrl;
  },

  /**
   * Creates a new project. In Demo Mode, creates in-memory simulation only.
   */
  createProject: async (projectData: Partial<Project>): Promise<Project | null> => {
    if (isDemoModeAllowed() && getStoredDemoPersona()) {
      console.warn('[Demo Mode] Project registration simulated in memory.');
      return {
        id: `PRJ-DEMO-${Date.now()}`,
        ...projectData,
        status: 'under_validation'
      } as Project;
    }
    return SupabaseService.createProject(projectData);
  },

  /**
   * Fetches aggregated dashboard stats
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    if (isDemoModeAllowed() && getStoredDemoPersona()) {
      return demoStats;
    }
    return SupabaseService.getDashboardStats();
  },

  /**
   * Subscribes to real-time project table changes
   */
  subscribeToProjects: (callback: (projects: Project[]) => void) => {
    if (isDemoModeAllowed() && getStoredDemoPersona()) {
      return { unsubscribe: () => {} };
    }
    return SupabaseService.subscribeToProjects(callback);
  }
};
