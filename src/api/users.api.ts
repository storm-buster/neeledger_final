import { supabase } from '../lib/supabase';
import { SupabaseService, UserAccount } from '../lib/supabaseService';
import { UserProfile } from '../types';
import { isDemoModeAllowed, getStoredDemoPersona, DEMO_ADMIN_PROFILE, DEMO_USER_PROFILE } from '../config/demo';
import { demoAccounts } from '../data/demoData';

export const usersApi = {
  /**
   * Fetches all registered user accounts. In Demo Mode, returns sample accounts.
   */
  getUserAccounts: async (): Promise<UserAccount[]> => {
    if (isDemoModeAllowed() && getStoredDemoPersona()) {
      return demoAccounts.map(acc => ({
        id: acc.id,
        name: acc.companyName,
        email: acc.email,
        role: acc.accountType,
        kyc_status: acc.kycStatus,
        member_since: acc.registrationDate,
        additional_data: { kycDocument: acc.kycDocument }
      })) as UserAccount[];
    }
    return SupabaseService.getUserAccounts();
  },

  /**
   * Fetches an individual user's profile. In Demo Mode, returns active demo persona profile.
   */
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    if (isDemoModeAllowed() && getStoredDemoPersona()) {
      const persona = getStoredDemoPersona();
      return persona === 'admin' ? DEMO_ADMIN_PROFILE : DEMO_USER_PROFILE;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error(`[usersApi] Error fetching profile for ${userId}:`, error);
      throw error;
    }

    return data as UserProfile | null;
  },

  /**
   * Updates KYC status for a user. In Demo Mode, simulates the action.
   */
  updateKycStatus: async (userId: string, kycStatus: 'Done' | 'Pending' | 'In Process' | 'Rejected'): Promise<void> => {
    if (isDemoModeAllowed() && getStoredDemoPersona()) {
      console.info(`[Demo Mode] KYC status for ${userId} updated to ${kycStatus} in memory simulation.`);
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({ kyc_status: kycStatus } as any)
      .eq('id', userId);

    if (error) {
      console.warn(`[usersApi] updateKycStatus not yet supported on backend schema:`, error.message);
      throw error;
    }
  },

  /**
   * Subscribes to real-time changes on public.users
   */
  subscribeToUsers: (callback: (users: UserAccount[]) => void) => {
    if (isDemoModeAllowed() && getStoredDemoPersona()) {
      return { unsubscribe: () => {} };
    }
    return SupabaseService.subscribeToUsers(callback);
  }
};
