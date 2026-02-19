import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  BaseResponse,
  History,
  HistoryCreateRequest,
  HistoryUpdateRequest,
  NetworkClient,
  Optional,
} from '@sudobility/starter_types';
import type { FirebaseIdToken } from '../types';
import { StarterClient } from '../network/StarterClient';
import { QUERY_KEYS } from '../types';

export interface UseHistoryMutationsReturn {
  createHistory: (data: HistoryCreateRequest) => Promise<BaseResponse<History>>;
  updateHistory: (
    historyId: string,
    data: HistoryUpdateRequest
  ) => Promise<BaseResponse<History>>;
  deleteHistory: (historyId: string) => Promise<BaseResponse<void>>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: Optional<string>;
  clearError: () => void;
}

export const useHistoryMutations = (
  networkClient: NetworkClient,
  baseUrl: string,
  userId: string | null,
  token: FirebaseIdToken | null
): UseHistoryMutationsReturn => {
  const client = useMemo(
    () => new StarterClient({ baseUrl, networkClient }),
    [baseUrl, networkClient]
  );

  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    if (userId) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.histories(userId),
      });
    }
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.historiesTotal(),
    });
  }, [queryClient, userId]);

  const createMutation = useMutation({
    mutationFn: async (data: HistoryCreateRequest) => {
      return client.createHistory(userId!, data, token!);
    },
    onSuccess: response => {
      if (response.success) invalidate();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      historyId,
      data,
    }: {
      historyId: string;
      data: HistoryUpdateRequest;
    }) => {
      return client.updateHistory(userId!, historyId, data, token!);
    },
    onSuccess: response => {
      if (response.success) invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (historyId: string) => {
      return client.deleteHistory(userId!, historyId, token!);
    },
    onSuccess: response => {
      if (response.success) invalidate();
    },
  });

  const createHistory = useCallback(
    (data: HistoryCreateRequest) => createMutation.mutateAsync(data),
    [createMutation]
  );

  const updateHistory = useCallback(
    (historyId: string, data: HistoryUpdateRequest) =>
      updateMutation.mutateAsync({ historyId, data }),
    [updateMutation]
  );

  const deleteHistory = useCallback(
    (historyId: string) => deleteMutation.mutateAsync(historyId),
    [deleteMutation]
  );

  const mutationError =
    createMutation.error ?? updateMutation.error ?? deleteMutation.error;
  const error = mutationError instanceof Error ? mutationError.message : null;

  const clearError = useCallback(() => {
    createMutation.reset();
    updateMutation.reset();
    deleteMutation.reset();
  }, [createMutation, updateMutation, deleteMutation]);

  return useMemo(
    () => ({
      createHistory,
      updateHistory,
      deleteHistory,
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
      error,
      clearError,
    }),
    [
      createHistory,
      updateHistory,
      deleteHistory,
      createMutation.isPending,
      updateMutation.isPending,
      deleteMutation.isPending,
      error,
      clearError,
    ]
  );
};
