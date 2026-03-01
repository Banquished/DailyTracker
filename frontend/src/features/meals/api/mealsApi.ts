import { apiClient } from '../../../api/client';
import type {
  Food,
  FoodCreate,
  MealPlanEntry,
  MealPlanEntryCreate,
  MealSlot,
} from '../domain/types';

export async function fetchFoods(search?: string): Promise<Food[]> {
  const params = search ? { search } : {};
  const res = await apiClient.get<Food[]>('/foods', { params });
  return res.data;
}

export async function createFood(data: FoodCreate): Promise<Food> {
  const res = await apiClient.post<Food>('/foods', data);
  return res.data;
}

export async function deleteFood(id: string): Promise<void> {
  await apiClient.delete(`/foods/${id}`);
}

export async function fetchMealPlan(week: string): Promise<MealPlanEntry[]> {
  // week = YYYY-MM-DD (Monday of the week)
  const res = await apiClient.get<MealPlanEntry[]>('/meals', { params: { week } });
  return res.data;
}

export async function addMealEntry(
  date: string,
  slot: MealSlot,
  data: MealPlanEntryCreate,
): Promise<MealPlanEntry> {
  const res = await apiClient.post<MealPlanEntry>(`/meals/${date}/${slot}`, data);
  return res.data;
}

export async function removeMealEntry(entryId: string): Promise<void> {
  await apiClient.delete(`/meals/${entryId}`);
}
