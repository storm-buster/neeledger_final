import { httpClient } from './client';
import satsData from '../data/customerSatellites.json';
import { isDemoModeAllowed, getStoredDemoPersona } from '../config/demo';

export interface CustomerSatellite {
  id: string;
  country: string;
  launch_date: string;
  mass: string;
  launcher: string;
}

export interface SatellitesResponse {
  customer_satellites: CustomerSatellite[];
}

export const satellitesApi = {
  /**
   * Fetches customer satellites list from /api/satellites, falling back to local dataset
   */
  getSatellites: async (): Promise<CustomerSatellite[]> => {
    if (isDemoModeAllowed() && getStoredDemoPersona()) {
      return (satsData.customer_satellites || []) as CustomerSatellite[];
    }

    try {
      const data = await httpClient.get<SatellitesResponse>('/api/satellites');
      return data.customer_satellites || [];
    } catch {
      return (satsData.customer_satellites || []) as CustomerSatellite[];
    }
  }
};
