import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { fetchMacroProfile, updateMacroProfile, fetchDailyMacros } from './macrosApi';
import type { MacroProfile, MacroProfileCreate, DailyMacros } from '../domain/types';

const MACROS_KEY = ['macros'] as const;

export function useMacroProfile(): UseQueryResult<MacroProfile> {
  return useQuery({
    queryKey: [...MACROS_KEY, 'profile'],
    queryFn: fetchMacroProfile,
  });
}

export function useUpdateMacroProfile(): UseMutationResult<
  MacroProfile,
  Error,
  MacroProfileCreate
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MacroProfileCreate) => updateMacroProfile(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...MACROS_KEY, 'profile'] });
    },
  });
}

export function useDailyMacros(date: string): UseQueryResult<DailyMacros> {
  return useQuery({
    queryKey: [...MACROS_KEY, 'daily', date],
    queryFn: () => fetchDailyMacros(date),
  });
}
