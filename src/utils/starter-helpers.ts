import type { FirebaseIdToken } from '../types';

export function createAuthHeaders(
  token: FirebaseIdToken
): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export function createHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

export function buildUrl(baseUrl: string, path: string): string {
  const cleanBase = baseUrl.replace(/\/$/, '');
  return `${cleanBase}${path}`;
}

export function handleApiError(response: unknown, operation: string): Error {
  const resp = response as { data?: { error?: string; message?: string } };
  const errorMessage =
    resp?.data?.error || resp?.data?.message || 'Unknown error';
  return new Error(`Failed to ${operation}: ${errorMessage}`);
}
