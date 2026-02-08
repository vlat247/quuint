/**
 * Centralized API client for backend communication.
 * Handles base URL configuration, error handling, and CORS-friendly requests.
 */

// Single source of truth for the API base URL
function getApiBaseUrl(): string {
  // Use env variable if available, otherwise fallback to the production URL
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://quint-backend-xq3u.onrender.com';
}

// Custom error class for API errors
export class ApiError extends Error {
  status: number;
  statusText: string;
  body: string;

  constructor(status: number, statusText: string, body: string) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

// Generic POST request helper
export async function apiPost<TPayload, TResponse>(
  endpoint: string,
  payload: TPayload
): Promise<TResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Minimal headers to avoid triggering CORS preflight for custom headers
      // Do NOT add Authorization, X-Custom-* headers unless strictly required
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorBody = '';
    try {
      errorBody = await response.text();
    } catch {
      errorBody = 'Could not read error response body';
    }
    console.error(`[API Error] ${response.status} ${response.statusText}`, errorBody);
    throw new ApiError(response.status, response.statusText, errorBody);
  }

  return response.json() as Promise<TResponse>;
}

// Specific helper for analyzing a channel
export async function analyzeChannelApi(email: string, channel: string) {
  interface AnalyzePayload {
    email: string;
    channel: string;
    model: string;
  }

  interface AnalyzeResponse {
    title?: string;
    summary?: string;
    insights?: string[];
    readers?: string;
    cached?: boolean;
    is_mock?: boolean;
  }

  const payload: AnalyzePayload = {
    email,
    channel,
    model: 'llama-3.3-70b-versatile', // Force non-deprecated model
  };

  return apiPost<AnalyzePayload, AnalyzeResponse>('/analyze', payload);
}
