import { apiClient } from '../../../api/client';
import type { MacroProfile, MacroProfileCreate, DailyMacros } from '../domain/types';

export async function fetchMacroProfile(): Promise<MacroProfile> {
  const response = await apiClient.get<MacroProfile>('/macros/profile');
  return response.data;
}

export async function updateMacroProfile(data: MacroProfileCreate): Promise<MacroProfile> {
  const response = await apiClient.put<MacroProfile>('/macros/profile', data);
  return response.data;
}

export async function fetchDailyMacros(date: string): Promise<DailyMacros> {
  const response = await apiClient.get<DailyMacros>('/macros/daily', {
    params: { date },
  });
  return response.data;
}
