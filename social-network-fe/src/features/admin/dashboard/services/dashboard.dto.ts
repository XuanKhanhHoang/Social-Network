export interface DashboardStatsDto {
  totalUsers: number;
  newUsersThisWeek: number;
  newUsersLastWeek: number;
  usersGrowthPercent: number;
  newPostsThisWeek: number;
  newPostsLastWeek: number;
  postsGrowthPercent: number;
  pendingReports: number;
}

export type ViewMode = 'day' | 'week' | 'month';

export interface UserGrowthDataPoint {
  period: string;
  label: string;
  dateRange: string;
  count: number;
}

export interface UserGrowthChartDto {
  data: UserGrowthDataPoint[];
  total: number;
}
