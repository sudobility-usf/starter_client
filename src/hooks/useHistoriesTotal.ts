import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { NetworkClient, Optional } from '@sudobility/starter_types';
import { StarterClient } from '../network/StarterClient';
import { QUERY_KEYS } from '../types';

export interface UseHistoriesTotalReturn {
  total: number;
  isLoading: boolean;
  error: Optional<string>;
  refetch: () => void;
}

export const useHistoriesTotal = (
  networkClient: NetworkClient,
  baseUrl: string,
  options?: { enabled?: boolean }
): UseHistoriesTotalReturn => {
  const enabled = options?.enabled ?? true;

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
    queryKey: QUERY_KEYS.historiesTotal(),
    queryFn: async () => {
      const response = await client.getHistoriesTotal();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch total');
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
      total: data?.total ?? 0,
      isLoading,
      error,
      refetch,
    }),
    [data, isLoading, error, refetch]
  );
};
