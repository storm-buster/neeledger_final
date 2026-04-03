import { supabase } from './supabase'
import { Project, Account, DashboardStats, Notification } from '../types'

export interface Evidence {
  id: string
  title: string
  description: string
  fileURLs: string[]
  userId?: string
  location?: any
  created_at?: string
}

export interface UserAccount {
  id: string
  name: string
  email: string
  wallet_address?: string
  credits?: number
  role?: string
  member_since?: string
  additional_data?: any
}

export class SupabaseService {
  // ── Projects operations ──────────────────────────────────────────────
  
  static async getProjects(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Return raw data with all fields from the new schema
      return data || []
    } catch (error) {
      console.error('Error fetching projects:', error)
      return []
    }
  }

  static async createProject(projectData: Partial<Project>): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: projectData.metadata?.ownership || 'New Project',
          description: projectData.metadata?.summary,
          user_id: projectData.accountId,
          status: projectData.status?.toLowerCase() || 'pending',
          additional_data: {
            creditsIssued: projectData.creditsIssued || 0,
            riskAssessment: projectData.riskAssessment || 'Low',
            bufferCredits: projectData.bufferCredits || 0,
            country: projectData.country || 'India',
            timeline: projectData.timeline || [],
            area: projectData.metadata?.area || 0,
            methodology: projectData.metadata?.methodology || 'VM0007',
            coordinates: projectData.metadata?.coordinates || { lat: 0, lng: 0 }
          },
          documents: projectData.metadata?.documentation?.map(doc => ({ file_name: doc })) || [],
          images: projectData.metadata?.images || []
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating project:', error)
      return null
    }
  }

  // ── Users operations ────────────────────────────────────────────────
  
  static async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  static async signUp(email: string, password: string, name: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  // ── Dashboard stats ──────────────────────────────────────────────────
  
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('additional_data')
      
      if (projectsError) throw projectsError
      
      const totalProjects = projects?.length || 0
      const totalCreditsIssued = projects?.reduce((sum, project) => 
        sum + (project.additional_data?.creditsIssued || 0), 0) || 0
      const totalBufferCredits = projects?.reduce((sum, project) => 
        sum + (project.additional_data?.bufferCredits || 0), 0) || 0
      
      return {
        totalProjects,
        totalCarbonRemoved: totalCreditsIssued * 0.8, // Approximate conversion
        totalCreditsIssued,
        totalBufferCredits
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalProjects: 0,
        totalCarbonRemoved: 0,
        totalCreditsIssued: 0,
        totalBufferCredits: 0
      }
    }
  }

  // ── File upload ─────────────────────────────────────────────────────
  
  static async uploadFile(bucket: string, path: string, file: File): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true })
      
      if (error) throw error
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path)
      
      return publicUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  // ── Users/Accounts operations ──────────────────────────────────────
  
  static async getUserAccounts(): Promise<UserAccount[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('member_since', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user accounts:', error)
      return []
    }
  }

  static async getNotifications(): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10)
      
      if (error) {
        console.warn('Notifications table not found, using mock data:', error.message)
        // Return mock notifications if table doesn't exist
        return [
          {
            id: '1',
            type: 'verification',
            title: 'Welcome to BlueLedger',
            message: 'Start by uploading your first carbon project',
            timestamp: new Date().toISOString(),
            read: false
          },
          {
            id: '2',
            type: 'credits',
            title: 'System Ready',
            message: 'XAI and Gemini AI integration is active',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: false
          }
        ]
      }
      return data || []
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  }

  // ── Evidence operations ──────────────────────────────────────────────
  
  static async getEvidence(): Promise<Evidence[]> {
    try {
      const { data, error } = await supabase
        .from('evidence')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching evidence:', error)
      return []
    }
  }

  static async saveEvidence(evidenceData: {
    title: string
    description: string
    fileURLs: string[]
    userId?: string
    location?: any
  }): Promise<Evidence | null> {
    try {
      const { data, error } = await supabase
        .from('evidence')
        .insert({
          title: evidenceData.title,
          description: evidenceData.description,
          file_urls: evidenceData.fileURLs,
          user_id: evidenceData.userId,
          location: evidenceData.location
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error saving evidence:', error)
      return null
    }
  }

  // ── Real-time subscriptions ───────────────────────────────────────────
  
  static subscribeToProjects(callback: (projects: Project[]) => void) {
    return supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        async () => {
          const projects = await this.getProjects()
          callback(projects)
        }
      )
      .subscribe()
  }

  static subscribeToEvidence(callback: (evidence: Evidence[]) => void) {
    return supabase
      .channel('evidence-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'evidence' },
        async () => {
          const evidence = await this.getEvidence()
          callback(evidence)
        }
      )
      .subscribe()
  }

  static subscribeToUsers(callback: (users: UserAccount[]) => void) {
    return supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        async () => {
          const users = await this.getUserAccounts()
          callback(users)
        }
      )
      .subscribe()
  }
}
