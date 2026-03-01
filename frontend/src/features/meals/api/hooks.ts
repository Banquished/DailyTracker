import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import {
  fetchFoods,
  createFood,
  deleteFood,
  fetchMealPlan,
  addMealEntry,
  removeMealEntry,
} from './mealsApi';
import type { Food, FoodCreate, MealPlanEntry, MealSlot } from '../domain/types';

const FOODS_KEY = ['foods'] as const;
const MEALS_KEY = ['meals'] as const;

export function useFoods(search?: string): UseQueryResult<Food[]> {
  return useQuery({
    queryKey: [...FOODS_KEY, search ?? ''],
    queryFn: () => fetchFoods(search),
  });
}

export function useCreateFood(): UseMutationResult<Food, Error, FoodCreate> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FoodCreate) => createFood(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FOODS_KEY });
    },
  });
}

export function useDeleteFood(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFood(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FOODS_KEY });
      void queryClient.invalidateQueries({ queryKey: MEALS_KEY });
    },
  });
}

export function useMealPlan(weekMonday: string): UseQueryResult<MealPlanEntry[]> {
  return useQuery({
    queryKey: [...MEALS_KEY, weekMonday],
    queryFn: () => fetchMealPlan(weekMonday),
  });
}

type AddMealEntryVars = {
  date: string;
  slot: MealSlot;
  foodId: string;
  grams: number;
  notes?: string;
};

export function useAddMealEntry(): UseMutationResult<MealPlanEntry, Error, AddMealEntryVars> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, slot, foodId, grams, notes }: AddMealEntryVars) =>
      addMealEntry(date, slot, { food_id: foodId, grams, notes }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MEALS_KEY });
    },
  });
}

export function useRemoveMealEntry(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => removeMealEntry(entryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MEALS_KEY });
    },
  });
}
