// API Configuration
// Consolidated handling for VITE_API_BASE_URL and legacy VITE_API_URL.
// Uses relative path for production (Vercel) and fallback to localhost:4000 for local dev.
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return ''; // Use relative path on production (Vercel)
  }
  return (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:4000'
  );
};

export const apiConfig = {
  get baseURL() {
    return getBaseUrl();
  },
  endpoints: {
    geocode: '/api/geocode',
    xai: '/api/xai',
    mockmap: '/api/mockmap',
    satellites: '/api/satellites',
    grokCompare: '/api/grok-compare'
  }
};

// API Client helper
export const apiClient = {
  get: async (endpoint: string, params?: Record<string, string>) => {
    const baseUrl = apiConfig.baseURL;
    const fullUrl = baseUrl ? `${baseUrl}${endpoint}` : endpoint;
    const url = new URL(fullUrl, window.location.origin);
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
    const baseUrl = apiConfig.baseURL;
    const fullUrl = baseUrl ? `${baseUrl}${endpoint}` : endpoint;
    const response = await fetch(fullUrl, {
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
