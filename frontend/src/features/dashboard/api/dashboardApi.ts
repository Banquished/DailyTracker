import { apiClient } from '../../../api/client';
import type { DashboardData } from '../domain/types';

export async function fetchDashboard(): Promise<DashboardData> {
  const res = await apiClient.get<DashboardData>('/dashboard/today');
  return res.data;
}
