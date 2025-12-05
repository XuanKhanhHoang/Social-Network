import { ApiClient } from '@/services/api';
import {
  DashboardStatsDto,
  ViewMode,
  UserGrowthChartDto,
} from './dashboard.dto';

const ADMIN_DASHBOARD_PREFIX = '/admin/dashboard';

export const adminDashboardService = {
  async getStats(): Promise<DashboardStatsDto> {
    return ApiClient.get(`${ADMIN_DASHBOARD_PREFIX}/stats`);
  },

  async getUserGrowth(mode?: ViewMode): Promise<UserGrowthChartDto> {
    const params = mode ? `?mode=${mode}` : '';
    return ApiClient.get(`${ADMIN_DASHBOARD_PREFIX}/user-growth${params}`);
  },
};
