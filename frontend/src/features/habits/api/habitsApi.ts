import { apiClient } from '../../../api/client';
import type { Habit, HabitCreate, HabitLog, HabitLogCreate } from '../domain/types';

export async function fetchHabits(): Promise<Habit[]> {
  const response = await apiClient.get<Habit[]>('/habits');
  return response.data;
}

export async function createHabit(data: HabitCreate): Promise<Habit> {
  const response = await apiClient.post<Habit>('/habits', data);
  return response.data;
}

export async function updateHabit(
  id: string,
  data: Partial<HabitCreate> & { active?: boolean },
): Promise<Habit> {
  const response = await apiClient.patch<Habit>(`/habits/${id}`, data);
  return response.data;
}

export async function deleteHabit(id: string): Promise<void> {
  await apiClient.delete(`/habits/${id}`);
}

export async function logHabit(habitId: string, data: HabitLogCreate): Promise<HabitLog> {
  const response = await apiClient.post<HabitLog>(`/habits/${habitId}/logs`, data);
  return response.data;
}

export async function deleteHabitLog(habitId: string, logId: string): Promise<void> {
  await apiClient.delete(`/habits/${habitId}/logs/${logId}`);
}
