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

/**
 * Return type for the {@link useHistoryMutations} hook.
 */
export interface UseHistoryMutationsReturn {
  /**
   * Creates a new history entry.
   *
   * @param data - The history data to create
   * @returns The created history wrapped in a {@link BaseResponse}
   */
  createHistory: (data: HistoryCreateRequest) => Promise<BaseResponse<History>>;
  /**
   * Updates an existing history entry.
   *
   * @param historyId - The ID of the history to update
   * @param data - The fields to update
   * @returns The updated history wrapped in a {@link BaseResponse}
   */
  updateHistory: (
    historyId: string,
    data: HistoryUpdateRequest
  ) => Promise<BaseResponse<History>>;
  /**
   * Deletes a history entry.
   *
   * @param historyId - The ID of the history to delete
   * @returns A void response wrapped in a {@link BaseResponse}
   */
  deleteHistory: (historyId: string) => Promise<BaseResponse<void>>;
  /** Whether a create mutation is currently in progress. */
  isCreating: boolean;
  /** Whether an update mutation is currently in progress. */
  isUpdating: boolean;
  /** Whether a delete mutation is currently in progress. */
  isDeleting: boolean;
  /** The most recent mutation error message, or `null` if no error. */
  error: Optional<string>;
  /** Resets all mutation error states. */
  clearError: () => void;
}

/**
 * TanStack Query mutation hook for creating, updating, and deleting history entries.
 *
 * Automatically invalidates the histories list and total count queries on
 * successful mutations to keep the UI cache consistent.
 *
 * @param networkClient - A {@link NetworkClient} implementation for HTTP requests
 * @param baseUrl - The base URL of the Starter API
 * @param userId - The Firebase UID of the user, or `null` if not authenticated
 * @param token - A valid Firebase ID token, or `null` if not authenticated
 * @returns An object with mutation functions, loading states, error, and clearError
 *
 * @example
 * ```typescript
 * import { useHistoryMutations } from '@sudobility/starter_client';
 *
 * function HistoryForm() {
 *   const { createHistory, isCreating, error, clearError } = useHistoryMutations(
 *     networkClient,
 *     'https://api.example.com',
 *     userId,
 *     idToken
 *   );
 *
 *   const handleSubmit = async (data: HistoryCreateRequest) => {
 *     const response = await createHistory(data);
 *     if (response.success) {
 *       // History created and cache auto-invalidated
 *     }
 *   };
 * }
 * ```
 */
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
