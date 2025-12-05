'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, FileText, Activity, Flag } from 'lucide-react';

const StatisticsPage = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Thống kê</h1>
        <p className="text-gray-500 text-sm mt-1">
          Xem các biểu đồ và phân tích chi tiết
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-blue-600" />
              Người dùng mới theo thời gian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-blue-50/50 rounded-lg flex items-center justify-center border border-dashed border-blue-200">
              <div className="text-center text-gray-400">
                <BarChart3 className="h-10 w-10 mx-auto mb-2" />
                <p className="text-sm">Biểu đồ sẽ được hiển thị ở đây</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-green-600" />
              Bài viết theo thời gian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-green-50/50 rounded-lg flex items-center justify-center border border-dashed border-green-200">
              <div className="text-center text-gray-400">
                <BarChart3 className="h-10 w-10 mx-auto mb-2" />
                <p className="text-sm">Biểu đồ sẽ được hiển thị ở đây</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-purple-600" />
              Tương tác (Likes, Comments)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-purple-50/50 rounded-lg flex items-center justify-center border border-dashed border-purple-200">
              <div className="text-center text-gray-400">
                <BarChart3 className="h-10 w-10 mx-auto mb-2" />
                <p className="text-sm">Biểu đồ sẽ được hiển thị ở đây</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flag className="h-5 w-5 text-red-600" />
              Báo cáo vi phạm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-red-50/50 rounded-lg flex items-center justify-center border border-dashed border-red-200">
              <div className="text-center text-gray-400">
                <BarChart3 className="h-10 w-10 mx-auto mb-2" />
                <p className="text-sm">Biểu đồ sẽ được hiển thị ở đây</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <p className="text-amber-800 text-sm">
            💡 <strong>Gợi ý:</strong> Chức năng thống kê chi tiết sẽ được phát
            triển trong các phiên bản tiếp theo. Hiện tại bạn có thể xem các số
            liệu cơ bản tại trang Tổng quan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsPage;
