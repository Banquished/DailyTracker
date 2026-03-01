import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { fetchWeightEntries, logWeight, deleteWeightEntry } from './weightApi';
import type { WeightEntry, WeightEntryCreate } from '../domain/types';

const WEIGHT_KEY = ['weight'] as const;

export function useWeightEntries(
  startDate: string,
  endDate: string,
): UseQueryResult<WeightEntry[]> {
  return useQuery({
    queryKey: [...WEIGHT_KEY, startDate, endDate],
    queryFn: () => fetchWeightEntries(startDate, endDate),
  });
}

export function useLogWeight(): UseMutationResult<WeightEntry, Error, WeightEntryCreate> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WeightEntryCreate) => logWeight(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WEIGHT_KEY });
    },
  });
}

export function useDeleteWeightEntry(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWeightEntry(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WEIGHT_KEY });
    },
  });
}
