'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  FileText,
  AlertTriangle,
  UserPlus,
  TrendingUp,
  Loader2,
  TrendingDown,
} from 'lucide-react';
import { useDashboardStats } from '@/features/admin/dashboard/hooks/useDashboard';
import { UserGrowthChart } from '@/features/admin/dashboard/components/UserGrowthChart';

const AdminDashboardPage = () => {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Chào mừng đến với trang quản trị Vibe
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Tăng trưởng người dùng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserGrowthChart />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate">
                  Tổng người dùng
                </p>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400 mt-1" />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">
                    {(stats?.totalUsers ?? 0).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate">
                  Bài viết mới (tuần)
                </p>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400 mt-1" />
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-gray-900">
                      {(stats?.newPostsThisWeek ?? 0).toLocaleString()}
                    </p>
                    {stats && (
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${
                          stats.postsGrowthPercent >= 0
                            ? 'text-green-600 bg-green-50'
                            : 'text-red-600 bg-red-50'
                        }`}
                      >
                        {stats.postsGrowthPercent >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {stats.postsGrowthPercent >= 0 ? '+' : ''}
                        {stats.postsGrowthPercent}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate">
                  Báo cáo chờ xử lý
                </p>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400 mt-1" />
                ) : (
                  <p className="text-lg font-semibold text-amber-600">
                    {(stats?.pendingReports ?? 0).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <UserPlus className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate">
                  Người dùng mới (tuần)
                </p>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400 mt-1" />
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-gray-900">
                      {(stats?.newUsersThisWeek ?? 0).toLocaleString()}
                    </p>
                    {stats && (
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${
                          stats.usersGrowthPercent >= 0
                            ? 'text-green-600 bg-green-50'
                            : 'text-red-600 bg-red-50'
                        }`}
                      >
                        {stats.usersGrowthPercent >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {stats.usersGrowthPercent >= 0 ? '+' : ''}
                        {stats.usersGrowthPercent}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
