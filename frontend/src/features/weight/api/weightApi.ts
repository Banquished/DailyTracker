import { apiClient } from '../../../api/client';
import type { WeightEntry, WeightEntryCreate } from '../domain/types';

export async function fetchWeightEntries(
  startDate: string,
  endDate: string,
): Promise<WeightEntry[]> {
  const response = await apiClient.get<WeightEntry[]>('/weight', {
    params: { start_date: startDate, end_date: endDate },
  });
  return response.data;
}

export async function logWeight(data: WeightEntryCreate): Promise<WeightEntry> {
  const response = await apiClient.post<WeightEntry>('/weight', data);
  return response.data;
}

export async function deleteWeightEntry(id: string): Promise<void> {
  await apiClient.delete(`/weight/${id}`);
}
