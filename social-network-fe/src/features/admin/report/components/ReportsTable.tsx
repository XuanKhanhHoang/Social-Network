'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Check,
  X,
  Clock,
  FileText,
  MessageSquare,
  Eye,
  Info,
  Undo2,
} from 'lucide-react';
import { ReportDto, ReportStatus } from '../services/report.dto';

export const statusLabels: Record<ReportStatus, string> = {
  pending: 'Chờ xử lý',
  resolved: 'Vi phạm',
  rejected: 'Bỏ qua',
};

export const statusColors: Record<ReportStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-red-100 text-red-800',
  rejected: 'bg-gray-100 text-gray-800',
};

export const formatExactTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

interface ReportsTableProps {
  data: ReportDto[] | undefined;
  isLoading: boolean;
  page: number;
  onPreview: (reportId: string) => void;
  onResolve: (report: ReportDto) => void;
  onReject: (report: ReportDto) => void;
  onViewDetail: (report: ReportDto) => void;
  onReverse?: (report: ReportDto) => void;
}

export function ReportsTable({
  data,
  isLoading,
  page,
  onPreview,
  onResolve,
  onReject,
  onViewDetail,
  onReverse,
}: ReportsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Người báo cáo</TableHead>
          <TableHead>Loại</TableHead>
          <TableHead>ID nội dung</TableHead>
          <TableHead>Lý do</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Thời gian</TableHead>
          <TableHead className="text-right">Hành động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8">
              Đang tải...
            </TableCell>
          </TableRow>
        ) : data?.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
              Không có báo cáo nào
            </TableCell>
          </TableRow>
        ) : (
          data?.map((report, index) => (
            <TableRow key={report._id}>
              <TableCell className="font-medium">
                {(page - 1) * 10 + index + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                    {report.reporter.firstName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {report.reporter.lastName} {report.reporter.firstName}
                    </p>
                    <p className="text-xs text-gray-500">
                      @{report.reporter.username}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {report.targetType === 'post' ? (
                    <FileText className="h-4 w-4 text-gray-500" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-sm">
                    {report.targetType === 'post' ? 'Bài viết' : 'Bình luận'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                  {report.targetId}
                </code>
              </TableCell>
              <TableCell>
                <p className="text-sm max-w-xs truncate">{report.reason}</p>
              </TableCell>
              <TableCell>
                <Badge
                  className={statusColors[report.status]}
                  variant="secondary"
                >
                  {report.status === 'pending' && (
                    <Clock className="h-3 w-3 mr-1" />
                  )}
                  {report.status === 'resolved' && (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {report.status === 'rejected' && (
                    <X className="h-3 w-3 mr-1" />
                  )}
                  {statusLabels[report.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                <div>{formatExactTime(report.createdAt)}</div>
                {report.reviewedAt && (
                  <div className="text-xs text-green-600">
                    Xử lý: {formatExactTime(report.reviewedAt)}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPreview(report._id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Xem
                  </Button>
                  {report.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => onResolve(report)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Vi phạm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-gray-600"
                        onClick={() => onReject(report)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Bỏ qua
                      </Button>
                    </>
                  )}
                  {report.status === 'resolved' &&
                    onReverse &&
                    report.reviewedAt &&
                    (() => {
                      const reviewedDate = new Date(report.reviewedAt);
                      const daysSinceReview = Math.floor(
                        (Date.now() - reviewedDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      return daysSinceReview <= 30;
                    })() && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-600 border-amber-600 hover:bg-amber-50"
                        onClick={() => onReverse(report)}
                      >
                        <Undo2 className="h-4 w-4 mr-1" />
                        Khôi phục
                      </Button>
                    )}
                  {report.status !== 'pending' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-500"
                      onClick={() => onViewDetail(report)}
                    >
                      <Info className="h-4 w-4 mr-1" />
                      Chi tiết
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
