import { getAuthToken } from './storage';

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim() || '';
const strictModeRaw = process.env.EXPO_PUBLIC_BACKEND_STRICT_MODE?.trim().toLowerCase();

export function isApiConfigured(): boolean {
  return apiBaseUrl.length > 0;
}

export function isBackendStrictMode(): boolean {
  if (!isApiConfigured()) {
    return false;
  }
  if (!strictModeRaw) {
    return true;
  }
  return strictModeRaw !== 'false';
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  if (!isApiConfigured()) {
    return false;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!isApiConfigured()) {
    throw new ApiError('API URL is not configured', 0);
  }

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (options.auth) {
    const token = await getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError('Unable to reach backend API', 0);
  }

  const text = await response.text();
  let data: any = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    const message =
      data?.error?.fieldErrors
        ? 'Invalid request data'
        : data?.error || 'Request failed';
    throw new ApiError(message, response.status);
  }

  return data as T;
}
