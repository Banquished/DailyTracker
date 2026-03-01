import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import {
  fetchHabits,
  createHabit,
  logHabit,
  deleteHabitLog,
  deleteHabit,
} from './habitsApi';
import type { Habit, HabitCreate, HabitLog, HabitLogCreate } from '../domain/types';

const HABITS_KEY = ['habits'] as const;

export function useHabits(): UseQueryResult<Habit[]> {
  return useQuery({
    queryKey: HABITS_KEY,
    queryFn: fetchHabits,
  });
}

export function useCreateHabit(): UseMutationResult<Habit, Error, HabitCreate> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HabitCreate) => createHabit(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: HABITS_KEY });
    },
  });
}

export function useLogHabit(): UseMutationResult<
  HabitLog,
  Error,
  { habitId: string; data: HabitLogCreate }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ habitId, data }: { habitId: string; data: HabitLogCreate }) =>
      logHabit(habitId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: HABITS_KEY });
    },
  });
}

export function useDeleteHabitLog(): UseMutationResult<
  void,
  Error,
  { habitId: string; logId: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ habitId, logId }: { habitId: string; logId: string }) =>
      deleteHabitLog(habitId, logId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: HABITS_KEY });
    },
  });
}

export function useDeleteHabit(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteHabit(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: HABITS_KEY });
    },
  });
}
