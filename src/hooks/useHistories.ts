import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  History,
  NetworkClient,
  Optional,
} from '@sudobility/starter_types';
import type { FirebaseIdToken } from '../types';
import { StarterClient } from '../network/StarterClient';
import { QUERY_KEYS } from '../types';

const EMPTY_HISTORIES: History[] = [];

export interface UseHistoriesReturn {
  histories: History[];
  isLoading: boolean;
  error: Optional<string>;
  refetch: () => void;
}

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
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
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
