import { useQuery } from '@tanstack/react-query';
import { adminDashboardService } from '../services/dashboard.service';
import {
  DashboardStatsDto,
  ViewMode,
  UserGrowthChartDto,
} from '../services/dashboard.dto';

export const useDashboardStats = () => {
  return useQuery<DashboardStatsDto>({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: () => adminDashboardService.getStats(),
    staleTime: 1000 * 60 * 2,
  });
};

export const useUserGrowthChart = (mode: ViewMode = 'day') => {
  return useQuery<UserGrowthChartDto>({
    queryKey: ['admin', 'dashboard', 'user-growth', mode],
    queryFn: () => adminDashboardService.getUserGrowth(mode),
    staleTime: 1000 * 60 * 5,
  });
};
