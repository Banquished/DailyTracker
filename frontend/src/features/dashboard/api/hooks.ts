import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchDashboard } from './dashboardApi';
import type { DashboardData } from '../domain/types';

export function useDashboard(): UseQueryResult<DashboardData> {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    staleTime: 30_000,
  });
}
