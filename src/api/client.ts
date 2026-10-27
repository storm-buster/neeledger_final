/**
 * Consolidated HTTP Client for NeeLedger
 *
 * Provides unified base URL resolution (supporting both VITE_API_BASE_URL and VITE_API_URL),
 * native fetch handling, and normalized error responses across environments (Local Dev & Vercel).
 */

export interface ApiErrorDetails {
  status: number;
  statusText: string;
  message: string;
  details?: unknown;
}

export class ApiError extends Error {
  status: number;
  statusText: string;
  details?: unknown;

  constructor(status: number, statusText: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.details = details;
  }
}

/**
 * Resolves the backend API base URL with fallback precedence:
 * 1. Empty string on non-localhost (Vercel serverless / relative routes).
 * 2. VITE_API_BASE_URL from environment.
 * 3. VITE_API_URL from environment (legacy compatibility).
 * 4. http://localhost:4000 (local Express dev server default).
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return ''; // Relative path for production deployments (e.g. Vercel)
  }
  return (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:4000'
  );
}

/**
 * Formats full URL from endpoint and optional query params.
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const baseUrl = getApiBaseUrl();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = baseUrl ? `${baseUrl}${path}` : path;

  // Use URL constructor with origin fallback for relative paths
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  const url = new URL(fullUrl, origin);

  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        url.searchParams.append(key, String(val));
      }
    });
  }

  // If baseUrl was empty (relative path), return relative pathname + search
  return baseUrl ? url.toString() : `${url.pathname}${url.search}`;
}

/**
 * Parses JSON response safely or returns fallback message
 */
async function parseErrorResponse(response: Response): Promise<{ message: string; details?: unknown }> {
  try {
    const data = await response.json();
    const message = data.error || data.message || `Request failed with status ${response.status}`;
    return { message, details: data };
  } catch {
    return { message: `Request failed with status ${response.status}: ${response.statusText}` };
  }
}

/**
 * Lightweight native fetch HTTP client wrapper
 */
export const httpClient = {
  get: async <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>, init?: RequestInit): Promise<T> => {
    const url = buildUrl(endpoint, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(init?.headers || {})
      },
      ...init
    });

    if (!response.ok) {
      const { message, details } = await parseErrorResponse(response);
      throw new ApiError(response.status, response.statusText, message, details);
    }

    return response.json() as Promise<T>;
  },

  post: async <T>(endpoint: string, body?: unknown, init?: RequestInit): Promise<T> => {
    const url = buildUrl(endpoint);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(init?.headers || {})
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...init
    });

    if (!response.ok) {
      const { message, details } = await parseErrorResponse(response);
      throw new ApiError(response.status, response.statusText, message, details);
    }

    return response.json() as Promise<T>;
  }
};
