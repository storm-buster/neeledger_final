// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    geocode: '/api/geocode',
    xai: '/api/xai',
    mockmap: '/api/mockmap',
    satellites: '/api/satellites'
  }
};

// API Client helper
export const apiClient = {
  get: async (endpoint: string, params?: Record<string, string>) => {
    const url = new URL(endpoint, apiConfig.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
  
  post: async (endpoint: string, data?: any) => {
    const response = await fetch(`${apiConfig.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
};