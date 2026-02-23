import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  History,
  NetworkClient,
  Optional,
} from '@sudobility/starter_types';
import type { FirebaseIdToken } from '../types';
import { StarterClient } from '../network/StarterClient';
import { DEFAULT_GC_TIME, DEFAULT_STALE_TIME, QUERY_KEYS } from '../types';

const EMPTY_HISTORIES: History[] = [];

/**
 * Return type for the {@link useHistories} hook.
 */
export interface UseHistoriesReturn {
  /** The list of histories for the user, or an empty array if not yet loaded. */
  histories: History[];
  /** Whether the query is currently loading. */
  isLoading: boolean;
  /** An error message if the query failed, or `null` if no error. */
  error: Optional<string>;
  /** Function to manually trigger a refetch of the histories. */
  refetch: () => void;
}

/**
 * TanStack Query hook that fetches a user's history list.
 *
 * Automatically manages caching, background refetching, and error state.
 * The query is disabled when `userId` or `token` is `null`, or when
 * `options.enabled` is `false`.
 *
 * @param networkClient - A {@link NetworkClient} implementation for HTTP requests
 * @param baseUrl - The base URL of the Starter API
 * @param userId - The Firebase UID of the user, or `null` if not authenticated
 * @param token - A valid Firebase ID token, or `null` if not authenticated
 * @param options - Optional configuration
 * @param options.enabled - Whether the query should execute (default: `true`)
 * @returns An object containing histories data, loading state, error, and refetch function
 *
 * @example
 * ```typescript
 * import { useHistories } from '@sudobility/starter_client';
 *
 * function HistoryList() {
 *   const { histories, isLoading, error } = useHistories(
 *     networkClient,
 *     'https://api.example.com',
 *     userId,
 *     idToken
 *   );
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error message={error} />;
 *   return <List items={histories} />;
 * }
 * ```
 */
export const useHistories = (
  networkClient: NetworkClient,
  baseUrl: string,
  userId: string | null,
  token: FirebaseIdToken | null,
  options?: { enabled?: boolean }
): UseHistoriesReturn => {
  const enabled = (options?.enabled ?? true) && !!userId && !!token;

  const client = useMemo(
    () => new StarterClient({ baseUrl, networkClient }),
    [baseUrl, networkClient]
  );

  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.histories(userId ?? ''),
    queryFn: async () => {
      const response = await client.getHistories(userId!, token!);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch histories');
      }
      return response.data;
    },
    enabled,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });

  const error = queryError instanceof Error ? queryError.message : null;

  return useMemo(
    () => ({
      histories: data ?? EMPTY_HISTORIES,
      isLoading,
      error,
      refetch,
    }),
    [data, isLoading, error, refetch]
  );
};
