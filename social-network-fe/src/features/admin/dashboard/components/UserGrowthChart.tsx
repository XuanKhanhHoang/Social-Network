'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useUserGrowthChart } from '../hooks/useDashboard';
import { ViewMode, UserGrowthDataPoint } from '../services/dashboard.dto';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const VIEW_MODE_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'day', label: 'Ngày' },
  { value: 'week', label: 'Tuần' },
  { value: 'month', label: 'Tháng' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: UserGrowthDataPoint }>;
  viewMode: ViewMode;
}

const CustomTooltip = ({ active, payload, viewMode }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const modeLabel =
    viewMode === 'day' ? 'Ngày' : viewMode === 'week' ? 'Tuần' : 'Tháng';

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 text-sm">
      <p className="font-medium text-gray-900 mb-1">
        {modeLabel}: {modeLabel == 'Tuần' ? data.label.slice(1) : data.label}
      </p>
      <p className="text-gray-500 text-xs mb-2">{data.dateRange}</p>
      <p className="text-blue-600 font-semibold">{data.count} người dùng mới</p>
    </div>
  );
};

export const UserGrowthChart = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const { data, isLoading, isFetching } = useUserGrowthChart(viewMode);

  const chartData = data?.data || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {VIEW_MODE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setViewMode(option.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === option.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        {isFetching && !isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p className="text-sm">Chưa có dữ liệu</p>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip viewMode={viewMode} />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }}
                activeDot={{
                  r: 5,
                  fill: '#3b82f6',
                  stroke: '#fff',
                  strokeWidth: 2,
                }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {data && (
        <div className="mt-3 text-center text-sm text-gray-500">
          Tổng đăng ký:{' '}
          <span className="font-semibold text-gray-900">
            {data.total.toLocaleString()}
          </span>{' '}
          người dùng
        </div>
      )}
    </div>
  );
};
